from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.experiment import (
    ExperimentCreateRequest,
    ExperimentListResponse,
    ExperimentResponse,
    ExperimentTuneRequest,
    ExperimentTuneResponse,
)
from app.services.experiment_service import experiment_service

router = APIRouter(prefix="/experiments", tags=["Experiments"])


@router.post(
    "",
    response_model=ExperimentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Train and compare multiple models on a dataset",
)
def create_experiment(
    payload: ExperimentCreateRequest,
    db: Session = Depends(get_db),
):
    return experiment_service.run_experiment(db, payload)


@router.get("", response_model=ExperimentListResponse, summary="List experiment history")
def list_experiments(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    s = skip if isinstance(skip, int) else 0
    l = limit if isinstance(limit, int) else 50
    items = experiment_service.list_experiments(db, skip=s, limit=l)
    return ExperimentListResponse(total=len(items), experiments=items)


@router.get(
    "/{experiment_id}",
    response_model=ExperimentResponse,
    summary="Get experiment status, models, metrics and comparison",
)
def get_experiment(experiment_id: str, db: Session = Depends(get_db)):
    return experiment_service.get_experiment(db, experiment_id)


@router.get(
    "/{experiment_id}/report",
    summary="Get complete evaluation and comparison report",
)
def get_experiment_report(experiment_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    return experiment_service.get_report(db, experiment_id)


@router.post(
    "/{experiment_id}/tune",
    response_model=ExperimentTuneResponse,
    summary="Tune hyperparameters for a model in an experiment",
)
def tune_model(
    experiment_id: str,
    payload: ExperimentTuneRequest,
    db: Session = Depends(get_db),
):
    return experiment_service.tune_experiment_model(db, experiment_id, payload)
