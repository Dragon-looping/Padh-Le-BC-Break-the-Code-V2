# PADH LE BC --- Complete Project Schema

**Project name:** PADH LE BC (Break the Code)\
**Tagline:** Learn the algorithm. Understand the result. Choose with
confidence.\
**Project type:** AI/ML learning platform + practical model training and
comparison laboratory\
**Repository structure:** One GitHub repository containing separate
`frontend/` and `backend/` applications.

------------------------------------------------------------------------

## 1. Project vision

PADH LE BC is a platform for people who want to learn Artificial
Intelligence and Machine Learning from the basics and also apply what
they learn.

A visitor should be able to:

1.  Learn AI and ML concepts from beginner to advanced introductory
    level.
2.  Study algorithms such as Linear Regression, Logistic Regression,
    KNN, Decision Trees, Random Forest and other models.
3.  Understand the intuition, mathematics, working steps and Python code
    behind each algorithm.
4.  Run guided experiments and see how changing parameters affects model
    behaviour.
5.  Upload their own dataset.
6.  Train multiple compatible ML models on that dataset.
7.  Check actual evaluation metrics such as accuracy, precision, recall,
    F1, MAE, RMSE and R², depending on the task.
8.  Compare models using the same evaluation conditions.
9.  Understand which model is suitable for their dataset and why.
10. Tune models and inspect whether performance improves.

The product has two connected pillars:

-   **Learn AI/ML:** study content, concepts, lessons, mathematical
    explanations, examples and code walkthroughs.
-   **Experiment with AI/ML:** interactive demonstrations, dataset
    upload, model training, evaluation, comparison and recommendations.

This is not a decision-tree-only application. Decision trees are one
topic in the wider learning platform.

## 2. Target users

-   Beginners learning AI/ML for the first time.
-   Students studying AI/ML subjects and algorithms.
-   Learners who want to understand code and mathematics together.
-   Developers who want to test models on their own datasets.
-   Users who want to compare model performance before choosing an
    approach.

## 3. Main user journey

1.  User visits the homepage.
2.  User chooses **Start Learning** or **Open Model Lab**.
3.  In Learning Hub, user follows a structured path or searches for a
    concept/algorithm.
4.  User opens an algorithm page and learns its purpose, intuition,
    mathematics, steps and code.
5.  User tries an interactive playground experiment.
6.  User opens Model Lab and uploads a CSV dataset.
7.  The platform validates and profiles the dataset.
8.  User explicitly selects the target column and confirms the task
    type.
9.  User chooses compatible algorithms or requests candidate
    recommendations.
10. Backend trains the models under comparable conditions.
11. User reviews real metrics, plots, warnings and model trade-offs.
12. User can tune a model, rerun an experiment and compare results.

------------------------------------------------------------------------

# PART A --- FRONTEND

## 4. Frontend responsibilities

The frontend owns:

-   Overall UI, navigation, layout and responsive behaviour.
-   Homepage and learning dashboard.
-   Displaying concepts, lessons and algorithm explanations.
-   Rendering code examples and mathematical content.
-   Interactive visualizations and playground controls.
-   Dataset upload interface and dataset preview.
-   Experiment configuration and progress display.
-   Model comparison charts, tables and result explanations.
-   Learner progress and experiment history presentation.
-   Calling backend APIs and handling loading, empty, success and error
    states.

The frontend must not invent model metrics, dataset statistics,
experiment status or recommendations. Those must come from backend
responses.

## 5. Frontend technology

Recommended stack:

-   React
-   Vite
-   TypeScript
-   Tailwind CSS
-   React Router
-   Axios or an existing shared API client
-   Recharts for charts
-   Framer Motion for purposeful transitions
-   Lucide icons

Keep the frontend independent from the backend implementation. It
communicates through the documented HTTP API.

## 6. Main navigation

1.  Home
2.  Learning Hub
3.  Algorithm Library
4.  ML Playground
5.  Model Lab
6.  Projects
7.  My Progress

