FROM python:3.11-slim

ENV POETRY_VERSION=2.4.1 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_NO_INTERACTION=1 \
    PATH="/opt/poetry/bin:$PATH"

WORKDIR /app

# Install system dependencies including PostgreSQL client and build tools
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir "poetry==${POETRY_VERSION}"

# Install Python dependencies (cached layer)
COPY pyproject.toml poetry.lock ./
RUN poetry install --only main --no-root

# Copy application code
COPY . .

# Create data directory for SQLite (fallback)
RUN mkdir -p /app/data

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check with retry and better timeout
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start the application with proper signal handling
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
