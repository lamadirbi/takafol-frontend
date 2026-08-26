#!/usr/bin/env bash
set -euo pipefail
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
npm config set fetch-retries 8 >/dev/null

ROOT=/www/wwwroot/takafol/frontend
git config --global --add safe.directory "$ROOT" 2>/dev/null || true
cd "$ROOT"

git fetch origin main
git reset --hard origin/main

export NODE_ENV=production
npm ci
npm run build

chown -R www:www .next
systemctl restart takafol-frontend

echo "takafol frontend deployed"
