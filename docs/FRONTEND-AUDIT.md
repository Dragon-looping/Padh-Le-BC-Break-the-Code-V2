# PADH LE BC (Break the Code) — Frontend & API Audit

**Audit Date:** 2026-11-07  
**Auditor:** Creative Frontend Architect & Lead Motion Engineer  
**Reference Schema:** `PROJECT-SCHEMA.md`  
**Backend Reference:** FastAPI Backend at `http://127.0.0.1:8000` / OpenAPI specification (`docs/openapi.json`)  
**Status:** Authoritative Backend Audit Complete — Ready for Frontend Implementation

---

## 1. What Exists & Can Be Reused

### Backend Services & ML Engine (100% Operational)
- **FastAPI Core (`backend/app/main.py`)**: Central router mounted at `/api` (`settings.API_V1_STR`), global CORS configured for `http://localhost:5173`, `http://localhost:3000`, `http://127.0.0.1:5173`, `http://127.0.0.1:3000`.
- **Exception Envelope (`backend/app/core/errors.py`)**: All errors (custom `AppException`, Starlette `HTTPException`, and Pydantic `RequestValidationError` 422) are wrapped into the standardized `{ "error": { "code": string, "message": string, "details"?: any } }` envelope.
- **ML Engine (`backend/app/ml/`)**:
  - `registry.py`: 13 trainable estimators (6 regression, 7 classification). Unsupervised models (`kmeans`, `agglomerative_clustering`, `dbscan`, `pca`) are cataloged with `training_supported: false`.
  - `preprocessing.py`: Leakage-safe `ColumnTransformer` and scikit-learn `Pipeline` (fit strictly on training splits).
  - `trainer.py`: Real multi-model training under identical train/test splits.
  - `evaluator.py`: Computes real metrics, confusion matrices with class labels, classification reports, and cross-validation folds.
  - `comparator.py` & `recommender.py`: Multi-criteria model ranking and candidate recommendations.
  - `tuner.py`: Grid hyperparameter search with before/after metric deltas.
- **Curriculum Content (`backend/app/learning/content/`)**: Authoritative JSON curriculum for Units 1–5 (11 lessons), foundational concepts (13 concepts), and algorithms (17 algorithms).
- **Test Suite**: 25/25 automated unit and integration tests passing in Pytest.

### Frontend Foundation Status
- `frontend/` directory does not yet exist. A clean, production-grade Vite + React 19 + TypeScript + Tailwind CSS application will be bootstrapped following the exact architectural specifications in Section 10 and Section 17.

---

## 2. API Endpoint Audit Table

| Method | Path | In Contract? | Implemented in Backend? | Matches OpenAPI & Live Response? | Notes & Exact Response Fields |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `GET` | `/api/health` | Yes | Yes | Yes | `{ status: "healthy", project: string, version: string, environment: string, timestamp: string, database: string }` |
| `GET` | `/api/concepts` | Yes | Yes | Yes | `{ total: number, concepts: ConceptSummary[] }` Query params: `category`, `level` |
| `GET` | `/api/concepts/{concept_id}` | Yes | Yes | Yes | `{ id, title, level, category, short_definition, simple_explanation, real_world_example, key_points, common_mistakes, related_concepts }` |
| `GET` | `/api/lessons` | Yes | Yes | Yes | `{ total_lessons: number, units: ModuleLessons[] }` Query param: `unit` |
| `GET` | `/api/lessons/{lesson_id}` | Yes | Yes | Yes | Structured `LessonDetail` with `learning_objectives`, `definitions`, `mathematical_explanation`, `python_code`, `knowledge_check` quiz |
| `GET` | `/api/algorithms` | Yes | Yes | Yes | `{ total: number, algorithms: AlgorithmSummary[] }` Includes `curriculum_status`, `learning_content_status`, `training_supported` |
| `GET` | `/api/algorithms/{algorithm_id}` | Yes | Yes | Yes | `AlgorithmDetail` including `intuition`, `step_by_step_working`, `parameters`, `python_snippet`, `training_supported`, `default_hyperparameters` |
| `POST` | `/api/datasets/upload` | Yes | Yes | Yes | Multipart `file` field. Returns `{ dataset_id, original_filename, file_size_bytes, status, rows, columns, profile_url }` |
| `GET` | `/api/datasets` | Yes | Yes | Yes | `{ total: number, datasets: DatasetSummary[] }` Query params: `skip`, `limit` |
| `GET` | `/api/datasets/{dataset_id}` | Yes | Yes | Yes | Metadata `DatasetSummary` |
| `GET` | `/api/datasets/{dataset_id}/profile` | Yes | Yes | Yes | `DatasetProfileResponse` with column profiles (missing, stats, categories), duplicate rows, preview rows, class distribution |
| `POST` | `/api/datasets/{dataset_id}/configure` | Yes | Yes | Yes | Body: `{ target_column: string, task_type?: string }`. Returns `{ dataset_id, target_column, task_type, compatible_models, warnings }` |
| `GET` | `/api/models` | Yes | Yes | Yes | `{ total: number, models: ModelInfo[] }` Query param: `task_type` |
| `POST` | `/api/models/recommend` | Yes | Yes | Yes | Body: `{ task_type, row_count, column_count, priority? }`. Returns `{ task_type, recommended_model_ids, recommendations: [...] }` |
| `POST` | `/api/experiments` | Yes | Yes | Yes | **Synchronous** run returning HTTP 201 with `ExperimentResponse`. Results contain real metrics, comparison, recommendation |
| `GET` | `/api/experiments` | Yes | Yes | Yes | `{ total: number, experiments: ExperimentSummary[] }` Query params: `skip`, `limit` |
| `GET` | `/api/experiments/{experiment_id}` | Yes | Yes | Yes | `ExperimentResponse` status, metrics per model, ranking, tradeoffs |
| `GET` | `/api/experiments/{experiment_id}/report` | Yes | Yes | Yes | Comparison report with ranked models, tradeoff analysis, metric comparison table |
| `POST` | `/api/experiments/{experiment_id}/tune` | Yes | Yes | Yes | Hyperparameter tuning via GridSearchCV. Returns before/after metrics delta |
| `GET` | `/api/progress` | Yes | Yes | Yes | Anonymous/session-based via `session_id` query param (default: `"default_learner"`). Returns completed lessons and timestamps |
| `POST` | `/api/progress/lessons/{lesson_id}/complete` | Yes | Yes | Yes | Marks lesson completed for session. Body: `{ session_id?: string }` |
| `GET` | `/api/projects` | Proposed | No | No | Not implemented in backend. As per spec, `/projects` is rendered in a **PLANNED** state |

