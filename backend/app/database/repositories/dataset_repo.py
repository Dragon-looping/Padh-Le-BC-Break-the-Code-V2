from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.models import DatasetModel


class DatasetRepository:
    def create(self, db: Session, dataset: DatasetModel) -> DatasetModel:
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        return dataset

    def get_by_id(self, db: Session, dataset_id: str) -> Optional[DatasetModel]:
        return db.query(DatasetModel).filter(DatasetModel.id == dataset_id).first()

    def list_all(self, db: Session, skip: int = 0, limit: int = 50) -> List[DatasetModel]:
        return (
            db.query(DatasetModel)
            .order_by(DatasetModel.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_all(self, db: Session) -> int:
        return db.query(DatasetModel).count()

    def update(self, db: Session, dataset: DatasetModel) -> DatasetModel:
        db.commit()
        db.refresh(dataset)
        return dataset

    def delete(self, db: Session, dataset: DatasetModel) -> None:
        db.delete(dataset)
        db.commit()


dataset_repo = DatasetRepository()
