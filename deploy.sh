#!/bin/bash
set -e

COMPOSE_FILE="docker-compose.yml"
API_PORT=8081
WEB_PORT=44100
TMP_API_PORT=8082
TMP_WEB_PORT=44101
HEALTH_RETRIES=30
HEALTH_INTERVAL=2

RED='\033[31m' GREEN='\033[32m' BLUE='\033[34m' NC='\033[0m'
log() { echo -e "${BLUE}[deploy]${NC} $1"; }
ok()  { echo -e "${GREEN}[ok]${NC} $1"; }
err() { echo -e "${RED}[err]${NC} $1"; }

health_check() {
  local port=$1 path=$2 label=$3
  for i in $(seq 1 $HEALTH_RETRIES); do
    if curl -sf "http://127.0.0.1:${port}${path}" > /dev/null 2>&1; then
      ok "$label healthy on :$port (attempt $i)"
      return 0
    fi
    sleep $HEALTH_INTERVAL
  done
  err "$label health check failed on :$port"
  return 1
}

# ── Build ──

log "building new images..."
docker compose -f $COMPOSE_FILE build

# ── API: blue-green ──

log "starting new API on :$TMP_API_PORT..."
docker compose -f $COMPOSE_FILE run -d --rm \
  -p 127.0.0.1:$TMP_API_PORT:8081 \
  --name aura-api-new \
  --entrypoint aura-server \
  api

if ! health_check $TMP_API_PORT "/api/entries?limit=1" "API"; then
  err "API failed, rolling back..."
  docker stop aura-api-new 2>/dev/null || true
  exit 1
fi

log "swapping API..."
docker stop aura-api 2>/dev/null || true
docker rm aura-api 2>/dev/null || true
docker compose -f $COMPOSE_FILE up -d api
docker stop aura-api-new 2>/dev/null || true

# ── Web: blue-green ──

log "starting new Web on :$TMP_WEB_PORT..."
docker compose -f $COMPOSE_FILE run -d --rm \
  -p 127.0.0.1:$TMP_WEB_PORT:44100 \
  --name aura-web-new \
  web

if ! health_check $TMP_WEB_PORT "/" "Web"; then
  err "Web failed, rolling back..."
  docker stop aura-web-new 2>/dev/null || true
  exit 1
fi

log "swapping Web..."
docker stop aura-web 2>/dev/null || true
docker rm aura-web 2>/dev/null || true
docker compose -f $COMPOSE_FILE up -d web
docker stop aura-web-new 2>/dev/null || true

# ── Cleanup ──

log "pruning old images..."
docker image prune -f

ok "Deploy complete — API :$API_PORT, Web :$WEB_PORT"