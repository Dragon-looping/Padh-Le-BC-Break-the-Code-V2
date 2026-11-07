from typing import Optional
from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.dataset import (
    DatasetConfigureRequest,
    DatasetConfigureResponse,
    DatasetListResponse,
    DatasetProfileResponse,
    DatasetSummary,
    DatasetUploadResponse,
)
from app.services.dataset_service import dataset_service

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.post(
    "/upload",
    response_model=DatasetUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a CSV dataset",
)
def upload_dataset(
    file: UploadFile = File(..., description="CSV file to upload"),
    db: Session = Depends(get_db),
):
    return dataset_service.save_upload(db, file)


@router.get("", response_model=DatasetListResponse, summary="List uploaded datasets")
def list_datasets(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    s = skip if isinstance(skip, int) else 0
    l = limit if isinstance(limit, int) else 50
    items = dataset_service.list_datasets(db, skip=s, limit=l)
    return DatasetListResponse(total=len(items), datasets=items)


@router.get("/{dataset_id}", response_model=DatasetSummary, summary="Get dataset metadata")
def get_dataset_metadata(dataset_id: str, db: Session = Depends(get_db)):
    d = dataset_service.get_dataset(db, dataset_id)
    return DatasetSummary(
        id=d.id,
        original_filename=d.original_filename,
        file_size_bytes=d.file_size_bytes,
        row_count=d.row_count,
        column_count=d.column_count,
        target_column=d.target_column,
        detected_task=d.detected_task,
        status=d.status,
        created_at=d.created_at.isoformat(),
    )


@router.get(
    "/{dataset_id}/profile",
    response_model=DatasetProfileResponse,
    summary="Inspect dataset profile and statistics",
)
def get_dataset_profile(dataset_id: str, db: Session = Depends(get_db)):
    return dataset_service.get_profile(db, dataset_id)


@router.post(
    "/{dataset_id}/configure",
    response_model=DatasetConfigureResponse,
    summary="Select target column and confirm task type",
)
def configure_dataset_target(
    dataset_id: str,
    payload: DatasetConfigureRequest,
    db: Session = Depends(get_db),
):
    return dataset_service.configure_target(
        db,
        dataset_id=dataset_id,
        target_column=payload.target_column,
        task_type=payload.task_type,
    )
