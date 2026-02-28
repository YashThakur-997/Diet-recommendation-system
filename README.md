<p align="center">
  <img src="client/public/favicon.jpg" width="80" height="80" alt="NutriAI" />
</p>

# NutriAI

**Your personal AI nutritionist.** Get tailored meal plans, recipes, and shopping lists based on your health profile, goals, allergies, and dietary preferences—with optional Strava integration and privacy-focused data handling.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| **🔐 Auth** | Email/password and **Google Sign-In** (JWT, httpOnly cookies) |
| **🥗 Meal plans** | AI-generated weekly plans + recipes + shopping lists (powered by **Ollama** / BioMistral) |
| **📋 Health profile** | Age, gender, blood group, BMI, conditions, allergies, goals, activity level, diet type, budget |
| **⌚ Wearables** | Optional **Strava** connect: sync activities and use data in recommendations |
| **🔒 Data safety** | PII/PHI detection, sanitization, de-identification; HIPAA Safe Harbor–style handling and audit log |
| **🎨 UI** | React 19 + Vite + Tailwind + Framer Motion; dark theme, responsive |

---

## 🛠 Tech stack

| Layer | Stack |
|-------|--------|
| **Frontend** | React 19, TypeScript, Vite 7, React Router 7, Tailwind CSS, Framer Motion, Lucide icons |
| **Backend** | Node.js, Express 5, Mongoose 9, JWT, bcrypt, Google Auth Library, Helmet, rate limiting |
| **AI** | Ollama (default model: BioMistral or `llama3.1`) — runs **locally** |
| **Data** | MongoDB |

---

## 📋 Prerequisites

- **Node.js** (v18+)
- **MongoDB** (local or Atlas)
- **Ollama** (for meal-plan AI) — [install](https://ollama.ai) and run e.g. `ollama pull llama3.1` or your preferred model

---

## 🚀 Quick start

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Diet-recommendation-system
```

**Backend**

```bash
cd server
npm install
```

**Frontend**

```bash
cd client
npm install
```

### 2. Environment variables

**Backend** — copy `server/.env.example` to `server/.env` and set:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/DietRecommendationDB
JWT_SECRET=your-secret
CORS_ORIGIN=http://localhost:5173
OLLAMA_HOST=http://localhost:11434
DEFAULT_MODEL=llama3.1
```

**Frontend** — create `client/.env` (optional; only needed for Google Sign-In):

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Run

**Terminal 1 — backend**

```bash
cd server
npm start
```

**Terminal 2 — frontend**

```bash
cd client
npm run dev
```

Open **http://localhost:5173**. Sign up or sign in, complete your health profile, then generate meal plans from the dashboard.

---

## 🔧 Configuration

### Google Sign-In

1. Create an [OAuth 2.0 Client ID](https://console.cloud.google.com/apis/credentials) (Web application).
2. Add **Authorized JavaScript origins** (e.g. `http://localhost:5173`).
3. Set **Backend:** `GOOGLE_CLIENT_ID` in `server/.env`.
4. Set **Frontend:** `VITE_GOOGLE_CLIENT_ID` in `client/.env` (same value).
5. Restart both server and client.

If you see *“The given origin is not allowed”*, add the exact URL you’re using (e.g. `http://localhost:5173` or `http://127.0.0.1:5173`) in the Google Cloud Console.

### Strava (optional)

1. Create an app in [Strava API](https://www.strava.com/settings/api).
2. In `server/.env` set:
   - `STRAVA_CLIENT_ID`
   - `STRAVA_CLIENT_SECRET`
   - `STRAVA_REDIRECT_URI` (e.g. `http://localhost:3000/api/strava/callback`)

---

## 📁 Project structure

```
Diet-recommendation-system/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Dashboard, MealPlan, HealthProfile, Sidebar, wearables
│   │   ├── pages/         # SignIn, SignUp, Wearables, HeroSection
│   │   └── App.tsx
│   ├── index.html
│   └── vite.config.ts
├── server/                 # Express API
│   ├── controllers/       # auth, mealplan, wearables
│   ├── middlewares/       # auth, validation, dataSafety
│   ├── models/            # users, db connection
│   ├── routes/            # auth, mealplan, wearables
│   ├── services/          # ollama, mealplan, prompts, profile, dataSafety
│   ├── server.js
│   └── .env.example
└── README.md
```

---

## 🌐 API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check + default model |
| POST | `/api/auth/signup` | Register (email/password) |
| POST | `/api/auth/login` | Login (email/password) |
| POST | `/api/auth/google` | Login/signup with Google credential |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user (protected) |
| PUT | `/api/auth/profile` | Update profile (protected) |
| GET | `/api/meal-plan/models` | List Ollama models (protected) |
| POST | `/api/meal-plan/generate` | Generate plan (protected) |
| POST | `/api/meal-plan/stream` | Generate plan via SSE (protected) |
| GET | `/api/wearables/strava/auth-url` | Strava auth URL (protected) |
| GET | `/api/wearables/strava/callback` | Strava OAuth callback |
| GET | `/api/data-safety/audit` | PII/PHI audit log (protected) |

---

## 📄 License

ISC.
