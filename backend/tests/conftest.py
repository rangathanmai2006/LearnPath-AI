import os
import sys
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Add project root and backend to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app.database import get_db, Base
from backend.app.models import User, LearningPath, Topic, QuizQuestion, QuizAttempt, StudyTask, ChatMessage
from backend.app.main import app
from backend.app.services.quiz_service import BUILTIN_QUESTIONS
import json

# Separate isolated test database file
TEST_DB_PATH = os.getenv("LEARNPATH_TEST_DB_PATH", os.path.join(BASE_DIR, "test_learnpath.db"))
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_PATH}"

test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create a pristine test database for the test session and clean it up after."""
    if os.path.exists(TEST_DB_PATH):
        try:
            os.remove(TEST_DB_PATH)
        except Exception:
            pass

    Base.metadata.create_all(bind=test_engine)

    # Seed initial quiz questions into test database
    db = TestingSessionLocal()
    try:
        for bq in BUILTIN_QUESTIONS:
            db.add(QuizQuestion(
                topic_name=bq["topic_name"],
                question=bq["question"],
                options_json=json.dumps(bq["options"]),
                correct_index=bq["correct_index"],
                explanation=bq["explanation"],
                is_ai_generated=bq["is_ai_generated"]
            ))
        db.commit()
    finally:
        db.close()

    yield

    # Clean up test database after all tests complete
    test_engine.dispose()
    if os.path.exists(TEST_DB_PATH):
        try:
            os.remove(TEST_DB_PATH)
        except Exception:
            pass

@pytest.fixture
def db_session():
    """Yields a database session connected to the isolated test database."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def client(db_session):
    """FastAPI TestClient with get_db overridden to use test database."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers(client):
    """Registers and authenticates a test student, returning valid JWT auth headers."""
    user_payload = {
        "name": "Jordan Lee",
        "email": "jordan.tester@example.com",
        "password": "Password123"
    }

    # Attempt registration; if already registered, log in
    reg_res = client.post("/auth/register", json=user_payload)
    if reg_res.status_code == 200:
        token = reg_res.json()["access_token"]
    else:
        login_res = client.post("/auth/login", json={
            "email": user_payload["email"],
            "password": user_payload["password"]
        })
        assert login_res.status_code == 200, f"Auth fixture failed: {login_res.text}"
        token = login_res.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}",
        "user_email": user_payload["email"]
    }
