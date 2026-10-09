# 🚀 FoodBridge AI - Production Deployment Guide

This guide details how to deploy **FoodBridge AI** into production across modern cloud platforms or dedicated virtual servers.

---

## 🏗️ Architecture Overview

FoodBridge AI is built as a production-grade monorepo containing:
* **Frontend:** Next.js 15+ App Router, React 19, Tailwind CSS, Leaflet Maps, Recharts (`apps/web`)
* **API Backend:** Node.js, Express, TypeScript, Prisma ORM, JWT with RBAC, Swagger (`apps/api`)
* **AI/ML Service:** Python 3.11+, FastAPI, Scikit-learn, Joblib (`apps/ml-service`)
* **Database:** MongoDB (or PostgreSQL/SQLite) via Prisma ORM (`prisma/`)
* **Shared Types:** TypeScript Zod validation & data schemas (`packages/shared`)

---

## 📋 Pre-Deployment Verification

Before deploying, you can run the full test and build verification with:

```bash
# 1. Build all packages and applications
npm run build

# 2. Run Backend API tests (Jest)
npm test

# 3. Run AI/ML tests (pytest)
npm run test:ml
```

---

## 🌐 Method 1: Cloud Deployment (Recommended)
### Vercel + Render / Railway + MongoDB Atlas

This modern architecture provides automatic SSL, global CDN caching, high availability, and free-tier hosting for all three tiers.

```
                    ┌─────────────────────────┐
                    │      Next.js (Web)      │
                    │   Deployed on Vercel    │
                    └────────────┬────────────┘
                                 │ HTTPS
                                 ▼
                    ┌─────────────────────────┐
                    │    Node.js (REST API)   │
                    │   Deployed on Render    │
                    └───────┬───────────┬─────┘
                            │           │
           Internal HTTP    │           │ MongoDB Driver
                            ▼           ▼
┌─────────────────────────────┐       ┌─────────────────────────────┐
│    FastAPI (AI/ML Service)  │       │        MongoDB Atlas        │
│     Deployed on Render      │       │     Managed Cloud Cluster   │
└─────────────────────────────┘       └─────────────────────────────┘
```

### Step 1: Create a Free Database on MongoDB Atlas
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (**M0**).
3. Under **Database Access**, create a user (e.g. `foodbridge_admin`) and password.
4. Under **Network Access**, add `0.0.0.0/0` (allow connection from anywhere).
5. Copy your connection string:
   ```env
   DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/foodbridge?retryWrites=true&w=majority"
   ```
6. From your local machine, push the schema and seed the base accounts:
   ```bash
   DATABASE_URL="<your_atlas_connection_string>" npx prisma db push
   DATABASE_URL="<your_atlas_connection_string>" npm run db:seed
   ```

---

### Step 2: Deploy Python AI/ML Service (Render / Railway)
1. In [Render](https://render.com) or [Railway](https://railway.app), create a new **Web Service** from your GitHub repo.
2. Configure settings:
   * **Root Directory:** `apps/ml-service`
   * **Runtime:** Python 3 or Docker
   * **Build Command:** `pip install -r requirements.txt && python train.py`
   * **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Copy your live ML service URL: `https://foodbridge-ml.onrender.com`.

---

### Step 3: Deploy Express API (Render / Railway)
1. Create another **Web Service** on Render/Railway.
2. Configure settings:
   * **Root Directory:** Root repository `/`
   * **Build Command:** `npm install && npm run build:shared && npx prisma generate && npm run build:api`
   * **Start Command:** `node apps/api/dist/server.js`
3. Add Environment Variables:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<your_atlas_connection_string>
   JWT_ACCESS_SECRET=<generate_a_random_64_char_string>
   JWT_REFRESH_SECRET=<generate_a_random_64_char_string>
   ML_SERVICE_URL=https://foodbridge-ml.onrender.com
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
4. Copy your live API URL: `https://foodbridge-api.onrender.com`.

---

### Step 4: Deploy Next.js Web on Vercel
1. Go to [vercel.com](https://vercel.com) and import your repository.
2. Select **Next.js** framework preset.
3. Set **Root Directory** to `apps/web`.
4. In **Environment Variables**, add:
   ```env
   NEXT_PUBLIC_API_URL=https://foodbridge-api.onrender.com/api
   ```
5. Click **Deploy**!
   Your web app will be live at `https://your-app.vercel.app`.

---

## 🐳 Method 2: Single-Server VPS with Docker Compose
### AWS EC2 / DigitalOcean Droplet / Linode / Hetzner

Deploy the entire stack with a single command on any Linux VPS with Docker installed.

### 1. Provision a Server
* OS: Ubuntu 22.04 LTS / 24.04 LTS
* Recommended Specs: 2 vCPU, 4GB RAM

### 2. Clone & Launch
```bash
# Install Docker & Docker Compose if not installed
curl -fsSL https://get.docker.com | sh

# Clone repository
git clone https://github.com/your-username/foodbridge-ai.git
cd foodbridge-ai

# Start the entire stack in detached production mode
docker compose up --build -d
```

### 3. Initialize & Seed Accounts
```bash
# Seed initial clean accounts into the containerized MongoDB
docker compose exec api npx ts-node prisma/clean.ts
```

### 4. Verify Services
* Frontend: `http://<your-server-ip>:3000`
* API & Health: `http://<your-server-ip>:5001/health`
* Swagger Docs: `http://<your-server-ip>:5001/api/docs`
* AI/ML Service: `http://<your-server-ip>:8001/health`

---

## 🔐 Environment Variables Reference

### Backend API (`apps/api`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | API server listen port | `5001` or `5000` |
| `DATABASE_URL` | MongoDB connection URI | `mongodb+srv://...` |
| `JWT_ACCESS_SECRET` | Secret key for signing access JWTs | Random 32+ character string |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh JWTs | Random 32+ character string |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifespan | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan | `7d` |
| `ML_SERVICE_URL` | Internal or public URL of ML service | `http://ml-service:8001` |
| `CORS_ORIGIN` | Allowed web origins (comma separated or `*`) | `https://foodbridge.ai` |

### Frontend Web (`apps/web`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Public URL to backend API | `https://api.foodbridge.ai/api` |
| `PORT` | Port for standalone Next.js server | `3000` |

### Python ML Service (`apps/ml-service`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | FastAPI listen port | `8001` |

---

## 🩺 Production Health Checks & Monitoring

* **Liveness & Readiness Probe:** `GET /health`
  ```json
  {
    "status": "healthy",
    "platform": "FoodBridge AI",
    "database": "connected",
    "uptimeSeconds": 1420,
    "timestamp": "2026-10-09T22:45:00.000Z"
  }
  ```
* **Security Headers Included Out of the Box:**
  * `X-Content-Type-Options: nosniff`
  * `X-Frame-Options: SAMEORIGIN`
  * `X-XSS-Protection: 1; mode=block`
  * `Referrer-Policy: strict-origin-when-cross-origin`

---

## 💾 Database Backup & Restore

### Backup MongoDB
```bash
mongodump --uri="<your-database-uri>" --out=/backups/$(date +%F)
```

### Restore MongoDB
```bash
mongorestore --uri="<your-database-uri>" /backups/2026-10-09/foodbridge
```
