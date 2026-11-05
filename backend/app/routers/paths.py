from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, LearningPath, Topic
from ..schemas import LearningPathResponse, GeneratePathRequest, TopicStatusUpdate, TopicResponse
from ..auth import get_current_user
from ..services.roadmap_service import generate_roadmap

router = APIRouter(prefix="/paths", tags=["Learning Paths"])

@router.get("", response_model=List[LearningPathResponse])
def get_user_paths(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    paths = db.query(LearningPath).filter(LearningPath.user_id == current_user.id).order_by(LearningPath.created_at.desc()).all()
    return paths

@router.post("/generate", response_model=LearningPathResponse)
def create_path(request: GeneratePathRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal_text = (request.custom_goal or request.goal or request.learning_goal or "").strip()
    subject_text = (request.subject or "").strip()

    if not subject_text:
        if goal_text:
            subject_text = goal_text
        else:
            raise HTTPException(status_code=400, detail="Please enter a learning goal or subject.")

    roadmap_data = generate_roadmap(subject_text, request.level, custom_goal=goal_text, goal=goal_text)

    new_path = LearningPath(
        user_id=current_user.id,
        title=roadmap_data["title"],
        subject=roadmap_data["subject"],
        level=roadmap_data["level"],
        progress=0,
        total_topics=len(roadmap_data["topics"]),
        completed_topics=0,
        description=roadmap_data["description"]
    )
    db.add(new_path)
    db.commit()
    db.refresh(new_path)

    for t in roadmap_data["topics"]:
        topic = Topic(
            learning_path_id=new_path.id,
            title=t["title"],
            order=t["order"],
            status=t["status"],
            duration_minutes=t["duration_minutes"],
            difficulty=t["difficulty"],
            summary=t.get("summary", ""),
            description=t.get("description", t.get("summary", "")),
            learning_objectives=t.get("learning_objectives", ""),
            mastery_score=0
        )
        db.add(topic)

    # Award XP for generating a new path
    current_user.xp += 50
    db.commit()
    db.refresh(new_path)
    # Eager load topics
    new_path = db.query(LearningPath).filter(LearningPath.id == new_path.id).first()
    return new_path

@router.get("/{path_id}", response_model=LearningPathResponse)
def get_path_details(path_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    path = db.query(LearningPath).filter(LearningPath.id == path_id, LearningPath.user_id == current_user.id).first()
    if not path:
        raise HTTPException(status_code=404, detail="Learning path not found.")
    return path

@router.patch("/topics/{topic_id}/status", response_model=TopicResponse)
def update_topic_status(topic_id: int, update: TopicStatusUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    topic = db.query(Topic).join(LearningPath).filter(Topic.id == topic_id, LearningPath.user_id == current_user.id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found.")

    old_status = topic.status
    if old_status == "locked":
        raise HTTPException(status_code=409, detail="Complete the previous topic before unlocking this one.")
    topic.status = update.status
    if update.mastery_score is not None:
        topic.mastery_score = update.mastery_score

    # If completed and wasn't before, unlock next topic and award XP
    path = topic.learning_path
    if update.status == "completed" and old_status != "completed":
        current_user.xp += 100
        # Unlock next topic
        next_topic = db.query(Topic).filter(
            Topic.learning_path_id == path.id,
            Topic.order == topic.order + 1
        ).first()
        if next_topic and next_topic.status == "locked":
            next_topic.status = "in-progress"
    elif update.status == "in-progress" and old_status == "completed":
        later_completion = db.query(Topic).filter(
            Topic.learning_path_id == path.id,
            Topic.order > topic.order,
            Topic.status == "completed",
        ).first()
        if later_completion:
            raise HTTPException(status_code=409, detail="Undo later completed topics before undoing this one.")
        current_user.xp = max(0, current_user.xp - 100)
        current_user.level = max(1, (current_user.xp // 500) + 1)
        next_topic = db.query(Topic).filter(
            Topic.learning_path_id == path.id,
            Topic.order == topic.order + 1,
        ).first()
        if next_topic and next_topic.status == "in-progress":
            next_topic.status = "locked"

    # Recalculate path progress after flushing dirty changes
    db.flush()
    completed_count = db.query(Topic).filter(
        Topic.learning_path_id == path.id,
        Topic.status == "completed"
    ).count()
    total_count = db.query(Topic).filter(Topic.learning_path_id == path.id).count()

    path.completed_topics = completed_count
    path.total_topics = total_count
    path.progress = int((completed_count / total_count) * 100) if total_count > 0 else 0

    db.commit()
    db.refresh(topic)

    # Return topic along with calculated path progress
    return {
        "id": topic.id,
        "learning_path_id": topic.learning_path_id,
        "title": topic.title,
        "order": topic.order,
        "status": topic.status,
        "duration_minutes": topic.duration_minutes,
        "difficulty": topic.difficulty,
        "summary": topic.summary or "",
        "description": topic.description or "",
        "learning_objectives": topic.learning_objectives or "",
        "mastery_score": topic.mastery_score,
        "path_progress": path.progress,
        "path_completed_topics": path.completed_topics,
        "path_total_topics": path.total_topics,
    }

@router.delete("/{path_id}")
def delete_path(path_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    path = db.query(LearningPath).filter(LearningPath.id == path_id, LearningPath.user_id == current_user.id).first()
    if not path:
        raise HTTPException(status_code=404, detail="Learning path not found.")
    db.delete(path)
    db.commit()
    return {"message": "Learning path deleted successfully."}
