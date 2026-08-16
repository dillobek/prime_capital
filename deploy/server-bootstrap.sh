#!/usr/bin/env sh
set -eu

REPO_URL="https://github.com/dillobek/prime_capital.git"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/prime-capital}"

if [ ! -d "$DEPLOY_PATH/.git" ]; then
  mkdir -p "$(dirname "$DEPLOY_PATH")"
  git clone "$REPO_URL" "$DEPLOY_PATH"
fi

cd "$DEPLOY_PATH"
git fetch origin main
git reset --hard origin/main

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Edit $DEPLOY_PATH/.env, then run this script again."
  exit 1
fi

docker compose up -d --build --remove-orphans
