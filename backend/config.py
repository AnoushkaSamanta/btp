import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
GUIDELINES_DIR = DATA_DIR / "guidelines"
DB_PATH = Path(os.getenv("ASHA_DB_PATH", str(DATA_DIR / "asha.db")))
OLLAMA_MODEL = os.getenv("ASHA_OLLAMA_MODEL", "llama3")
WHISPER_MODEL = os.getenv("ASHA_WHISPER_MODEL", "small")
USE_LLM = os.getenv("ASHA_USE_LLM", "false").lower() in {"1", "true", "yes"}

# Cross-origin access is disabled outside the local development origins unless
# an operator explicitly configures the public frontend origin(s).
_configured_origins = os.getenv("ASHA_CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000")
CORS_ORIGINS = [origin.strip().rstrip("/") for origin in _configured_origins.split(",") if origin.strip()]
if "*" not in CORS_ORIGINS:
    CORS_ORIGINS.append("*")


# Keep uploaded audio bounded in memory and on disk. Operators can lower this
# limit for constrained deployments, but should not raise it without review.
MAX_AUDIO_UPLOAD_BYTES = int(os.getenv("ASHA_MAX_AUDIO_UPLOAD_BYTES", str(20 * 1024 * 1024)))
