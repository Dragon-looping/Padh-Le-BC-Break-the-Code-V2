from typing import Optional
from fastapi import APIRouter
from app.schemas.concept import ConceptBase, ConceptListResponse
from app.services.learning_service import learning_service

router = APIRouter(prefix="/concepts", tags=["Concepts"])


@router.get("", response_model=ConceptListResponse)
def list_concepts(
    category: Optional[str] = None,
    level: Optional[str] = None,
):
    cat = category if isinstance(category, str) else None
    lvl = level if isinstance(level, str) else None
    return learning_service.list_concepts(category=cat, level=lvl)


@router.get("/{concept_id}", response_model=ConceptBase)
def get_concept(concept_id: str):
    return learning_service.get_concept(concept_id)
