import io
import re
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlparse
import pytest
from fastapi import UploadFile
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.errors import AppException
from app.database.database import Base
from app.main import root
from app.routes import (
    algorithms,
    concepts,
    datasets,
    experiments,
    health,
    lessons,
    models,
    progress,
)
from app.schemas.dataset import DatasetConfigureRequest
from app.schemas.experiment import ExperimentCreateRequest, ExperimentTuneRequest
from app.schemas.model import ModelRecommendationRequest
from app.schemas.progress import LessonCompleteRequest


class TestResponse:
    def __init__(self, status_code: int, data: any):
        self.status_code = status_code
        self._data = data

    def json(self):
        if hasattr(self._data, "model_dump"):
            return self._data.model_dump()
        return self._data


class LocalApiClient:
    def __init__(self, db):
        self.db = db

    def get(self, url: str):
        parsed = urlparse(url)
        path = parsed.path.rstrip("/")
        if not path:
            path = "/"
        params = {k: v[0] for k, v in parse_qs(parsed.query).items()}

        try:
            if path in ("", "/"):
                return TestResponse(200, root())
            if path == "/api/health":
                return TestResponse(200, health.health_check(self.db))
            if path == "/api/concepts":
                return TestResponse(
                    200,
                    concepts.list_concepts(
                        category=params.get("category"), level=params.get("level")
                    ),
                )
            if path.startswith("/api/concepts/"):
                cid = path.split("/api/concepts/")[1]
                return TestResponse(200, concepts.get_concept(cid))
            if path == "/api/lessons":
                return TestResponse(
                    200, lessons.list_lessons(unit=params.get("unit"))
                )
            if path.startswith("/api/lessons/"):
                lid = path.split("/api/lessons/")[1]
                return TestResponse(200, lessons.get_lesson(lid))
            if path == "/api/algorithms":
                trainable = params.get("trainable_only", "false").lower() == "true"
                return TestResponse(
                    200,
                    algorithms.list_algorithms(
                        category=params.get("category"),
                        task_type=params.get("task_type"),
                        trainable_only=trainable,
                    ),
                )
            if path.startswith("/api/algorithms/"):
                aid = path.split("/api/algorithms/")[1]
                return TestResponse(200, algorithms.get_algorithm(aid))
            if path == "/api/models":
                return TestResponse(
                    200, models.list_trainable_models(task_type=params.get("task_type"))
                )
            if path == "/api/datasets":
                return TestResponse(
                    200,
                    datasets.list_datasets(
                        skip=int(params.get("skip", 0)),
                        limit=int(params.get("limit", 50)),
                        db=self.db,
                    ),
                )
            m_prof = re.match(r"^/api/datasets/([^/]+)/profile$", path)
            if m_prof:
                return TestResponse(
                    200, datasets.get_dataset_profile(m_prof.group(1), db=self.db)
                )
            m_dmeta = re.match(r"^/api/datasets/([^/]+)$", path)
            if m_dmeta:
                return TestResponse(
                    200, datasets.get_dataset_metadata(m_dmeta.group(1), db=self.db)
                )
            if path == "/api/experiments":
                return TestResponse(
                    200,
                    experiments.list_experiments(
                        skip=int(params.get("skip", 0)),
                        limit=int(params.get("limit", 50)),
                        db=self.db,
                    ),
                )
            m_rep = re.match(r"^/api/experiments/([^/]+)/report$", path)
            if m_rep:
                return TestResponse(
                    200, experiments.get_experiment_report(m_rep.group(1), db=self.db)
                )
            m_exp = re.match(r"^/api/experiments/([^/]+)$", path)
            if m_exp:
                return TestResponse(
                    200, experiments.get_experiment(m_exp.group(1), db=self.db)
                )
            if path == "/api/progress":
                return TestResponse(
                    200,
                    progress.get_learner_progress(
                        session_id=params.get("session_id", "default_learner"),
                        db=self.db,
                    ),
                )

            return TestResponse(
                404, {"error": {"code": "NOT_FOUND", "message": f"Route not found: {path}"}}
            )

        except AppException as e:
            return TestResponse(
                e.status_code,
                {"error": {"code": e.code, "message": e.message, "details": e.details}},
            )
        except Exception as e:
            return TestResponse(
                500, {"error": {"code": "INTERNAL_SERVER_ERROR", "message": str(e)}}
            )

    def post(self, url: str, json: dict = None, files: dict = None):
        parsed = urlparse(url)
        path = parsed.path.rstrip("/")
        if not path:
            path = "/"
        params = {k: v[0] for k, v in parse_qs(parsed.query).items()}

        try:
            if path == "/api/datasets/upload":
                if not files or "file" not in files:
                    return TestResponse(
                        400,
                        {"error": {"code": "MISSING_FILE", "message": "File field is required."}},
                    )
                file_info = files["file"]
                # file_info is (filename, file_obj, content_type)
                if isinstance(file_info, tuple):
                    filename, fileobj, content_type = file_info
                else:
                    filename = getattr(file_info, "name", "upload.csv")
                    fileobj = file_info
                    content_type = "text/csv"

                if isinstance(fileobj, bytes):
                    fileobj = io.BytesIO(fileobj)

                up_file = UploadFile(filename=filename, file=fileobj)
                res = datasets.upload_dataset(up_file, db=self.db)
                return TestResponse(201, res)

            m_cfg = re.match(r"^/api/datasets/([^/]+)/configure$", path)
            if m_cfg:
                dataset_id = m_cfg.group(1)
                req = DatasetConfigureRequest(**(json or {}))
                res = datasets.configure_dataset_target(dataset_id, req, db=self.db)
                return TestResponse(200, res)

            if path == "/api/models/recommend":
                req = ModelRecommendationRequest(**(json or {}))
                res = models.recommend_models(req)
                return TestResponse(200, res)

            if path == "/api/experiments":
                req = ExperimentCreateRequest(**(json or {}))
                res = experiments.create_experiment(req, db=self.db)
                return TestResponse(201, res)

            m_tune = re.match(r"^/api/experiments/([^/]+)/tune$", path)
            if m_tune:
                exp_id = m_tune.group(1)
                req = ExperimentTuneRequest(**(json or {}))
                res = experiments.tune_model(exp_id, req, db=self.db)
                return TestResponse(200, res)

            m_comp = re.match(r"^/api/progress/lessons/([^/]+)/complete$", path)
            if m_comp:
                lesson_id = m_comp.group(1)
                req = LessonCompleteRequest(**(json or {})) if json else None
                res = progress.mark_lesson_complete(lesson_id, req, db=self.db)
                return TestResponse(200, res)

            return TestResponse(
                404, {"error": {"code": "NOT_FOUND", "message": f"Route not found: {path}"}}
            )

        except AppException as e:
            return TestResponse(
                e.status_code,
                {"error": {"code": e.code, "message": e.message, "details": e.details}},
            )
        except Exception as e:
            return TestResponse(
                500, {"error": {"code": "INTERNAL_SERVER_ERROR", "message": str(e)}}
            )


@pytest.fixture(scope="session")
def test_engine(tmp_path_factory):
    db_file = tmp_path_factory.mktemp("data") / "test_padh_le_bc.db"
    engine = create_engine(
        f"sqlite:///{db_file}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    return engine


@pytest.fixture
def db_session(test_engine):
    connection = test_engine.connect()
    transaction = connection.begin()
    session_factory = sessionmaker(bind=connection)
    session = session_factory()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    return LocalApiClient(db_session)
