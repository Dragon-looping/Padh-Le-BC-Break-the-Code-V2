# PADH LE BC — Backend API Contract & Specification

**Base URL:** `http://localhost:8000/api`  
**OpenAPI / Swagger UI:** `http://localhost:8000/docs`  
**ReDoc UI:** `http://localhost:8000/redoc`

---

## 1. Global Conventions & Error Format

All failure responses follow this consistent structure across every endpoint:

```json
{
  "error": {
    "code": "INVALID_TARGET_COLUMN",
    "message": "The selected target column does not exist in this dataset.",
    "details": {}
  }
}
```

### Standard HTTP Status Codes:
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Invalid request parameters, missing required payload, or business validation failure.
- `404 Not Found`: Target resource, concept, lesson, dataset, or experiment was not found.
- `413 Request Entity Too Large`: Uploaded file exceeds configured limit (`MAX_UPLOAD_SIZE_MB`).
- `422 Unprocessable Content`: Empty CSV, malformed file, duplicate columns, or unprocessable data.
- `500 Internal Server Error`: Unhandled server exception.

---

## 2. API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check, DB connectivity, and version info |
| `GET` | `/api/concepts` | List ML concepts with category and level filters |
| `GET` | `/api/concepts/{concept_id}` | Detailed educational concept explanation |
| `GET` | `/api/lessons` | List syllabus modules and educational lessons |
| `GET` | `/api/lessons/{lesson_id}` | Full lesson content with code walkthrough and quiz |
| `GET` | `/api/algorithms` | Full algorithm catalog (supervised and unsupervised) |
| `GET` | `/api/algorithms/{algorithm_id}` | In-depth algorithm intuition, mathematics & parameters |
| `GET` | `/api/models` | List models currently trainable in Model Lab |
| `POST` | `/api/models/recommend` | Recommend candidate models for dataset properties |
| `POST` | `/api/datasets/upload` | Secure CSV dataset upload (`multipart/form-data`) |
| `GET` | `/api/datasets` | List uploaded datasets metadata |
| `GET` | `/api/datasets/{dataset_id}` | Get single dataset metadata |
| `GET` | `/api/datasets/{dataset_id}/profile` | Comprehensive dataset statistics, preview & types |
| `POST` | `/api/datasets/{dataset_id}/configure` | Set target column and confirm task type |
| `POST` | `/api/experiments` | Run real model training & comparative benchmark |
| `GET` | `/api/experiments` | List experiment execution history |
| `GET` | `/api/experiments/{experiment_id}` | Retrieve experiment results & metrics |
| `GET` | `/api/experiments/{experiment_id}/report` | Detailed comparative analysis report |
| `POST` | `/api/experiments/{experiment_id}/tune` | Perform controlled hyperparameter grid tuning |
| `GET` | `/api/progress` | Fetch user learning progress and history |
| `POST` | `/api/progress/lessons/{lesson_id}/complete` | Mark a lesson as completed |

---

## 3. Learning Content Endpoints

### `GET /api/concepts`
Returns list of ML concepts.

**Query Parameters:**
- `category` (optional, string): `foundations`, `data`, `model`, `evaluation`
- `level` (optional, string): `beginner`, `intermediate`, `advanced`

**Example Response (200 OK):**
```json
{
  "total": 13,
  "concepts": [
    {
      "id": "ai-ml-dl",
      "title": "Artificial Intelligence, Machine Learning & Deep Learning",
      "level": "beginner",
      "category": "foundations",
      "short_definition": "AI is the broad field of smart machines, ML is learning from data without explicit rules, and DL uses multi-layered neural networks."
    }
  ]
}
```

### `GET /api/concepts/{concept_id}`
Returns deep structured concept explanation.

**Example Response (200 OK):**
```json
{
  "id": "dataset-features-target",
  "title": "Dataset, Features & Target",
  "level": "beginner",
  "category": "data",
  "short_definition": "A dataset is a collection of data; features are the input clues (X), and the target is the answer we want to predict (y).",
  "simple_explanation": "Think of a spreadsheet where each row is a patient...",
  "real_world_example": "When predicting house prices, features include square footage...",
  "key_points": [
    "Features (X) are independent input variables.",
    "The Target (y) is the dependent variable we wish to forecast."
  ],
  "common_mistakes": [
    "Accidentally including the target column inside the input feature matrix (leakage)."
  ],
  "related_concepts": ["preprocessing", "train-val-test", "regression-classification"]
}
```

