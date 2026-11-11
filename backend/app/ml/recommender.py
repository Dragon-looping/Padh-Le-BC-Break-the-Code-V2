from typing import List, Optional
from app.ml.registry import TRAINABLE_MODELS
from app.schemas.model import (
    ModelRecommendationItem,
    ModelRecommendationResponse,
)


class ModelRecommender:
    def recommend_candidates(
        self,
        task_type: str,
        row_count: Optional[int] = None,
        column_count: Optional[int] = None,
        priority: str = "performance",
    ) -> ModelRecommendationResponse:
        rows = row_count or 500
        cols = column_count or 10
        priority = (priority or "performance").lower()

        items: List[ModelRecommendationItem] = []

        for mid, info in TRAINABLE_MODELS.items():
            if info["task_type"] != task_type:
                continue

            score = 0.70
            pros = []
            cons = []

            if task_type == "classification":
                if mid == "logistic_regression":
                    pros.append("Simple, transparent, and provides calibrated probabilities")
                    if priority in ("interpretability", "speed"):
                        score += 0.20
                    if rows < 1000:
                        pros.append("Well-suited for small-to-medium datasets")
                elif mid == "random_forest_classifier":
                    pros.append("Excellent robustness and captures non-linear feature interactions")
                    if priority == "performance":
                        score += 0.25
                    if cols > 15:
                        pros.append("Handles higher-dimensional tabular data well")
                elif mid == "gradient_boosting_classifier":
                    pros.append("Top-tier predictive power on structured tabular datasets")
                    if priority == "performance":
                        score += 0.22
                    cons.append("Requires slightly longer training time")
                elif mid == "knn_classifier":
                    pros.append("Intuitive instance-based learning without parametric assumptions")
                    if rows > 10000:
                        cons.append("Inference scales linearly with dataset size, leading to slower lookups")
                        score -= 0.15
                elif mid == "naive_bayes":
                    pros.append("Extremely fast baseline with low compute footprint")
                    if priority == "speed":
                        score += 0.25
                    cons.append("Assumes feature independence which may not hold in practice")
                elif mid == "decision_tree_classifier":
                    pros.append("Flowchart-style interpretability without feature scaling requirements")
                    if priority == "interpretability":
                        score += 0.25
                    cons.append("Prone to overfitting if tree depth is unconstrained")
                elif mid == "svm_classifier":
                    pros.append("Effective margin maximization in complex boundary spaces")
                    if rows > 20000:
                        cons.append("Quadratic training complexity on very large sample sizes")
                        score -= 0.20

            else:
                if mid == "linear_regression":
                    pros.append("Classic interpretable baseline with instant training")
                    if priority in ("interpretability", "speed"):
                        score += 0.20
                    cons.append("Assumes linear relationship between features and target")
                elif mid == "ridge_regression":
                    pros.append("Stabilizes coefficients and prevents multicollinearity issues")
                    if cols > 10:
                        score += 0.15
                        pros.append("Ideal when features are mutually correlated")
                elif mid == "lasso_regression":
                    pros.append("Performs automatic feature selection by zeroing out uninformative weights")
                    if cols > 15:
                        score += 0.18
                elif mid == "random_forest_regressor":
                    pros.append("High accuracy, robust to outliers, and models complex interactions")
                    if priority == "performance":
                        score += 0.25
                elif mid == "gradient_boosting_regressor":
                    pros.append("Sequential error correction yielding minimal RMSE")
                    if priority == "performance":
                        score += 0.22
                elif mid == "decision_tree_regressor":
                    pros.append("Clear if-else decision rules for non-linear regression")
                    if priority == "interpretability":
                        score += 0.20

            items.append(
                ModelRecommendationItem(
                    model_id=mid,
                    model_name=info["name"],
                    category=info["category"],
                    suitability_score=round(min(max(score, 0.1), 0.99), 2),
                    reasoning=f"Selected for {task_type} based on {priority} priority and dataset dimensions ({rows} rows, {cols} cols).",
                    pros_for_dataset=pros,
                    cons_for_dataset=cons,
                )
            )

        items.sort(key=lambda x: x.suitability_score, reverse=True)

        guidance = (
            f"For a {task_type} dataset with {rows} rows and {cols} columns, we recommend training "
            f"a diverse selection: a linear baseline, an interpretable decision tree, and an ensemble "
            f"such as Random Forest or Gradient Boosting to compare empirical trade-offs."
        )

        return ModelRecommendationResponse(
            task_type=task_type,
            priority=priority,
            recommended_models=items,
            general_guidance=guidance,
        )


recommender = ModelRecommender()
