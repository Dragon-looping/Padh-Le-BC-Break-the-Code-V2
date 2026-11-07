import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from app.database.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class DatasetModel(Base):
    __tablename__ = "datasets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False, unique=True)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False, default=0)
    row_count = Column(Integer, nullable=False, default=0)
    column_count = Column(Integer, nullable=False, default=0)
    target_column = Column(String(255), nullable=True)
    detected_task = Column(String(50), nullable=True)  # classification, regression, clustering
    status = Column(String(50), nullable=False, default="uploaded")  # uploaded, configured, error
    profile_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    experiments = relationship("ExperimentModel", back_populates="dataset", cascade="all, delete-orphan")


class ExperimentModel(Base):
    __tablename__ = "experiments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_id = Column(String(36), ForeignKey("datasets.id"), nullable=False)
    name = Column(String(255), nullable=True)
    target_column = Column(String(255), nullable=False)
    task_type = Column(String(50), nullable=False)  # classification or regression
    test_size = Column(Float, nullable=False, default=0.2)
    random_state = Column(Integer, nullable=False, default=42)
    priority = Column(String(50), nullable=True, default="performance")  # performance, speed, interpretability, balanced
    status = Column(String(50), nullable=False, default="pending")  # pending, running, completed, failed
    error_message = Column(Text, nullable=True)
    recommendation_json = Column(Text, nullable=True)
    report_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    dataset = relationship("DatasetModel", back_populates="experiments")
    model_results = relationship("ModelResultModel", back_populates="experiment", cascade="all, delete-orphan")


class ModelResultModel(Base):
    __tablename__ = "model_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False)
    model_id = Column(String(100), nullable=False)
    model_name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)  # classification or regression
    hyperparameters_json = Column(Text, nullable=False, default="{}")
    metrics_json = Column(Text, nullable=False, default="{}")
    training_duration_seconds = Column(Float, nullable=False, default=0.0)
    cv_scores_json = Column(Text, nullable=True)
    train_metric = Column(Float, nullable=True)
    test_metric = Column(Float, nullable=True)
    status = Column(String(50), nullable=False, default="completed")  # completed, failed
    error_message = Column(Text, nullable=True)
    is_tuned = Column(Boolean, nullable=False, default=False)
    tuning_comparison_json = Column(Text, nullable=True)
    artifact_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    experiment = relationship("ExperimentModel", back_populates="model_results")


class LearnerProgressModel(Base):
    __tablename__ = "learner_progress"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(100), nullable=False, default="default_learner")
    lesson_id = Column(String(100), nullable=False)
    completed = Column(Boolean, nullable=False, default=True)
    completed_at = Column(DateTime, default=utc_now, nullable=False)