### `GET /api/lessons`
Returns organized Unit 1–5 syllabus curriculum.

**Query Parameters:**
- `unit` (optional, string): `Unit 1`, `Unit 2`, etc.

**Example Response (200 OK):**
```json
{
  "total_lessons": 11,
  "units": [
    {
      "unit": "Unit 1",
      "module_title": "Foundations of Machine Learning",
      "lessons": [
        {
          "id": "lesson-u1-l1",
          "unit": "Unit 1",
          "module": "Foundations of Machine Learning",
          "title": "Introduction to Machine Learning and Problem Formulation",
          "order": 1,
          "level": "beginner",
          "estimated_minutes": 20
        }
      ]
    }
  ]
}
```

### `GET /api/lessons/{lesson_id}`
Returns complete lesson with mathematical derivations, code walkthrough, and quiz questions.

---

## 4. Algorithm & Model Endpoints

### `GET /api/algorithms`
Returns algorithms in the catalog.

**Query Parameters:**
- `category` (optional, string): `regression`, `classification`, `unsupervised`
- `task_type` (optional, string): `regression`, `classification`, `clustering`, `dimensionality_reduction`
- `trainable_only` (optional, boolean): `true` to filter only models trainable in Model Lab.

### `GET /api/algorithms/{algorithm_id}`
Returns intuition, parameters, pros, cons, and python snippet for an algorithm.

### `GET /api/models`
Returns list of currently trainable models for Model Lab experiments.

**Query Parameters:**
- `task_type` (optional, string): `classification` or `regression`

### `POST /api/models/recommend`
Recommends candidate models based on dataset shape and optimization priority.

**Request Body:**
```json
{
  "task_type": "classification",
  "row_count": 1200,
  "column_count": 8,
  "priority": "performance"
}
```

---

## 5. Dataset Workflow Endpoints

### `POST /api/datasets/upload`
Accepts multipart form-data CSV upload.

**Request Headers:** `Content-Type: multipart/form-data`  
**Form Fields:** `file`: CSV file

**Response (201 Created):**
```json
{
  "dataset_id": "8fb87010-09b6-419b-ba76-cf0b5be82fbe",
  "original_filename": "customer_churn.csv",
  "file_size_bytes": 10420,
  "status": "uploaded",
  "rows": 500,
  "columns": 6,
  "profile_url": "/api/datasets/8fb87010-09b6-419b-ba76-cf0b5be82fbe/profile"
}
```

### `GET /api/datasets/{dataset_id}/profile`
Returns detailed dataset profiling without data leakage risk.

**Response (200 OK):**
```json
{
  "dataset_id": "8fb87010-09b6-419b-ba76-cf0b5be82fbe",
  "original_filename": "customer_churn.csv",
  "row_count": 500,
  "column_count": 6,
  "columns": ["age", "tenure", "monthly_charges", "contract", "churn"],
  "column_profiles": [
    {
      "name": "age",
      "inferred_type": "numeric",
      "missing_count": 0,
      "missing_percentage": 0.0,
      "unique_count": 52,
      "min": 18,
      "max": 70,
      "mean": 43.5,
      "std": 14.2,
      "median": 44.0,
      "top_categories": null,
      "sample_values": [25, 30, 45, 35, 50]
    }
  ],
  "duplicate_rows": 0,
  "target_column": null,
  "detected_task": null,
  "preview_rows": [
    {"age": 25, "tenure": 12, "monthly_charges": 45.5, "contract": "Month-to-month", "churn": "No"}
  ],
  "class_distribution": null,
  "warnings": []
}
```

### `POST /api/datasets/{dataset_id}/configure`
Explicitly sets the target column and validates task compatibility.

**Request Body:**
```json
{
  "target_column": "churn",
  "task_type": "classification"
}
```

