# ABR Greens - Production TypeScript Backend & PostgreSQL

High-performance, strictly typed REST API backend built for the ABR Greens Real Estate mobile app. Engineered to scale to **1,000+ requests/sec** on AWS EC2 using Node.js clustering, `pg.Pool` connection pooling, and open-source PostgreSQL.

---

## 🏗️ Architecture & Tech Stack

- **Runtime**: Node.js (v18+ / v20+ / v24+)
- **Language**: 100% **TypeScript** (`strict: true`)
- **Framework**: Express.js
- **Database**: **PostgreSQL 16** (Open-Source)
- **Driver**: `pg` with connection pooling (`pg.Pool`)
- **Process Manager**: PM2 (Cluster Mode utilizing all CPU cores)
- **Authentication**: JWT & `bcryptjs`
- **File Uploads**: Multer with static asset storage

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts                   # PostgreSQL pool connection & auto-table migration
│   ├── controllers/
│   │   ├── authController.ts       # Registration, login, profile, password, FCM tokens
│   │   ├── projectController.ts    # Projects list, preferences, agents, about, contact
│   │   ├── applicationController.ts# Plot applications, uploads, allotment letter PDF
│   │   ├── receiptController.ts    # Payment receipts & mobile transactions
│   │   ├── referralController.ts   # Referrals, resale requests, site visit bookings
│   │   ├── luckyDrawController.ts  # Mega lucky draw status & winner lists
│   │   └── mediaController.ts      # Image & video galleries
│   ├── middleware/
│   │   ├── auth.ts                 # JWT Bearer token authentication
│   │   └── upload.ts               # Multer image/document uploader
│   ├── routes/
│   │   └── api.ts                  # All 34 Flutter-compatible REST routes
│   ├── scripts/
│   │   └── initDb.ts               # Standalone database migration runner
│   ├── types/
│   │   └── index.ts                # TypeScript domain models and interface types
│   └── server.ts                   # Express app entrypoint & static storage serving
├── storage/                        # Uploaded PDFs, brochures, project images
├── schema.sql                      # Open-source PostgreSQL schema with indexes & seed data
├── Dockerfile                      # Production Docker container image definition
├── docker-compose.yml              # Multi-container orchestration (API + PostgreSQL 16)
├── ecosystem.config.json           # PM2 cluster configuration for 1,000 req/s on EC2
├── setup-server.sh                 # 1-click EC2 Linux automated deployment script
├── package.json
└── tsconfig.json
```

---

## 🐳 Option A: 1-Command Full Stack Docker (API + PostgreSQL)

If Docker is installed on your server:

```bash
cd backend

# Build and start both PostgreSQL 16 & the TypeScript Backend API:
docker compose up -d --build

# View real-time logs:
docker compose logs -f

# Check container status:
docker compose ps
```
The Docker setup automatically runs `schema.sql`, configures connection pooling, and exposes the REST API on port `8000`.

---

## 🐧 Option B: Deploy onto Ubuntu / Debian / EC2 Linux Server (Recommended)

Run the included automated setup script on your EC2 instance:

```bash
cd backend
chmod +x setup-server.sh
./setup-server.sh
```

Or manually perform the steps:

### 1. Install PostgreSQL
```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 2. Create Database & User
```bash
sudo -u postgres psql
```
Inside the `psql` shell:
```sql
CREATE USER abr_user WITH ENCRYPTED PASSWORD 'YourSecurePasswordHere';
CREATE DATABASE abr_greens OWNER abr_user;
GRANT ALL PRIVILEGES ON DATABASE abr_greens TO abr_user;
\q
```

### 3. Load Schema & Seed Data
```bash
PGPASSWORD='YourSecurePasswordHere' psql -h localhost -U abr_user -d abr_greens -f schema.sql
```

### 4. Configure Environment
Edit `.env`:
```env
PORT=8000
DATABASE_URL=postgresql://abr_user:YourSecurePasswordHere@localhost:5432/abr_greens
DB_HOST=localhost
DB_PORT=5432
DB_USER=abr_user
DB_PASSWORD=YourSecurePasswordHere
DB_NAME=abr_greens
DB_POOL_MAX=30
JWT_SECRET=production_secret_key_change_me
```

### 5. Compile & Launch with PM2 Cluster Mode
```bash
npm install
npm run build
pm2 start ecosystem.config.json --env production
pm2 save
pm2 startup
```

---

## 🚀 Performance Tuning for 1,000 Requests / Second

1. **PM2 Cluster Mode**: `ecosystem.config.json` runs `instances: 'max'`, creating an event loop per CPU core.
2. **PostgreSQL Connection Pool**: `DB_POOL_MAX=30` allocates optimal persistent database sockets per cluster worker.
3. **Database B-Tree Indexes**: Indexes on `users(email)`, `users(mobile)`, `applications(user_id)`, and `receipts(user_id)` ensure index-seek response times under 5ms.
4. **Static File Serving**: Express serves `/storage/` directly with cached headers.

---

## 📱 Connecting the Flutter App

In [lib/res/app_urls.dart](file:///Users/macbook/Downloads/abr_v1.1.0/lib/res/app_urls.dart), update the base URLs:

```dart
class AppUrl {
  // Replace with your EC2 Public IP or Domain:
  static var baseUrl = 'http://YOUR_EC2_PUBLIC_IP:8000/api/';
  static var imageBaseUrl = 'http://YOUR_EC2_PUBLIC_IP:8000/storage/';
  
  // For local Android Emulator testing:
  // static var baseUrl = 'http://10.0.2.2:8000/api/';
  // static var imageBaseUrl = 'http://10.0.2.2:8000/storage/';
}
```
