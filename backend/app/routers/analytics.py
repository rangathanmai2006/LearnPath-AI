import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, QuizAttempt, Topic, LearningPath, StudyTask
from ..schemas import AnalyticsResponse
from ..auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Learning Analytics"])

@router.get("", response_model=AnalyticsResponse)
def get_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Total minutes calculated from completed topics and study tasks
    raw_topic_mins = db.query(func.sum(Topic.duration_minutes)).join(LearningPath).filter(
        LearningPath.user_id == current_user.id,
        Topic.status == "completed"
    ).scalar()
    topic_mins = raw_topic_mins if raw_topic_mins is not None else 0

    raw_task_mins = db.query(func.sum(StudyTask.duration_minutes)).filter(
        StudyTask.user_id == current_user.id,
        StudyTask.completed == True
    ).scalar()
    task_mins = raw_task_mins if raw_task_mins is not None else 0

    total_hours = round((topic_mins + task_mins) / 60.0, 1)

    # Average accuracy from actual quiz attempts
    raw_avg_accuracy = db.query(func.avg(QuizAttempt.percentage)).filter(
        QuizAttempt.user_id == current_user.id
    ).scalar()
    avg_accuracy = round(float(raw_avg_accuracy), 1) if raw_avg_accuracy is not None else 0.0

    # Actual completed topics count
    completed_topics_count = db.query(Topic).join(LearningPath).filter(
        LearningPath.user_id == current_user.id,
        Topic.status == "completed"
    ).count()

    # Mastery index calculation based on real completions
    if completed_topics_count > 0 or avg_accuracy > 0:
        mastery_index = min(100.0, round(50.0 + (completed_topics_count * 6.5) + (avg_accuracy * 0.25), 1))
    else:
        mastery_index = 0.0

    # Daily values come only from real task completion timestamps and quiz attempts.
    today = datetime.date.today()
    week_start = datetime.datetime.combine(today - datetime.timedelta(days=6), datetime.time.min)
    completed_tasks = db.query(StudyTask).filter(
        StudyTask.user_id == current_user.id,
        StudyTask.completed.is_(True),
        StudyTask.completed_at >= week_start,
    ).all()
    recent_attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.created_at >= week_start,
    ).all()
    weekly_activity = []
    for offset in range(7):
        activity_day = today - datetime.timedelta(days=6 - offset)
        task_hours = sum(
            task.duration_minutes for task in completed_tasks
            if task.completed_at.date() == activity_day
        ) / 60.0
        scores = [attempt.percentage for attempt in recent_attempts if attempt.created_at.date() == activity_day]
        weekly_activity.append({
            "day": activity_day.strftime("%a"),
            "hours": round(task_hours, 1),
            "topics": 0,
            "score": round(sum(scores) / len(scores), 1) if scores else None,
        })

    # Completed modules list for student
    completed_topics_rows = db.query(Topic).join(LearningPath).filter(
        LearningPath.user_id == current_user.id,
        Topic.status == "completed"
    ).order_by(Topic.id.desc()).all()

    completed_modules = [
        {
            "id": t.id,
            "title": t.title,
            "course_name": t.learning_path.title,
            "subject": t.learning_path.subject,
            "duration_minutes": t.duration_minutes,
            "difficulty": t.difficulty,
            "mastery_score": t.mastery_score,
        }
        for t in completed_topics_rows
    ]

    # Enrolled paths list with accurate progress
    user_paths = db.query(LearningPath).filter(
        LearningPath.user_id == current_user.id
    ).order_by(LearningPath.created_at.desc()).all()

    enrolled_paths = [
        {
            "id": p.id,
            "title": p.title,
            "subject": p.subject,
            "level": p.level,
            "progress": p.progress,
            "completed_topics": p.completed_topics,
            "total_topics": p.total_topics,
        }
        for p in user_paths
    ]

    # Calculate Strong and Weak topics from quiz attempts and topic mastery
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == current_user.id).all()
    topic_scores = {}
    for a in attempts:
        topic_scores.setdefault(a.topic_name, []).append(a.percentage)

    strong_topics = []
    weak_topics = []

    for name, scores in topic_scores.items():
        avg = sum(scores) / len(scores)
        if avg >= 75:
            strong_topics.append({
                "subject": name,
                "mastery": round(avg, 1),
                "remedyAction": "Solid comprehension verified! Continue to next advanced module."
            })
        else:
            weak_topics.append({
                "subject": name,
                "mastery": round(avg, 1),
                "benchmark": 75,
                "remedyAction": f"Review foundational questions in {name} with AI Tutor."
            })

    return {
        "total_study_hours": total_hours,
        "mastery_index": mastery_index,
        "accuracy_percentage": avg_accuracy,
        "weekly_activity": weekly_activity,
        "strong_topics": strong_topics,
        "weak_topics": weak_topics,
        "completed_modules": completed_modules,
        "enrolled_paths": enrolled_paths,
        "total_completed_lessons": completed_topics_count
    }
