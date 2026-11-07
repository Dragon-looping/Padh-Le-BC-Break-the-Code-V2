from typing import Optional
from fastapi import APIRouter
from app.schemas.algorithm import AlgorithmDetail, AlgorithmListResponse
from app.services.learning_service import learning_service

router = APIRouter(prefix="/algorithms", tags=["Algorithms"])


@router.get("", response_model=AlgorithmListResponse)
def list_algorithms(
    category: Optional[str] = None,
    task_type: Optional[str] = None,
    trainable_only: bool = False,
):
    cat = category if isinstance(category, str) else None
    tt = task_type if isinstance(task_type, str) else None
    to = bool(trainable_only) if not hasattr(trainable_only, "default") else False
    return learning_service.list_algorithms(
        category=cat, task_type=tt, trainable_only=to
    )


@router.get("/{algorithm_id}", response_model=AlgorithmDetail)
def get_algorithm(algorithm_id: str):
    return learning_service.get_algorithm(algorithm_id)
