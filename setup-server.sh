#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " ABR Greens Backend & Open-Source PostgreSQL Setup (EC2) "
echo "=========================================================="

# 1. Update OS packages
echo "📦 Updating server packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# 2. Install Open-Source PostgreSQL
echo "🐘 Installing Open-Source PostgreSQL 16..."
sudo apt-get install -y postgresql postgresql-contrib

# 3. Start & Enable PostgreSQL Service
sudo systemctl enable postgresql
sudo systemctl start postgresql

# 4. Create Database & User
DB_NAME="abr_greens"
DB_USER="abr_user"
DB_PASS="SecurePassword2026!"

echo "🔑 Creating PostgreSQL User & Database..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname = '${DB_USER}'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS}';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

# 5. Run Database Schema & Seed Data
echo "📊 Initializing Database Schema..."
PGPASSWORD="${DB_PASS}" psql -h localhost -U "${DB_USER}" -d "${DB_NAME}" -f schema.sql

# 6. Install Node.js 20 LTS & PM2
echo "⚡ Installing Node.js LTS and PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2 rimraf typescript

# 7. Configure Environment
cat <<EOF > .env
PORT=3000
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}
DB_HOST=localhost
DB_PORT=5432
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
DB_NAME=${DB_NAME}
DB_POOL_MAX=30
JWT_SECRET=$(openssl rand -hex 32)
EOF

# 8. Install Dependencies & Build TypeScript
echo "🔨 Installing Node dependencies and building TypeScript..."
npm install
npm run build

# 9. Start with PM2 Cluster Mode
echo "🚀 Starting backend with PM2 Cluster Mode..."
pm2 start ecosystem.config.json --env production
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

echo "=========================================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "Server is running on port 3000"
echo "Check status: pm2 status"
echo "Check logs:   pm2 logs"
echo "=========================================================="
