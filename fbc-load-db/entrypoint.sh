#!/usr/bin/env bash
set -euo pipefail

# -----------------------------------------------------------------------------
# Fixed configuration (can be overridden via env if needed)
# -----------------------------------------------------------------------------
BIG_REPO_URL="${BIG_REPO_URL:-https://gitlab.com/OdinLimaye/cs373-fall-2025-55085_07.git}"
SCRAPERS_PATH="${SCRAPERS_PATH:-scrapers}"        # flat dir: only .py and a .txt manifest
SCRAPERS_REF="${SCRAPERS_REF:-main}"              # branch/tag/commit
SCRAPERS_DIR="${SCRAPERS_DIR:-/app/scrapers}"     # destination directory
FETCH_METHOD="${FETCH_METHOD:-archive}"           # we use archive for exact-only download

# Optional token for private access (HTTPS). Not required for public repo.
GIT_AUTH_TOKEN="${GIT_AUTH_TOKEN:-}"

log()  { printf '%s %s\n' "[startup]" "$*"; }
warn() { printf '%s %s\n' "[warn]"    "$*" >&2; }
err()  { printf '%s %s\n' "[error]"   "$*" >&2; }

require() { command -v "$1" >/dev/null 2>&1 || { err "missing required tool: $1"; exit 90; }; }

authed_url() {
  if [[ -n "$GIT_AUTH_TOKEN" && "$BIG_REPO_URL" == https://* ]]; then
    local without_proto="${BIG_REPO_URL#https://}"
    printf 'https://%s@%s' "$GIT_AUTH_TOKEN" "$without_proto"
  else
    printf '%s' "$BIG_REPO_URL"
  fi
}

# Fetch exactly the contents of SCRAPERS_PATH into SCRAPERS_DIR using git archive
fetch_with_archive() {
  require git; require tar
  local url; url="$(authed_url)"
  log "cloning ${BIG_REPO_URL} (archive)"
  mkdir -p "$SCRAPERS_DIR"
  local tmpdir; tmpdir="$(mktemp -d)"
  (
    cd "$tmpdir"
    # Download exactly the directory tree 'SCRAPERS_PATH' at SCRAPERS_REF
    git archive --remote="$url" "${SCRAPERS_REF}:${SCRAPERS_PATH}" | tar -x
  )
  shopt -s dotglob nullglob
  mv -f "$tmpdir"/* "$SCRAPERS_DIR"/ 2>/dev/null || true
  rmdir "$tmpdir" 2>/dev/null || true
}

# Sparse-checkout fallback (only if archive is not available)
fetch_with_sparse() {
  require git
  log "cloning ${BIG_REPO_URL} (sparse)"
  local tmprepo; tmprepo="$(mktemp -d)"
  local url; url="$(authed_url)"
  git -c advice.detachedHead=false clone --depth 1 --filter=blob:none --no-checkout "$url" "$tmprepo"
  (
    cd "$tmprepo"
    git sparse-checkout init --cone
    git sparse-checkout set "$SCRAPERS_PATH"
    git checkout "$SCRAPERS_REF"
  )
  mkdir -p "$SCRAPERS_DIR"
  shopt -s dotglob nullglob
  mv -f "$tmprepo/$SCRAPERS_PATH"/* "$SCRAPERS_DIR"/ 2>/dev/null || true
  rm -rf "$tmprepo"
}

verify_flat_layout() {
  # Warn (non-fatal) if subdirectories are present; we expect only files for identical output.
  local found_dir=""
  while IFS= read -r -d '' item; do
    if [[ -d "$item" ]]; then found_dir="yes"; break; fi
  done < <(find "$SCRAPERS_DIR" -mindepth 1 -maxdepth 1 -print0)
  if [[ -n "$found_dir" ]]; then
    warn "Expected a flat 'scrapers/' directory (no subfolders)."
  fi
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
start_ts=$(date +%s)

log "preparing $SCRAPERS_DIR"
rm -rf "$SCRAPERS_DIR"
mkdir -p "$SCRAPERS_DIR"

set +e
# Prefer archive for byte-for-byte directory contents; fallback if disabled server-side.
fetch_with_archive
rc=$?
if [[ $rc -ne 0 ]]; then
  warn "git archive failed, retrying with sparse-checkout ..."
  fetch_with_sparse
  rc=$?
fi
set -e

if [[ $rc -ne 0 ]]; then
  err "Failed to fetch '${SCRAPERS_PATH}' from ${BIG_REPO_URL}@${SCRAPERS_REF}."
  exit 65
fi

verify_flat_layout

count_py=$(find "$SCRAPERS_DIR" -maxdepth 1 -type f -name "*.py" | wc -l | xargs)
count_txt=$(find "$SCRAPERS_DIR" -maxdepth 1 -type f -name "*.txt" | wc -l | xargs)
elapsed=$(( $(date +%s) - start_ts ))
log "scrapers ready in $SCRAPERS_DIR (py: ${count_py}, txt: ${count_txt}, ${elapsed}s)"

# Maintain previous behavior: look for scrapers.txt and warn if missing
if [[ ! -f "$SCRAPERS_DIR/scrapers.txt" ]]; then
  warn "scrapers.txt not found in $SCRAPERS_DIR (the run may yield 0 items)."
fi

# Hand off to Python app, preserving prior behavior
if [[ $# -gt 0 ]]; then
  exec "$@"
else
  if [[ -f "/app/main.py" ]]; then
    exec python /app/main.py
  else
    log "No /app/main.py found; starting a shell for inspection."
    exec bash
  fi
fi
