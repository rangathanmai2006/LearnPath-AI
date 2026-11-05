from typing import List
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, StudyTask
from ..schemas import StudyTaskCreate, StudyTaskResponse
from ..auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Study Planner Tasks"])

@router.get("", response_model=List[StudyTaskResponse])
def get_user_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(StudyTask).filter(StudyTask.user_id == current_user.id).order_by(StudyTask.completed.asc(), StudyTask.id.desc()).all()
    return tasks

@router.post("", response_model=StudyTaskResponse)
def create_study_task(task_data: StudyTaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = StudyTask(
        user_id=current_user.id,
        title=task_data.title.strip(),
        course_name=task_data.course_name.strip(),
        duration_minutes=task_data.duration_minutes,
        time_slot=task_data.time_slot,
        due_date=task_data.due_date,
        priority=task_data.priority,
        completed=False,
        category=task_data.category
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.patch("/{task_id}/toggle", response_model=StudyTaskResponse)
def toggle_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(StudyTask).filter(StudyTask.id == task_id, StudyTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    task.completed = not task.completed
    if task.completed:
        current_user.xp += 20
        task.completed_at = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    else:
        current_user.xp = max(0, current_user.xp - 20)
        task.completed_at = None
    current_user.level = max(1, (current_user.xp // 500) + 1)

    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(StudyTask).filter(StudyTask.id == task_id, StudyTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    db.delete(task)
    db.commit()
    return {"message": "Task removed."}
