import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal, migrate_existing_schema
from .services.quiz_service import seed_quiz_bank
from .routers import auth, dashboard, paths, tutor, quizzes, analytics, tasks
from .config import is_gemini_configured

# Create SQLite database tables if not existing
Base.metadata.create_all(bind=engine)
migrate_existing_schema()

# Seed built-in quiz bank
db = SessionLocal()
try:
    seed_quiz_bank(db)
finally:
    db.close()

app = FastAPI(
    title="LearnPath AI API",
    description="Intelligent AI-Powered Personalized Learning Platform Backend",
    version="1.0.0"
)

# Configure CORS so React app can communicate smoothly
configured_origins = os.getenv("FRONTEND_ORIGINS", "").strip()
allowed_origins = [origin.strip().rstrip("/") for origin in configured_origins.split(",") if origin.strip()] if configured_origins else [
    "http://localhost:5173", "http://127.0.0.1:5173",
    "http://localhost:4173", "http://127.0.0.1:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers (supporting both /api prefix for frontend and direct paths)
routers = [auth.router, dashboard.router, paths.router, tutor.router, quizzes.router, analytics.router, tasks.router]
for r in routers:
    app.include_router(r, prefix="/api")
    app.include_router(r)

@app.get("/")
def root():
    return {
        "platform": "LearnPath AI API",
        "status": "online",
        "version": "1.0.0",
        "gemini_ai_configured": is_gemini_configured(),
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "gemini_ai_active": is_gemini_configured()
    }
