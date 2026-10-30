#!/usr/bin/env bash
# ==============================================================================
# ISKCON Kopargaon - Automated AWS EC2 Server Setup Script
# Target OS: Ubuntu 22.04 LTS / 24.04 LTS
# Run as root or with sudo: sudo bash deploy/setup-ec2.sh
# ==============================================================================

set -euo pipefail

echo "=========================================================="
echo "  ISKCON Kopargaon - Ubuntu EC2 Server Provisioning"
echo "=========================================================="

# 1. Verify sudo / root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root or with sudo: sudo bash deploy/setup-ec2.sh"
  exit 1
fi

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UPLOAD_DIR="/var/www/iskcon-uploads"
LOG_DIR="/var/log/pm2"

echo "📍 Application directory: ${APP_DIR}"
echo "📁 External uploads directory: ${UPLOAD_DIR}"

# 2. System update
echo "🔄 Updating system packages..."
apt-get update -y
apt-get upgrade -y
apt-get install -y curl wget git build-essential ufw nginx certbot python3-certbot-nginx

# 3. Install Node.js LTS (v20.x) if not already installed
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -lt 20 ]; then
  echo "📦 Installing Node.js LTS (v20.x)..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "✅ Node.js $(node -v) is already installed."
fi

echo "✅ Node: $(node -v) | npm: $(npm -v)"

# 4. Install PM2 globally
if ! command -v pm2 >/dev/null 2>&1; then
  echo "📦 Installing PM2 process manager..."
  npm install -g pm2
fi

# 5. Create directories & set permissions
echo "📁 Provisioning directories..."
mkdir -p "${UPLOAD_DIR}"
mkdir -p "${LOG_DIR}"

# Determine non-root invoking user (for PM2 ownership)
REAL_USER="${SUDO_USER:-$USER}"
if [ "${REAL_USER}" != "root" ]; then
  chown -R "${REAL_USER}:www-data" "${UPLOAD_DIR}"
  chown -R "${REAL_USER}:${REAL_USER}" "${LOG_DIR}"
else
  chown -R www-data:www-data "${UPLOAD_DIR}"
fi

chmod -R 777 "${UPLOAD_DIR}"
chmod -R 755 "${LOG_DIR}"

# 6. Configure UFW Firewall
echo "🛡️ Configuring firewall rules..."
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
ufw status verbose

# 7. Configure Nginx
echo "🌐 Configuring Nginx reverse proxy (client_max_body_size 10M)..."
NGINX_CONF_DEST="/etc/nginx/sites-available/iskcon-kopargaon"
cp "${APP_DIR}/deploy/nginx-iskcon.conf" "${NGINX_CONF_DEST}"

# Enable site if not already enabled
if [ ! -f /etc/nginx/sites-enabled/iskcon-kopargaon ]; then
  ln -sf "${NGINX_CONF_DEST}" /etc/nginx/sites-enabled/iskcon-kopargaon
fi

# Remove default site if present
if [ -f /etc/nginx/sites-enabled/default ]; then
  rm -f /etc/nginx/sites-enabled/default
fi

# Test Nginx configuration
nginx -t
systemctl restart nginx
systemctl enable nginx

# 8. Setup .env if missing
if [ ! -f "${APP_DIR}/server/.env" ]; then
  echo "⚠️  No server/.env file found. Creating from template..."
  cp "${APP_DIR}/server/.env.example" "${APP_DIR}/server/.env"
  echo "👉 Please edit ${APP_DIR}/server/.env and set your MONGODB_URI and JWT_SECRET!"
fi

# 9. Install dependencies & build
echo "🔨 Installing npm packages and building application..."
cd "${APP_DIR}"
npm install
npm run build

# 10. Start / Reload with PM2
echo "🚀 Starting server with PM2..."
if [ "${REAL_USER}" != "root" ]; then
  sudo -u "${REAL_USER}" pm2 startOrRestart ecosystem.config.cjs
  sudo -u "${REAL_USER}" pm2 save
  env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u "${REAL_USER}" --hp "/home/${REAL_USER}" || true
else
  pm2 startOrRestart ecosystem.config.cjs
  pm2 save
  pm2 startup systemd -u root --hp /root || true
fi

echo "=========================================================="
echo "🎉 Provisioning Complete!"
echo ""
echo "Next steps:"
echo "1. Verify backend: curl http://127.0.0.1:5000/api/health"
echo "2. Edit server/.env with your production MongoDB connection string:"
echo "   nano ${APP_DIR}/server/.env"
echo "3. Run database image migration on your live DB:"
echo "   npm run migrate:images --workspace server"
echo "4. Obtain an SSL certificate using Certbot (once DNS is pointed):"
echo "   sudo certbot --nginx -d iskconkopargaon.com -d www.iskconkopargaon.com"
echo "=========================================================="

