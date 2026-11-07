import os
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field

# Base directory for backend (where app/, datasets/, etc. reside)
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseModel):
    PROJECT_NAME: str = "PADH LE BC (Break the Code)"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "t")

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", f"sqlite:///{BACKEND_DIR / 'padh_le_bc.db'}"
    )

    # Directories
    BASE_DIR: Path = BACKEND_DIR
    UPLOAD_DIR: Path = BACKEND_DIR / "datasets" / "uploads"
    SAMPLE_DIR: Path = BACKEND_DIR / "datasets" / "samples"
    ARTIFACT_DIR: Path = BACKEND_DIR / "artifacts"
    CONTENT_DIR: Path = BACKEND_DIR / "app" / "learning" / "content"

    # Dataset upload constraints
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "15"))
    MAX_CSV_ROWS: int = int(os.getenv("MAX_CSV_ROWS", "100000"))
    MAX_CSV_COLUMNS: int = int(os.getenv("MAX_CSV_COLUMNS", "100"))

    # CORS
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
        ).split(",")
        if origin.strip()
    ]


settings = Settings()

# Ensure required local directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
settings.ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
settings.CONTENT_DIR.mkdir(parents=True, exist_ok=True)