## 7. Frontend routes

  ------------------------------------------------------------------------------
  Route                          Page                    Purpose
  ------------------------------ ----------------------- -----------------------
  `/`                            Home                    Product introduction,
                                                         continue learning and
                                                         quick actions

  `/learn`                       Learning Hub            Units, modules and
                                                         learning path

  `/learn/:lessonId`             Lesson Page             Individual lesson

  `/concepts/:conceptId`         Concept Page            Individual ML concept

  `/algorithms`                  Algorithm Library       Browse algorithms by
                                                         category

  `/algorithms/:algorithmId`     Algorithm Detail        Learn an algorithm

  `/playground`                  Playground Home         Browse interactive
                                                         experiments

  `/playground/:algorithmId`     Algorithm Playground    Experiment with one
                                                         algorithm

  `/model-lab`                   Model Lab               Upload dataset and
                                                         configure model
                                                         comparison

  `/datasets/:datasetId`         Dataset Profile         Inspect uploaded
                                                         dataset

  `/experiments/:experimentId`   Experiment Results      Metrics, comparison and
                                                         recommendation

  `/projects`                    Projects                Guided practical case
                                                         studies

  `/progress`                    My Progress             Learning progress and
                                                         experiment history
  ------------------------------------------------------------------------------

These are frontend routes, not backend endpoints.

## 8. Homepage

The homepage should feel like a polished educational product, not a
generic admin dashboard.

Recommended sections:

-   Hero headline: **Machine Learning, without the confusion.**
-   Short explanation of what users can learn and build.
-   Start Learning and Open Model Lab actions.
-   Continue Learning section.
-   Learning roadmap and progress.
-   Explore algorithms by category.
-   Try the ML Playground.
-   Compare models using a dataset.
-   Real-world project examples.

The first-time experience must make it obvious where a beginner should
start. Avoid overwhelming new learners with advanced terms.

## 9. Learning Hub

Organize content into a structured curriculum:

-   Units and modules based on the team's actual Unit 1--5 study
    material.
-   Lessons within each module.
-   Concepts linked to lessons.
-   Examples and worked problems.
-   Code demonstrations.
-   Knowledge checks or quizzes.
-   Completion state and next-lesson navigation.

**Syllabus rule:** The actual Unit 1--5 PDFs/notes must be imported and
reviewed before declaring the exact curriculum. Preserve the source's
topic names and ordering. Do not invent topics and label them as
syllabus content. Supplementary topics must be marked separately.

Each lesson should be able to display:

1.  Learning objective.
2.  Explanation.
3.  Definitions and terminology.
4.  Mathematical notation and derivation where relevant.
5.  Real-world example.
6.  Step-by-step worked example.
7.  Python code.
8.  Code explanation.
9.  Advantages, limitations or common mistakes where relevant.
10. Related concepts.
11. Knowledge check.
12. Mark-complete action.

## 10. Algorithm Library

Organize algorithms by task.

### Regression

-   Simple Linear Regression
-   Multiple Linear Regression
-   Polynomial Regression, if included in the agreed curriculum
-   Ridge Regression
-   Lasso Regression
-   Decision Tree Regressor
-   Random Forest Regressor
-   Gradient Boosting Regressor

### Classification

-   Logistic Regression
-   K-Nearest Neighbours
-   Naive Bayes
-   Decision Tree Classifier
-   Random Forest Classifier
-   Support Vector Machine
-   Gradient Boosting Classifier

### Unsupervised learning

-   K-Means
-   Hierarchical / Agglomerative Clustering
-   DBSCAN
-   Principal Component Analysis

This is a proposed catalogue, not a claim that every algorithm appears
in Unit 1--5 or is already implemented. Each algorithm must show:

-   Curriculum status: in-syllabus or supplementary.
-   Learning content status: available or planned.
-   Training support: available or not yet available.

### Algorithm detail page

