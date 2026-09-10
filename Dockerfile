# VERITAS-GEM Container Image
# Multi-stage / lightweight Python 3.12-slim runtime
FROM python:3.12-slim

# Prevent Python from buffering stdout/stderr and writing bytecode
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app/backend

WORKDIR /app

# Install system dependencies (curl for container healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy application backend and frontend assets
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/

# Expose HTTP port
EXPOSE 8000

# Container healthcheck against versioned system status endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/system/status || exit 1

# Production server entrypoint (supports cloud dynamic $PORT e.g. Render, Railway, Cloud Run)
CMD ["sh", "-c", "uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port ${PORT:-8000}"]
