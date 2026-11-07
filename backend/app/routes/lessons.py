from typing import Optional
from fastapi import APIRouter
from app.schemas.lesson import LessonDetail, LessonListResponse
from app.services.learning_service import learning_service

router = APIRouter(prefix="/lessons", tags=["Lessons"])


@router.get("", response_model=LessonListResponse)
def list_lessons(
    unit: Optional[str] = None,
):
    u = unit if isinstance(unit, str) else None
    return learning_service.list_lessons(unit=u)


@router.get("/{lesson_id}", response_model=LessonDetail)
def get_lesson(lesson_id: str):
    return learning_service.get_lesson(lesson_id)