Every algorithm page should contain:

1.  What the algorithm is.
2.  What problem it solves.
3.  Beginner-friendly intuition.
4.  Mathematical explanation.
5.  Step-by-step working.
6.  Visual or numerical example.
7.  Python implementation.
8.  Explanation of the code.
9.  Important parameters.
10. Advantages and limitations.
11. When to use and when to avoid it.
12. Related algorithms.
13. Experiment action only when the backend supports training.

## 11. Concept Library

Initial foundational concepts to prepare, subject to verification
against Unit 1--5:

-   Artificial Intelligence, Machine Learning and Deep Learning.
-   Dataset, rows, columns, features and target/label.
-   Supervised and unsupervised learning.
-   Regression and classification.
-   Training, validation and testing.
-   Data preprocessing.
-   Missing values and categorical encoding.
-   Scaling and normalization.
-   Overfitting and underfitting.
-   Parameters and hyperparameters.
-   Cross-validation.
-   Evaluation metrics.
-   Model selection and generalization.

## 12. ML Playground

The playground teaches algorithm behaviour through controlled
experiments.

Examples:

-   Linear Regression: adjust points and inspect the fitted line and
    residuals.
-   Logistic Regression: change the classification threshold and inspect
    prediction changes.
-   KNN: change K and inspect how neighbours affect classification.
-   Decision Tree: change tree depth and observe complexity.
-   K-Means: change cluster count and inspect assignments.

Every playground must clearly identify whether it is:

-   An illustrative frontend-side simulation, or
-   An actual backend model training experiment.

Never present illustrative outputs as real model evaluation results.

## 13. Model Lab --- dataset upload and model comparison

### User workflow

1.  Select or drag-and-drop a CSV file.
2.  Display upload progress and validation errors.
3.  Show dataset preview and profile.
4.  Select the target column explicitly.
5.  Confirm the detected classification or regression task.
6.  Select compatible models.
7.  Configure experiment settings.
8.  Submit the experiment.
9.  Show loading or experiment status.
10. Display actual metrics and comparison.
11. Show backend recommendation and its reasoning.
12. Allow tuning and before/after comparison.

### Results UI

For classification, display available metrics:

-   Accuracy
-   Precision
-   Recall
-   F1 score
-   Confusion matrix
-   Classification report

For regression, display:

-   MAE
-   MSE
-   RMSE
-   R²

Also show training time, cross-validation summary and warnings when
supplied by the backend.

Do not assume the last CSV column is the target. Do not fabricate
example metrics as if they came from a real run.

## 14. Projects and practice

A guided project can include:

-   Problem statement.
-   Learning objectives.
-   Dataset information.
-   Suggested algorithms.
-   Step-by-step tasks.
-   Evaluation criteria.
-   Reflection questions.

Only show projects whose learning content and assets actually exist.

## 15. My Progress

Display:

-   Completed units and lessons.
-   Current learning stage.
-   Recently viewed lessons.
-   Recent experiments.
-   Experiment history.
-   Achievements only when earned.

Anonymous/local progress may be used for an early prototype if the
backend contract supports it. Do not imply account synchronization
unless authentication and user identity are implemented.

## 16. Frontend design direction

-   Premium, clean educational-product appearance.
-   Dark charcoal or deep navy foundation.
-   Restrained violet and cyan accents.
-   Strong typography and readable line lengths.
-   Clear information hierarchy and spacing.
-   Visualizations that teach rather than decorate.
-   Responsive desktop and mobile layouts.
-   Accessible contrast, keyboard navigation and form labels.

Avoid excessive gradients, glowing borders, generic dashboard cards,
fake charts, unnecessary animation and dense walls of text.

## 17. Frontend folder structure

