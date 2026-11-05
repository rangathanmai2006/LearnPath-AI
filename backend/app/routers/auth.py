import datetime
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, LearningPath, Topic, StudyTask, UserPreference
from ..schemas import UserRegister, UserLogin, TokenResponse, UserResponse, UserUpdate, UserPreferences
from ..auth import hash_password, verify_password, create_access_token, get_current_user
from ..services.roadmap_service import generate_roadmap

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if email already registered
    existing_user = db.query(User).filter(User.email == user_data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Create new user
    hashed_pwd = hash_password(user_data.password)
    user = User(
        name=user_data.name.strip(),
        email=user_data.email.lower().strip(),
        hashed_password=hashed_pwd,
        level=1,
        xp=0,
        streak_days=1,
        daily_goal_minutes=45,
        target_goal="AI & Full-Stack Specialist",
        last_active_date=datetime.date.today().isoformat()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Seed default starter learning path so student starts with a clear roadmap
    default_roadmap = generate_roadmap("Neural Networks & Deep Learning", "Intermediate")
    path = LearningPath(
        user_id=user.id,
        title=default_roadmap["title"],
        subject=default_roadmap["subject"],
        level=default_roadmap["level"],
        progress=0,
        total_topics=len(default_roadmap["topics"]),
        completed_topics=0,
        description=default_roadmap["description"]
    )
    db.add(path)
    db.commit()
    db.refresh(path)

    for i, t in enumerate(default_roadmap["topics"]):
        status_val = "in-progress" if i == 0 else "locked"
        topic = Topic(
            learning_path_id=path.id,
            title=t["title"],
            order=t["order"],
            status=status_val,
            duration_minutes=t["duration_minutes"],
            difficulty=t["difficulty"],
            summary=t.get("summary", ""),
            description=t.get("description", t.get("summary", "")),
            learning_objectives=t.get("learning_objectives", ""),
            mastery_score=0
        )
        db.add(topic)

    # Seed 3 starter study tasks
    starter_tasks = [
        {"title": "Review Perceptron Decision Boundaries", "course": "Neural Networks", "category": "Theory", "mins": 25, "due": "Today", "prio": "high", "done": False},
        {"title": "Complete Backpropagation Practice Quiz", "course": "Neural Networks", "category": "Quiz", "mins": 20, "due": "Today", "prio": "high", "done": False},
        {"title": "Implement PyTorch Linear Layer from scratch", "course": "Neural Networks", "category": "Coding", "mins": 35, "due": "Tomorrow", "prio": "medium", "done": False},
    ]
    for st in starter_tasks:
        db.add(StudyTask(
            user_id=user.id,
            title=st["title"],
            course_name=st["course"],
            duration_minutes=st["mins"],
            time_slot="Flexible",
            due_date=st["due"],
            priority=st["prio"],
            completed=st["done"],
            category=st["category"]
        ))

    db.commit()

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email.lower().strip()).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials."
        )

    # Update streak
    today_str = datetime.date.today().isoformat()
    if user.last_active_date != today_str:
        # Check if consecutive day
        if user.last_active_date:
            try:
                last_date = datetime.date.fromisoformat(user.last_active_date)
                delta = (datetime.date.today() - last_date).days
                if delta == 1:
                    user.streak_days += 1
                elif delta > 1:
                    user.streak_days = 1
            except Exception:
                user.streak_days = 1
        else:
            user.streak_days = 1
        user.last_active_date = today_str
        db.commit()

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_profile(data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.name:
        current_user.name = data.name.strip()
    if data.target_goal:
        current_user.target_goal = data.target_goal.strip()
    if data.daily_goal_minutes:
        current_user.daily_goal_minutes = data.daily_goal_minutes
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/preferences", response_model=UserPreferences)
def get_preferences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not row:
        return UserPreferences()
    return UserPreferences.model_validate(json.loads(row.preferences_json))


@router.put("/preferences", response_model=UserPreferences)
def update_preferences(data: UserPreferences, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    values = data.model_dump()
    if values["learning_pace"] not in {"relaxed", "balanced", "intensive"}:
        raise HTTPException(status_code=422, detail="Invalid learning pace.")
    if values["difficulty_preference"] not in {"adaptive", "challenging", "foundational"}:
        raise HTTPException(status_code=422, detail="Invalid difficulty preference.")
    if values["language"] not in {"English (US)", "Spanish (ES)", "German (DE)", "French (FR)", "Japanese (JA)"}:
        raise HTTPException(status_code=422, detail="Unsupported platform language.")
    row = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if row:
        row.preferences_json = json.dumps(values)
    else:
        db.add(UserPreference(user_id=current_user.id, preferences_json=json.dumps(values)))
    db.commit()
    return data
