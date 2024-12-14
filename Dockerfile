# Build stage for frontend
FROM node:22-bookworm-slim AS frontend-builder
WORKDIR /app
COPY frontend/ ./
RUN npm install
RUN npm run build

# Build stage for backend
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS backend-builder
WORKDIR /app
COPY backend/ ./
RUN uv sync --no-dev

# Final distroless stage
FROM gcr.io/distroless/static-debian12
WORKDIR /app

# Copy Python dependencies from backend-builder
COPY --from=backend-builder /app/.venv /app/.venv
COPY --from=backend-builder /root/.local/share/uv/ /root/.local/share/uv/

# Copy your application code
COPY --from=backend-builder /app/src /app/src
# Copy frontend static files
COPY --from=frontend-builder /app/dist /app/static


# Expose port
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV HOST=0.0.0.0

# Run the application
CMD ["./.venv/bin/python", "src/main.py", "--server", "--host", "0.0.0.0", "--port", "8080"]
