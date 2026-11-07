from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class TermDefinition(BaseModel):
    term: str
    definition: str


class QuizOption(BaseModel):
    id: str
    text: str


class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[QuizOption]
    correct_option_id: str
    explanation: str


class LessonSummary(BaseModel):
    id: str
    unit: str
    module: str
    title: str
    order: int
    level: str
    estimated_minutes: int = 15


class LessonDetail(BaseModel):
    id: str
    unit: str
    module: str
    title: str
    order: int
    level: str
    estimated_minutes: int = 15
    learning_objectives: List[str] = Field(default_factory=list)
    explanation: str
    definitions: List[TermDefinition] = Field(default_factory=list)
    mathematical_explanation: Optional[str] = None
    real_world_example: str
    step_by_step_working: List[str] = Field(default_factory=list)
    python_code: str
    code_explanation: str
    advantages: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    common_mistakes: List[str] = Field(default_factory=list)
    related_concepts: List[str] = Field(default_factory=list)
    knowledge_check: List[QuizQuestion] = Field(default_factory=list)


class ModuleLessons(BaseModel):
    unit: str
    module_title: str
    lessons: List[LessonSummary]


class LessonListResponse(BaseModel):
    total_lessons: int
    units: List[ModuleLessons]
