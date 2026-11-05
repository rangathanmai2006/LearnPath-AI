import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from .database import Base


def utcnow_naive():
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(180), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    target_goal = Column(String(200), default="Full-Stack & AI Specialist")
    daily_goal_minutes = Column(Integer, default=45)
    streak_days = Column(Integer, default=1)
    last_active_date = Column(String(30), default="")
    created_at = Column(DateTime, default=utcnow_naive)

    # Relationships
    learning_paths = relationship("LearningPath", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    study_tasks = relationship("StudyTask", back_populates="user", cascade="all, delete-orphan")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    preferences_json = Column(Text, nullable=False, default="{}")
    updated_at = Column(DateTime, default=utcnow_naive, onupdate=utcnow_naive)

class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    subject = Column(String(100), nullable=False)
    level = Column(String(50), default="Beginner")  # Beginner, Intermediate, Advanced
    progress = Column(Integer, default=0)
    total_topics = Column(Integer, default=0)
    completed_topics = Column(Integer, default=0)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=utcnow_naive)

    user = relationship("User", back_populates="learning_paths")
    topics = relationship("Topic", back_populates="learning_path", cascade="all, delete-orphan", order_by="Topic.order")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    learning_path_id = Column(Integer, ForeignKey("learning_paths.id"), nullable=False)
    title = Column(String(200), nullable=False)
    order = Column(Integer, nullable=False)
    status = Column(String(30), default="locked")  # completed, in-progress, locked
    duration_minutes = Column(Integer, default=30)
    difficulty = Column(String(30), default="Medium")  # Easy, Medium, Hard
    summary = Column(Text, default="")
    description = Column(Text, default="")
    learning_objectives = Column(Text, default="")
    mastery_score = Column(Integer, default=0)

    learning_path = relationship("LearningPath", back_populates="topics")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender = Column(String(20), nullable=False)  # user, ai
    message = Column(Text, nullable=False)
    formula = Column(Text, nullable=True)
    code_snippet = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow_naive)

    user = relationship("User", back_populates="chat_messages")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    topic_name = Column(String(150), index=True, nullable=False)
    question = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False)  # JSON serialized list of 4 options
    correct_index = Column(Integer, nullable=False)
    explanation = Column(Text, default="")
    is_ai_generated = Column(Boolean, default=False)


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_name = Column(String(150), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    answers_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=utcnow_naive)

    user = relationship("User", back_populates="quiz_attempts")


class StudyTask(Base):
    __tablename__ = "study_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    course_name = Column(String(150), default="General Studies")
    duration_minutes = Column(Integer, default=30)
    time_slot = Column(String(60), default="Flexible")
    due_date = Column(String(40), default="Today")  # Today, Tomorrow, Upcoming
    priority = Column(String(20), default="medium")  # low, medium, high
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    category = Column(String(30), default="Theory")  # Theory, Coding, Quiz, Revision
    created_at = Column(DateTime, default=utcnow_naive)

    user = relationship("User", back_populates="study_tasks")