``` text
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── router.tsx
│   │   └── providers.tsx
│   ├── pages/
│   │   ├── HomePage/
│   │   ├── LearningHubPage/
│   │   ├── LessonPage/
│   │   ├── ConceptPage/
│   │   ├── AlgorithmLibraryPage/
│   │   ├── AlgorithmDetailPage/
│   │   ├── PlaygroundPage/
│   │   ├── ModelLabPage/
│   │   ├── DatasetProfilePage/
│   │   ├── ExperimentResultsPage/
│   │   ├── ProjectsPage/
│   │   └── ProgressPage/
│   ├── components/
│   │   ├── layout/
│   │   ├── navigation/
│   │   ├── learning/
│   │   ├── algorithms/
│   │   ├── visualizations/
│   │   ├── datasets/
│   │   ├── experiments/
│   │   └── feedback/
│   ├── features/
│   │   ├── learning/
│   │   ├── algorithms/
│   │   ├── playground/
│   │   ├── datasets/
│   │   ├── experiments/
│   │   └── progress/
│   ├── services/
│   │   ├── api.ts
│   │   ├── concepts.ts
│   │   ├── lessons.ts
│   │   ├── algorithms.ts
│   │   ├── datasets.ts
│   │   └── experiments.ts
│   ├── hooks/
│   ├── types/
│   └── styles/
├── .env.example
├── package.json
└── README.md
```

------------------------------------------------------------------------

# PART B --- BACKEND

## 18. Backend responsibilities

The backend owns:

-   Structured concept, lesson and algorithm content APIs.
-   Dataset upload, validation, storage and profiling.
-   Target selection and task validation.
-   Preprocessing and leakage-safe model training.
-   Model evaluation and comparison.
-   Model recommendations and hyperparameter tuning.
-   Experiment persistence and reports.
-   Progress persistence if included in the release.
-   Pydantic schemas, API documentation and automated tests.

The backend must provide real, reproducible ML operations. It must not
return fabricated metrics.

## 19. Backend technology

Recommended stack:

-   Python
-   FastAPI
-   Pydantic
-   scikit-learn
-   Pandas
-   NumPy
-   SQLAlchemy
-   SQLite for the initial prototype
-   Joblib for trusted server-generated model artifacts, where needed
-   Pytest
-   Uvicorn

## 20. Backend folder structure

``` text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   ├── router.py
│   │   └── dependencies.py
│   ├── routes/
│   │   ├── health.py
│   │   ├── concepts.py
│   │   ├── lessons.py
│   │   ├── algorithms.py
│   │   ├── datasets.py
│   │   ├── models.py
│   │   ├── experiments.py
│   │   └── progress.py
│   ├── schemas/
│   │   ├── concept.py
│   │   ├── lesson.py
│   │   ├── algorithm.py
│   │   ├── dataset.py
│   │   ├── experiment.py
│   │   ├── model.py
│   │   └── progress.py
│   ├── services/
│   │   ├── learning_service.py
│   │   ├── dataset_service.py
│   │   ├── experiment_service.py
│   │   └── progress_service.py
│   ├── ml/
│   │   ├── registry.py
│   │   ├── preprocessing.py
│   │   ├── trainer.py
│   │   ├── evaluator.py
│   │   ├── comparator.py
│   │   ├── recommender.py
│   │   └── tuner.py
│   ├── learning/
│   │   └── content/
│   │       ├── foundations.json
│   │       ├── unit_1.json
│   │       ├── unit_2.json
│   │       ├── unit_3.json
│   │       ├── unit_4.json
│   │       ├── unit_5.json
│   │       ├── regression.json
│   │       ├── classification.json
│   │       └── unsupervised.json
│   ├── database/
│   │   ├── database.py
│   │   ├── models.py
│   │   └── repositories/
│   └── core/
│       ├── config.py
│       └── errors.py
├── datasets/
│   ├── samples/
│   └── uploads/
├── artifacts/
├── tests/
│   ├── test_health.py
│   ├── test_concepts.py
│   ├── test_lessons.py
│   ├── test_algorithms.py
│   ├── test_dataset_upload.py
│   ├── test_dataset_profile.py
│   ├── test_training.py
│   ├── test_comparison.py
│   └── test_upload_security.py
├── requirements.txt
├── .env.example
└── README.md
```

