# syntax=docker/dockerfile:1
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Minimal tools to fetch just the scrapers/ directory at runtime
RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates curl tar bash coreutils \
 && update-ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# (Optional) install deps for your app here
# COPY requirements.txt ./
# RUN pip install --no-cache-dir -r requirements.txt
# COPY . .

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Fixed defaults to the user's repo + path as requested
ENV BIG_REPO_URL="https://gitlab.com/OdinLimaye/cs373-fall-2025-55085_07.git" \
    SCRAPERS_PATH="scrapers" \
    SCRAPERS_REF="main" \
    SCRAPERS_DIR="/app/scrapers" \
    FETCH_METHOD="archive"

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
