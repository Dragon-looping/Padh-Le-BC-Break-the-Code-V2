import math
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
)
from sklearn.model_selection import KFold, StratifiedKFold, cross_val_score


class Evaluator:
    @staticmethod
    def evaluate_classification(
        y_true_test: np.ndarray,
        y_pred_test: np.ndarray,
        y_true_train: Optional[np.ndarray] = None,
        y_pred_train: Optional[np.ndarray] = None,
        target_classes: Optional[List[str]] = None,
    ) -> Tuple[Dict[str, Any], Optional[float], Optional[float], Optional[str]]:
        acc = float(accuracy_score(y_true_test, y_pred_test))
        prec_macro = float(
            precision_score(y_true_test, y_pred_test, average="macro", zero_division=0)
        )
        rec_macro = float(
            recall_score(y_true_test, y_pred_test, average="macro", zero_division=0)
        )
        f1_macro = float(
            f1_score(y_true_test, y_pred_test, average="macro", zero_division=0)
        )
        f1_weighted = float(
            f1_score(y_true_test, y_pred_test, average="weighted", zero_division=0)
        )

        cm = confusion_matrix(y_true_test, y_pred_test).tolist()

        try:
            target_names = (
                target_classes
                if target_classes and len(target_classes) == len(cm)
                else None
            )
            report = classification_report(
                y_true_test,
                y_pred_test,
                target_names=target_names,
                output_dict=True,
                zero_division=0,
            )
        except Exception:
            report = {}

        metrics: Dict[str, Any] = {
            "accuracy": round(acc, 4),
            "precision_macro": round(prec_macro, 4),
            "recall_macro": round(rec_macro, 4),
            "f1_macro": round(f1_macro, 4),
            "f1_weighted": round(f1_weighted, 4),
            "confusion_matrix": cm,
            "classes": target_classes
            or [str(i) for i in range(len(cm))],
            "classification_report": report,
        }

        train_metric = None
        test_metric = acc
        overfitting_warning = None

        if y_true_train is not None and y_pred_train is not None:
            train_acc = float(accuracy_score(y_true_train, y_pred_train))
            train_metric = round(train_acc, 4)
            gap = train_acc - acc
            if gap > 0.15:
                overfitting_warning = (
                    f"Overfitting detected: Training accuracy ({train_acc:.1%}) is significantly higher "
                    f"than test accuracy ({acc:.1%}), showing a generalization gap of {gap:.1%}."
                )

        return metrics, train_metric, test_metric, overfitting_warning

    @staticmethod
    def evaluate_regression(
        y_true_test: np.ndarray,
        y_pred_test: np.ndarray,
        y_true_train: Optional[np.ndarray] = None,
        y_pred_train: Optional[np.ndarray] = None,
    ) -> Tuple[Dict[str, Any], Optional[float], Optional[float], Optional[str]]:
        mae = float(mean_absolute_error(y_true_test, y_pred_test))
        mse = float(mean_squared_error(y_true_test, y_pred_test))
        rmse = float(math.sqrt(mse))
        r2 = float(r2_score(y_true_test, y_pred_test))

        metrics: Dict[str, Any] = {
            "mae": round(mae, 4),
            "mse": round(mse, 4),
            "rmse": round(rmse, 4),
            "r2": round(r2, 4),
        }

        train_metric = None
        test_metric = round(r2, 4)
        overfitting_warning = None

        if y_true_train is not None and y_pred_train is not None:
            train_r2 = float(r2_score(y_true_train, y_pred_train))
            train_metric = round(train_r2, 4)
            gap = train_r2 - r2
            if gap > 0.20:
                overfitting_warning = (
                    f"High variance detected: Training R² ({train_r2:.2f}) exceeds test R² ({r2:.2f}) "
                    f"by {gap:.2f}. The model may have memorized training noise."
                )

        return metrics, train_metric, test_metric, overfitting_warning

    @staticmethod
    def compute_cross_validation(
        estimator: Any,
        X: np.ndarray,
        y: np.ndarray,
        task_type: str,
        cv_folds: int = 3,
    ) -> Optional[Dict[str, Any]]:
        if len(y) < cv_folds * 3:
            return None

        scoring = "accuracy" if task_type == "classification" else "r2"

        try:
            cv = (
                StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
                if task_type == "classification"
                else KFold(n_splits=cv_folds, shuffle=True, random_state=42)
            )
            scores = cross_val_score(estimator, X, y, cv=cv, scoring=scoring)
            return {
                "metric": scoring,
                "folds": cv_folds,
                "mean": round(float(np.mean(scores)), 4),
                "std": round(float(np.std(scores)), 4),
                "fold_scores": [round(float(s), 4) for s in scores],
            }
        except Exception:
            return None


evaluator = Evaluator()
