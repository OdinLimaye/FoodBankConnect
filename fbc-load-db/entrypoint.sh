#!/usr/bin/env bash
# =============================================================================
# entrypoint.sh
#
# © 2025 Francisco Vivas. All rights reserved.
#
# This script is the main entrypoint for the container.
# It prepares the scraper environment, either by using local files baked into
# the image or by fetching them from a remote Git repository. Once ready, it
# launches the Python application.
#
# Key behavior:
#   - If FETCH_METHOD=local or scrapers already exist → uses them directly.
#   - Otherwise, attempts a git archive fetch, falling back to sparse checkout.
#   - Logs useful information about the scraper state.
#   - Starts the Flask server (main.py) afterward.
#
# Environment variables:
#   SCRAPERS_DIR      — Directory where scrapers are located (default: /app/scrapers)
#   SCRAPERS_REPO     — Git repository URL for scrapers (if using remote)
#   SCRAPERS_REF      — Git branch or tag to fetch from (default: main)
#   SCRAPERS_PATH     — Path inside the repo to fetch (default: .)
#   FETCH_METHOD      — 'local' or 'remote' (default: remote)
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# Configuration Variables
# -----------------------------------------------------------------------------
SCRAPERS_DIR="${SCRAPERS_DIR:-/app/scrapers}"
SCRAPERS_REPO="${SCRAPERS_REPO:-}"
SCRAPERS_REF="${SCRAPERS_REF:-main}"
SCRAPERS_PATH="${SCRAPERS_PATH:-.}"
FETCH_METHOD="${FETCH_METHOD:-remote}"

# -----------------------------------------------------------------------------
# Logging Helpers
# -----------------------------------------------------------------------------
log()   { echo "[startup] $*"; }
warn()  { echo "[warn] $*" >&2; }
err()   { echo "[error] $*" >&2; }

# -----------------------------------------------------------------------------
# fetch_with_archive
#
# Attempts to download the scrapers from the remote repository using
# `git archive` and extract them directly into SCRAPERS_DIR.
#
# This method is lightweight and fast, but requires the repository to support
# `git archive` over HTTP/SSH.
# -----------------------------------------------------------------------------
fetch_with_archive() {
  git archive --remote="${SCRAPERS_REPO}" "${SCRAPERS_REF}" "${SCRAPERS_PATH}" \
    | tar -x -C "${SCRAPERS_DIR}"
}

# -----------------------------------------------------------------------------
# fetch_with_sparse
#
# Fallback method: uses sparse-checkout to clone only the desired directory
# from the repository. Useful when git archive is not supported.
# -----------------------------------------------------------------------------
fetch_with_sparse() {
  local tmp_dir
  tmp_dir=$(mktemp -d)

  git clone --filter=blob:none --sparse "${SCRAPERS_REPO}" "${tmp_dir}"
  (
    cd "${tmp_dir}"
    git sparse-checkout set "${SCRAPERS_PATH}"
    git checkout "${SCRAPERS_REF}"
    cp -r "${SCRAPERS_PATH}/." "${SCRAPERS_DIR}/"
  )
  rm -rf "${tmp_dir}"
}

# -----------------------------------------------------------------------------
# use_local_scrapers
#
# Determines whether to skip network fetching and use scrapers already present
# in the container image. Returns 0 if local scrapers should be used.
#
# Conditions:
#   - FETCH_METHOD is explicitly set to 'local'
#   - SCRAPERS_DIR contains *.py or scrapers.txt
# -----------------------------------------------------------------------------
use_local_scrapers() {
  [[ "${FETCH_METHOD}" == "local" ]] && return 0
  [[ -d "${SCRAPERS_DIR}" ]] && \
    find "${SCRAPERS_DIR}" -maxdepth 1 \( -name "*.py" -o -name "scrapers.txt" \) | grep -q . && return 0
  return 1
}

# -----------------------------------------------------------------------------
# Main Setup Logic
# -----------------------------------------------------------------------------
log "preparing ${SCRAPERS_DIR}"

if use_local_scrapers; then
  log "using local scrapers in ${SCRAPERS_DIR} (no network fetch)"
else
  rm -rf "${SCRAPERS_DIR}"
  mkdir -p "${SCRAPERS_DIR}"

  if ! fetch_with_archive; then
    warn "git archive failed, retrying with sparse-checkout ..."
    if ! fetch_with_sparse; then
      err "Failed to fetch '${SCRAPERS_PATH}' from ${SCRAPERS_REPO}@${SCRAPERS_REF}."
      exit 65
    fi
  fi
fi

# -----------------------------------------------------------------------------
# Reporting and Startup
# -----------------------------------------------------------------------------
py_count=$(find "${SCRAPERS_DIR}" -maxdepth 1 -type f -name "*.py" | wc -l || true)
txt_count=$(find "${SCRAPERS_DIR}" -maxdepth 1 -type f -name "scrapers.txt" | wc -l || true)

log "scrapers ready in ${SCRAPERS_DIR} (py: ${py_count}, txt: ${txt_count}, $(date +%Ss))"

if [[ "${txt_count}" -eq 0 ]]; then
  warn "scrapers.txt not found in ${SCRAPERS_DIR} (the run may yield 0 items)."
fi

# -----------------------------------------------------------------------------
# Application Launch
# -----------------------------------------------------------------------------
log "starting application..."
exec python main.py
