#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f .env.deploy ]; then
  echo "Missing .env.deploy in $SCRIPT_DIR"
  exit 1
fi

if [ ! -f .env.prod ]; then
  echo "Missing .env.prod runtime file in $SCRIPT_DIR"
  exit 1
fi

RUNTIME_DB_URL="$(grep -E '^MEDIAHUB_DB_URL=' .env.prod | tail -n 1 | cut -d= -f2- || true)"
if [ -z "$RUNTIME_DB_URL" ]; then
  echo "Missing MEDIAHUB_DB_URL in .env.prod"
  exit 1
fi

# Print runtime DB target (without credentials) to make deploy failures actionable.
RUNTIME_DB_URL_SAFE="$(echo "$RUNTIME_DB_URL" | sed -E 's#(postgres(ql)?://)[^@/]+@#\1***@#')"
echo "Runtime DB URL from .env.prod: $RUNTIME_DB_URL_SAFE"

set -a
source .env.deploy
set +a

COMPOSE="docker compose --env-file .env.deploy -f docker-compose.prod.yml"
BACKEND_HEALTH_URL="http://127.0.0.1:${BACKEND_PORT:-8080}/api/health"

echo "Pulling fresh images..."
$COMPOSE pull

echo "Cleaning up conflicting legacy containers (if any)..."
for name in mediahub-backend mediahub-frontend; do
  if docker ps -a --format '{{.Names}}' | grep -Fxq "$name"; then
    docker rm -f "$name" > /dev/null || true
    echo "Removed stale container: $name"
  fi
done

echo "Restarting stack..."
$COMPOSE up -d --remove-orphans

echo "Waiting for backend health..."
for attempt in $(seq 1 40); do
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
echo "----- Backend logs (last 200 lines) -----"
docker logs --tail 200 mediahub-backend || true
echo "----- Frontend logs (last 80 lines) -----"
docker logs --tail 80 mediahub-frontend || true
echo "----- Backend container state -----"
docker inspect mediahub-backend --format '{{json .State}}' || true
exit 1
