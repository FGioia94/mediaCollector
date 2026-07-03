#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

COMPOSE="docker compose --env-file .env.prod -f docker-compose.prod.yml"
BACKEND_HEALTH_URL="http://127.0.0.1:${BACKEND_PORT:-8080}/api/health"

echo "Pulling fresh images..."
$COMPOSE pull

echo "Restarting stack..."
$COMPOSE up -d --remove-orphans

echo "Waiting for backend health..."
for attempt in $(seq 1 20); do
  if curl -fsS "$BACKEND_HEALTH_URL" > /dev/null; then
    echo "Health check passed."
    $COMPOSE ps
    docker image prune -f > /dev/null || true
    exit 0
  fi
  sleep 3
done

echo "Health check failed after deploy."
$COMPOSE ps
exit 1
