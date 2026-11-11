from typing import Any, Dict, Optional
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AppException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class NotFoundException(AppException):
    def __init__(self, message: str, code: str = "RESOURCE_NOT_FOUND"):
        super().__init__(
            code=code,
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
        )


class BadRequestException(AppException):
    def __init__(self, message: str, code: str = "BAD_REQUEST"):
        super().__init__(
            code=code,
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
        )


class FileTooLargeException(AppException):
    def __init__(self, message: str = "The uploaded file exceeds the maximum allowed size."):
        super().__init__(
            code="FILE_TOO_LARGE",
            message=message,
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
        )


class InvalidDatasetException(AppException):
    def __init__(self, message: str, code: str = "INVALID_DATASET"):
        super().__init__(
            code=code,
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        )


class InvalidTargetColumnException(AppException):
    def __init__(self, message: str = "The selected target column does not exist in this dataset."):
        super().__init__(
            code="INVALID_TARGET_COLUMN",
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
        )


class ModelTrainingException(AppException):
    def __init__(self, message: str, code: str = "MODEL_TRAINING_FAILED"):
        super().__init__(
            code=code,
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
        )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    content: Dict[str, Any] = {
        "error": {
            "code": exc.code,
            "message": exc.message,
        }
    }
    if exc.details:
        content["error"]["details"] = exc.details
    return JSONResponse(status_code=exc.status_code, content=content)


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    details = []
    for err in exc.errors():
        loc = " -> ".join([str(x) for x in err.get("loc", []) if x != "body"])
        msg = err.get("msg", "Validation error")
        details.append(f"{loc}: {msg}" if loc else msg)

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "; ".join(details) if details else "Invalid request data",
                "details": exc.errors(),
            }
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": str(exc) if exc else "An unexpected error occurred.",
            }
        },
    )