This is the target architecture. If a module already exists with the
same responsibility, reuse it instead of creating a duplicate.

## 21. API endpoint-to-file mapping

All paths below are relative to `/api`.

  --------------------------------------------------------------------------------------------------------------------------------------
  Method         Endpoint                                   Route file                Main service/ML module           Purpose
  -------------- ------------------------------------------ ------------------------- -------------------------------- -----------------
  GET            `/health`                                  `routes/health.py`        health handler                   Health check

  GET            `/concepts`                                `routes/concepts.py`      `services/learning_service.py`   List concepts

  GET            `/concepts/{concept_id}`                   `routes/concepts.py`      `services/learning_service.py`   Concept details

  GET            `/lessons`                                 `routes/lessons.py`       `services/learning_service.py`   List modules and
                                                                                                                       lessons

  GET            `/lessons/{lesson_id}`                     `routes/lessons.py`       `services/learning_service.py`   Lesson content

  GET            `/algorithms`                              `routes/algorithms.py`    `ml/registry.py`, learning       Algorithm
                                                                                      service                          catalogue

  GET            `/algorithms/{algorithm_id}`               `routes/algorithms.py`    learning service,                Algorithm details
                                                                                      `ml/registry.py`                 

  POST           `/datasets/upload`                         `routes/datasets.py`      `services/dataset_service.py`    Upload CSV

  GET            `/datasets`                                `routes/datasets.py`      dataset repository               List accessible
                                                                                                                       datasets

  GET            `/datasets/{dataset_id}`                   `routes/datasets.py`      dataset service                  Dataset metadata

  GET            `/datasets/{dataset_id}/profile`           `routes/datasets.py`      dataset service                  Dataset
                                                                                                                       preview/profile

  POST           `/datasets/{dataset_id}/configure`         `routes/datasets.py`      dataset service/task detector    Set target and
                                                                                                                       task

  GET            `/models`                                  `routes/models.py`        `ml/registry.py`                 List trainable
                                                                                                                       models

  POST           `/models/recommend`                        `routes/models.py`        `ml/recommender.py`              Recommend
                                                                                                                       candidate models

  POST           `/experiments`                             `routes/experiments.py`   experiment service,              Create and run
                                                                                      `ml/trainer.py`                  experiment

  GET            `/experiments`                             `routes/experiments.py`   experiment repository            Experiment
                                                                                                                       history

  GET            `/experiments/{experiment_id}`             `routes/experiments.py`   experiment service               Experiment
                                                                                                                       status/results

  GET            `/experiments/{experiment_id}/report`      `routes/experiments.py`   `ml/comparator.py`               Detailed
                                                                                                                       comparison

  POST           `/experiments/{experiment_id}/tune`        `routes/experiments.py`   `ml/tuner.py`                    Tune a model

  GET            `/progress`                                `routes/progress.py`      progress service/repository      Learner progress

  POST           `/progress/lessons/{lesson_id}/complete`   `routes/progress.py`      progress service/repository      Mark lesson
                                                                                                                       complete
  --------------------------------------------------------------------------------------------------------------------------------------

These are proposed endpoints. Before implementation, inspect the actual
repository and finalize request/response schemas in the API contract. Do
not silently rename existing fields.

## 22. Basic concepts and learning content API

Provide structured beginner-friendly content for:

-   AI, ML and Deep Learning.
-   Dataset, rows, columns, features and target/label.
-   Supervised and unsupervised learning.
-   Regression and classification.
-   Training, validation and testing.
-   Data preprocessing and missing values.
-   Categorical encoding and feature scaling.
-   Overfitting and underfitting.
-   Parameters and hyperparameters.
-   Cross-validation.
-   Evaluation metrics.
-   Model selection and generalization.

