from pathlib import Path


def test_real_regression_experiment(client):
    sample_path = Path(__file__).resolve().parent.parent / "datasets" / "samples" / "regression_housing.csv"
    assert sample_path.exists(), f"Sample housing CSV must exist at {sample_path}"

    with open(sample_path, "rb") as f:
        upload_res = client.post(
            "/api/datasets/upload",
            files={"file": ("housing_test.csv", f, "text/csv")},
        )
    assert upload_res.status_code == 201
    dataset_id = upload_res.json()["dataset_id"]

    config_res = client.post(
        f"/api/datasets/{dataset_id}/configure",
        json={"target_column": "price", "task_type": "regression"},
    )
    assert config_res.status_code == 200

    experiment_payload = {
        "dataset_id": dataset_id,
        "target_column": "price",
        "task_type": "regression",
        "model_ids": [
            "linear_regression",
            "ridge_regression",
            "random_forest_regressor",
        ],
        "test_size": 0.2,
        "random_state": 42,
        "priority": "performance",
    }
    exp_res = client.post("/api/experiments", json=experiment_payload)
    assert exp_res.status_code == 201
    edata = exp_res.json()

    assert edata["status"] == "completed"
    assert len(edata["results"]) == 3

    for r in edata["results"]:
        assert r["status"] == "completed"
        metrics = r["metrics"]
        assert "mae" in metrics
        assert "rmse" in metrics
        assert "r2" in metrics
        assert "accuracy" not in metrics
        assert metrics["rmse"] > 0

    comp = edata["comparison"]
    assert comp is not None
    assert comp["primary_metric_name"] == "r2"
    assert comp["best_model_id"] in experiment_payload["model_ids"]
