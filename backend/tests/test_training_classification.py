from pathlib import Path


def test_real_classification_experiment(client):
    sample_path = Path(__file__).resolve().parent.parent / "datasets" / "samples" / "classification_churn.csv"
    assert sample_path.exists(), f"Sample churn CSV must exist at {sample_path}"

    with open(sample_path, "rb") as f:
        upload_res = client.post(
            "/api/datasets/upload",
            files={"file": ("churn_test.csv", f, "text/csv")},
        )
    assert upload_res.status_code == 201
    dataset_id = upload_res.json()["dataset_id"]

    config_res = client.post(
        f"/api/datasets/{dataset_id}/configure",
        json={"target_column": "churn", "task_type": "classification"},
    )
    assert config_res.status_code == 200

    experiment_payload = {
        "dataset_id": dataset_id,
        "target_column": "churn",
        "task_type": "classification",
        "model_ids": [
            "logistic_regression",
            "decision_tree_classifier",
            "random_forest_classifier",
            "naive_bayes",
        ],
        "test_size": 0.25,
        "random_state": 42,
        "priority": "performance",
    }
    exp_res = client.post("/api/experiments", json=experiment_payload)
    assert exp_res.status_code == 201
    edata = exp_res.json()

    assert edata["status"] == "completed"
    assert len(edata["results"]) == 4

    for r in edata["results"]:
        assert r["status"] == "completed"
        assert r["training_duration_seconds"] >= 0.0
        metrics = r["metrics"]
        assert "accuracy" in metrics
        assert 0.0 <= metrics["accuracy"] <= 1.0
        assert "f1_macro" in metrics
        assert "confusion_matrix" in metrics
        assert len(metrics["confusion_matrix"]) == 2

    comp = edata["comparison"]
    assert comp is not None
    assert comp["best_model_id"] in experiment_payload["model_ids"]
    assert len(comp["ranked_models"]) == 4
    assert comp["ranked_models"][0]["rank"] == 1
    assert "tradeoff_analysis" in comp
    assert "recommendation_reason" in comp
