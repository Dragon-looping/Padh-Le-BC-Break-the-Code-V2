from typing import List, Optional
from pydantic import BaseModel, Field


class ConceptBase(BaseModel):
    id: str
    title: str
    level: str = "beginner"  # beginner, intermediate, advanced
    category: str = "foundations"  # foundations, data, model, evaluation
    short_definition: str
    simple_explanation: str
    real_world_example: str
    key_points: List[str] = Field(default_factory=list)
    common_mistakes: List[str] = Field(default_factory=list)
    related_concepts: List[str] = Field(default_factory=list)


class ConceptSummary(BaseModel):
    id: str
    title: str
    level: str
    category: str
    short_definition: str


class ConceptListResponse(BaseModel):
    total: int
    concepts: List[ConceptSummary]
