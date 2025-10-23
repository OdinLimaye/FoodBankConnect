# =============================================================================
# Dockerfile
# © 2025 Francisco Vivas. All rights reserved.
# =============================================================================

# Base image
FROM python:3.11-slim-bullseye

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080 \
    SCRAPERS_DIR=/app/scrapers

# Install minimal system dependencies
RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and scrapers
COPY main.py scraper.py entrypoint.sh ./
COPY scrapers/ ./scrapers/
RUN chmod +x entrypoint.sh

# Expose port and start
EXPOSE 8080
ENTRYPOINT ["./entrypoint.sh"]
CMD []