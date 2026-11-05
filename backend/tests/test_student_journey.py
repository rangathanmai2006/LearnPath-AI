from uuid import uuid4


def test_complete_student_journey(client, monkeypatch):
    email = f"journey-{uuid4().hex[:10]}@example.test"
    registration = client.post("/auth/register", json={
        "name": "Journey Student",
        "email": email,
        "password": "SecurePassword123",
    })
    assert registration.status_code == 200
    headers = {"Authorization": f"Bearer {registration.json()['access_token']}"}

    dashboard = client.get("/dashboard", headers=headers)
    assert dashboard.status_code == 200
    assert dashboard.json()["student_name"] == "Journey Student"
    assert dashboard.json()["xp"] == 0
    assert dashboard.json()["total_lessons_completed"] == 0

    paths = client.get("/paths", headers=headers)
    assert paths.status_code == 200 and paths.json()
    starter_path = paths.json()[0]
    first_topic, next_topic = starter_path["topics"][:2]
    assert first_topic["status"] == "in-progress"
    assert next_topic["status"] == "locked"

    blocked = client.patch(f"/paths/topics/{next_topic['id']}/status", json={"status": "completed"}, headers=headers)
    assert blocked.status_code == 409
    completed = client.patch(f"/paths/topics/{first_topic['id']}/status", json={"status": "completed"}, headers=headers)
    assert completed.status_code == 200
    assert completed.json()["path_progress"] > 0

    questions = client.get("/quizzes/questions", params={"topic": first_topic["title"]}, headers=headers)
    assert questions.status_code == 200 and questions.json()
    answers = [{"question_id": q["id"], "selected_index": 0} for q in questions.json()]
    submitted = client.post("/quizzes/submit", json={"topic_name": first_topic["title"], "answers": answers}, headers=headers)
    assert submitted.status_code == 200
    assert len(submitted.json()["results"]) == len(questions.json())
    assert client.get("/quizzes/history", headers=headers).json()

    task = client.post("/tasks", json={"title": "Review the quiz explanations", "duration_minutes": 20}, headers=headers)
    assert task.status_code == 200
    task_id = task.json()["id"]
    assert client.patch(f"/tasks/{task_id}/toggle", headers=headers).json()["completed"] is True
    assert client.delete(f"/tasks/{task_id}", headers=headers).status_code == 200

    preferences = {
        "learning_pace": "balanced",
        "difficulty_preference": "foundational",
        "email_notifications": False,
        "streak_reminders": True,
        "language": "English (US)",
    }
    assert client.put("/auth/preferences", json=preferences, headers=headers).json() == preferences
    assert client.get("/auth/preferences", headers=headers).json() == preferences

    captured = {}
    def tutor_reply(_message, _topic_context="", conversation_history=None):
        captured["history"] = conversation_history
        return {"message": "A contextual test answer.", "formula": None, "code_snippet": None, "is_live_ai": True}
    monkeypatch.setattr("backend.app.routers.tutor.generate_tutor_response", tutor_reply)
    client.get("/tutor/history", headers=headers)
    first_chat = client.post("/tutor/chat", json={"message": "Explain sequential learning paths."}, headers=headers)
    assert first_chat.status_code == 200
    chat = client.post("/tutor/chat", json={"message": "Why is the next topic unlocked?"}, headers=headers)
    assert chat.status_code == 200
    assert any(item["message"] == "Explain sequential learning paths." for item in captured["history"])
    assert chat.json()["message"] == "A contextual test answer."
