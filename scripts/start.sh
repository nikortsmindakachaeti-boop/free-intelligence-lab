#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if ! command -v docker >/dev/null 2>&1; then
  echo 'Docker არ არის დაყენებული. ჯერ დააყენე Docker Engine და Compose.' >&2
  exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo 'Docker Compose v2 ვერ მოიძებნა.' >&2
  exit 1
fi
if ! command -v openssl >/dev/null 2>&1; then
  echo 'openssl აუცილებელია გასაღებების გენერაციისთვის.' >&2
  exit 1
fi
if [[ ! -f .env ]]; then
  umask 077
  printf 'ENCRYPTION_KEY=%s\nWEBUI_SECRET_KEY=%s\n' "$(openssl rand -hex 32)" "$(openssl rand -hex 32)" > .env
  echo 'შეიქმნა ლოკალური .env შემთხვევითი საიდუმლო გასაღებებით.'
fi
# Never run a publicly exposed API gateway: every published port is bound to 127.0.0.1.
docker compose up -d --build
printf '\nპორტალი: http://localhost:8088\nOSIRIS: http://localhost:3000\nFreeLLMAPI: http://localhost:3001\nOpen WebUI: http://localhost:3002\n'
