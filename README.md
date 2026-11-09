# PADH LE BC (Break the Code)

<<<<<<< HEAD
> **Learn the algorithm. Understand the result. Choose with confidence.**

PADH LE BC is a beginner-first AI/ML learning platform combined with an interactive Model Training, Evaluation, and Comparison Laboratory.

---

## 1. Project Overview

PADH LE BC connects structured educational material with hands-on empirical experimentation:
- **Learning Hub:** Beginner-friendly lessons, mathematical derivations, step-by-step intuition, Python code walkthroughs, and knowledge checks spanning Units 1 through 5.
- **Model Lab:** Real ML workbench where learners upload their own CSV datasets, inspect data characteristics, select target columns, and train multiple compatible machine learning models to compare actual metrics side-by-side with explainable recommendations.

---

## 2. Repository Structure

```
PADH-LE-BC/
├── frontend/               # React / Vite frontend application (developed independently)
├── backend/                # FastAPI backend application
│   ├── app/                # Application routes, schemas, services, ML engine, database
│   ├── datasets/           # Uploads and bundled sample datasets
│   ├── artifacts/          # Trusted experiment model artifacts
│   ├── tests/              # 25 automated pytest tests
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
├── docs/                   # Shared architectural documentation
│   ├── PROJECT-SCHEMA.md   # Master project blueprint
│   └── API-CONTRACT.md     # Documented REST API contract for frontend integration
├── .gitignore
└── README.md
=======
> **Tagline:** Learn the algorithm. Understand the result. Choose with confidence.

PADH LE BC is a modern AI/ML educational platform paired with a hands-on Model Training, Evaluation, and Comparison Laboratory.

---

## Repository Structure

```
PADH-LE-BC/
├── frontend/             # React 19 + TypeScript + Vite + Tailwind CSS application
│   ├── src/
│   │   ├── app/          # Central router and layouts
│   │   ├── components/   # UI & feedback components (ProvenanceBadge, ConnectionError)
│   │   ├── content/      # Centralized marketing and educational copy
│   │   ├── design-system/# Tokens and primitive components
│   │   ├── motion/       # Motion tokens and useReducedMotion hook
│   │   ├── pages/        # Lazy-loaded route views
│   │   ├── services/     # Typed API clients for backend resources
│   │   ├── three/        # WebGL shader particle vortex hero
│   │   └── types/        # Strict API contract interfaces
│   └── package.json
│
├── backend/              # FastAPI + scikit-learn + SQLAlchemy backend service
│   ├── app/
│   │   ├── ml/           # Model training, comparison, tuning, and evaluation
│   │   ├── routes/       # REST endpoints under /api
│   │   ├── schemas/      # Strict Pydantic models
│   │   └── services/     # Business logic and dataset handlers
│   ├── datasets/         # Sample CSVs (churn, housing) and isolated uploads
│   └── tests/            # Pytest test suite (25/25 passing)
│
├── docs/
│   ├── FRONTEND-AUDIT.md # Comprehensive backend and API audit report
│   └── openapi.json      # Authoritative exported OpenAPI 3.1 specification
│
└── PROJECT-SCHEMA.md     # Complete master project architecture schema
>>>>>>> 3e6b61c73c5056c41549facf3e146ef6f7b48393
```

---

<<<<<<< HEAD
## 3. Quickstart (Backend)

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Start the Backend API
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Interactive API Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 4. Run Automated Tests
```bash
python -m pytest backend/tests/ -v
```

---

## 4. API Contract for Frontend Team

The frontend developer can find all endpoints, request bodies, query parameters, response structures, and error formats documented in:
[docs/API-CONTRACT.md](docs/API-CONTRACT.md)
=======
## Running the Applications

### 1. Start the Backend Server
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Start the Frontend Application
```bash
cd frontend
bun install # or: npm install
npm run dev
```
Frontend web application: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## Running Tests

- **Backend Pytest:** `python -m pytest backend/tests/ -v` (25 tests passing)
- **Frontend Vitest:** `cd frontend && npm run test` (10 tests passing)
- **Frontend Typecheck & Build:** `cd frontend && npm run build` (0 errors)
>>>>>>> 3e6b61c73c5056c41549facf3e146ef6f7b48393
