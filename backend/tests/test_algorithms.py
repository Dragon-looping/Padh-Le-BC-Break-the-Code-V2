def test_list_algorithms(client):
    response = client.get("/api/algorithms")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 15
    algo_ids = [a["id"] for a in data["algorithms"]]
    assert "linear_regression" in algo_ids
    assert "ridge_regression" in algo_ids
    assert "random_forest_regressor" in algo_ids
    assert "logistic_regression" in algo_ids
    assert "random_forest_classifier" in algo_ids
    assert "naive_bayes" in algo_ids
    assert "kmeans" in algo_ids
    assert "pca" in algo_ids


def test_trainable_only_filter(client):
    response = client.get("/api/algorithms?trainable_only=true")
    assert response.status_code == 200
    data = response.json()
    for algo in data["algorithms"]:
        assert algo["training_supported"] is True
    algo_ids = [a["id"] for a in data["algorithms"]]
    assert "kmeans" not in algo_ids
    assert "pca" not in algo_ids


def test_get_algorithm_details(client):
    response = client.get("/api/algorithms/random_forest_classifier")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "random_forest_classifier"
    assert "intuition" in data
    assert "parameters" in data
    assert len(data["parameters"]) > 0
    assert "python_snippet" in data
    assert "advantages" in data
    assert "limitations" in data


def test_get_invalid_algorithm_returns_404(client):
    response = client.get("/api/algorithms/quantum_neural_teleporter")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "ALGORITHM_NOT_FOUND"


def test_trainable_models_endpoint(client):
    response = client.get("/api/models?task_type=classification")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 7
    for m in data["models"]:
        assert m["task_type"] == "classification"
        assert m["training_supported"] is True
