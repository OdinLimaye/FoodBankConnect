# ==============================================================
#  Copyright (c) 2025 Francisco Vivas Puerto (aka "DaFrancc")
#  All rights reserved.
# ==============================================================

FROM python:3.11-slim

# System deps (optional but handy for builds)
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    curl ca-certificates tini \
  && rm -rf /var/lib/apt/lists/*

# Workdir
WORKDIR /app

# Python deps first (better layer caching)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# App code + local scrapers
COPY . /app

# Environment defaults
ENV PYTHONUNBUFFERED=1 \
    SCRAPERS_DIR=/app/scrapers \
    PORT=8080

# Entrypoint
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/usr/bin/tini","--","/app/entrypoint.sh"]

# Default behavior: run local scrapers and exit
CMD ["run"]