Suggested concept response:

``` json
{
  "id": "features",
  "title": "Features",
  "level": "beginner",
  "short_definition": "Input information a model uses to make a prediction.",
  "simple_explanation": "For house-price prediction, area and number of rooms can be features.",
  "real_world_example": "Predicting a house price from its area and number of rooms.",
  "key_points": [
    "Features are model inputs.",
    "Features can be numeric or categorical."
  ],
  "common_mistakes": [
    "Accidentally including the target column as an input feature."
  ],
  "related_concepts": ["dataset", "target-label", "preprocessing"]
}
```

Store educational content in structured JSON or a content repository. Do
not hardcode the content inside route handlers. The exact Unit 1--5
content must be created from the team's actual source PDFs/notes.

## 23. Algorithm registry

Every algorithm should have metadata:

-   Stable algorithm ID.
-   Display name.
-   Category and task type.
-   Short description.
-   Beginner intuition.
-   Parameters.
-   Advantages and limitations.
-   Use cases.
-   Curriculum status.
-   Learning content availability.
-   Training support status.

Suggested initial models:

**Regression** - Linear Regression - Ridge - Lasso - Decision Tree
Regressor - Random Forest Regressor - Gradient Boosting Regressor

**Classification** - Logistic Regression - KNN - Decision Tree
Classifier - Random Forest Classifier - Naive Bayes - SVM - Gradient
Boosting Classifier

**Unsupervised** - K-Means - Agglomerative Clustering - DBSCAN - PCA

Do not advertise a model as trainable until its implementation and tests
exist. Learning-only algorithms must be marked clearly.

## 24. User dataset upload requirements

Support CSV upload first.

### Upload workflow

1.  Accept `multipart/form-data` with a `file` field.
2.  Validate extension and inspect file content; do not trust browser
    MIME type alone.
3.  Enforce configurable file-size, row and column limits.
4.  Generate a server-side UUID storage filename.
5.  Never use the original filename as a filesystem path.
6.  Reject empty, malformed or unreadable CSV files with clear errors.
7.  Store uploaded files under `datasets/uploads/`, outside publicly
    served static folders.
8.  Persist metadata in the database.
9.  Return a dataset ID.
10. Let the user inspect the profile.
11. Require explicit target-column selection.
12. Validate the target and task before training.
13. Never assume the last column is the target.

### Security and reliability

-   Prevent path traversal.
-   Never execute uploaded files.
-   Do not accept user-uploaded pickle/joblib artifacts.
-   Do not expose server filesystem paths in API responses.
-   Avoid logging raw dataset rows.
-   Reject ambiguous duplicate column names.
-   Apply parsing limits to reduce resource exhaustion risk.
-   Fit imputers, encoders and scalers only on training data, preferably
    inside scikit-learn Pipelines.
-   Add tests for oversized, empty, malformed and suspiciously named
    files.

Illustrative upload response:

``` json
{
  "dataset_id": "generated-uuid",
  "filename": "customer_data.csv",
  "status": "uploaded",
  "rows": 1200,
  "columns": 8,
  "profile_url": "/api/datasets/generated-uuid/profile"
}
```

The values above illustrate response shape only. Actual values must be
computed from the uploaded file.

## 25. Dataset profiling

Return useful information:

-   Row and column counts.
-   Column names and data types.
-   Missing-value counts and percentages.
-   Duplicate-row count.
-   Numeric summary statistics.
-   Categorical frequency summaries with sensible limits.
-   Limited data preview.
-   Target class distribution after target selection.
-   Imbalance warnings where appropriate.
-   Correlation data where meaningful.

Do not return unlimited rows or unnecessarily expose uploaded data.

## 26. Model training and comparison

An experiment request should include:

-   Dataset ID.
-   Explicit target column.
-   Task type or validated task configuration.
-   Selected model IDs.
-   Test size / split configuration.
-   Random seed.
-   Optional model parameters.
-   Optional user priority such as performance, speed or
    interpretability.

