import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, LearningPath, Topic, QuizAttempt, StudyTask
from ..schemas import DashboardStatsResponse
from ..auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Student Dashboard"])

@router.get("", response_model=DashboardStatsResponse)
def get_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Total completed topics/lessons
    total_completed = db.query(Topic).join(LearningPath).filter(
        LearningPath.user_id == current_user.id,
        Topic.status == "completed"
    ).count()

    # Average quiz score
    avg_score = db.query(func.avg(QuizAttempt.percentage)).filter(
        QuizAttempt.user_id == current_user.id
    ).scalar() or 0.0

    # Active learning path
    active_path = db.query(LearningPath).filter(
        LearningPath.user_id == current_user.id
    ).order_by(LearningPath.created_at.desc()).first()

    # Recommended next topic
    recommended_topic = None
    if active_path:
        next_topic = db.query(Topic).filter(
            Topic.learning_path_id == active_path.id,
            Topic.status.in_(["in-progress", "locked"])
        ).order_by(Topic.order.asc()).first()

        if next_topic:
            recommended_topic = {
                "id": next_topic.id,
                "title": next_topic.title,
                "course_name": active_path.title,
                "duration_minutes": next_topic.duration_minutes,
                "difficulty": next_topic.difficulty,
                "summary": next_topic.summary
            }

    # Completed tasks today
    today = datetime.date.today()
    day_start = datetime.datetime.combine(today, datetime.time.min)
    next_day = day_start + datetime.timedelta(days=1)
    completed_tasks_mins = db.query(func.sum(StudyTask.duration_minutes)).filter(
        StudyTask.user_id == current_user.id,
        StudyTask.completed == True,
        StudyTask.completed_at >= day_start,
        StudyTask.completed_at < next_day,
    ).scalar() or 0

    # Recent activity stream
    recent_activities = []

    recent_quizzes = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id
    ).order_by(QuizAttempt.created_at.desc()).limit(3).all()

    for q in recent_quizzes:
        recent_activities.append({
            "type": "quiz",
            "title": f"Quiz: {q.topic_name}",
            "description": f"Scored {q.score}/{q.total_questions} ({q.percentage}%)",
            "timestamp": q.created_at.strftime("%b %d, %H:%M")
        })

    recent_topics = db.query(Topic).join(LearningPath).filter(
        LearningPath.user_id == current_user.id,
        Topic.status == "completed"
    ).order_by(Topic.id.desc()).limit(3).all()

    for t in recent_topics:
        recent_activities.append({
            "type": "lesson",
            "title": f"Lesson Completed: {t.title}",
            "description": f"{t.duration_minutes} min lesson mastered (+100 XP)",
            "timestamp": "Recently"
        })

    if not recent_activities:
        recent_activities.append({
            "type": "welcome",
            "title": "Welcome to LearnPath AI!",
            "description": "Your account was successfully initialized. Start your first lesson or take a quiz.",
            "timestamp": "Just now"
        })

    return {
        "student_name": current_user.name,
        "target_goal": current_user.target_goal,
        "level": current_user.level,
        "xp": current_user.xp,
        "streak_days": current_user.streak_days,
        "daily_goal_minutes": current_user.daily_goal_minutes,
        "daily_completed_minutes": min(current_user.daily_goal_minutes, int(completed_tasks_mins)),
        "total_lessons_completed": total_completed,
        "avg_quiz_score": round(float(avg_score), 1),
        "recent_activities": recent_activities[:5],
        "recommended_topic": recommended_topic,
        "active_path": active_path
    }
