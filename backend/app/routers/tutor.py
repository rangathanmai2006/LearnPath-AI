from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, ChatMessage
from ..schemas import ChatMessageCreate, ChatMessageResponse, TutorStatusResponse
from ..auth import get_current_user
from ..config import is_gemini_configured
from ..services.ai_service import generate_tutor_response, PRIMARY_MODEL

router = APIRouter(prefix="/tutor", tags=["AI Tutor"])

@router.get("/status", response_model=TutorStatusResponse)
def get_tutor_status():
    configured = is_gemini_configured()
    return {
        "ai_configured": configured,
        "model": PRIMARY_MODEL if configured else "unavailable",
        "notice": None if configured else "GEMINI_API_KEY is not set in the backend environment. Live AI Tutor responses are unavailable."
    }

@router.get("/history", response_model=List[ChatMessageResponse])
def get_chat_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).order_by(ChatMessage.created_at.asc()).all()
    # If no messages yet, seed a friendly greeting from the tutor
    if not messages:
        greeting = ChatMessage(
            user_id=current_user.id,
            sender="ai",
            message=f"Hello {current_user.name}! I am your LearnPath AI Tutor. What concept would you like to explore or clarify today?"
        )
        db.add(greeting)
        db.commit()
        db.refresh(greeting)
        messages = [greeting]
    return messages

@router.post("/chat", response_model=ChatMessageResponse)
def send_chat_message(data: ChatMessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    previous_messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.created_at.desc()).limit(8).all()
    previous_messages.reverse()
    # Save user message
    user_msg = ChatMessage(
        user_id=current_user.id,
        sender="user",
        message=data.message.strip()
    )
    db.add(user_msg)
    db.commit()

    # Call AI service
    ai_result = generate_tutor_response(
        data.message,
        data.topic_context or "",
        conversation_history=[{"sender": item.sender, "message": item.message} for item in previous_messages],
    )

    if not ai_result.get("is_live_ai"):
        raise HTTPException(status_code=503, detail=ai_result["message"])

    # Save AI reply
    ai_msg = ChatMessage(
        user_id=current_user.id,
        sender="ai",
        message=ai_result["message"],
        formula=ai_result.get("formula"),
        code_snippet=ai_result.get("code_snippet")
    )
    db.add(ai_msg)

    # Award XP for engaging with AI tutor
    current_user.xp += 15
    db.commit()
    db.refresh(ai_msg)
    return ai_msg

@router.delete("/history")
def clear_chat_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Chat history cleared."}
