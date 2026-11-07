from fastapi import APIRouter

from app.routes.algorithms import router as algorithms_router
from app.routes.concepts import router as concepts_router
from app.routes.datasets import router as datasets_router
from app.routes.experiments import router as experiments_router
from app.routes.health import router as health_router
from app.routes.lessons import router as lessons_router
from app.routes.models import router as models_router
from app.routes.progress import router as progress_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(concepts_router)
api_router.include_router(lessons_router)
api_router.include_router(algorithms_router)
api_router.include_router(datasets_router)
api_router.include_router(models_router)
api_router.include_router(experiments_router)
api_router.include_router(progress_router)
