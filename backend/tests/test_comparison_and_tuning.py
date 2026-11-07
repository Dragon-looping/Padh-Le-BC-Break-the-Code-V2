from pathlib import Path


def test_experiment_report_and_hyperparameter_tuning(client):
    # Upload sample classification dataset (robust path resolution)
    sample_path = Path(__file__).resolve().parent.parent / "datasets" / "samples" / "classification_churn.csv"
    assert sample_path.exists(), f"Sample churn CSV must exist at {sample_path}"
    with open(sample_path, "rb") as f:
        upload_res = client.post(
            "/api/datasets/upload",
            files={"file": ("churn_tune.csv", f, "text/csv")},
        )
    dataset_id = upload_res.json()["dataset_id"]

    client.post(
        f"/api/datasets/{dataset_id}/configure",
        json={"target_column": "churn", "task_type": "classification"},
    )

    # 1. Create experiment
    exp_res = client.post(
        "/api/experiments",
        json={
            "dataset_id": dataset_id,
            "target_column": "churn",
            "task_type": "classification",
            "model_ids": ["decision_tree_classifier"],
            "test_size": 0.25,
            "random_state": 42,
        },
    )
    assert exp_res.status_code == 201
    experiment_id = exp_res.json()["experiment_id"]

    # 2. Fetch experiment history
    list_res = client.get("/api/experiments")
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 1

    # 3. Fetch report
    report_res = client.get(f"/api/experiments/{experiment_id}/report")
    assert report_res.status_code == 200
    rdata = report_res.json()
    assert rdata["experiment_id"] == experiment_id
    assert "model_comparison" in rdata
    assert len(rdata["results_breakdown"]) == 1

    # 4. Tune decision_tree_classifier
    tune_res = client.post(
        f"/api/experiments/{experiment_id}/tune",
        json={
            "model_id": "decision_tree_classifier",
            "param_grid": {
                "max_depth": [2, 4, 6],
                "min_samples_split": [2, 5],
            },
            "cv_folds": 3,
        },
    )
    assert tune_res.status_code == 200
    tdata = tune_res.json()
    assert tdata["model_id"] == "decision_tree_classifier"
    assert "before_metrics" in tdata
    assert "after_metrics" in tdata
    assert "best_parameters" in tdata
    assert "improvement_summary" in tdata
