import json
import uuid
from typing import Any, Dict, List, Optional
import pandas as pd
from sqlalchemy.orm import Session

from app.core.errors import BadRequestException, NotFoundException
from app.database.models import ExperimentModel, ModelResultModel
from app.database.repositories.experiment_repo import experiment_repo
from app.ml.comparator import comparator
from app.ml.preprocessing import prepare_and_split_data
from app.ml.trainer import trainer
from app.ml.tuner import tuner
from app.schemas.experiment import (
    ExperimentCreateRequest,
    ExperimentResponse,
    ExperimentSummary,
    ExperimentTuneRequest,
    ExperimentTuneResponse,
    ModelComparisonSummary,
    ModelEvaluationResult,
)
from app.services.dataset_service import dataset_service


class ExperimentService:
    def run_experiment(
        self, db: Session, payload: ExperimentCreateRequest
    ) -> ExperimentResponse:
        dataset = dataset_service.get_dataset(db, payload.dataset_id)
        df = dataset_service.load_dataframe(dataset)

        task_type = payload.task_type or dataset.detected_task
        if not task_type:
            # Auto-infer
            if pd.api.types.is_numeric_dtype(df[payload.target_column]) and df[payload.target_column].nunique() > 20:
                task_type = "regression"
            else:
                task_type = "classification"

        experiment_id = str(uuid.uuid4())

        # 1. Create initial experiment record
        exp_model = ExperimentModel(
            id=experiment_id,
            dataset_id=dataset.id,
            target_column=payload.target_column,
            task_type=task_type,
            test_size=payload.test_size,
            random_state=payload.random_state,
            priority=payload.priority,
            status="running",
        )
        experiment_repo.create(db, exp_model)

        # 2. Train and evaluate requested models
        results, warnings, _ = trainer.train_and_evaluate_models(
            df=df,
            target_column=payload.target_column,
            task_type=task_type,
            model_ids=payload.model_ids,
            test_size=payload.test_size,
            random_state=payload.random_state,
            custom_hyperparameters=payload.hyperparameters,
        )

        # 3. Model comparison & recommendation
        comparison = comparator.compare_and_rank(
            results=results,
            task_type=task_type,
            priority=payload.priority,
        )

        # 4. Save results to database
        for r in results:
            mr = ModelResultModel(
                experiment_id=experiment_id,
                model_id=r.model_id,
                model_name=r.model_name,
                category=r.category,
                hyperparameters_json=json.dumps(r.hyperparameters),
                metrics_json=json.dumps(r.metrics),
                training_duration_seconds=r.training_duration_seconds,
                cv_scores_json=json.dumps(r.cv_scores) if r.cv_scores else None,
                train_metric=r.train_metric,
                test_metric=r.test_metric,
                status=r.status,
                error_message=r.error_message,
            )
            experiment_repo.add_model_result(db, mr)

        # Update experiment record
        exp_model.status = "completed"
        exp_model.recommendation_json = json.dumps(comparison.model_dump())
        experiment_repo.update(db, exp_model)

        return ExperimentResponse(
            experiment_id=exp_model.id,
            dataset_id=exp_model.dataset_id,
            target_column=exp_model.target_column,
            task_type=exp_model.task_type,
            test_size=exp_model.test_size,
            random_state=exp_model.random_state,
            status=exp_model.status,
            priority=exp_model.priority,
            results=results,
            comparison=comparison,
            warnings=warnings,
            created_at=exp_model.created_at.isoformat(),
        )

    def get_experiment(self, db: Session, experiment_id: str) -> ExperimentResponse:
        exp = experiment_repo.get_by_id(db, experiment_id)
        if not exp:
            raise NotFoundException(
                f"Experiment with ID '{experiment_id}' was not found.",
                code="EXPERIMENT_NOT_FOUND",
            )

        results = []
        for mr in exp.model_results:
            results.append(
                ModelEvaluationResult(
                    model_id=mr.model_id,
                    model_name=mr.model_name,
                    category=mr.category,
                    hyperparameters=json.loads(mr.hyperparameters_json or "{}"),
                    metrics=json.loads(mr.metrics_json or "{}"),
                    training_duration_seconds=mr.training_duration_seconds,
                    train_metric=mr.train_metric,
                    test_metric=mr.test_metric,
                    cv_scores=json.loads(mr.cv_scores_json) if mr.cv_scores_json else None,
                    status=mr.status,
                    error_message=mr.error_message,
                    is_tuned=mr.is_tuned,
                    tuning_comparison=json.loads(mr.tuning_comparison_json)
                    if mr.tuning_comparison_json
                    else None,
                )
            )

        comparison = None
        if exp.recommendation_json:
            comparison = ModelComparisonSummary(**json.loads(exp.recommendation_json))

        return ExperimentResponse(
            experiment_id=exp.id,
            dataset_id=exp.dataset_id,
            target_column=exp.target_column,
            task_type=exp.task_type,
            test_size=exp.test_size,
            random_state=exp.random_state,
            status=exp.status,
            priority=exp.priority or "performance",
            results=results,
            comparison=comparison,
            warnings=[],
            created_at=exp.created_at.isoformat(),
        )

    def list_experiments(
        self, db: Session, skip: int = 0, limit: int = 50
    ) -> List[ExperimentSummary]:
        records = experiment_repo.list_all(db, skip=skip, limit=limit)
        items = []
        for r in records:
            best = None
            if r.recommendation_json:
                try:
                    best = json.loads(r.recommendation_json).get("best_model_name")
                except Exception:
                    pass
            items.append(
                ExperimentSummary(
                    id=r.id,
                    dataset_id=r.dataset_id,
                    target_column=r.target_column,
                    task_type=r.task_type,
                    status=r.status,
                    model_count=len(r.model_results),
                    best_model=best,
                    created_at=r.created_at.isoformat(),
                )
            )
        return items

    def get_report(self, db: Session, experiment_id: str) -> Dict[str, Any]:
        exp_res = self.get_experiment(db, experiment_id)
        return {
            "experiment_id": exp_res.experiment_id,
            "dataset_id": exp_res.dataset_id,
            "target_column": exp_res.target_column,
            "task_type": exp_res.task_type,
            "status": exp_res.status,
            "model_comparison": exp_res.comparison.model_dump()
            if exp_res.comparison
            else None,
            "models_evaluated": len(exp_res.results),
            "results_breakdown": [r.model_dump() for r in exp_res.results],
            "created_at": exp_res.created_at,
        }

    def tune_experiment_model(
        self, db: Session, experiment_id: str, payload: ExperimentTuneRequest
    ) -> ExperimentTuneResponse:
        exp = experiment_repo.get_by_id(db, experiment_id)
        if not exp:
            raise NotFoundException(
                f"Experiment '{experiment_id}' was not found.", code="EXPERIMENT_NOT_FOUND"
            )

        dataset = dataset_service.get_dataset(db, exp.dataset_id)
        df = dataset_service.load_dataframe(dataset)

        # Prepare exact split used in experiment
        prep_result = prepare_and_split_data(
            df=df,
            target_column=exp.target_column,
            task_type=exp.task_type,
            test_size=exp.test_size,
            random_state=exp.random_state,
        )

        tune_res = tuner.tune_model(
            experiment_id=experiment_id,
            model_id=payload.model_id,
            prep_result=prep_result,
            task_type=exp.task_type,
            param_grid=payload.param_grid,
            cv_folds=payload.cv_folds,
        )

        # Update model result record if exists
        mr = experiment_repo.get_model_result(db, experiment_id, payload.model_id)
        if mr:
            mr.is_tuned = True
            mr.hyperparameters_json = json.dumps(tune_res.best_parameters)
            mr.metrics_json = json.dumps(tune_res.after_metrics)
            mr.tuning_comparison_json = json.dumps(tune_res.model_dump())
            experiment_repo.update_model_result(db, mr)

        return tune_res


experiment_service = ExperimentService()
