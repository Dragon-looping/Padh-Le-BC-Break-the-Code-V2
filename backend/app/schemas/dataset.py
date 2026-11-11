from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ColumnProfile(BaseModel):
    name: str
    inferred_type: str  # numeric, categorical, datetime, text, boolean
    missing_count: int
    missing_percentage: float
    unique_count: int
    min: Optional[float] = None
    max: Optional[float] = None
    mean: Optional[float] = None
    std: Optional[float] = None
    median: Optional[float] = None
    top_categories: Optional[List[Dict[str, Any]]] = None
    sample_values: List[Any] = Field(default_factory=list)


class DatasetUploadResponse(BaseModel):
    dataset_id: str
    original_filename: str
    file_size_bytes: int
    status: str
    rows: int
    columns: int
    profile_url: str


class DatasetProfileResponse(BaseModel):
    dataset_id: str
    original_filename: str
    row_count: int
    column_count: int
    columns: List[str]
    column_profiles: List[ColumnProfile]
    duplicate_rows: int
    target_column: Optional[str] = None
    detected_task: Optional[str] = None  # classification, regression
    preview_rows: List[Dict[str, Any]]
    class_distribution: Optional[Dict[str, int]] = None
    warnings: List[str] = Field(default_factory=list)


class DatasetConfigureRequest(BaseModel):
    target_column: str
    task_type: Optional[str] = None  # classification or regression


class DatasetConfigureResponse(BaseModel):
    dataset_id: str
    target_column: str
    task_type: str
    compatible_models: List[str]
    warnings: List[str] = Field(default_factory=list)


class DatasetSummary(BaseModel):
    id: str
    original_filename: str
    file_size_bytes: int
    row_count: int
    column_count: int
    target_column: Optional[str] = None
    detected_task: Optional[str] = None
    status: str
    created_at: str


class DatasetListResponse(BaseModel):
    total: int
    datasets: List[DatasetSummary]


class SampleDatasetInfo(BaseModel):
    id: str
    display_name: str
    description: str
    filename: str
    row_count: int
    feature_count: int
    target_column: str
    task_type: str  # classification | regression
    difficulty: str  # Beginner | Intermediate
    available_algorithms: List[str]
    educational_objectives: List[str]
    disclaimer: Optional[str] = None


class SampleDatasetListResponse(BaseModel):
    total: int
    samples: List[SampleDatasetInfo]

