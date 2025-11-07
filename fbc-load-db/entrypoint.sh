#!/usr/bin/env bash
# ==============================================================
#  Copyright (c) 2025 Francisco Vivas Puerto (aka "DaFrancc")
#  All rights reserved.
# ==============================================================

set -euo pipefail

MODE="${1:-run}"

case "$MODE" in
  run)
    # Run local scrapers listed in scrapers/scrapers.txt and print JSON to stdout.
    python - <<'PY'
import json, os
from scraper import scrape
data = scrape()
print(json.dumps(data, ensure_ascii=False))
PY
    ;;

  load)
    # Use your existing loader to truncate/insert into Postgres, then exit.
    # Set DB_* env vars at docker run time. DRY_RUN=false by default.
    import_python='import json, os; os.environ.setdefault("DRY_RUN","false"); from main import run_load; print(json.dumps(run_load(dry_run=os.environ.get("DRY_RUN","false").lower()=="true"), ensure_ascii=False))'
    python -c "$import_python"
    ;;

  api)
    # Start the Flask API defined in main.py
    exec python -u /app/main.py
    ;;

  *)
    echo "Unknown mode: $MODE"
    echo "Usage: docker run … [run|load|api]"
    exit 2
    ;;
esac
