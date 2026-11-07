import json
from pathlib import Path
from typing import Dict, List, Optional
from app.core.config import settings
from app.core.errors import NotFoundException
from app.schemas.concept import ConceptBase, ConceptSummary, ConceptListResponse
from app.schemas.lesson import LessonDetail, LessonSummary, ModuleLessons, LessonListResponse
from app.schemas.algorithm import AlgorithmDetail, AlgorithmSummary, AlgorithmListResponse


class LearningService:
    def __init__(self, content_dir: Optional[Path] = None):
        self.content_dir = content_dir or settings.CONTENT_DIR
        self._concepts: Dict[str, ConceptBase] = {}
        self._lessons: Dict[str, LessonDetail] = {}
        self._algorithms: Dict[str, AlgorithmDetail] = {}
        self._load_all_content()

    def _load_all_content(self) -> None:
        # 1. Load concepts
        foundations_file = self.content_dir / "foundations.json"
        if foundations_file.exists():
            with open(foundations_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data:
                    concept = ConceptBase(**item)
                    self._concepts[concept.id] = concept

        # 2. Load Unit Lessons (unit_1.json through unit_5.json)
        for unit_file in sorted(self.content_dir.glob("unit_*.json")):
            with open(unit_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data:
                    lesson = LessonDetail(**item)
                    self._lessons[lesson.id] = lesson

        # 3. Load Algorithms (regression.json, classification.json, unsupervised.json)
        for algo_file in ["regression.json", "classification.json", "unsupervised.json"]:
            path = self.content_dir / algo_file
            if path.exists():
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for item in data:
                        algo = AlgorithmDetail(**item)
                        self._algorithms[algo.id] = algo

    # Concepts
    def list_concepts(
        self, category: Optional[str] = None, level: Optional[str] = None
    ) -> ConceptListResponse:
        results: List[ConceptSummary] = []
        for c in self._concepts.values():
            if category and c.category.lower() != category.lower():
                continue
            if level and c.level.lower() != level.lower():
                continue
            results.append(
                ConceptSummary(
                    id=c.id,
                    title=c.title,
                    level=c.level,
                    category=c.category,
                    short_definition=c.short_definition,
                )
            )
        return ConceptListResponse(total=len(results), concepts=results)

    def get_concept(self, concept_id: str) -> ConceptBase:
        if concept_id not in self._concepts:
            raise NotFoundException(
                f"Concept with ID '{concept_id}' was not found.", code="CONCEPT_NOT_FOUND"
            )
        return self._concepts[concept_id]

    # Lessons
    def list_lessons(self, unit: Optional[str] = None) -> LessonListResponse:
        units_dict: Dict[str, Dict[str, List[LessonSummary]]] = {}

        for l in sorted(self._lessons.values(), key=lambda x: (x.unit, x.order)):
            if unit and l.unit.lower() != unit.lower():
                continue
            if l.unit not in units_dict:
                units_dict[l.unit] = {"module_title": l.module, "lessons": []}
            units_dict[l.unit]["lessons"].append(
                LessonSummary(
                    id=l.id,
                    unit=l.unit,
                    module=l.module,
                    title=l.title,
                    order=l.order,
                    level=l.level,
                    estimated_minutes=l.estimated_minutes,
                )
            )

        module_list = [
            ModuleLessons(
                unit=u_name,
                module_title=u_data["module_title"],
                lessons=u_data["lessons"],
            )
            for u_name, u_data in units_dict.items()
        ]

        total_count = sum(len(m.lessons) for m in module_list)
        return LessonListResponse(total_lessons=total_count, units=module_list)

    def get_lesson(self, lesson_id: str) -> LessonDetail:
        if lesson_id not in self._lessons:
            raise NotFoundException(
                f"Lesson with ID '{lesson_id}' was not found.", code="LESSON_NOT_FOUND"
            )
        return self._lessons[lesson_id]

    # Algorithms
    def list_algorithms(
        self,
        category: Optional[str] = None,
        task_type: Optional[str] = None,
        trainable_only: bool = False,
    ) -> AlgorithmListResponse:
        results: List[AlgorithmSummary] = []
        for a in self._algorithms.values():
            if category and a.category.lower() != category.lower():
                continue
            if task_type and a.task_type.lower() != task_type.lower():
                continue
            if trainable_only and not a.training_supported:
                continue
            results.append(
                AlgorithmSummary(
                    id=a.id,
                    name=a.name,
                    category=a.category,
                    task_type=a.task_type,
                    short_description=a.short_description,
                    curriculum_status=a.curriculum_status,
                    learning_content_status=a.learning_content_status,
                    training_supported=a.training_supported,
                )
            )
        return AlgorithmListResponse(total=len(results), algorithms=results)

    def get_algorithm(self, algorithm_id: str) -> AlgorithmDetail:
        if algorithm_id not in self._algorithms:
            raise NotFoundException(
                f"Algorithm with ID '{algorithm_id}' was not found.", code="ALGORITHM_NOT_FOUND"
            )
        return self._algorithms[algorithm_id]


learning_service = LearningService()
