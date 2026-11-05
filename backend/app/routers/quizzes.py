import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, QuizQuestion, QuizAttempt
from ..schemas import (
    QuizQuestionResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
    QuestionResult,
    QuizAttemptResponse
)
from ..auth import get_current_user
from ..services.quiz_service import get_questions_for_topic

router = APIRouter(prefix="/quizzes", tags=["Quizzes & Assessments"])

@router.get("/questions", response_model=List[QuizQuestionResponse])
def get_quiz_questions(topic: str = Query(min_length=1, max_length=150), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    questions = get_questions_for_topic(db, topic)[:5]
    results = []
    for q in questions:
        try:
            options = json.loads(q.options_json)
        except Exception:
            options = ["Option A", "Option B", "Option C", "Option D"]
        results.append({
            "id": q.id,
            "topic_name": q.topic_name,
            "question": q.question,
            "options": options,
            "is_ai_generated": q.is_ai_generated
        })
    return results

@router.post("/submit", response_model=QuizSubmitResponse)
def submit_quiz(submission: QuizSubmitRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    answer_ids = [item.question_id for item in submission.answers]
    if len(answer_ids) != len(set(answer_ids)):
        raise HTTPException(status_code=400, detail="Each quiz question can only be answered once.")

    expected_questions = get_questions_for_topic(db, submission.topic_name)[:5]
    expected_ids = {question.id for question in expected_questions}
    if not expected_ids or set(answer_ids) != expected_ids:
        raise HTTPException(status_code=400, detail="Submit one answer for every question in this quiz.")

    score = 0
    results_detail: List[QuestionResult] = []

    for item in submission.answers:
        question = db.query(QuizQuestion).filter(QuizQuestion.id == item.question_id).first()
        if not question:
            raise HTTPException(status_code=400, detail="A submitted question is no longer available.")
        try:
            options = json.loads(question.options_json)
        except (TypeError, json.JSONDecodeError):
            raise HTTPException(status_code=500, detail="Quiz question data is invalid.")
        if item.selected_index >= len(options):
            raise HTTPException(status_code=422, detail="Selected answer is not a valid option.")

        is_correct = (item.selected_index == question.correct_index)
        if is_correct:
            score += 1

        results_detail.append(QuestionResult(
            question_id=question.id,
            question=question.question,
            selected_index=item.selected_index,
            correct_index=question.correct_index,
            is_correct=is_correct,
            explanation=question.explanation
        ))

    total = len(results_detail)
    percentage = round((score / total) * 100, 1) if total > 0 else 0.0

    # Calculate XP (+25 XP per correct answer)
    xp_earned = score * 25
    current_user.xp += xp_earned

    # Check level up (every 500 XP increases 1 level)
    current_user.level = max(1, (current_user.xp // 500) + 1)

    # Save attempt in database
    attempt = QuizAttempt(
        user_id=current_user.id,
        topic_name=submission.topic_name,
        score=score,
        total_questions=total,
        percentage=percentage,
        answers_json=json.dumps([{"qid": a.question_id, "sel": a.selected_index} for a in submission.answers])
    )
    db.add(attempt)
    db.commit()

    return QuizSubmitResponse(
        topic_name=submission.topic_name,
        score=score,
        total_questions=total,
        percentage=percentage,
        xp_earned=xp_earned,
        results=results_detail
    )

@router.get("/history", response_model=List[QuizAttemptResponse])
def get_quiz_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == current_user.id).order_by(QuizAttempt.created_at.desc()).all()
    return attempts
