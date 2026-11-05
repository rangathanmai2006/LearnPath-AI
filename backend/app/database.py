from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import DATABASE_URL

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def migrate_existing_schema():
    """Apply additive SQLite changes without dropping or rewriting existing records."""
    inspector = inspect(engine)
    if "study_tasks" in inspector.get_table_names():
        columns = {column["name"] for column in inspector.get_columns("study_tasks")}
        if "completed_at" not in columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE study_tasks ADD COLUMN completed_at DATETIME"))

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
