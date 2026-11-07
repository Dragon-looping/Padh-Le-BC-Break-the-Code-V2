from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.progress import (
    LearnerProgressResponse,
    LessonCompleteRequest,
    LessonCompleteResponse,
)
from app.services.progress_service import progress_service

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("", response_model=LearnerProgressResponse, summary="Get learner progress")
def get_learner_progress(
    session_id: str = "default_learner",
    db: Session = Depends(get_db),
):
    sid = session_id if isinstance(session_id, str) else "default_learner"
    return progress_service.get_progress(db, session_id=sid)


@router.post(
    "/lessons/{lesson_id}/complete",
    response_model=LessonCompleteResponse,
    status_code=status.HTTP_200_OK,
    summary="Mark a lesson as completed",
)
def mark_lesson_complete(
    lesson_id: str,
    payload: Optional[LessonCompleteRequest] = None,
    db: Session = Depends(get_db),
):
    sess_id = (
        payload.session_id
        if payload and payload.session_id and isinstance(payload.session_id, str)
        else "default_learner"
    )
    return progress_service.complete_lesson(db, lesson_id=lesson_id, session_id=sess_id)
