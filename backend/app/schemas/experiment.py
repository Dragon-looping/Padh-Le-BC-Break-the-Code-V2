from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ExperimentCreateRequest(BaseModel):
    dataset_id: str
    target_column: str
    task_type: Optional[str] = None  # classification or regression
    model_ids: List[str] = Field(..., min_length=1)
    test_size: float = Field(0.2, ge=0.05, le=0.5)
    random_state: int = Field(42, ge=0)
    priority: str = Field("performance")  # performance, speed, interpretability, balanced
    hyperparameters: Optional[Dict[str, Dict[str, Any]]] = None


class ModelEvaluationResult(BaseModel):
    model_id: str
    model_name: str
    category: str
    hyperparameters: Dict[str, Any]
    metrics: Dict[str, Any]
    training_duration_seconds: float
    train_metric: Optional[float] = None
    test_metric: Optional[float] = None
    overfitting_warning: Optional[str] = None
    cv_scores: Optional[Dict[str, Any]] = None
    status: str
    error_message: Optional[str] = None
    is_tuned: bool = False
    tuning_comparison: Optional[Dict[str, Any]] = None


class ModelRankingItem(BaseModel):
    rank: int
    model_id: str
    model_name: str
    primary_metric_value: float
    training_duration_seconds: float
    pros: List[str]
    cons: List[str]


class ModelComparisonSummary(BaseModel):
    best_model_id: str
    best_model_name: str
    primary_metric_name: str
    ranked_models: List[ModelRankingItem]
    tradeoff_analysis: str
    recommendation_reason: str


class ExperimentResponse(BaseModel):
    experiment_id: str
    dataset_id: str
    target_column: str
    task_type: str
    test_size: float
    random_state: int
    status: str
    priority: str
    results: List[ModelEvaluationResult]
    comparison: Optional[ModelComparisonSummary] = None
    warnings: List[str] = Field(default_factory=list)
    created_at: str


class ExperimentSummary(BaseModel):
    id: str
    dataset_id: str
    target_column: str
    task_type: str
    status: str
    model_count: int
    best_model: Optional[str] = None
    created_at: str


class ExperimentListResponse(BaseModel):
    total: int
    experiments: List[ExperimentSummary]


class ExperimentTuneRequest(BaseModel):
    model_id: str
    param_grid: Optional[Dict[str, List[Any]]] = None
    cv_folds: int = Field(3, ge=2, le=10)


class ExperimentTuneResponse(BaseModel):
    experiment_id: str
    model_id: str
    original_parameters: Dict[str, Any]
    best_parameters: Dict[str, Any]
    before_metrics: Dict[str, Any]
    after_metrics: Dict[str, Any]
    improvement_summary: str
    meaningful_improvement: bool
    warnings: List[str] = Field(default_factory=list)
