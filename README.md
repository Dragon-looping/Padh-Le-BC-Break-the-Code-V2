# PADH LE BC (Break the Code)

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
```

---

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