Comparison rules:

-   Use the same train/test split for all models in a comparison.
-   Use compatible algorithms for the selected task.
-   Use the same evaluation data.
-   Fit preprocessing only on training data.
-   Use scikit-learn Pipelines for imputation, encoding and scaling.
-   Validate target, row count, class count and feature suitability.
-   Return understandable warnings for small or imbalanced datasets.
-   Do not claim that one algorithm is universally best.

### Classification metrics

-   Accuracy
-   Precision
-   Recall
-   F1 score
-   Confusion matrix
-   Classification report

### Regression metrics

-   MAE
-   MSE
-   RMSE
-   R²

Also report training duration, optional cross-validation results,
train/test performance gap and warnings when relevant.

## 27. Model recommendation

The recommendation engine should consider:

-   Task type.
-   Dataset size and feature characteristics.
-   Class imbalance where applicable.
-   Evaluation metrics.
-   Training time.
-   Interpretability.
-   User-selected priority.

The response must explain why a model is recommended and mention
relevant trade-offs. Do not return an unsupported claim that a model is
the best in all situations.

## 28. Database entities

Suggested tables:

-   `datasets`: ID, original filename, stored filename, row count,
    column count, upload time, status and metadata.
-   `experiments`: ID, dataset ID, target column, task type,
    configuration, status and timestamps.
-   `model_results`: ID, experiment ID, model ID, metrics, parameters,
    training duration and optional artifact reference.
-   `concepts`: ID, title, level and structured content.
-   `lessons`: ID, module/unit, title, ordering and structured content.
-   `learner_progress`: learner/session ID, lesson ID, completion state
    and update time.

For a public multi-user deployment, implement authentication, dataset
ownership, authorization, retention/deletion rules and resource limits
before exposing private uploads. Anonymous progress is only suitable for
a limited prototype.

## 29. API contract and error handling

Use Pydantic request and response schemas. Keep stable IDs and
consistent response shapes.

Suggested error format:

``` json
{
  "error": {
    "code": "INVALID_TARGET_COLUMN",
    "message": "The selected target column does not exist in this dataset."
  }
}
```

Use appropriate HTTP status codes such as 400, 404, 413, 422 and 500.
Document multipart upload fields and every request/response property.
Keep OpenAPI `/docs` synchronized. Configure CORS for the actual
frontend origins only.

------------------------------------------------------------------------

# PART C --- SHARED REPOSITORY AND TEAM WORKFLOW

## 30. Complete GitHub repository structure

``` text
PADH-LE-BC/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── backend/
│   ├── app/
│   ├── datasets/
│   ├── artifacts/
│   ├── tests/
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── docs/
│   ├── PROJECT-SCHEMA.md
│   ├── API-CONTRACT.md
│   ├── TEAM-OWNERSHIP.md
│   └── UNIT-1-TO-5-CURRICULUM.md
│
├── .gitignore
└── README.md
```

This document can be saved as `docs/PROJECT-SCHEMA.md`. The API
contract, team ownership and curriculum mapping can later be split into
separate documents if the team wants. This single document is the master
specification.

## 31. API contract conventions

-   Backend owns the canonical API contract.
-   Frontend must consume the exact documented endpoints and fields.
-   Do not invent endpoint paths or response properties independently.
-   Update this schema when a contract changes.
-   Keep OpenAPI docs synchronized.
-   Include loading, empty, error and retry behaviour in the frontend.
-   Use multipart form data for CSV uploads.
-   Keep frontend API base URL configurable, for example
    `VITE_API_BASE_URL`.
-   Never put backend secrets in frontend environment variables.

## 32. Team ownership template