**Response (200 OK):**
```json
{
  "dataset_id": "8fb87010-09b6-419b-ba76-cf0b5be82fbe",
  "target_column": "churn",
  "task_type": "classification",
  "compatible_models": [
    "logistic_regression",
    "knn_classifier",
    "decision_tree_classifier",
    "random_forest_classifier",
    "naive_bayes",
    "svm_classifier",
    "gradient_boosting_classifier"
  ],
  "warnings": []
}
```

---

## 6. Model Training & Comparison Endpoints

### `POST /api/experiments`
Trains selected models on identical splits and produces comparative rankings.

**Request Body:**
```json
{
  "dataset_id": "8fb87010-09b6-419b-ba76-cf0b5be82fbe",
  "target_column": "churn",
  "task_type": "classification",
  "model_ids": [
    "logistic_regression",
    "random_forest_classifier",
    "decision_tree_classifier"
  ],
  "test_size": 0.2,
  "random_state": 42,
  "priority": "performance"
}
```

**Response (201 Created):**
```json
{
  "experiment_id": "01991d30-b3e1-4cfa-9311-6677934ef289",
  "dataset_id": "8fb87010-09b6-419b-ba76-cf0b5be82fbe",
  "target_column": "churn",
  "task_type": "classification",
  "test_size": 0.2,
  "random_state": 42,
  "status": "completed",
  "priority": "performance",
  "results": [
    {
      "model_id": "random_forest_classifier",
      "model_name": "Random Forest Classifier",
      "category": "classification",
      "hyperparameters": {"n_estimators": 50, "max_depth": 8, "random_state": 42},
      "metrics": {
        "accuracy": 0.88,
        "precision_macro": 0.87,
        "recall_macro": 0.86,
        "f1_macro": 0.865,
        "f1_weighted": 0.879,
        "confusion_matrix": [[65, 5], [7, 23]],
        "classes": ["No", "Yes"],
        "classification_report": {}
      },
      "training_duration_seconds": 0.045,
      "train_metric": 0.94,
      "test_metric": 0.88,
      "overfitting_warning": null,
      "status": "completed",
      "error_message": null
    }
  ],
  "comparison": {
    "best_model_id": "random_forest_classifier",
    "best_model_name": "Random Forest Classifier",
    "primary_metric_name": "f1_macro",
    "ranked_models": [
      {
        "rank": 1,
        "model_id": "random_forest_classifier",
        "model_name": "Random Forest Classifier",
        "primary_metric_value": 0.865,
        "training_duration_seconds": 0.045,
        "pros": ["Extremely fast training time (<0.1s)", "Good generalization gap"],
        "cons": []
      }
    ],
    "tradeoff_analysis": "Evaluated 3 compatible models on identical train/test splits...",
    "recommendation_reason": "Recommended based on user priority 'performance'..."
  },
  "warnings": [],
  "created_at": "2026-11-07T15:15:00.000000Z"
}
```

### `POST /api/experiments/{experiment_id}/tune`
Performs cross-validated hyperparameter grid tuning.

**Request Body:**
```json
{
  "model_id": "decision_tree_classifier",
  "param_grid": {
    "max_depth": [3, 5, 8],
    "min_samples_split": [2, 5, 10]
  },
  "cv_folds": 3
}
```

**Response (200 OK):**
```json
{
  "experiment_id": "01991d30-b3e1-4cfa-9311-6677934ef289",
  "model_id": "decision_tree_classifier",
  "original_parameters": {"max_depth": 5, "min_samples_split": 2},
  "best_parameters": {"max_depth": 5, "min_samples_split": 5},
  "before_metrics": {"accuracy": 0.82, "f1_macro": 0.80},
  "after_metrics": {"accuracy": 0.85, "f1_macro": 0.84},
  "improvement_summary": "Accuracy moved from 0.8200 to 0.8500 (+0.0300) with best parameters: {'max_depth': 5, 'min_samples_split': 5}.",
  "meaningful_improvement": true,
  "warnings": []
}
```

---

## 7. Progress Endpoints

### `GET /api/progress`
**Query Parameters:** `session_id` (default: `"default_learner"`)

### `POST /api/progress/lessons/{lesson_id}/complete`
**Request Body:**
```json
{
  "session_id": "default_learner"
}
```
