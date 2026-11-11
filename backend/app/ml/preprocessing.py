from typing import List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler

from app.core.errors import BadRequestException, InvalidDatasetException


class PreprocessingResult:
    def __init__(
        self,
        X_train_transformed: np.ndarray,
        X_test_transformed: np.ndarray,
        y_train: np.ndarray,
        y_test: np.ndarray,
        feature_names: List[str],
        preprocessor: ColumnTransformer,
        label_encoder: Optional[LabelEncoder] = None,
        target_classes: Optional[List[str]] = None,
    ):
        self.X_train = X_train_transformed
        self.X_test = X_test_transformed
        self.y_train = y_train
        self.y_test = y_test
        self.feature_names = feature_names
        self.preprocessor = preprocessor
        self.label_encoder = label_encoder
        self.target_classes = target_classes


def prepare_and_split_data(
    df: pd.DataFrame,
    target_column: str,
    task_type: str,
    test_size: float = 0.2,
    random_state: int = 42,
) -> PreprocessingResult:
    if target_column not in df.columns:
        raise BadRequestException(
            f"Target column '{target_column}' is missing from the dataset.",
            code="INVALID_TARGET_COLUMN",
        )

    df_clean = df.dropna(subset=[target_column]).copy()
    if len(df_clean) < 10:
        raise InvalidDatasetException(
            f"Dataset has only {len(df_clean)} valid rows with non-null target values. Minimum 10 rows required.",
            code="INSUFFICIENT_DATA_ROWS",
        )

    X = df_clean.drop(columns=[target_column])
    y = df_clean[target_column]

    if len(X.columns) == 0:
        raise InvalidDatasetException(
            "Dataset must contain at least one feature column besides the target.",
            code="NO_FEATURE_COLUMNS",
        )

    label_encoder = None
    target_classes = None
    y_processed = y.values

    if task_type == "classification":
        label_encoder = LabelEncoder()
        y_processed = label_encoder.fit_transform(y.astype(str))
        target_classes = [str(c) for c in label_encoder.classes_]

        if len(target_classes) < 2:
            raise InvalidDatasetException(
                f"Classification requires at least 2 distinct classes in target '{target_column}', found {len(target_classes)}.",
                code="INSUFFICIENT_CLASSES",
            )
    else:
        try:
            y_processed = y.astype(float).values
        except Exception:
            raise BadRequestException(
                f"Cannot parse regression target column '{target_column}' as continuous floating-point numbers.",
                code="NON_NUMERIC_REGRESSION_TARGET",
            )

    stratify_split = None
    if task_type == "classification":
        class_counts = pd.Series(y_processed).value_counts()
        if (class_counts >= 2).all() and len(df_clean) * test_size >= len(class_counts):
            stratify_split = y_processed

    try:
        X_train_raw, X_test_raw, y_train, y_test = train_test_split(
            X,
            y_processed,
            test_size=test_size,
            random_state=random_state,
            stratify=stratify_split,
        )
    except Exception:
        X_train_raw, X_test_raw, y_train, y_test = train_test_split(
            X, y_processed, test_size=test_size, random_state=random_state
        )

    numeric_cols = []
    categorical_cols = []

    for col in X.columns:
        if pd.api.types.is_numeric_dtype(X[col]):
            numeric_cols.append(col)
        else:
            categorical_cols.append(col)

    transformers = []

    if numeric_cols:
        num_pipeline = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
            ]
        )
        transformers.append(("num", num_pipeline, numeric_cols))

    if categorical_cols:
        cat_pipeline = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="most_frequent")),
                (
                    "encoder",
                    OneHotEncoder(
                        handle_unknown="ignore", sparse_output=False, drop=None
                    ),
                ),
            ]
        )
        transformers.append(("cat", cat_pipeline, categorical_cols))

    preprocessor = ColumnTransformer(transformers=transformers, remainder="drop")

    X_train_transformed = preprocessor.fit_transform(X_train_raw)
    X_test_transformed = preprocessor.transform(X_test_raw)

    feature_names = []
    if numeric_cols:
        feature_names.extend(numeric_cols)
    if categorical_cols:
        try:
            encoder = preprocessor.named_transformers_["cat"].named_steps["encoder"]
            cat_feature_names = encoder.get_feature_names_out(categorical_cols).tolist()
            feature_names.extend(cat_feature_names)
        except Exception:
            feature_names.extend(categorical_cols)

    return PreprocessingResult(
        X_train_transformed=X_train_transformed,
        X_test_transformed=X_test_transformed,
        y_train=y_train,
        y_test=y_test,
        feature_names=feature_names,
        preprocessor=preprocessor,
        label_encoder=label_encoder,
        target_classes=target_classes,
    )
