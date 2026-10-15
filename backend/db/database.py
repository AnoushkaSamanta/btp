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


class SessionWrapper(Session):
    def __iter__(self):
        yield self

    def __next__(self):
        return self


def get_session():
    return SessionWrapper(engine)


def create_patient_if_not_exists(
    session: Session,
    name: str,
    village: str = "",
    age: int = 0,
    bp: str = "",
    status: str = "routine",
    trimester: str = "1st",
    risk_factors: list = None,
    blood_group: str = "B+",
    **kwargs
):
    import uuid
    from datetime import datetime
    from sqlmodel import select
    from backend.db.models import Patient

    clean_name = (name or "").strip()
    clean_village = (village or "").strip()
    if not clean_name:
        clean_name = "Unknown Patient"

    stmt = select(Patient).where(Patient.name.ilike(clean_name))
    if clean_village:
        stmt = stmt.where(Patient.village.ilike(clean_village))
    
    existing = session.exec(stmt).first()
    if not existing and not clean_village:
        existing = session.exec(select(Patient).where(Patient.name.ilike(clean_name))).first()

    now_date = datetime.utcnow().date().isoformat()
    if existing:
        if bp:
            existing.bp = bp
        if village and not existing.village:
            existing.village = village
        if age and not existing.age:
            existing.age = age
        if trimester:
            existing.trimester = trimester
        if status in {"critical", "high-risk"} or existing.status == "routine":
            existing.status = status
        if risk_factors:
            cur_rf = list(existing.risk_factors or [])
            for rf in risk_factors:
                if rf not in cur_rf:
                    cur_rf.append(rf)
            existing.risk_factors = cur_rf
        existing.last_visit = now_date
        session.add(existing)
        return existing

    # Create new patient
    pid = f"p{uuid.uuid4().hex[:8]}"
    new_patient = Patient(
        id=pid,
        name=clean_name,
        village=clean_village,
        age=age or 0,
        bp=bp or "",
        status=status or "routine",
        trimester=trimester or "1st",
        blood_group=blood_group or "B+",
        risk_factors=risk_factors or [],
        last_visit=now_date,
        first_living_child=kwargs.get("first_living_child", False),
        bpl_card=kwargs.get("bpl_card", False),
        income_category=kwargs.get("income_category", "APL"),
        gender=kwargs.get("gender", "Female"),
    )
    session.add(new_patient)
    return new_patient


def create_visit(
    session: Session,
    patient_id: str,
    patient_name: str,
    village: str = "",
    bp: str = "",
    notes: str = "",
    structured_json: dict = None,
    protocol_flags: list = None,
    scheme_matches: list = None,
    tasks: list = None,
    transcript: str = "",
    report_text: str = "",
    trimester: str = "1st",
):
    import uuid
    from datetime import datetime
    from backend.db.models import Visit

    now = datetime.utcnow()
    vid = f"vis-{uuid.uuid4().hex[:10]}"
    visit = Visit(
        id=vid,
        patient_id=patient_id,
        patient_name=patient_name or "Unknown Patient",
        village=village or "",
        time=now.strftime("%H:%M"),
        date=now.date().isoformat(),
        status="completed",
        type="Voice-documented home visit",
        notes=notes or report_text or "",
        trimester=trimester or "1st",
        transcript=transcript or "",
        structured_json=structured_json or {},
        protocol_flags=protocol_flags or [],
        scheme_matches=scheme_matches or [],
        report_text=report_text or "",
        tasks=tasks or [],
        confirmed=True,
    )
    session.add(visit)
    return visit

