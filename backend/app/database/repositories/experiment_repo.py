from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.models import ExperimentModel, ModelResultModel


class ExperimentRepository:
    def create(self, db: Session, experiment: ExperimentModel) -> ExperimentModel:
        db.add(experiment)
        db.commit()
        db.refresh(experiment)
        return experiment

    def get_by_id(self, db: Session, experiment_id: str) -> Optional[ExperimentModel]:
        return (
            db.query(ExperimentModel)
            .filter(ExperimentModel.id == experiment_id)
            .first()
        )

    def list_all(
        self, db: Session, skip: int = 0, limit: int = 50
    ) -> List[ExperimentModel]:
        return (
            db.query(ExperimentModel)
            .order_by(ExperimentModel.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update(self, db: Session, experiment: ExperimentModel) -> ExperimentModel:
        db.commit()
        db.refresh(experiment)
        return experiment

    def add_model_result(
        self, db: Session, result: ModelResultModel
    ) -> ModelResultModel:
        db.add(result)
        db.commit()
        db.refresh(result)
        return result

    def get_model_result(
        self, db: Session, experiment_id: str, model_id: str
    ) -> Optional[ModelResultModel]:
        return (
            db.query(ModelResultModel)
            .filter(
                ModelResultModel.experiment_id == experiment_id,
                ModelResultModel.model_id == model_id,
            )
            .first()
        )

    def update_model_result(
        self, db: Session, result: ModelResultModel
    ) -> ModelResultModel:
        db.commit()
        db.refresh(result)
        return result


experiment_repo = ExperimentRepository()
