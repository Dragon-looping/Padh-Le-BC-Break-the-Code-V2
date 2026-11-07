import time
from typing import Any, Dict, List, Optional, Tuple
import pandas as pd

from app.core.errors import BadRequestException, ModelTrainingException
from app.ml.evaluator import evaluator
from app.ml.preprocessing import PreprocessingResult, prepare_and_split_data
from app.ml.registry import TRAINABLE_MODELS, get_estimator_instance, is_trainable
from app.schemas.experiment import ModelEvaluationResult


class ModelTrainer:
    def train_and_evaluate_models(
        self,
        df: pd.DataFrame,
        target_column: str,
        task_type: str,
        model_ids: List[str],
        test_size: float = 0.2,
        random_state: int = 42,
        custom_hyperparameters: Optional[Dict[str, Dict[str, Any]]] = None,
    ) -> Tuple[List[ModelEvaluationResult], List[str], PreprocessingResult]:
        # 1. Validate requested models
        for mid in model_ids:
            if not is_trainable(mid, task_type):
                raise BadRequestException(
                    f"Model '{mid}' is not a valid trainable model for task '{task_type}'.",
                    code="UNSUPPORTED_MODEL_FOR_TASK",
                )

        # 2. Preprocess and split dataset strictly once
        prep_result = prepare_and_split_data(
            df=df,
            target_column=target_column,
            task_type=task_type,
            test_size=test_size,
            random_state=random_state,
        )

        results: List[ModelEvaluationResult] = []
        warnings: List[str] = []

        if len(prep_result.X_train) < 30:
            warnings.append(
                f"Small training split ({len(prep_result.X_train)} samples). Metric estimates may have higher variance."
            )

        # 3. Train and evaluate each model under the exact same split
        for mid in model_ids:
            model_info = TRAINABLE_MODELS[mid]
            user_params = (
                custom_hyperparameters.get(mid, {}) if custom_hyperparameters else {}
            )

            start_time = time.perf_counter()
            status = "completed"
            error_msg = None
            metrics: Dict[str, Any] = {}
            train_metric = None
            test_metric = None
            overfitting_warn = None
            cv_scores = None

            try:
                estimator = get_estimator_instance(mid, user_params)
                estimator.fit(prep_result.X_train, prep_result.y_train)

                duration = float(time.perf_counter() - start_time)

                # Predict on test and train
                y_pred_test = estimator.predict(prep_result.X_test)
                y_pred_train = estimator.predict(prep_result.X_train)

                if task_type == "classification":
                    (
                        metrics,
                        train_metric,
                        test_metric,
                        overfitting_warn,
                    ) = evaluator.evaluate_classification(
                        y_true_test=prep_result.y_test,
                        y_pred_test=y_pred_test,
                        y_true_train=prep_result.y_train,
                        y_pred_train=y_pred_train,
                        target_classes=prep_result.target_classes,
                    )
                else:
                    (
                        metrics,
                        train_metric,
                        test_metric,
                        overfitting_warn,
                    ) = evaluator.evaluate_regression(
                        y_true_test=prep_result.y_test,
                        y_pred_test=y_pred_test,
                        y_true_train=prep_result.y_train,
                        y_pred_train=y_pred_train,
                    )

                # Cross-validation
                cv_scores = evaluator.compute_cross_validation(
                    estimator=estimator,
                    X=prep_result.X_train,
                    y=prep_result.y_train,
                    task_type=task_type,
                    cv_folds=3,
                )

            except Exception as e:
                duration = float(time.perf_counter() - start_time)
                status = "failed"
                error_msg = str(e)
                metrics = {}

            # Hyperparameters record
            effective_params = model_info["default_params"].copy()
            effective_params.update(user_params)
            # Make sure parameters are JSON serializable
            clean_params = {
                k: v if isinstance(v, (int, float, str, bool)) or v is None else str(v)
                for k, v in effective_params.items()
            }

            results.append(
                ModelEvaluationResult(
                    model_id=mid,
                    model_name=model_info["name"],
                    category=model_info["category"],
                    hyperparameters=clean_params,
                    metrics=metrics,
                    training_duration_seconds=round(duration, 4),
                    train_metric=train_metric,
                    test_metric=test_metric,
                    overfitting_warning=overfitting_warn,
                    cv_scores=cv_scores,
                    status=status,
                    error_message=error_msg,
                )
            )

        return results, warnings, prep_result


trainer = ModelTrainer()
