import pytest

def test_dashboard_stats(client, auth_headers):
    """Test GET /dashboard returns user stats, streak, active pathway, and activity stream."""
    headers = {"Authorization": auth_headers["Authorization"]}
    res = client.get("/dashboard", headers=headers)
    assert res.status_code == 200, f"Dashboard failed: {res.text}"
    stats = res.json()
    assert "student_name" in stats
    assert "xp" in stats
    assert "streak_days" in stats
    assert "total_lessons_completed" in stats
    assert "avg_quiz_score" in stats
    assert isinstance(stats["recent_activities"], list)

def test_my_progress_analytics(client, auth_headers):
    """Test GET /analytics returns metrics calculated from SQLite database."""
    headers = {"Authorization": auth_headers["Authorization"]}
    res = client.get("/analytics", headers=headers)
    assert res.status_code == 200, f"Analytics failed: {res.text}"
    data = res.json()
    assert "mastery_index" in data
    assert "accuracy_percentage" in data
    assert "total_study_hours" in data
    assert "weekly_activity" in data
    assert "completed_modules" in data
    assert "enrolled_paths" in data

    for path in data["enrolled_paths"]:
        assert "title" in path
        assert "progress" in path
        assert "completed_topics" in path

def test_study_planner_crud(client, auth_headers):
    """Test creating, fetching, toggling, and deleting study planner tasks."""
    headers = {"Authorization": auth_headers["Authorization"]}

    # Create task
    create_res = client.post("/tasks", json={
        "title": "Practice LeetCode Binary Search",
        "course_name": "Algorithms",
        "duration_minutes": 45,
        "time_slot": "Morning",
        "due_date": "Today",
        "priority": "high",
        "category": "Coding"
    }, headers=headers)
    assert create_res.status_code == 200
    task = create_res.json()
    task_id = task["id"]
    assert task["title"] == "Practice LeetCode Binary Search"
    assert task["completed"] is False

    # Fetch tasks
    list_res = client.get("/tasks", headers=headers)
    assert list_res.status_code == 200
    all_tasks = list_res.json()
    assert any(t["id"] == task_id for t in all_tasks)

    # Toggle task
    toggle_res = client.patch(f"/tasks/{task_id}/toggle", headers=headers)
    assert toggle_res.status_code == 200
    assert toggle_res.json()["completed"] is True

    # Delete task
    del_res = client.delete(f"/tasks/{task_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["message"] == "Task removed."

    # Verify task is deleted
    list_after = client.get("/tasks", headers=headers).json()
    assert not any(t["id"] == task_id for t in list_after)

def test_ai_tutor_status_and_conversation(client, auth_headers, monkeypatch):
    """Test checking tutor status, receiving initial greeting, and sending queries."""
    monkeypatch.setattr(
        "backend.app.routers.tutor.generate_tutor_response",
        lambda *args, **kwargs: {"message": "A live test tutor response.", "formula": None, "code_snippet": None, "is_live_ai": True},
    )
    headers = {"Authorization": auth_headers["Authorization"]}

    # Status check
    status_res = client.get("/tutor/status")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert "ai_configured" in status_data
    assert "model" in status_data

    # Chat history
    hist_res = client.get("/tutor/history", headers=headers)
    assert hist_res.status_code == 200
    messages = hist_res.json()
    assert len(messages) >= 1  # Greets the student

    # Send chat message
    chat_res = client.post("/tutor/chat", json={
        "message": "Explain how learning rate impacts gradient descent convergence."
    }, headers=headers)
    assert chat_res.status_code == 200
    reply = chat_res.json()
    assert reply["sender"] == "ai"
    assert "message" in reply and len(reply["message"]) > 0

    # Clear chat history
    clear_res = client.delete("/tutor/history", headers=headers)
    assert clear_res.status_code == 200


def test_student_preferences_persist(client, auth_headers):
    headers = {"Authorization": auth_headers["Authorization"]}
    defaults = client.get("/auth/preferences", headers=headers)
    assert defaults.status_code == 200
    assert defaults.json()["learning_pace"] == "balanced"

    update = {
        "learning_pace": "intensive",
        "difficulty_preference": "challenging",
        "email_notifications": True,
        "streak_reminders": False,
        "language": "French (FR)",
    }
    saved = client.put("/auth/preferences", json=update, headers=headers)
    assert saved.status_code == 200
    reloaded = client.get("/auth/preferences", headers=headers)
    assert reloaded.json() == update


def test_student_preferences_reject_unsupported_values(client, auth_headers):
    headers = {"Authorization": auth_headers["Authorization"]}
    invalid = {
        "learning_pace": "unlimited",
        "difficulty_preference": "adaptive",
        "email_notifications": False,
        "streak_reminders": True,
        "language": "English (US)",
    }
    res = client.put("/auth/preferences", json=invalid, headers=headers)
    assert res.status_code == 422