---

## 3. Status of Known Gaps (Section 3 Resolution)

1. **Full request and response schemas**:  
   - Generated canonical OpenAPI schema at `docs/openapi.json`. Reconciled all types with Pydantic definitions. Preserved exact snake_case property names throughout.
2. **`POST /experiments` sync vs async & status**:  
   - Synchronous execution returning HTTP 201 Created on completion. Status values: `"running"`, `"completed"`, `"failed"`. No streamable progress percentages are emitted by the server during training; frontend displays an honest indeterminate running state with status text.
3. **`/algorithms` status fields**:  
   - Returns all three fields: `curriculum_status` (`"in-syllabus"` \| `"supplementary"`), `learning_content_status` (`"available"` \| `"planned"`), and `training_supported` (`boolean`).
4. **Lesson content format & quizzes**:  
   - Structured JSON schema containing rich blocks (`definitions`, `learning_objectives`, `mathematical_explanation`, `python_code`, `code_explanation`, etc.). Includes interactive `knowledge_check` quizzes with multi-choice options, correct option IDs, and explanations.
5. **Unsupervised learning metrics and training**:  
   - `training_supported: false` for all unsupervised algorithms (`kmeans`, `agglomerative_clustering`, `dbscan`, `pca`). Clustering and PCA cannot be trained in Model Lab. Only classification and regression tasks are supported for training.
6. **Backend-trained playgrounds**:  
   - No backend training endpoint exists for playgrounds. All algorithm playgrounds are illustrative frontend-side numerical/graphical simulations permanently labeled with `ILLUSTRATIVE SIMULATION`.
7. **Projects endpoint**:  
   - No `/projects` endpoint exists in backend. The `/projects` route presents an honest `PLANNED` state detailing planned case studies.
8. **Learner identity**:  
   - Progress is session-based and anonymous, keyed by `session_id` (stored locally in `localStorage`, defaulting to `"default_learner"`). No auth/cookies required.
9. **Upload limits**:  
   - Enforced by backend: `MAX_UPLOAD_SIZE_MB = 15`, `MAX_CSV_ROWS = 100000`, `MAX_CSV_COLUMNS = 100`. Frontend pre-checks client files against these limits and displays backend errors verbatim.
10. **Report, confusion matrix & cross-validation shapes**:  
    - Confusion matrix is returned as 2D integer array with `classes` array. Classification report provides per-class precision, recall, f1, support and averages. CV summary returns `{ metric, folds, mean, std, fold_scores }`.
11. **FastAPI 422 envelope**:  
    - Yes, `validation_exception_handler` in `app/core/errors.py` wraps validation errors into `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }`.
12. **CORS origins**:  
    - Allowed: `http://localhost:5173`, `http://localhost:3000`, `http://127.0.0.1:5173`, `http://127.0.0.1:3000`.

---

## 4. Frontend Dependency & Architecture Decisions

| Capability | Package / Technology | Decision & Rationale |
| :--- | :--- | :--- |
| **Framework** | React 19 + TypeScript + Vite | Blazing fast HMR, strict type safety matching backend schemas |
| **Styling** | Tailwind CSS + CSS Variables | Exact color tokens (`ink-950`, `cyan-400`, `lime-400`, `orange-500`, etc.), chamfered clip-paths |
| **Routing** | React Router v7 | Deep-linkable routes, query sync for Model Lab, code-split lazy routes |
| **API Client** | Axios | Shared singleton instance with request cancellation, baseURL fallback, and normalized error transformer |
| **3D Hero Scene** | Three.js | Custom `ShaderMaterial` with vertex-shader particles, adaptive quality budget, prefers-reduced-motion fallback |
| **Motion** | Framer Motion | Smooth layout animations, page cross-fades, scanline route wipes |
| **Typography** | Fontsource | Self-hosted JetBrains Mono, Bricolage Grotesque, Instrument Sans |
| **Maths** | KaTeX | Fast, server/client-safe LaTeX formula rendering |
| **Icons** | Lucide React | Clean, precise technical iconography |

---

## 5. Requests to Backend Team

*(Non-blocking enhancements for future iterations)*
1. **Server-Sent Events / WebSockets for Experiment Progress**: While synchronous training is fast for moderate datasets, streaming progress percentages (e.g. 25%, 50%, 75%) would enhance UX for larger datasets.
2. **K-Means / PCA Clustering Training Endpoint**: Consider adding an unsupervised training route (`POST /experiments/unsupervised`) for silhouette score, inertia, and 2D PCA coordinate projection.
3. **Projects Catalogue Endpoint (`GET /api/projects`)**: Exposing structured metadata for guided case studies will allow Projects to transition from `PLANNED` to fully interactive.
