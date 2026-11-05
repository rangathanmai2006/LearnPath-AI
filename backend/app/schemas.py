import re
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal
import datetime

# Auth Schemas
class UserRegister(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=180)
    password: str = Field(min_length=8, max_length=72)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name cannot be blank.")
        return value

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        value = value.strip().lower()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value):
            raise ValueError("Enter a valid email address.")
        return value

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 UTF-8 bytes.")
        return value

class UserLogin(BaseModel):
    email: str = Field(min_length=3, max_length=180)
    password: str = Field(min_length=1, max_length=72)

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        value = value.strip().lower()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value):
            raise ValueError("Enter a valid email address.")
        return value

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    level: int
    xp: int
    target_goal: str
    daily_goal_minutes: int
    streak_days: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    target_goal: Optional[str] = Field(default=None, min_length=1, max_length=200)
    daily_goal_minutes: Optional[int] = Field(default=None, ge=1, le=1440)

    @field_validator("name", "target_goal")
    @classmethod
    def trim_non_empty_text(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank.")
        return value


class UserPreferences(BaseModel):
    learning_pace: str = "balanced"
    difficulty_preference: str = "adaptive"
    email_notifications: bool = False
    streak_reminders: bool = True
    language: str = "English (US)"

# Learning Path Schemas
class TopicResponse(BaseModel):
    id: int
    learning_path_id: int
    title: str
    order: int
    status: str
    duration_minutes: int
    difficulty: str
    summary: Optional[str] = ""
    description: Optional[str] = ""
    learning_objectives: Optional[str] = ""
    mastery_score: int
    path_progress: Optional[int] = None
    path_completed_topics: Optional[int] = None
    path_total_topics: Optional[int] = None

    class Config:
        from_attributes = True

class LearningPathResponse(BaseModel):
    id: int
    title: str
    subject: str
    level: str
    progress: int
    total_topics: int
    completed_topics: int
    description: str
    created_at: datetime.datetime
    topics: List[TopicResponse] = []

    class Config:
        from_attributes = True

class GeneratePathRequest(BaseModel):
    subject: Optional[str] = Field(default="", max_length=100)
    level: Literal["Beginner", "Intermediate", "Advanced"] = "Beginner"
    custom_goal: Optional[str] = Field(default=None, max_length=500)
    goal: Optional[str] = Field(default=None, max_length=500)
    learning_goal: Optional[str] = Field(default=None, max_length=500)

class TopicStatusUpdate(BaseModel):
    status: Literal["completed", "in-progress"]
    mastery_score: Optional[int] = Field(default=None, ge=0, le=100)

# Chat / AI Tutor Schemas
class ChatMessageCreate(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    topic_context: Optional[str] = Field(default=None, max_length=500)

    @field_validator("message")
    @classmethod
    def non_empty_message(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Message cannot be blank.")
        return value

class ChatMessageResponse(BaseModel):
    id: int
    sender: str
    message: str
    formula: Optional[str] = None
    code_snippet: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class TutorStatusResponse(BaseModel):
    ai_configured: bool
    model: str
    notice: Optional[str] = None

# Quiz Schemas
class QuizQuestionResponse(BaseModel):
    id: int
    topic_name: str
    question: str
    options: List[str]
    is_ai_generated: bool

class QuizSubmitAnswer(BaseModel):
    question_id: int
    selected_index: int = Field(ge=0, le=3)

class QuizSubmitRequest(BaseModel):
    topic_name: str = Field(min_length=1, max_length=150)
    answers: List[QuizSubmitAnswer] = Field(min_length=1, max_length=20)

class QuestionResult(BaseModel):
    question_id: int
    question: str
    selected_index: int
    correct_index: int
    is_correct: bool
    explanation: str

class QuizSubmitResponse(BaseModel):
    topic_name: str
    score: int
    total_questions: int
    percentage: float
    xp_earned: int
    results: List[QuestionResult]

class QuizAttemptResponse(BaseModel):
    id: int
    topic_name: str
    score: int
    total_questions: int
    percentage: float
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Study Task Schemas
class StudyTaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    course_name: str = Field(default="General Studies", max_length=150)
    duration_minutes: int = Field(default=30, ge=1, le=1440)
    time_slot: str = Field(default="Flexible", max_length=60)
    due_date: str = Field(default="Today", max_length=40)
    priority: Literal["low", "medium", "high"] = "medium"
    category: Literal["Theory", "Coding", "Quiz", "Revision"] = "Theory"

class StudyTaskResponse(BaseModel):
    id: int
    title: str
    course_name: str
    duration_minutes: int
    time_slot: str
    due_date: str
    priority: str
    completed: bool
    category: str

    class Config:
        from_attributes = True

# Dashboard & Analytics Schemas
class DashboardStatsResponse(BaseModel):
    student_name: str
    target_goal: str
    level: int
    xp: int
    streak_days: int
    daily_goal_minutes: int
    daily_completed_minutes: int
    total_lessons_completed: int
    avg_quiz_score: float
    recent_activities: List[dict]
    recommended_topic: Optional[dict] = None
    active_path: Optional[LearningPathResponse] = None

class AnalyticsResponse(BaseModel):
    total_study_hours: float
    mastery_index: float
    accuracy_percentage: float
    weekly_activity: List[dict]
    strong_topics: List[dict]
    weak_topics: List[dict]
    completed_modules: List[dict] = []
    enrolled_paths: List[dict] = []
    total_completed_lessons: int = 0
