from sqlmodel import SQLModel, Session, create_engine

from backend.config import DATA_DIR, DB_PATH

DATA_DIR.mkdir(parents=True, exist_ok=True)

engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})


def init_db() -> None:
    from backend.db import models  # noqa: F401
    from backend.db.seed import refresh_demo_calendar, seed_if_empty

    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        seed_if_empty(session)
        refresh_demo_calendar(session)


def get_session() -> Session:
    return Session(engine)
