from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ModelInfo(BaseModel):
    id: str
    name: str
    category: str  # regression, classification, unsupervised
    task_type: str
    short_description: str
    training_supported: bool
    default_hyperparameters: Dict[str, Any] = Field(default_factory=dict)


class ModelListResponse(BaseModel):
    total: int
    models: List[ModelInfo]


class ModelRecommendationRequest(BaseModel):
    task_type: str  # classification, regression
    dataset_id: Optional[str] = None
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    priority: Optional[str] = "performance"  # performance, speed, interpretability, balanced


class ModelRecommendationItem(BaseModel):
    model_id: str
    model_name: str
    category: str
    suitability_score: float  # 0 to 1
    reasoning: str
    pros_for_dataset: List[str]
    cons_for_dataset: List[str]


class ModelRecommendationResponse(BaseModel):
    task_type: str
    priority: str
    recommended_models: List[ModelRecommendationItem]
    general_guidance: str
