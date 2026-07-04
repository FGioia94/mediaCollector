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

RUNTIME_DB_URL_NO_JDBC="${RUNTIME_DB_URL#jdbc:}"
RUNTIME_DB_NAME="${RUNTIME_DB_URL_NO_JDBC##*/}"
RUNTIME_DB_NAME="${RUNTIME_DB_NAME%%\?*}"
if [ -z "$RUNTIME_DB_NAME" ] || [ "$RUNTIME_DB_NAME" = "$RUNTIME_DB_URL_NO_JDBC" ]; then
  echo "Cannot parse database name from MEDIAHUB_DB_URL"
  exit 1
fi

RUNTIME_DB_AUTHORITY_PATH="${RUNTIME_DB_URL_NO_JDBC#postgresql://}"
RUNTIME_DB_AUTHORITY="${RUNTIME_DB_AUTHORITY_PATH%%/*}"
RUNTIME_DB_CREDENTIALS=""
RUNTIME_DB_HOST_PORT="$RUNTIME_DB_AUTHORITY"
if echo "$RUNTIME_DB_AUTHORITY" | grep -q '@'; then
  RUNTIME_DB_CREDENTIALS="${RUNTIME_DB_AUTHORITY%@*}"
  RUNTIME_DB_HOST_PORT="${RUNTIME_DB_AUTHORITY##*@}"
fi

RUNTIME_DB_URL_USER=""
RUNTIME_DB_URL_PASSWORD=""
if [ -n "$RUNTIME_DB_CREDENTIALS" ]; then
  RUNTIME_DB_URL_USER="${RUNTIME_DB_CREDENTIALS%%:*}"
  if [ "$RUNTIME_DB_URL_USER" != "$RUNTIME_DB_CREDENTIALS" ]; then
    RUNTIME_DB_URL_PASSWORD="${RUNTIME_DB_CREDENTIALS#*:}"
  fi
fi

RUNTIME_DB_HOST="${RUNTIME_DB_HOST_PORT%%:*}"
RUNTIME_DB_PORT="${RUNTIME_DB_HOST_PORT##*:}"
if [ -z "$RUNTIME_DB_HOST" ] || [ "$RUNTIME_DB_HOST" = "$RUNTIME_DB_HOST_PORT" ]; then
  echo "Cannot parse database host from MEDIAHUB_DB_URL"
  exit 1
fi
if [ "$RUNTIME_DB_PORT" = "$RUNTIME_DB_HOST_PORT" ]; then
  RUNTIME_DB_PORT="5432"
fi

RUNTIME_DB_APP_USER="$(grep -E '^MEDIAHUB_DB_USERNAME=' .env.prod | tail -n 1 | cut -d= -f2- || true)"
RUNTIME_DB_APP_PASSWORD="$(grep -E '^MEDIAHUB_DB_PASSWORD=' .env.prod | tail -n 1 | cut -d= -f2- || true)"
if [ -z "$RUNTIME_DB_APP_USER" ]; then
  echo "Missing MEDIAHUB_DB_USERNAME in .env.prod"
  exit 1
fi
if [ -z "$RUNTIME_DB_APP_PASSWORD" ]; then
  echo "Missing MEDIAHUB_DB_PASSWORD in .env.prod"
  exit 1
fi

# Print runtime DB target (without credentials) to make deploy failures actionable.
RUNTIME_DB_URL_SAFE="$(echo "$RUNTIME_DB_URL" | sed -E 's#(postgres(ql)?://)[^@/]+@#\1***@#')"
echo "Runtime DB URL from .env.prod: $RUNTIME_DB_URL_SAFE"
echo "Runtime DB name from .env.prod: $RUNTIME_DB_NAME"
echo "Runtime DB host/port from .env.prod: ${RUNTIME_DB_HOST}:${RUNTIME_DB_PORT}"

ensure_database_exists() {
  local db_name="$1"
  local pg_container="mediahub-postgres"

  if ! docker ps -a --format '{{.Names}}' | grep -Fxq "$pg_container"; then
    echo "Postgres container '$pg_container' not found; cannot run DB preflight."
    return 1
  fi

  local admin_user="$RUNTIME_DB_APP_USER"
  local admin_password="$RUNTIME_DB_APP_PASSWORD"

  echo "Using postgres user '$admin_user' for DB preflight."

  psql_exec() {
    local sql="$1"
    if [ -n "$admin_password" ]; then
      docker exec -e PGPASSWORD="$admin_password" "$pg_container" \
        psql -h "$RUNTIME_DB_HOST" -p "$RUNTIME_DB_PORT" -U "$admin_user" -d postgres -v ON_ERROR_STOP=1 -tAc "$sql"
    else
      docker exec "$pg_container" \
        psql -h "$RUNTIME_DB_HOST" -p "$RUNTIME_DB_PORT" -U "$admin_user" -d postgres -v ON_ERROR_STOP=1 -tAc "$sql"
    fi
  }

  if psql_exec "SELECT 1 FROM pg_database WHERE datname='${db_name}';" | grep -qx '1'; then
    echo "Database '$db_name' already exists in '$pg_container'."
    return 0
  fi

  echo "Database '$db_name' not found in '$pg_container'. Attempting create with user '$admin_user'..."
  if psql_exec "CREATE DATABASE \"${db_name}\";" > /dev/null; then
    echo "Database '$db_name' created successfully."
  else
    echo "Could not auto-create '$db_name'. Check postgres credentials/privileges."
    return 1
  fi
}

if ! ensure_database_exists "$RUNTIME_DB_NAME"; then
  echo "DB preflight failed. Aborting deploy before restarting containers."
  exit 1
fi

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
