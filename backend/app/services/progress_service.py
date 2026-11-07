from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.repositories.progress_repo import progress_repo
from app.schemas.progress import (
    LearnerProgressResponse,
    LessonCompleteResponse,
    LessonProgressItem,
)
from app.services.learning_service import learning_service


class ProgressService:
    def get_progress(
        self, db: Session, session_id: str = "default_learner"
    ) -> LearnerProgressResponse:
        records = progress_repo.get_progress(db, session_id=session_id)
        completed_ids = [r.lesson_id for r in records if r.completed]
        recent = [
            LessonProgressItem(
                lesson_id=r.lesson_id,
                completed=r.completed,
                completed_at=r.completed_at.isoformat(),
            )
            for r in records[:10]
        ]
        return LearnerProgressResponse(
            session_id=session_id,
            completed_lessons=completed_ids,
            total_completed=len(completed_ids),
            recent_lessons=recent,
        )

    def complete_lesson(
        self, db: Session, lesson_id: str, session_id: str = "default_learner"
    ) -> LessonCompleteResponse:
        # Validate that lesson exists
        learning_service.get_lesson(lesson_id)
        progress = progress_repo.mark_lesson_complete(
            db, lesson_id=lesson_id, session_id=session_id
        )
        return LessonCompleteResponse(
            session_id=progress.session_id,
            lesson_id=progress.lesson_id,
            completed=progress.completed,
            message=f"Lesson '{lesson_id}' marked as completed.",
        )


progress_service = ProgressService()
