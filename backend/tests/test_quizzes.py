import pytest


def test_quiz_questions_require_authentication(client):
    res = client.get("/quizzes/questions?topic=Python")
    assert res.status_code in (401, 403)

def test_fetch_quiz_questions_has_four_options(client, auth_headers):
    """Test fetching diagnostic quiz questions returns questions with exactly 4 options each."""
    headers = {"Authorization": auth_headers["Authorization"]}
    res = client.get("/quizzes/questions?topic=NumPy+Arrays+and+Vectorized+Computation", headers=headers)
    assert res.status_code == 200, f"Failed: {res.text}"
    questions = res.json()
    assert len(questions) > 0, "Question list should not be empty"

    for q in questions:
        assert "id" in q
        assert "question" in q
        assert "options" in q
        assert len(q["options"]) == 4, f"Expected 4 options, got {len(q['options'])}"
        for opt in q["options"]:
            assert opt, "Option text must not be empty"

def test_quiz_fallback_generation_for_custom_topic(client, auth_headers):
    """Test built-in diagnostic generator returns questions for any custom topic without Gemini API key."""
    headers = {"Authorization": auth_headers["Authorization"]}
    res = client.get("/quizzes/questions?topic=Quantum+Computing+Basics", headers=headers)
    assert res.status_code == 200
    questions = res.json()
    assert len(questions) == 5, "Custom topics should produce a five-question practice quiz"
    for q in questions:
        assert len(q["options"]) == 4

def test_quiz_submission_and_scoring(client, auth_headers):
    """Test submitting answers calculates score, percentage, XP, and returns explanations."""
    headers = {"Authorization": auth_headers["Authorization"]}
    q_res = client.get("/quizzes/questions?topic=NumPy+Arrays+and+Vectorized+Computation", headers=headers)
    questions = q_res.json()
    assert len(questions) > 0

    submission_answers = [
        {"question_id": q["id"], "selected_index": 0}
        for q in questions
    ]

    sub_res = client.post("/quizzes/submit", json={
        "topic_name": "NumPy Arrays and Vectorized Computation",
        "answers": submission_answers
    }, headers=headers)

    assert sub_res.status_code == 200, f"Submit failed: {sub_res.text}"
    result = sub_res.json()
    assert result["topic_name"] == "NumPy Arrays and Vectorized Computation"
    assert result["total_questions"] == len(questions)
    assert 0 <= result["score"] <= result["total_questions"]
    assert 0.0 <= result["percentage"] <= 100.0
    assert result["xp_earned"] == result["score"] * 25
    assert len(result["results"]) == len(questions)

    for item in result["results"]:
        assert "explanation" in item and item["explanation"], "Must have explanatory rationale"
        assert "is_correct" in item
        assert "correct_index" in item


def test_quiz_submission_requires_all_unique_questions(client, auth_headers):
    headers = {"Authorization": auth_headers["Authorization"]}
    questions = client.get(
        "/quizzes/questions?topic=NumPy+Arrays+and+Vectorized+Computation",
        headers=headers,
    ).json()
    first_answer = {"question_id": questions[0]["id"], "selected_index": 0}
    partial = client.post("/quizzes/submit", json={
        "topic_name": "NumPy Arrays and Vectorized Computation",
        "answers": [first_answer],
    }, headers=headers)
    assert partial.status_code == 400

    duplicate = client.post("/quizzes/submit", json={
        "topic_name": "NumPy Arrays and Vectorized Computation",
        "answers": [first_answer, first_answer],
    }, headers=headers)
    assert duplicate.status_code == 400


def test_quiz_submission_rejects_invalid_option_index(client, auth_headers):
    headers = {"Authorization": auth_headers["Authorization"]}
    questions = client.get(
        "/quizzes/questions?topic=NumPy+Arrays+and+Vectorized+Computation",
        headers=headers,
    ).json()
    answers = [{"question_id": q["id"], "selected_index": 0} for q in questions]
    answers[0]["selected_index"] = 4
    res = client.post("/quizzes/submit", json={
        "topic_name": "NumPy Arrays and Vectorized Computation",
        "answers": answers,
    }, headers=headers)
    assert res.status_code == 422

def test_quiz_history_storage_in_database(client, auth_headers):
    """Test submitted quiz attempt is recorded in SQLite and returned via GET /quizzes/history."""
    headers = {"Authorization": auth_headers["Authorization"]}
    hist_res = client.get("/quizzes/history", headers=headers)
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 1, "Quiz history must contain previously submitted attempt"

    latest = history[0]
    assert "id" in latest
    assert "topic_name" in latest
    assert "score" in latest
    assert "percentage" in latest
    assert "created_at" in latest
