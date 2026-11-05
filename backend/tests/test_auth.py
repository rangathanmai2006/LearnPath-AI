import pytest

def test_user_registration_success(client):
    """Test registering a new student account creates user and returns JWT token."""
    res = client.post("/auth/register", json={
        "name": "Maya Lin",
        "email": "maya.lin@example.com",
        "password": "SecurePassword123"
    })
    assert res.status_code == 200, f"Registration failed: {res.text}"
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "maya.lin@example.com"
    assert data["user"]["name"] == "Maya Lin"
    assert data["user"]["level"] >= 1

def test_user_registration_duplicate_email(client):
    """Test duplicate registration with existing email is rejected with 400 Bad Request."""
    res = client.post("/auth/register", json={
        "name": "Maya Duplicate",
        "email": "maya.lin@example.com",
        "password": "AnotherPassword123"
    })
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"].lower()

def test_user_login_success(client):
    """Test login with valid email and password returns JWT bearer token."""
    res = client.post("/auth/login", json={
        "email": "maya.lin@example.com",
        "password": "SecurePassword123"
    })
    assert res.status_code == 200, f"Login failed: {res.text}"
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "maya.lin@example.com"

def test_user_login_invalid_password(client):
    """Test login with incorrect password returns 401 Unauthorized."""
    res = client.post("/auth/login", json={
        "email": "maya.lin@example.com",
        "password": "WrongPassword999"
    })
    assert res.status_code == 401
    assert "invalid" in res.json()["detail"].lower()

def test_user_login_nonexistent_email(client):
    """Test login with unknown email returns 401 Unauthorized."""
    res = client.post("/auth/login", json={
        "email": "nonexistent.student@example.com",
        "password": "AnyPassword123"
    })
    assert res.status_code == 401

def test_get_current_user_profile(client, auth_headers):
    """Test GET /auth/me returns current user profile when authenticated."""
    headers = {"Authorization": auth_headers["Authorization"]}
    res = client.get("/auth/me", headers=headers)
    assert res.status_code == 200
    user_data = res.json()
    assert user_data["email"] == auth_headers["user_email"]
    assert "xp" in user_data
    assert "streak_days" in user_data

def test_unauthenticated_request_rejected(client):
    """Test protected endpoint rejects requests without Authorization header."""
    res = client.get("/auth/me")
    assert res.status_code in [401, 403]

def test_update_user_profile(client, auth_headers):
    """Test PUT /auth/me updates user learning goals and preferences."""
    headers = {"Authorization": auth_headers["Authorization"]}
    res = client.put("/auth/me", json={
        "target_goal": "Machine Learning Engineer",
        "daily_goal_minutes": 60
    }, headers=headers)
    assert res.status_code == 200
    updated = res.json()
    assert updated["target_goal"] == "Machine Learning Engineer"
    assert updated["daily_goal_minutes"] == 60
