# Build stage for frontend
FROM node:22-bookworm-slim AS frontend-builder
WORKDIR /app
COPY frontend/ ./
RUN npm install
RUN npm run build

# Build stage for backend
FROM ghcr.io/astral-sh/uv:python3.13-alpine
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Install the project's dependencies using the lockfile and settings
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=backend/uv.lock,target=uv.lock \
    --mount=type=bind,source=backend/pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

COPY backend/src /app/src
COPY --from=frontend-builder /app/dist /app/static

# Expose port
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV HOST=0.0.0.0

# Run the application
CMD ["./.venv/bin/python", "src/main.py", "--server", "--host", "0.0.0.0", "--port", "8080"]
