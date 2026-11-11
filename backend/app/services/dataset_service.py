import io
import json
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.errors import (
    AppException,
    BadRequestException,
    FileTooLargeException,
    InvalidDatasetException,
    InvalidTargetColumnException,
    NotFoundException,
)
from app.database.models import DatasetModel
from app.database.repositories.dataset_repo import dataset_repo
from app.ml.registry import get_trainable_models
from app.schemas.dataset import (
    ColumnProfile,
    DatasetConfigureResponse,
    DatasetProfileResponse,
    DatasetSummary,
    DatasetUploadResponse,
    SampleDatasetInfo,
    SampleDatasetListResponse,
)


class DatasetService:
    def __init__(self, upload_dir: Optional[Path] = None):
        self.upload_dir = upload_dir or settings.UPLOAD_DIR
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def _clean_for_json(self, val: Any) -> Any:
        if val is None or pd.isna(val) or (isinstance(val, float) and (np.isnan(val) or np.isinf(val))):
            return None
        if isinstance(val, (np.integer, int)):
            return int(val)
        if isinstance(val, (np.floating, float)):
            return float(val)
        if isinstance(val, (np.bool_, bool)):
            return bool(val)
        return str(val)

    def save_upload(self, db: Session, file: UploadFile) -> DatasetUploadResponse:
        if not file.filename:
            raise BadRequestException("Uploaded file must have a filename.", code="INVALID_FILENAME")

        clean_filename = Path(file.filename).name
        if not clean_filename.lower().endswith(".csv"):
            raise BadRequestException(
                f"Unsupported file format '{clean_filename}'. Only CSV (.csv) files are permitted.",
                code="INVALID_FILE_TYPE",
            )

        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        file_bytes = io.BytesIO()
        total_size = 0

        file.file.seek(0)
        while chunk := file.file.read(1024 * 64):
            total_size += len(chunk)
            if total_size > max_bytes:
                raise FileTooLargeException(
                    f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
                )
            file_bytes.write(chunk)

        if total_size == 0:
            raise InvalidDatasetException("The uploaded CSV file is empty (0 bytes).", code="EMPTY_FILE")

        file_bytes.seek(0)

        try:
            content = file_bytes.getvalue()
            try:
                text_content = content.decode("utf-8")
            except UnicodeDecodeError:
                text_content = content.decode("latin-1")

            lines = [l for l in text_content.strip().splitlines() if l.strip()]
            if lines:
                raw_header = [h.strip() for h in lines[0].split(",")]
                if len(raw_header) != len(set(raw_header)):
                    duplicates = [col for col in raw_header if raw_header.count(col) > 1]
                    raise InvalidDatasetException(
                        f"CSV contains ambiguous duplicate column names: {list(set(duplicates))}",
                        code="DUPLICATE_COLUMNS",
                    )

            df = pd.read_csv(io.StringIO(text_content))
        except AppException:
            raise
        except Exception as e:
            raise InvalidDatasetException(
                f"Failed to parse CSV file: {str(e)}", code="MALFORMED_CSV"
            )

        if df.empty or len(df) == 0:
            raise InvalidDatasetException(
                "The CSV file contains no data rows.", code="EMPTY_DATASET"
            )

        if len(df.columns) == 0:
            raise InvalidDatasetException(
                "The CSV file contains no columns.", code="NO_COLUMNS"
            )

        if len(df) > settings.MAX_CSV_ROWS:
            raise InvalidDatasetException(
                f"Dataset row count ({len(df)}) exceeds maximum permitted limit ({settings.MAX_CSV_ROWS}).",
                code="MAX_ROWS_EXCEEDED",
            )

        if len(df.columns) > settings.MAX_CSV_COLUMNS:
            raise InvalidDatasetException(
                f"Dataset column count ({len(df.columns)}) exceeds maximum permitted limit ({settings.MAX_CSV_COLUMNS}).",
                code="MAX_COLUMNS_EXCEEDED",
            )

        if len(df.columns) != len(set(df.columns)):
            duplicates = [col for col in df.columns if list(df.columns).count(col) > 1]
            raise InvalidDatasetException(
                f"CSV contains ambiguous duplicate column names: {list(set(duplicates))}",
                code="DUPLICATE_COLUMNS",
            )

        dataset_id = str(uuid.uuid4())
        stored_filename = f"{dataset_id}.csv"
        destination_path = self.upload_dir / stored_filename

        with open(destination_path, "wb") as f:
            f.write(content)

        profile_data = self._generate_profile_dict(df)

        dataset_model = DatasetModel(
            id=dataset_id,
            original_filename=clean_filename,
            stored_filename=stored_filename,
            file_path=str(destination_path),
            file_size_bytes=total_size,
            row_count=len(df),
            column_count=len(df.columns),
            status="uploaded",
            profile_json=json.dumps(profile_data),
        )
        dataset_repo.create(db, dataset_model)

        return DatasetUploadResponse(
            dataset_id=dataset_id,
            original_filename=clean_filename,
            file_size_bytes=total_size,
            status="uploaded",
            rows=len(df),
            columns=len(df.columns),
            profile_url=f"/api/datasets/{dataset_id}/profile",
        )

    def _generate_profile_dict(
        self, df: pd.DataFrame, target_column: Optional[str] = None
    ) -> Dict[str, Any]:
        column_profiles = []
        warnings = []

        if len(df) < 50:
            warnings.append(
                f"Dataset has only {len(df)} rows. Machine learning models may underfit or display high variance."
            )

        dup_rows = int(df.duplicated().sum())
        if dup_rows > 0:
            warnings.append(
                f"Dataset contains {dup_rows} duplicate rows ({dup_rows / len(df) * 100:.1f}%)."
            )

        for col in df.columns:
            series = df[col]
            missing_count = int(series.isna().sum())
            missing_pct = float((missing_count / len(df)) * 100)
            unique_count = int(series.nunique(dropna=True))

            if missing_pct > 30:
                warnings.append(
                    f"Column '{col}' has {missing_pct:.1f}% missing values. Consider imputation or dropping."
                )

            if unique_count == 1:
                warnings.append(
                    f"Column '{col}' has a constant single value and provides zero predictive variance."
                )

            if pd.api.types.is_bool_dtype(series):
                inferred_type = "boolean"
            elif pd.api.types.is_numeric_dtype(series):
                inferred_type = "numeric"
            elif pd.api.types.is_datetime64_any_dtype(series):
                inferred_type = "datetime"
            else:
                inferred_type = "categorical"

            c_min = c_max = c_mean = c_std = c_median = None
            top_cats = None

            if inferred_type == "numeric":
                non_null = series.dropna()
                if len(non_null) > 0:
                    c_min = self._clean_for_json(non_null.min())
                    c_max = self._clean_for_json(non_null.max())
                    c_mean = self._clean_for_json(round(float(non_null.mean()), 4))
                    c_std = (
                        self._clean_for_json(round(float(non_null.std()), 4))
                        if len(non_null) > 1
                        else 0.0
                    )
                    c_median = self._clean_for_json(round(float(non_null.median()), 4))
            else:
                counts = series.value_counts(dropna=True).head(5)
                top_cats = [
                    {
                        "value": str(idx),
                        "count": int(count),
                        "percentage": round((count / len(df)) * 100, 2),
                    }
                    for idx, count in counts.items()
                ]
                if unique_count > 50 and inferred_type == "categorical":
                    warnings.append(
                        f"Categorical column '{col}' has high cardinality ({unique_count} distinct categories)."
                    )

            sample_vals = [
                self._clean_for_json(v)
                for v in series.dropna().head(5).tolist()
            ]

            column_profiles.append(
                {
                    "name": col,
                    "inferred_type": inferred_type,
                    "missing_count": missing_count,
                    "missing_percentage": round(missing_pct, 2),
                    "unique_count": unique_count,
                    "min": c_min,
                    "max": c_max,
                    "mean": c_mean,
                    "std": c_std,
                    "median": c_median,
                    "top_categories": top_cats,
                    "sample_values": sample_vals,
                }
            )

        preview_df = df.head(10).replace({np.nan: None})
        preview_rows = [
            {k: self._clean_for_json(v) for k, v in row.items()}
            for row in preview_df.to_dict(orient="records")
        ]

        class_dist = None
        if target_column and target_column in df.columns:
            target_series = df[target_column]
            if target_series.nunique() <= 50:
                dist = target_series.value_counts().to_dict()
                class_dist = {str(k): int(v) for k, v in dist.items()}
                counts = list(dist.values())
                if len(counts) > 1 and (min(counts) / max(counts) < 0.2):
                    warnings.append(
                        f"Target column '{target_column}' is severely imbalanced (minority class < 20% of majority)."
                    )

        return {
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": list(df.columns),
            "column_profiles": column_profiles,
            "duplicate_rows": dup_rows,
            "preview_rows": preview_rows,
            "class_distribution": class_dist,
            "warnings": warnings,
        }

    def get_dataset(self, db: Session, dataset_id: str) -> DatasetModel:
        dataset = dataset_repo.get_by_id(db, dataset_id)
        if not dataset:
            raise NotFoundException(
                f"Dataset with ID '{dataset_id}' was not found.", code="DATASET_NOT_FOUND"
            )
        return dataset

    def load_dataframe(self, dataset: DatasetModel) -> pd.DataFrame:
        path = Path(dataset.file_path)
        if not path.exists():
            raise NotFoundException(
                "Dataset file not found on server storage.", code="DATASET_FILE_MISSING"
            )
        try:
            return pd.read_csv(path)
        except Exception as e:
            raise InvalidDatasetException(
                f"Failed to load dataset: {str(e)}", code="DATASET_LOAD_ERROR"
            )

    def get_profile(self, db: Session, dataset_id: str) -> DatasetProfileResponse:
        dataset = self.get_dataset(db, dataset_id)
        if dataset.profile_json:
            p = json.loads(dataset.profile_json)
        else:
            df = self.load_dataframe(dataset)
            p = self._generate_profile_dict(df, target_column=dataset.target_column)
            dataset.profile_json = json.dumps(p)
            dataset_repo.update(db, dataset)

        return DatasetProfileResponse(
            dataset_id=dataset.id,
            original_filename=dataset.original_filename,
            row_count=p["row_count"],
            column_count=p["column_count"],
            columns=p["columns"],
            column_profiles=[ColumnProfile(**cp) for cp in p["column_profiles"]],
            duplicate_rows=p["duplicate_rows"],
            target_column=dataset.target_column,
            detected_task=dataset.detected_task,
            preview_rows=p["preview_rows"],
            class_distribution=p.get("class_distribution"),
            warnings=p.get("warnings", []),
        )

    def configure_target(
        self,
        db: Session,
        dataset_id: str,
        target_column: str,
        task_type: Optional[str] = None,
    ) -> DatasetConfigureResponse:
        dataset = self.get_dataset(db, dataset_id)
        df = self.load_dataframe(dataset)

        if target_column not in df.columns:
            raise InvalidTargetColumnException(
                f"The selected target column '{target_column}' does not exist in dataset columns: {list(df.columns)}"
            )

        target_series = df[target_column].dropna()
        if len(target_series) == 0:
            raise InvalidDatasetException(
                f"Target column '{target_column}' contains only missing (NaN) values.",
                code="EMPTY_TARGET_COLUMN",
            )

        unique_count = target_series.nunique()
        is_numeric = pd.api.types.is_numeric_dtype(target_series)
        is_float = pd.api.types.is_float_dtype(target_series)

        detected = "classification"
        warnings = []

        if not is_numeric or target_series.dtype == object or pd.api.types.is_bool_dtype(target_series):
            detected = "classification"
            if unique_count > 100:
                warnings.append(
                    f"Target column '{target_column}' has {unique_count} distinct categories. Classification may be impractical."
                )
        elif is_float and unique_count > 20:
            detected = "regression"
        elif unique_count <= 20:
            detected = "classification"
        else:
            detected = "regression"

        final_task = (task_type.lower() if task_type else detected).strip()
        if final_task not in ("classification", "regression"):
            raise BadRequestException(
                f"Unsupported task type '{final_task}'. Supported tasks are 'classification' and 'regression'.",
                code="INVALID_TASK_TYPE",
            )

        if final_task == "regression" and (not is_numeric):
            raise BadRequestException(
                f"Cannot perform regression on non-numeric target column '{target_column}'.",
                code="INCOMPATIBLE_TASK_TYPE",
            )

        if final_task == "classification" and unique_count < 2:
            raise BadRequestException(
                f"Target column '{target_column}' has only 1 unique class ({unique_count}). At least 2 distinct classes are required for classification.",
                code="INSUFFICIENT_CLASSES",
            )

        dataset.target_column = target_column
        dataset.detected_task = final_task
        dataset.status = "configured"

        p = self._generate_profile_dict(df, target_column=target_column)
        dataset.profile_json = json.dumps(p)
        dataset_repo.update(db, dataset)

        compatible_models = [m["id"] for m in get_trainable_models(final_task)]

        return DatasetConfigureResponse(
            dataset_id=dataset.id,
            target_column=target_column,
            task_type=final_task,
            compatible_models=compatible_models,
            warnings=warnings,
        )

    def list_datasets(self, db: Session, skip: int = 0, limit: int = 50) -> List[DatasetSummary]:
        records = dataset_repo.list_all(db, skip=skip, limit=limit)
        return [
            DatasetSummary(
                id=d.id,
                original_filename=d.original_filename,
                file_size_bytes=d.file_size_bytes,
                row_count=d.row_count,
                column_count=d.column_count,
                target_column=d.target_column,
                detected_task=d.detected_task,
                status=d.status,
                created_at=d.created_at.isoformat(),
            )
            for d in records
        ]

    def list_sample_datasets(self) -> SampleDatasetListResponse:
        samples = [SampleDatasetInfo(**item) for item in SAMPLE_DATASETS_CATALOG.values()]
        return SampleDatasetListResponse(total=len(samples), samples=samples)

    def load_sample_dataset(self, db: Session, sample_id: str) -> DatasetUploadResponse:
        sample_meta = SAMPLE_DATASETS_CATALOG.get(sample_id)
        if not sample_meta:
            raise NotFoundException(
                f"Sample dataset '{sample_id}' not found. Available samples: {list(SAMPLE_DATASETS_CATALOG.keys())}",
                code="SAMPLE_NOT_FOUND",
            )

        samples_dir = Path(__file__).resolve().parent.parent.parent / "datasets" / "samples"
        source_path = samples_dir / sample_meta["filename"]
        if not source_path.exists():
            raise NotFoundException(
                f"Sample dataset file '{sample_meta['filename']}' could not be located on disk.",
                code="SAMPLE_FILE_MISSING",
            )

        with open(source_path, "rb") as f:
            content = f.read()

        df = pd.read_csv(io.StringIO(content.decode("utf-8")))

        dataset_id = str(uuid.uuid4())
        stored_filename = f"{dataset_id}.csv"
        destination_path = self.upload_dir / stored_filename

        with open(destination_path, "wb") as f:
            f.write(content)

        profile_data = self._generate_profile_dict(df)

        dataset_model = DatasetModel(
            id=dataset_id,
            original_filename=sample_meta["filename"],
            stored_filename=stored_filename,
            file_path=str(destination_path),
            file_size_bytes=len(content),
            row_count=len(df),
            column_count=len(df.columns),
            status="uploaded",
            profile_json=json.dumps(profile_data),
        )
        dataset_repo.create(db, dataset_model)

        return DatasetUploadResponse(
            dataset_id=dataset_id,
            original_filename=sample_meta["filename"],
            file_size_bytes=len(content),
            status="uploaded",
            rows=len(df),
            columns=len(df.columns),
            profile_url=f"/api/datasets/{dataset_id}/profile",
        )


