from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ParameterSchema(BaseModel):
    name: str
    type: str  # int, float, str, bool
    default: Any
    description: str
    allowed_range: Optional[str] = None
    options: Optional[List[Any]] = None


class AlgorithmSummary(BaseModel):
    id: str
    name: str
    category: str  # regression, classification, unsupervised
    task_type: str  # regression, classification, clustering, dimensionality_reduction
    short_description: str
    curriculum_status: str  # in-syllabus, supplementary
    learning_content_status: str  # available, planned
    training_supported: bool


class AlgorithmDetail(BaseModel):
    id: str
    name: str
    category: str
    task_type: str
    short_description: str
    intuition: str
    mathematical_formula: Optional[str] = None
    step_by_step_working: List[str] = Field(default_factory=list)
    parameters: List[ParameterSchema] = Field(default_factory=list)
    advantages: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    use_cases: List[str] = Field(default_factory=list)
    when_to_use: List[str] = Field(default_factory=list)
    when_to_avoid: List[str] = Field(default_factory=list)
    python_snippet: str
    code_explanation: str
    curriculum_status: str
    learning_content_status: str
    training_supported: bool
    default_hyperparameters: Dict[str, Any] = Field(default_factory=dict)


class AlgorithmListResponse(BaseModel):
    total: int
    algorithms: List[AlgorithmSummary]
