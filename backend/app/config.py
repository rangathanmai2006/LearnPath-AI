import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
DB_PATH = BASE_DIR / "learnpath.db"

def load_dotenv_file():
    """
    Native, zero-dependency .env loader that checks backend/.env and root .env.
    Populates os.environ without overwriting existing environment variables.
    """
    env_paths = [
        BASE_DIR / ".env",
        PROJECT_ROOT / ".env"
    ]
    for env_path in env_paths:
        if env_path.is_file():
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#"):
                            continue
                        if "=" in line:
                            key, val = line.split("=", 1)
                            key = key.strip()
                            val = val.strip().strip("'\"")
                            if key and key not in os.environ:
                                os.environ[key] = val
            except Exception:
                pass

load_dotenv_file()

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")
APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
JWT_SECRET = os.getenv("JWT_SECRET", "").strip()
if APP_ENV == "production" and (len(JWT_SECRET) < 32 or JWT_SECRET == "learnpath-ai-super-secret-dev-key-change-in-prod-2026"):
    raise RuntimeError("Set a unique JWT_SECRET of at least 32 characters before starting in production.")
if not JWT_SECRET:
    JWT_SECRET = "learnpath-ai-super-secret-dev-key-change-in-prod-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def get_gemini_api_key() -> str:
    """Dynamically reads the Gemini API key from environment."""
    return os.getenv("GEMINI_API_KEY", "").strip()

GEMINI_API_KEY = get_gemini_api_key()

def is_gemini_configured() -> bool:
    """Checks whether a valid Gemini API key is configured."""
    key = get_gemini_api_key()
    return bool(key and len(key) > 10)
