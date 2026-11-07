def test_learner_progress_flow(client):
    session_id = "test_student_42"

    # 1. Check initial progress
    initial_res = client.get(f"/api/progress?session_id={session_id}")
    assert initial_res.status_code == 200
    assert initial_res.json()["total_completed"] == 0

    # 2. Mark lesson-u1-l1 complete
    complete_res = client.post(
        "/api/progress/lessons/lesson-u1-l1/complete",
        json={"session_id": session_id},
    )
    assert complete_res.status_code == 200
    assert complete_res.json()["completed"] is True
    assert complete_res.json()["lesson_id"] == "lesson-u1-l1"

    # 3. Check updated progress
    updated_res = client.get(f"/api/progress?session_id={session_id}")
    assert updated_res.status_code == 200
    udata = updated_res.json()
    assert udata["total_completed"] == 1
    assert "lesson-u1-l1" in udata["completed_lessons"]

    # 4. Attempt to mark invalid lesson
    invalid_res = client.post(
        "/api/progress/lessons/non-existent-lesson/complete",
        json={"session_id": session_id},
    )
    assert invalid_res.status_code == 404
    assert invalid_res.json()["error"]["code"] == "LESSON_NOT_FOUND"