SAMPLE_DATASETS_CATALOG: Dict[str, Dict[str, Any]] = {
    "iris": {
        "id": "iris",
        "display_name": "Iris Flower Classification",
        "description": "The classic multiclass classification benchmark from scikit-learn. Predict 3 flower species (setosa, versicolor, virginica) from 4 botanical petal and sepal measurements.",
        "filename": "iris.csv",
        "row_count": 150,
        "feature_count": 4,
        "target_column": "species",
        "task_type": "classification",
        "difficulty": "Beginner",
        "available_algorithms": [
            "logistic_regression",
            "knn_classifier",
            "decision_tree_classifier",
            "random_forest_classifier",
            "naive_bayes",
            "svm_classifier",
            "gradient_boosting_classifier",
        ],
        "educational_objectives": [
            "Understand multiclass classification (3 classes)",
            "Explore 2D/3D feature distributions and class overlap",
            "Observe how K-Nearest Neighbors classifies points in metric space",
            "Compare accuracy and confusion matrix across linear, tree, and ensemble models",
        ],
        "disclaimer": None,
    },
    "breast_cancer": {
        "id": "breast_cancer",
        "display_name": "Breast Cancer Wisconsin Diagnostic",
        "description": "Standard binary classification benchmark from scikit-learn. Classify breast mass cell nuclei features as malignant or benign across 30 real-valued morphological attributes.",
        "filename": "breast_cancer.csv",
        "row_count": 569,
        "feature_count": 30,
        "target_column": "diagnosis",
        "task_type": "classification",
        "difficulty": "Beginner to Intermediate",
        "available_algorithms": [
            "logistic_regression",
            "knn_classifier",
            "decision_tree_classifier",
            "random_forest_classifier",
            "naive_bayes",
            "svm_classifier",
            "gradient_boosting_classifier",
        ],
        "educational_objectives": [
            "Understand binary classification (malignant vs. benign)",
            "Explore the critical tradeoff between Precision and Recall",
            "Analyze why false negatives (missing malignant tumors) are costlier than false positives",
            "Compare high-dimensional feature scaling and regularized models",
        ],
        "disclaimer": "Public educational dataset from UCI/scikit-learn. For academic machine learning evaluation only, not for clinical diagnostic or medical decision-making.",
    },
    "churn": {
        "id": "churn",
        "display_name": "Customer Churn Prediction",
        "description": "Supervised binary classification predicting whether telecommunications subscribers will cancel their contract based on account tenure, monthly charges, and support interactions.",
        "filename": "classification_churn.csv",
        "row_count": 100,
        "feature_count": 5,
        "target_column": "churn",
        "task_type": "classification",
        "difficulty": "Beginner",
        "available_algorithms": [
            "logistic_regression",
            "knn",
            "decision_tree_classifier",
            "random_forest_classifier",
            "gradient_boosting_classifier",
        ],
        "educational_objectives": [
            "Formulate customer churn as a binary classification problem",
            "Preprocess mixed numerical and categorical subscriber features",
            "Optimize F1 macro to detect churn without excessive false alarms",
        ],
        "disclaimer": None,
    },
    "housing": {
        "id": "housing",
        "display_name": "Real Estate Housing Valuation",
        "description": "Supervised regression predicting continuous residential property market sale prices from square footage, bedroom/bathroom counts, and neighborhood tier.",
        "filename": "regression_housing.csv",
        "row_count": 100,
        "feature_count": 4,
        "target_column": "price",
        "task_type": "regression",
        "difficulty": "Beginner",
        "available_algorithms": [
            "linear_regression",
            "ridge_regression",
            "lasso_regression",
            "decision_tree_regressor",
            "random_forest_regressor",
            "gradient_boosting_regressor",
        ],
        "educational_objectives": [
            "Formulate continuous real estate valuation as regression",
            "Benchmark regularized linear baselines (L1/L2) against non-linear tree models",
            "Evaluate model performance using R², RMSE, and MAE error metrics",
        ],
        "disclaimer": None,
    },
}


dataset_service = DatasetService()
