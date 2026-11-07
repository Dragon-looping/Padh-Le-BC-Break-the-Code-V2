from typing import List, Optional
from pydantic import BaseModel, Field


class LessonProgressItem(BaseModel):
    lesson_id: str
    completed: bool
    completed_at: str


class LearnerProgressResponse(BaseModel):
    session_id: str
    completed_lessons: List[str] = Field(default_factory=list)
    total_completed: int
    recent_lessons: List[LessonProgressItem] = Field(default_factory=list)


class LessonCompleteRequest(BaseModel):
    session_id: Optional[str] = "default_learner"


class LessonCompleteResponse(BaseModel):
    session_id: str
    lesson_id: str
    completed: bool
    message: str
