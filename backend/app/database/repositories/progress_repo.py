from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.models import LearnerProgressModel


class ProgressRepository:
    def get_progress(
        self, db: Session, session_id: str = "default_learner"
    ) -> List[LearnerProgressModel]:
        return (
            db.query(LearnerProgressModel)
            .filter(LearnerProgressModel.session_id == session_id)
            .order_by(LearnerProgressModel.completed_at.desc())
            .all()
        )

    def mark_lesson_complete(
        self, db: Session, lesson_id: str, session_id: str = "default_learner"
    ) -> LearnerProgressModel:
        existing = (
            db.query(LearnerProgressModel)
            .filter(
                LearnerProgressModel.session_id == session_id,
                LearnerProgressModel.lesson_id == lesson_id,
            )
            .first()
        )
        if existing:
            return existing

        progress = LearnerProgressModel(
            session_id=session_id,
            lesson_id=lesson_id,
            completed=True,
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)
        return progress


progress_repo = ProgressRepository()
