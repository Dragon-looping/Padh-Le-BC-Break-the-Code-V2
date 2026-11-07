from typing import Any, Dict, List, Optional
from sklearn.linear_model import LinearRegression, Ridge, Lasso, LogisticRegression
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.ensemble import (
    RandomForestRegressor,
    RandomForestClassifier,
    GradientBoostingRegressor,
    GradientBoostingClassifier,
)
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC

from app.core.errors import BadRequestException


# Catalog of trainable estimators and default parameters
TRAINABLE_MODELS: Dict[str, Dict[str, Any]] = {
    # --- REGRESSION MODELS ---
    "linear_regression": {
        "name": "Linear Regression",
        "category": "regression",
        "task_type": "regression",
        "estimator_class": LinearRegression,
        "default_params": {"fit_intercept": True},
        "param_grid": {
            "fit_intercept": [True, False],
        },
        "description": "Ordinary Least Squares Linear Regression.",
    },
    "ridge_regression": {
        "name": "Ridge Regression",
        "category": "regression",
        "task_type": "regression",
        "estimator_class": Ridge,
        "default_params": {"alpha": 1.0},
        "param_grid": {
            "alpha": [0.01, 0.1, 1.0, 10.0, 100.0],
        },
        "description": "Linear least squares with L2 regularization.",
    },
    "lasso_regression": {
        "name": "Lasso Regression",
        "category": "regression",
        "task_type": "regression",
        "estimator_class": Lasso,
        "default_params": {"alpha": 0.1},
        "param_grid": {
            "alpha": [0.01, 0.05, 0.1, 0.5, 1.0],
        },
        "description": "Linear model with L1 regularization producing sparse coefficients.",
    },
    "decision_tree_regressor": {
        "name": "Decision Tree Regressor",
        "category": "regression",
        "task_type": "regression",
        "estimator_class": DecisionTreeRegressor,
        "default_params": {"max_depth": 5, "min_samples_split": 2, "random_state": 42},
        "param_grid": {
            "max_depth": [3, 5, 8, 12, None],
            "min_samples_split": [2, 5, 10],
        },
        "description": "Non-linear decision tree regressor.",
    },
    "random_forest_regressor": {
        "name": "Random Forest Regressor",
        "category": "regression",
        "task_type": "regression",
        "estimator_class": RandomForestRegressor,
        "default_params": {"n_estimators": 50, "max_depth": 8, "random_state": 42},
        "param_grid": {
            "n_estimators": [25, 50, 100],
            "max_depth": [4, 8, 12, None],
        },
        "description": "Ensemble of decision trees trained on bootstrap samples.",
    },
    "gradient_boosting_regressor": {
        "name": "Gradient Boosting Regressor",
        "category": "regression",
        "task_type": "regression",
        "estimator_class": GradientBoostingRegressor,
        "default_params": {
            "n_estimators": 50,
            "learning_rate": 0.1,
            "max_depth": 3,
            "random_state": 42,
        },
        "param_grid": {
            "n_estimators": [30, 50, 100],
            "learning_rate": [0.01, 0.05, 0.1, 0.2],
            "max_depth": [2, 3, 5],
        },
        "description": "Additive ensemble of trees minimizing squared error loss.",
    },
    # --- CLASSIFICATION MODELS ---
    "logistic_regression": {
        "name": "Logistic Regression",
        "category": "classification",
        "task_type": "classification",
        "estimator_class": LogisticRegression,
        "default_params": {"C": 1.0, "max_iter": 300, "random_state": 42},
        "param_grid": {
            "C": [0.01, 0.1, 1.0, 10.0, 100.0],
        },
        "description": "Regularized logistic regression classifier with calibrated probabilities.",
    },
    "knn_classifier": {
        "name": "K-Nearest Neighbors Classifier",
        "category": "classification",
        "task_type": "classification",
        "estimator_class": KNeighborsClassifier,
        "default_params": {"n_neighbors": 5, "weights": "uniform"},
        "param_grid": {
            "n_neighbors": [3, 5, 7, 9, 11],
            "weights": ["uniform", "distance"],
        },
        "description": "Instance-based majority vote classification.",
    },
    "decision_tree_classifier": {
        "name": "Decision Tree Classifier",
        "category": "classification",
        "task_type": "classification",
        "estimator_class": DecisionTreeClassifier,
        "default_params": {"max_depth": 5, "min_samples_split": 2, "random_state": 42},
        "param_grid": {
            "max_depth": [3, 5, 8, 12, None],
            "min_samples_split": [2, 5, 10],
        },
        "description": "Recursive partitioning classifier using Gini impurity.",
    },
    "random_forest_classifier": {
        "name": "Random Forest Classifier",
        "category": "classification",
        "task_type": "classification",
        "estimator_class": RandomForestClassifier,
        "default_params": {"n_estimators": 50, "max_depth": 8, "random_state": 42},
        "param_grid": {
            "n_estimators": [25, 50, 100],
            "max_depth": [4, 8, 12, None],
        },
        "description": "Ensemble of diverse decision trees with majority voting.",
    },
    "naive_bayes": {
        "name": "Gaussian Naive Bayes",
        "category": "classification",
        "task_type": "classification",
        "estimator_class": GaussianNB,
        "default_params": {"var_smoothing": 1e-9},
        "param_grid": {
            "var_smoothing": [1e-11, 1e-9, 1e-7, 1e-5],
        },
        "description": "Probabilistic classifier applying Bayes rule with Gaussian feature density.",
    },
    "svm_classifier": {
        "name": "Support Vector Machine Classifier",
        "category": "classification",
        "task_type": "classification",
        "estimator_class": SVC,
        "default_params": {"C": 1.0, "kernel": "rbf", "probability": True, "random_state": 42},
        "param_grid": {
            "C": [0.1, 1.0, 10.0],
            "kernel": ["linear", "rbf"],
        },
        "description": "Maximum-margin hyperplane classifier.",
    },
    "gradient_boosting_classifier": {
        "name": "Gradient Boosting Classifier",
        "category": "classification",
        "task_type": "classification",
        "estimator_class": GradientBoostingClassifier,
        "default_params": {
            "n_estimators": 50,
            "learning_rate": 0.1,
            "max_depth": 3,
            "random_state": 42,
        },
        "param_grid": {
            "n_estimators": [30, 50, 100],
            "learning_rate": [0.01, 0.05, 0.1, 0.2],
            "max_depth": [2, 3, 5],
        },
        "description": "Sequential ensemble minimizing cross-entropy loss via gradient boosting.",
    },
}


def get_trainable_models(task_type: Optional[str] = None) -> List[Dict[str, Any]]:
    results = []
    for model_id, info in TRAINABLE_MODELS.items():
        if task_type and info["task_type"] != task_type:
            continue
        results.append(
            {
                "id": model_id,
                "name": info["name"],
                "category": info["category"],
                "task_type": info["task_type"],
                "short_description": info["description"],
                "training_supported": True,
                "default_hyperparameters": info["default_params"],
            }
        )
    return results


def is_trainable(model_id: str, task_type: Optional[str] = None) -> bool:
    if model_id not in TRAINABLE_MODELS:
        return False
    if task_type and TRAINABLE_MODELS[model_id]["task_type"] != task_type:
        return False
    return True


def get_estimator_instance(model_id: str, custom_params: Optional[Dict[str, Any]] = None):
    if model_id not in TRAINABLE_MODELS:
        raise BadRequestException(
            f"Algorithm '{model_id}' is not in the trainable registry.",
            code="UNSUPPORTED_ALGORITHM",
        )
    info = TRAINABLE_MODELS[model_id]
    params = info["default_params"].copy()
    if custom_params:
        params.update(custom_params)
    estimator_class = info["estimator_class"]
    return estimator_class(**params)
