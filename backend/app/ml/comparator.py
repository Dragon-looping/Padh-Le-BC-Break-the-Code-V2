from typing import Any, Dict, List
from app.schemas.experiment import ModelComparisonSummary, ModelEvaluationResult, ModelRankingItem


class ModelComparator:
    def compare_and_rank(
        self,
        results: List[ModelEvaluationResult],
        task_type: str,
        priority: str = "performance",
    ) -> ModelComparisonSummary:
        completed = [r for r in results if r.status == "completed"]
        if not completed:
            # If all failed
            first = results[0]
            return ModelComparisonSummary(
                best_model_id=first.model_id,
                best_model_name=first.model_name,
                primary_metric_name="none",
                ranked_models=[],
                tradeoff_analysis="All model training runs encountered errors.",
                recommendation_reason="No models completed training successfully.",
            )

        if task_type == "classification":
            primary_metric_name = "f1_macro" if "f1_macro" in completed[0].metrics else "accuracy"
            # Sort function: higher is better
            def score_fn(res: ModelEvaluationResult) -> float:
                val = float(res.metrics.get(primary_metric_name, 0.0))
                if priority == "speed":
                    # Penalize slow models
                    val -= min(res.training_duration_seconds * 0.05, 0.2)
                elif priority == "interpretability":
                    if res.model_id in ("logistic_regression", "decision_tree_classifier"):
                        val += 0.05
                return val

            sorted_models = sorted(completed, key=score_fn, reverse=True)

        else:
            primary_metric_name = "r2"
            # Sort function: higher R² is better
            def score_fn_reg(res: ModelEvaluationResult) -> float:
                r2 = float(res.metrics.get("r2", -999.0))
                if priority == "speed":
                    r2 -= min(res.training_duration_seconds * 0.05, 0.2)
                elif priority == "interpretability":
                    if res.model_id in ("linear_regression", "decision_tree_regressor"):
                        r2 += 0.05
                return r2

            sorted_models = sorted(completed, key=score_fn_reg, reverse=True)

        best_model = sorted_models[0]
        ranked_items: List[ModelRankingItem] = []

        for rank, m in enumerate(sorted_models, start=1):
            val = float(m.metrics.get(primary_metric_name, 0.0))
            pros = []
            cons = []

            if m.training_duration_seconds < 0.1:
                pros.append("Extremely fast training time (<0.1s)")
            elif m.training_duration_seconds > 2.0:
                cons.append(f"Slower training duration ({m.training_duration_seconds:.2f}s)")

            if m.overfitting_warning:
                cons.append("Evidence of overfitting between training and test sets")
            else:
                pros.append("Good generalization gap between train and test splits")

            if m.model_id in ("linear_regression", "logistic_regression"):
                pros.append("Coefficients provide direct white-box interpretability")
            elif m.model_id in ("random_forest_classifier", "random_forest_regressor"):
                pros.append("Ensemble averaging provides high predictive robustness")
            elif m.model_id in ("gradient_boosting_classifier", "gradient_boosting_regressor"):
                pros.append("Iterative boosting captures subtle non-linear interactions")

            ranked_items.append(
                ModelRankingItem(
                    rank=rank,
                    model_id=m.model_id,
                    model_name=m.model_name,
                    primary_metric_value=round(val, 4),
                    training_duration_seconds=m.training_duration_seconds,
                    pros=pros,
                    cons=cons,
                )
            )

        # Build trade-off narrative
        best_val = best_model.metrics.get(primary_metric_name, 0.0)
        fastest = min(completed, key=lambda x: x.training_duration_seconds)

        tradeoff = (
            f"Evaluated {len(completed)} compatible models on identical train/test splits. "
            f"The best performing model is '{best_model.model_name}' with a {primary_metric_name} score of {best_val}. "
            f"The fastest model to train was '{fastest.model_name}' taking {fastest.training_duration_seconds:.3f} seconds."
        )

        reason = (
            f"Recommended based on user priority '{priority}'. '{best_model.model_name}' delivered "
            f"the highest overall balance of predictive accuracy ({primary_metric_name} = {best_val}) "
            f"and reliable generalization on the test partition."
        )

        return ModelComparisonSummary(
            best_model_id=best_model.model_id,
            best_model_name=best_model.model_name,
            primary_metric_name=primary_metric_name,
            ranked_models=ranked_items,
            tradeoff_analysis=tradeoff,
            recommendation_reason=reason,
        )


comparator = ModelComparator()
