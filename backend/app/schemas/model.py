from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ModelInfo(BaseModel):
    id: str
    name: str
    category: str
    task_type: str
    short_description: str
    training_supported: bool
    default_hyperparameters: Dict[str, Any] = Field(default_factory=dict)


class ModelListResponse(BaseModel):
    total: int
    models: List[ModelInfo]


class ModelRecommendationRequest(BaseModel):
    task_type: str
    dataset_id: Optional[str] = None
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    priority: Optional[str] = "performance"


class ModelRecommendationItem(BaseModel):
    model_id: str
    model_name: str
    category: str
    suitability_score: float
    reasoning: str
    pros_for_dataset: List[str]
    cons_for_dataset: List[str]


class ModelRecommendationResponse(BaseModel):
    task_type: str
    priority: str
    recommended_models: List[ModelRecommendationItem]
    general_guidance: str
