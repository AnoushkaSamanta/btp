"""
Database connection and session management for Voice-First ASHA Co-Pilot.
Provides clean SQLite connection setup using SQLModel / SQLAlchemy.
"""

import os
import logging
from typing import Generator
from sqlmodel import SQLModel, create_engine, Session

logger = logging.getLogger(__name__)

# Base directory for the project
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "asha_copilot.db")

# Allow database URL override via environment variable
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")

# For SQLite, check_same_thread=False is needed for multi-threaded FastAPI workers
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args=connect_args
)


def init_db() -> None:
    """
    Initialize database and create tables.
    Gracefully imports models if defined by Anoushka in backend.db.models.
    """
    try:
        # Check if Anoushka's models have been defined
        import importlib
        models_module = importlib.import_module("backend.db.models")
        logger.info("Loaded models from backend.db.models")
    except (ImportError, ModuleNotFoundError):
        logger.info("backend.db.models not yet defined by teammate; database engine initialized.")

    # Create tables defined in SQLModel metadata (if any)
    SQLModel.metadata.create_all(engine)
    logger.info("Database initialized successfully.")


def get_session() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields an active database session.
    """
    with Session(engine) as session:
        yield session


# Convenience alias for dependency injection
get_db = get_session
