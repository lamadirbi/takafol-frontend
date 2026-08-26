#!/usr/bin/env bash
set -euo pipefail

ROOT=/www/wwwroot/takafol/frontend
cd "$ROOT"

git fetch origin main
git reset --hard origin/main

export NODE_ENV=production
npm ci
npm run build

chown -R www:www .next
systemctl restart takafol-frontend

echo "takafol frontend deployed"
