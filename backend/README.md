# PADH LE BC (Break the Code) — Backend

**PADH LE BC** is a beginner-first AI/ML learning platform combined with an interactive Model Training, Evaluation, and Comparison Laboratory.

This repository directory contains the complete Python backend service built with FastAPI, SQLAlchemy, scikit-learn, and Pandas.

---

## 1. Architecture Overview

The backend is built around a clean separation of concerns:
- **`app/routes/`**: Clean FastAPI endpoints mapping directly to frontend needs.
- **`app/schemas/`**: Strict Pydantic models for request validation and response typing.
- **`app/services/`**: High-level domain services orchestrating learning content, dataset management, and experiments.
- **`app/ml/`**: Leakage-safe preprocessing pipelines, algorithm registry, model training, evaluation, comparison, and hyperparameter tuning.
- **`app/learning/content/`**: Authoritative structured JSON files for concepts, lessons (Unit 1–5), and algorithms.
- **`app/database/`**: SQLAlchemy models and repository pattern for SQLite persistence.

```
backend/
├── app/
│   ├── main.py                     # FastAPI entrypoint, middleware, exception handlers
│   ├── api/
│   │   ├── router.py               # Central API router aggregating all endpoints
│   │   └── dependencies.py         # DB session and injection dependencies
│   ├── routes/
│   │   ├── health.py               # GET /api/health
│   │   ├── concepts.py             # GET /api/concepts, GET /api/concepts/{id}
│   │   ├── lessons.py              # GET /api/lessons, GET /api/lessons/{id}
│   │   ├── algorithms.py           # GET /api/algorithms, GET /api/algorithms/{id}
│   │   ├── datasets.py             # Upload, profile, configure datasets
│   │   ├── models.py               # List trainable models, recommendations
│   │   ├── experiments.py          # Train, compare, report, and tune models
│   │   └── progress.py             # Learner lesson completion tracking
│   ├── schemas/                    # Pydantic validation schemas
│   ├── services/                   # Business domain services
│   ├── ml/
│   │   ├── registry.py             # Trainable models registry & default parameters
│   │   ├── preprocessing.py        # Leakage-safe ColumnTransformers and Pipelines
│   │   ├── trainer.py              # Real multi-model training execution
│   │   ├── evaluator.py            # Classification & regression metric computation
│   │   ├── comparator.py           # Trade-off analysis & ranking engine
│   │   ├── recommender.py          # Candidate model suitability scoring
│   │   └── tuner.py                # GridSearchCV hyperparameter optimization
│   ├── learning/content/           # Structured JSON curriculum content
│   ├── database/                   # SQLite database models & repositories
│   └── core/
│       ├── config.py               # App configuration & environment settings
│       └── errors.py               # Standardized error responses & handlers
├── datasets/
│   ├── samples/                    # Bundled test datasets (churn, housing)
│   └── uploads/                    # Local UUID-isolated user uploads
├── artifacts/                      # Trusted experiment outputs
├── tests/                          # Comprehensive Pytest test suite (25 tests)
├── requirements.txt
├── .env.example
└── README.md
```

---

## 2. Requirements & Installation

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Pip

### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

---

## 3. Configuration

Copy the example environment configuration:
```bash
cp .env.example .env
```

Key environment variables:
- `DATABASE_URL`: SQLite connection string (`sqlite:///./padh_le_bc.db`)
- `UPLOAD_DIR`: Directory where uploaded CSVs are saved with UUID filenames
- `MAX_UPLOAD_SIZE_MB`: Maximum permitted CSV upload size (default `15` MB)
- `MAX_CSV_ROWS`: Row limit protection against resource exhaustion (default `100000`)
- `MAX_CSV_COLUMNS`: Column limit protection (default `100`)
- `CORS_ORIGINS`: Comma-separated list of allowed frontend origins

---

## 4. Running the Backend Server

Start the API with Uvicorn:
```bash
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Once running:
- **Interactive OpenAPI Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 5. Running the Test Suite

Run all automated unit and integration tests using Pytest:
```bash
python -m pytest backend/tests/ -v
```

The test suite validates:
- API health and root routing
- Concept and lesson educational content endpoints
- Algorithm registry and trainable vs supplementary tagging
- Secure CSV upload (valid, empty, malformed, oversized, duplicate headers)
- Filename sanitization and path traversal prevention
- Dataset profiling, data type inference, statistics, and class distribution
- Explicit target selection and task type validation
- Leakage-safe preprocessing pipelines (fitted strictly on training splits)
- Real model training for Classification (Accuracy, Precision, Recall, F1, Confusion Matrix)
- Real model training for Regression (MAE, MSE, RMSE, R²)
- Multi-model comparison, ranking, and trade-off analysis
- Hyperparameter grid tuning with cross-validation and before/after delta reporting
- Learner progress persistence

---

## 6. End-to-End User Workflow

1. **Explore Concepts & Lessons:**
   - Call `GET /api/concepts` and `GET /api/lessons` to render educational material.
2. **Upload CSV Dataset:**
   - Submit a CSV to `POST /api/datasets/upload` using multipart form data.
3. **Inspect Profile:**
   - Call `GET /api/datasets/{dataset_id}/profile` to render column summaries, missingness, and preview.
4. **Configure Target:**
   - Send `POST /api/datasets/{dataset_id}/configure` with `{ "target_column": "target_name" }`.
5. **Get Compatible Trainable Models:**
   - Retrieve compatible algorithms via `GET /api/models?task_type=classification`.
6. **Train & Compare Models:**
   - Send `POST /api/experiments` with selected `model_ids`.
   - The backend runs real training under identical train/test splits, computes evaluation metrics, and ranks models based on user priority (`performance`, `speed`, `interpretability`, `balanced`).
7. **Tune Hyperparameters:**
   - Send `POST /api/experiments/{experiment_id}/tune` to optimize parameters via cross-validation and inspect before/after improvements.

---

## 7. API Contract

The complete API specification for all frontend routes is located in:
`docs/API-CONTRACT.md`
