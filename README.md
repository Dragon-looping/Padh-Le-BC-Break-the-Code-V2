# PADH LE BC (Break the Code)

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
```

---

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
