from pathlib import Path
import pytest


def test_list_sample_datasets(client):
    res = client.get("/api/datasets/samples")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 2

    sample_ids = [s["id"] for s in data["samples"]]
    assert "iris" in sample_ids
    assert "breast_cancer" in sample_ids

    iris = next(s for s in data["samples"] if s["id"] == "iris")
    assert iris["display_name"] == "Iris Flower Classification"
    assert iris["row_count"] == 150
    assert iris["feature_count"] == 4
    assert iris["target_column"] == "species"
    assert iris["task_type"] == "classification"
    assert "knn_classifier" in iris["available_algorithms"]

    bc = next(s for s in data["samples"] if s["id"] == "breast_cancer")
    assert bc["display_name"] == "Breast Cancer Wisconsin Diagnostic"
    assert bc["row_count"] == 569
    assert bc["feature_count"] == 30
    assert bc["target_column"] == "diagnosis"
    assert bc["task_type"] == "classification"
    assert bc["disclaimer"] is not None


def test_load_iris_sample_and_train_knn(client):
    load_res = client.post("/api/datasets/samples/iris/load")
    assert load_res.status_code == 201
    load_data = load_res.json()
    dataset_id = load_data["dataset_id"]
    assert load_data["rows"] == 150
    assert load_data["columns"] == 5

    prof_res = client.get(f"/api/datasets/{dataset_id}/profile")
    assert prof_res.status_code == 200
    prof = prof_res.json()
    assert prof["row_count"] == 150
    assert "species" in prof["columns"]

    conf_res = client.post(
        f"/api/datasets/{dataset_id}/configure",
        json={"target_column": "species", "task_type": "classification"},
    )
    assert conf_res.status_code == 200
    conf_data = conf_res.json()
    assert conf_data["task_type"] == "classification"
    assert "knn_classifier" in conf_data["compatible_models"]

    exp_res = client.post(
        "/api/experiments",
        json={
            "dataset_id": dataset_id,
            "target_column": "species",
            "task_type": "classification",
            "model_ids": ["knn_classifier", "decision_tree_classifier"],
            "test_size": 0.2,
            "random_state": 42,
        },
    )
    assert exp_res.status_code == 201
    exp_data = exp_res.json()
    assert exp_data["status"] == "completed"
    assert len(exp_data["results"]) == 2

    knn_res = next(r for r in exp_data["results"] if r["model_id"] == "knn_classifier")
    assert knn_res["status"] == "completed"
    assert knn_res["metrics"]["accuracy"] > 0.8
    assert knn_res["metrics"]["confusion_matrix"] is not None


def test_load_breast_cancer_sample_and_train(client):
    load_res = client.post("/api/datasets/samples/breast_cancer/load")
    assert load_res.status_code == 201
    load_data = load_res.json()
    dataset_id = load_data["dataset_id"]
    assert load_data["rows"] == 569
    assert load_data["columns"] == 31

    conf_res = client.post(
        f"/api/datasets/{dataset_id}/configure",
        json={"target_column": "diagnosis", "task_type": "classification"},
    )
    assert conf_res.status_code == 200

    exp_res = client.post(
        "/api/experiments",
        json={
            "dataset_id": dataset_id,
            "target_column": "diagnosis",
            "task_type": "classification",
            "model_ids": ["logistic_regression", "random_forest_classifier"],
            "test_size": 0.2,
            "random_state": 42,
        },
    )
    assert exp_res.status_code == 201
    exp_data = exp_res.json()
    assert exp_data["status"] == "completed"

    lr_res = next(r for r in exp_data["results"] if r["model_id"] == "logistic_regression")
    assert lr_res["status"] == "completed"
    assert lr_res["metrics"]["recall_macro"] is not None
    assert lr_res["metrics"]["f1_macro"] is not None


def test_load_invalid_sample_returns_404(client):
    res = client.post("/api/datasets/samples/non-existent-sample/load")
    assert res.status_code == 404
    assert res.json()["error"]["code"] == "SAMPLE_NOT_FOUND"
