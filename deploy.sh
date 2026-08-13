#!/usr/bin/env bash
set -euo pipefail

echo "==> git pull"
git pull

echo "==> npm install"
npm install

echo "==> npm run build"
npm run build

echo "==> pm2 restart swami"
pm2 restart swami

echo "==> Deploy complete"
