import pytest

def test_generate_learning_roadmap(client, auth_headers):
    """Test generating a structured learning roadmap from subject and goal."""
    headers = {"Authorization": auth_headers["Authorization"]}
    res = client.post("/paths/generate", json={
        "subject": "Python",
        "level": "Beginner",
        "goal": "Learn Python for AI and Data Science"
    }, headers=headers)

    assert res.status_code == 200, f"Generation failed: {res.text}"
    path_data = res.json()
    assert path_data["subject"] == "Python"
    assert path_data["level"] == "Beginner"
    assert path_data["total_topics"] > 0
    assert len(path_data["topics"]) == path_data["total_topics"]
    assert path_data["progress"] == 0

    first_topic = path_data["topics"][0]
    assert "title" in first_topic
    assert "description" in first_topic
    assert "duration_minutes" in first_topic
    assert "status" in first_topic

def test_view_previously_generated_roadmaps(client, auth_headers):
    """Test GET /paths returns previously generated roadmaps without regenerating."""
    headers = {"Authorization": auth_headers["Authorization"]}
    res = client.get("/paths", headers=headers)
    assert res.status_code == 200
    paths = res.json()
    assert len(paths) >= 1, "Must return previously generated roadmaps"

    for p in paths:
        assert "id" in p
        assert "title" in p
        assert "subject" in p
        assert "level" in p
        assert "completed_topics" in p
        assert "total_topics" in p
        assert "progress" in p
        assert isinstance(p["topics"], list)

def test_get_path_details_by_id(client, auth_headers):
    """Test GET /paths/{path_id} returns roadmap and full syllabus."""
    headers = {"Authorization": auth_headers["Authorization"]}
    paths = client.get("/paths", headers=headers).json()
    assert len(paths) > 0
    path_id = paths[0]["id"]

    res = client.get(f"/paths/{path_id}", headers=headers)
    assert res.status_code == 200
    details = res.json()
    assert details["id"] == path_id
    assert len(details["topics"]) == details["total_topics"]

def test_topic_completion_and_progress_calculation(client, auth_headers):
    """Test marking a module done updates status and immediately recalculates path progress."""
    headers = {"Authorization": auth_headers["Authorization"]}
    paths = client.get("/paths", headers=headers).json()
    active_path = paths[0]
    topics = active_path["topics"]
    assert len(topics) >= 2, "Path must have at least 2 topics"

    target_topic = topics[0]
    topic_id = target_topic["id"]

    # Mark topic completed
    patch_res = client.patch(f"/paths/topics/{topic_id}/status", json={
        "status": "completed",
        "mastery_score": 92
    }, headers=headers)
    assert patch_res.status_code == 200
    updated_topic = patch_res.json()

    assert updated_topic["status"] == "completed"
    assert updated_topic["path_completed_topics"] >= 1
    assert updated_topic["path_progress"] is not None
    assert updated_topic["path_progress"] > 0

    # Verify calculated progress matches expected formula
    expected_pct = int((updated_topic["path_completed_topics"] / updated_topic["path_total_topics"]) * 100)
    assert updated_topic["path_progress"] == expected_pct

def test_duplicate_completion_prevention(client, auth_headers):
    """Test clicking Mark Done multiple times on the same module prevents duplicate count increments."""
    headers = {"Authorization": auth_headers["Authorization"]}
    paths = client.get("/paths", headers=headers).json()
    target_topic = paths[0]["topics"][0]
    topic_id = target_topic["id"]

    res1 = client.patch(f"/paths/topics/{topic_id}/status", json={
        "status": "completed",
        "mastery_score": 95
    }, headers=headers).json()

    res2 = client.patch(f"/paths/topics/{topic_id}/status", json={
        "status": "completed",
        "mastery_score": 95
    }, headers=headers).json()

    assert res1["path_completed_topics"] == res2["path_completed_topics"]
    assert res1["path_progress"] == res2["path_progress"]

def test_persistence_across_relogin(client):
    """Test that after logging out and re-logging in, all roadmaps and completion progress remain intact in SQLite."""
    user_cred = {
        "email": "jordan.tester@example.com",
        "password": "Password123"
    }

    # Re-login
    login_res = client.post("/auth/login", json=user_cred)
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    fresh_headers = {"Authorization": f"Bearer {token}"}

    # Fetch paths again
    paths_res = client.get("/paths", headers=fresh_headers)
    assert paths_res.status_code == 200
    paths = paths_res.json()
    assert len(paths) >= 1

    first_path = paths[0]
    assert first_path["completed_topics"] >= 1
    assert first_path["progress"] > 0
    assert any(t["status"] == "completed" for t in first_path["topics"])
