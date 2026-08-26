#!/usr/bin/env bash
set -euo pipefail
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
npm config set fetch-retries 8 >/dev/null

ROOT=/www/wwwroot/takafol/frontend
git config --global --add safe.directory "$ROOT" 2>/dev/null || true
cd "$ROOT"

git fetch origin main
git reset --hard origin/main

npm ci --include=dev
NODE_ENV=production npm run build

chown -R www:www .next
systemctl restart takafol-frontend

# aaPanel enables a global nginx proxy cache that would keep the previous HTML for a day.
if [ -f /www/wwwroot/takafol/nginx-proxy.inc ]; then
  python3 - <<'PY'
from pathlib import Path
p = Path('/www/wwwroot/takafol/nginx-proxy.inc')
t = p.read_text()
if 'proxy_cache off' not in t:
    t = t.replace('proxy_pass http://127.0.0.1:8010;', 'proxy_pass http://127.0.0.1:8010;\n        proxy_cache off;')
    t = t.replace(
        'proxy_pass http://127.0.0.1:3010;',
        'proxy_pass http://127.0.0.1:3010;\n        proxy_cache off;\n        proxy_no_cache 1;\n        proxy_cache_bypass 1;',
        1,
    )
    p.write_text(t)
PY
fi
find /www/server/nginx/proxy_cache_dir -type f -delete 2>/dev/null || true
nginx -s reload >/dev/null 2>&1 || true

echo "takafol frontend deployed"
