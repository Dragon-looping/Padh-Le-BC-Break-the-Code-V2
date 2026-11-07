from typing import Any, Dict, List, Optional
import numpy as np
from sklearn.model_selection import GridSearchCV, KFold, StratifiedKFold

from app.core.errors import BadRequestException, ModelTrainingException
from app.ml.evaluator import evaluator
from app.ml.preprocessing import PreprocessingResult
from app.ml.registry import TRAINABLE_MODELS, get_estimator_instance
from app.schemas.experiment import ExperimentTuneResponse


class HyperparameterTuner:
    def tune_model(
        self,
        experiment_id: str,
        model_id: str,
        prep_result: PreprocessingResult,
        task_type: str,
        param_grid: Optional[Dict[str, List[Any]]] = None,
        cv_folds: int = 3,
    ) -> ExperimentTuneResponse:
        if model_id not in TRAINABLE_MODELS:
            raise BadRequestException(
                f"Model '{model_id}' is not in the trainable model registry.",
                code="UNSUPPORTED_TUNING_MODEL",
            )

        model_info = TRAINABLE_MODELS[model_id]
        if model_info["task_type"] != task_type:
            raise BadRequestException(
                f"Model '{model_id}' task type ({model_info['task_type']}) does not match experiment task '{task_type}'.",
                code="TASK_MISMATCH",
            )

        # 1. Use safe parameter grid
        grid = param_grid or model_info.get("param_grid")
        if not grid:
            raise BadRequestException(
                f"No tuning parameter grid available for '{model_id}'.",
                code="NO_PARAM_GRID",
            )

        # 2. Train baseline before metrics
        base_estimator = get_estimator_instance(model_id)
        base_estimator.fit(prep_result.X_train, prep_result.y_train)

        y_pred_base_test = base_estimator.predict(prep_result.X_test)
        y_pred_base_train = base_estimator.predict(prep_result.X_train)

        if task_type == "classification":
            before_metrics, _, _, _ = evaluator.evaluate_classification(
                y_true_test=prep_result.y_test,
                y_pred_test=y_pred_base_test,
                y_true_train=prep_result.y_train,
                y_pred_train=y_pred_base_train,
                target_classes=prep_result.target_classes,
            )
            scoring = "accuracy"
            cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
        else:
            before_metrics, _, _, _ = evaluator.evaluate_regression(
                y_true_test=prep_result.y_test,
                y_pred_test=y_pred_base_test,
                y_true_train=prep_result.y_train,
                y_pred_train=y_pred_base_train,
            )
            scoring = "r2"
            cv = KFold(n_splits=cv_folds, shuffle=True, random_state=42)

        # 3. Perform Grid Search
        try:
            grid_search = GridSearchCV(
                estimator=get_estimator_instance(model_id),
                param_grid=grid,
                cv=cv,
                scoring=scoring,
                n_jobs=1,  # Keep single threaded for reliability
            )
            grid_search.fit(prep_result.X_train, prep_result.y_train)
        except Exception as e:
            raise ModelTrainingException(
                f"Hyperparameter tuning failed during cross-validation: {str(e)}"
            )

        best_estimator = grid_search.best_estimator_
        best_params = grid_search.best_params_

        # 4. Evaluate after metrics
        y_pred_tuned_test = best_estimator.predict(prep_result.X_test)
        y_pred_tuned_train = best_estimator.predict(prep_result.X_train)

        if task_type == "classification":
            after_metrics, _, _, _ = evaluator.evaluate_classification(
                y_true_test=prep_result.y_test,
                y_pred_test=y_pred_tuned_test,
                y_true_train=prep_result.y_train,
                y_pred_train=y_pred_tuned_train,
                target_classes=prep_result.target_classes,
            )
            primary_key = "accuracy"
            delta = after_metrics["accuracy"] - before_metrics["accuracy"]
            is_meaningful = delta >= 0.01
            summary = (
                f"Accuracy moved from {before_metrics['accuracy']:.4f} to {after_metrics['accuracy']:.4f} "
                f"({delta:+.4f}) with best parameters: {best_params}."
            )
        else:
            after_metrics, _, _, _ = evaluator.evaluate_regression(
                y_true_test=prep_result.y_test,
                y_pred_test=y_pred_tuned_test,
                y_true_train=prep_result.y_train,
                y_pred_train=y_pred_tuned_train,
            )
            primary_key = "r2"
            delta = after_metrics["r2"] - before_metrics["r2"]
            is_meaningful = delta >= 0.01 or (
                after_metrics["rmse"] < before_metrics["rmse"] * 0.98
            )
            summary = (
                f"R² moved from {before_metrics['r2']:.4f} to {after_metrics['r2']:.4f} "
                f"({delta:+.4f}) and RMSE from {before_metrics['rmse']:.4f} to {after_metrics['rmse']:.4f} "
                f"with best parameters: {best_params}."
            )

        warnings = []
        if not is_meaningful:
            warnings.append(
                "Tuning produced marginal or negligible improvement on the hold-out test set."
            )

        # Clean params for JSON serialization
        clean_best_params = {
            k: v if isinstance(v, (int, float, str, bool)) or v is None else str(v)
            for k, v in best_params.items()
        }
        clean_orig_params = {
            k: v if isinstance(v, (int, float, str, bool)) or v is None else str(v)
            for k, v in model_info["default_params"].items()
        }

        return ExperimentTuneResponse(
            experiment_id=experiment_id,
            model_id=model_id,
            original_parameters=clean_orig_params,
            best_parameters=clean_best_params,
            before_metrics=before_metrics,
            after_metrics=after_metrics,
            improvement_summary=summary,
            meaningful_improvement=is_meaningful,
            warnings=warnings,
        )


tuner = HyperparameterTuner()
