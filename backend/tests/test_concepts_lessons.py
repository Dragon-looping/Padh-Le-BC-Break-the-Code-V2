def test_list_concepts(client):
    response = client.get("/api/concepts")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 10
    assert len(data["concepts"]) == data["total"]
    # Check concept fields
    first = data["concepts"][0]
    assert "id" in first
    assert "title" in first
    assert "level" in first
    assert "short_definition" in first


def test_get_concept_details(client):
    response = client.get("/api/concepts/dataset-features-target")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "dataset-features-target"
    assert "simple_explanation" in data
    assert "real_world_example" in data
    assert len(data["key_points"]) > 0
    assert len(data["common_mistakes"]) > 0


def test_get_invalid_concept_returns_404(client):
    response = client.get("/api/concepts/non-existent-concept-xyz")
    assert response.status_code == 404
    error_data = response.json()
    assert "error" in error_data
    assert error_data["error"]["code"] == "CONCEPT_NOT_FOUND"


def test_list_lessons(client):
    response = client.get("/api/lessons")
    assert response.status_code == 200
    data = response.json()
    assert data["total_lessons"] >= 5
    assert len(data["units"]) >= 4


def test_get_lesson_details(client):
    response = client.get("/api/lessons/lesson-u1-l1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "lesson-u1-l1"
    assert "learning_objectives" in data
    assert "python_code" in data
    assert "code_explanation" in data
    assert "knowledge_check" in data
    assert len(data["knowledge_check"]) > 0


def test_get_invalid_lesson_returns_404(client):
    response = client.get("/api/lessons/invalid-lesson-id")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "LESSON_NOT_FOUND"