Fill this with the actual team members.

  -----------------------------------------------------------------------
  Team member             Role                    Responsibilities
  ----------------------- ----------------------- -----------------------
  \[Name\]                Backend developer       FastAPI, ML models,
                                                  dataset upload, APIs,
                                                  database and tests

  \[Name\]                Frontend developer      React UI, navigation,
                                                  learning pages,
                                                  playground and API
                                                  integration

  \[Name\]                ML content/research     Unit 1--5 mapping,
                                                  concept explanations,
                                                  algorithms and code
                                                  walkthroughs

  \[Name\]                Testing/integration     Test datasets, API
                                                  tests, integration and
                                                  bug tracking

  \[Name\]                Documentation/demo      README, diagrams,
                                                  report, presentation
                                                  and demo
  -----------------------------------------------------------------------

A person may hold multiple roles. Do not assign names until the team
confirms ownership.

## 33. Git branch and collaboration strategy

Suggested branches:

-   `main`: stable integrated application.
-   `frontend`: frontend work.
-   `backend`: backend work.
-   Feature branches for larger independent tasks.

Keep frontend and backend in separate folders even when working on
separate branches. Coordinate before changing shared API contracts. Use
pull requests or an agreed merge process. Verify actual remote and
branch names before pushing.

## 34. `.gitignore` requirements

Exclude: - Python virtual environments. - `__pycache__` and test
caches. - `node_modules` and build output. - `.env` secrets. - Uploaded
user datasets. - Local generated databases. - Temporary model artifacts.

Do not commit private user-uploaded datasets or secrets.

## 35. Implementation phases

### Phase 1 --- Foundation

-   Create the new GitHub repository.
-   Create separate frontend and backend applications.
-   Agree on stack, folder structure and API contract.
-   Import and map actual Unit 1--5 material.

### Phase 2 --- Learning experience

-   Build concept and lesson content structure.
-   Implement concept, lesson and algorithm APIs.
-   Build frontend Learning Hub and Algorithm Library.
-   Add beginner-friendly code explanations.

### Phase 3 --- Dataset workflow

-   Implement secure CSV upload.
-   Implement dataset profile and preview.
-   Implement target selection and task validation.
-   Build frontend Model Lab upload/configuration flow.

### Phase 4 --- ML engine

-   Implement and test model registry.
-   Implement preprocessing pipelines.
-   Implement training and evaluation.
-   Implement model comparison and recommendations.
-   Connect frontend results visualizations.

### Phase 5 --- Playground and advanced learning

-   Add interactive algorithm demonstrations.
-   Clearly distinguish simulations from actual training.
-   Add tuning and experiment history.
-   Add guided projects and progress tracking.

### Phase 6 --- Integration and release

-   Run frontend and backend together.
-   Test upload → profile → configure → train → compare → report.
-   Test error cases and security limits.
-   Verify responsive UI.
-   Update documentation.
-   Prepare deployment and demo.

## 36. Definition of done

The first complete release should satisfy:

-   A beginner can navigate to the first lesson without prior knowledge.
-   Core ML concepts are explained in structured content.
-   Algorithm pages explain intuition, maths and code.
-   Users can upload valid CSV datasets.
-   Users can inspect dataset profiles and explicitly choose target
    columns.
-   Users can train multiple supported models.
-   Models in one comparison use consistent evaluation conditions.
-   Metrics are actual computed results.
-   The platform explains model trade-offs and recommendations.
-   Errors are handled clearly.
-   Frontend and backend follow one API contract.
-   Automated tests pass.
-   The complete end-to-end workflow is verified.

## 37. Important scope boundaries

-   This is a new project/repository, not a patch to the old
    application.
-   Do not make decision trees the main identity of the product.
-   Do not claim every listed algorithm is implemented at launch.
-   Do not label supplementary topics as part of Unit 1--5 without
    checking the actual material.
-   Do not use an LLM chatbot as a replacement for accurate, structured
    learning content.
-   Do not fabricate dataset statistics, model metrics or
    recommendations.
-   Do not expose user-uploaded datasets publicly.
-   Do not build authentication or multi-user claims without
    implementing ownership and access controls.
