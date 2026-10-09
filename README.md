# 🍱 FoodBridge AI
### AI-Powered Food Waste Reduction & Hunger Management Platform

> **"Turn Surplus Food Into Someone's Next Meal."**
> FoodBridge AI connects restaurants, college hostels, cafeterias, and event organizers with verified hunger relief shelters and volunteer delivery networks — intelligently, locally, and in real time.

---

## 🌟 Architecture & Monorepo Structure

FoodBridge AI is structured as a clean, modular production monorepo:

```
foodbridge-ai/
├── apps/
│   ├── web/                 # Next.js 15+ App Router, React 19, Tailwind CSS, Leaflet Maps, Recharts
│   ├── api/                 # Node.js + Express + TypeScript, Prisma ORM, JWT, RBAC, Swagger
│   └── ml-service/          # Python FastAPI, scikit-learn (GBM/RF Regressors), Pandas, NumPy
│
├── packages/
│   └── shared/              # Shared TypeScript types, Zod schemas, conversion constants
│
├── prisma/
│   ├── schema.prisma        # Complete schema (SQLite for local zero-config, Postgres production)
│   ├── schema.postgres.prisma
│   └── seed.ts              # Delhi NCR seed data (10 Donors, 10 NGOs, 5 Volunteers, 50+ donations)
│
├── docker-compose.yml       # Multi-container orchestration (Postgres, Redis, API, Web, ML)
├── README.md
└── package.json
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, Recharts, Leaflet / OpenStreetMap, Lucide Icons |
| **Backend API** | Node.js, Express.js, TypeScript, REST Architecture, Swagger / OpenAPI 3.0, Morgan |
| **Database & ORM** | PostgreSQL 16 (Production) / SQLite (Zero-config local), Prisma ORM |
| **AI / ML Service** | Python 3.11+, FastAPI, scikit-learn (GradientBoosting & RandomForest), Pandas, NumPy, Joblib |
| **Authentication** | JWT Access & Refresh Tokens, bcryptjs password hashing, Role-Based Access Control (RBAC) |
| **Containerization** | Docker, Docker Compose multi-service architecture |

---

## 👥 User Roles & Capabilities

### 1. 🍽️ Food Donors (Restaurants, Hostels, Caterers, Banquets)
- Create surplus listings in under 60 seconds with dietary categorization (Veg, Non-Veg, Vegan), packaging type, allergens checklist, and pickup timing.
- Automatic **meal portion conversion** (e.g. 20 kg cooked meal yields ~50 meal portions).
- Immediate AI NGO matching upon submission with score breakdown and live nearby shelter discovery.
- Track volunteer dispatch, pickup status, and confirmed delivery.
- Comprehensive impact dashboard: Total food donated (kg), meals rescued, waste prevented, CO₂ mitigated.

### 2. 🏠 NGOs & Food Shelters
- Post real-time daily food demands with urgency levels (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- **"Recommended For You"** AI recommendation feed showing suitability scores, proximity (km), and explainable reasons.
- 1-click **Accept / Decline** donation flow that automatically books collection dispatch and closes competing requests.
- Track volunteer transit and mark donation receipt.

### 3. 🛵 Delivery Volunteers
- Live assignment feed with pickup and destination addresses, distance, cargo quantity, and deadline.
- Interactive stepper: `ASSIGNED` $\to$ `ON WAY TO PICKUP` $\to$ `PICKED UP` $\to$ `DELIVERED`.
- Complete delivery with receiver name, delivered quantity verification, and digital receipt notes.
- Profile stats and gamified delivery milestone badges.

### 4. 🛡️ Platform Administrators
- Top platform metrics: Total rescued kg, meals provided, active donors, NGOs, and couriers.
- Organization verification queue to approve or reject newly registered NGOs and shelters.
- User management with active/suspend controls.
- Full audit log trail capturing logins, listings, matching events, and completed deliveries.
- 1-click **CSV Report Export** (Donations, NGO Shelters, Donor Directory, Impact metrics).

---

## 🧠 6-Factor AI Matching Engine

When a donation is reported, the matching engine calculates a normalized 0–100 suitability score for every verified NGO in the area:

$$\text{MatchScore} = 0.20 \cdot \text{Distance} + 0.20 \cdot \text{QuantityFit} + 0.20 \cdot \text{Compatibility} + 0.15 \cdot \text{Urgency} + 0.15 \cdot \text{Expiry} + 0.10 \cdot \text{Capacity}$$

### Factor Scoring Breakdown:
1. **Distance Score (20%)**: Haversine distance from donor to NGO. $\le 2\text{ km} = 100$, linear decay up to NGO service radius ($15\text{ km}$).
2. **Quantity Fit Score (20%)**: Compares donation estimated meals against NGO active demand and daily meal capacity.
3. **Food Compatibility Score (20%)**: Strict dietary filters. Non-veg food is automatically filtered out ($0\%$) for vegetarian-only shelters.
4. **Urgency Score (15%)**: Weighting based on shelter urgency (`CRITICAL` = 100%, `HIGH` = 88%, `MEDIUM` = 70%).
5. **Expiry Score (15%)**: Prioritizes urgent rescue if food expires within 6 hours.
6. **Capacity Score (10%)**: Ensures the shelter's physical capacity can handle the incoming quantity.

### Natural Language AI Explainability:
Every recommendation includes natural language drivers, for example:
> *"Recommended because Robin Hood Army is 2.3 km away, currently requires 62 meals, 100% vegetarian compatible, and the batch expires within 5 hours."*

---

## 🔮 Machine Learning Prediction Models

The Python FastAPI microservice trains and evaluates regression models on historical kitchen surplus and shelter demand patterns:

1. **Surplus Regressor (`GradientBoostingRegressor`)**:
   - Features: `restaurant_type`, `food_category`, `day_of_week`, `month`, `expected_customers`, `has_event`, `is_holiday`
   - Target: `surplus_kg`
   - Returns: Point estimate, 95% confidence prediction interval range, and key factor drivers.
   - Benchmark: $R^2 \approx 0.81$, $\text{MAE} \approx 3.42\text{ kg}$.

2. **Demand Regressor (`RandomForestRegressor`)**:
   - Features: `ngo_type`, `food_category`, `day_of_week`, `people_served`, `is_weekend`, `scheduled_drive`
   - Target: `demand_kg`
   - Benchmark: $R^2 \approx 0.84$, $\text{MAE} \approx 4.15\text{ kg}$.

3. **Deterministic Algorithmic Fallback**:
   - The Node.js API features built-in fallback formulas so the entire application operates continuously without interruption even if the Python service is offline.

---

## 🔑 Demo Accounts (Seeded)

All demo accounts are pre-seeded and accessible via the **1-Click Demo Persona Switcher** on the navbar and login page:

| Role | Email | Password | Organization / Entity |
|---|---|---|---|
| **System Admin** | `admin@foodbridge.ai` | `Admin@123` | Platform Administrator |
| **Restaurant Donor** | `donor@foodbridge.ai` | `Password@123` | FoodBridge Partner Kitchen (0 donations) |
| **NGO Shelter** | `ngo@foodbridge.ai` | `Password@123` | FoodBridge Shelter Home (0 demands) |
| **Courier Volunteer** | `volunteer@foodbridge.ai` | `Password@123` | Volunteer Courier (0 deliveries) |

---

## 🧹 Database Reset & Cleaning

To reset the database to a completely clean slate (0 donations, 0 fake listings, 0 completed deliveries):
```bash
npm run db:clean
```

To re-seed sample demonstration data if ever needed:
```bash
npm run db:seed
```

---

## 🚀 Quick Start & Installation

### Option 1: One-Command Docker Setup
```bash
docker compose up --build
```
- Web Application: [http://localhost:3000](http://localhost:3000)
- REST API & Swagger: [http://localhost:5001/api/docs](http://localhost:5001/api/docs)
- Python ML Service: [http://localhost:8001/metrics](http://localhost:8001/metrics)

---

### Option 2: Local Native Development

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Initialize Database & Seed
```bash
npm run db:push
npm run db:seed
```

#### 3. Start Python ML Microservice (Terminal 1)
```bash
cd apps/ml-service
python3 -m pip install -r requirements.txt
python3 train.py
python3 main.py
```

#### 4. Start Backend API (Terminal 2)
```bash
npm run dev:api
```

#### 5. Start Frontend Web App (Terminal 3)
```bash
npm run dev:web
```

---

## 🧪 Testing

### Backend Unit & Integration Tests:
```bash
npm run test:api
```
Validates:
- JWT generation and verification
- Matching formula weights ($= 1.00$)
- Haversine distance calculations
- Dietary compatibility filters
- Meal conversion rules across categories

### Python ML Service Tests:
```bash
npm run test:ml
```

---

## 🗺️ Interactive Maps (OpenStreetMap & Leaflet)
- Interactive map available at `/map`
- Color-coded pins for **Donors** (Orange), **NGOs** (Blue), **Surplus Food** (Emerald), and **Deliveries** (Purple)
- Full popup metadata showing quantity, address, contact, and current status.
- Zero expensive proprietary map keys required.

---

## 📄 License
MIT License. Built for social impact and food waste eradication.
