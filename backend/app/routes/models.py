from typing import Optional
from fastapi import APIRouter
from app.ml.recommender import recommender
from app.ml.registry import get_trainable_models
from app.schemas.model import (
    ModelInfo,
    ModelListResponse,
    ModelRecommendationRequest,
    ModelRecommendationResponse,
)

router = APIRouter(prefix="/models", tags=["Models"])


@router.get("", response_model=ModelListResponse, summary="List trainable models")
def list_trainable_models(
    task_type: Optional[str] = None,
):
    tt = task_type if isinstance(task_type, str) else None
    models = get_trainable_models(task_type=tt)
    return ModelListResponse(total=len(models), models=[ModelInfo(**m) for m in models])


@router.post("/recommend", response_model=ModelRecommendationResponse, summary="Recommend candidate models")
def recommend_models(payload: ModelRecommendationRequest):
    return recommender.recommend_candidates(
        task_type=payload.task_type,
        row_count=payload.row_count,
        column_count=payload.column_count,
        priority=payload.priority or "performance",
    )
