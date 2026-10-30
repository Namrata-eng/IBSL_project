#!/usr/bin/env bash
# ==============================================================================
# ISKCON Kopargaon - Zero-Downtime Application Update Script
# Usage: bash deploy/update.sh
# ==============================================================================

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${APP_DIR}"

echo "🔄 Pulling latest changes from Git repository..."
git pull

echo "📦 Installing any new dependencies..."
npm install

echo "🔨 Building client and server..."
npm run build

echo "⚡ Performing zero-downtime PM2 reload..."
pm2 reload iskcon-api

echo "🌐 Reloading Nginx configuration..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Application successfully updated and running!"

