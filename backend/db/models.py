from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel, Column, JSON


class Patient(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str = ""
    age: Optional[int] = 0
    village: Optional[str] = ""
    phone: Optional[str] = ""
    status: str = "routine"
    trimester: Optional[str] = "1st"
    lmp_date: Optional[str] = ""
    gravida: Optional[int] = 1
    para: Optional[int] = 0
    risk_factors: list = Field(default_factory=list, sa_column=Column(JSON))
    last_visit: Optional[str] = ""
    next_visit: Optional[str] = ""
    blood_group: Optional[str] = "B+"
    weight: Optional[float] = 0.0
    bp: Optional[str] = ""
    hemoglobin: Optional[float] = 0.0
    aadhaar_linked: bool = True
    bpl_card: bool = False
    jsy_registered: bool = False
    pmjay_eligible: bool = False
    income_category: str = "APL"
    children_count: Optional[int] = 0
    first_living_child: bool = False
    gender: Optional[str] = "Female"
    photo_url: Optional[str] = ""
    medications: list = Field(default_factory=list, sa_column=Column(JSON))
    clinical_notes: list = Field(default_factory=list, sa_column=Column(JSON))


class Visit(SQLModel, table=True):
    id: str = Field(primary_key=True)
    patient_id: Optional[str] = None
    patient_name: str = ""
    village: str = ""
    time: str = ""
    date: str = ""
    status: str = "pending"
    type: str = "Home visit"
    notes: str = ""
    trimester: str = "1st"
    transcript: str = ""
    structured_json: dict = Field(default_factory=dict, sa_column=Column(JSON))
    protocol_flags: list = Field(default_factory=list, sa_column=Column(JSON))
    scheme_matches: list = Field(default_factory=list, sa_column=Column(JSON))
    report_text: str = ""
    tasks: list = Field(default_factory=list, sa_column=Column(JSON))
    confirmed: bool = False
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class PendingDraft(SQLModel, table=True):
    id: str = Field(primary_key=True)
    payload: dict = Field(default_factory=dict, sa_column=Column(JSON))
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class Immunization(SQLModel, table=True):
    id: str = Field(primary_key=True)
    patient_name: str
    patient_id: str
    vaccine: str
    dose_number: int = 1
    due_date: str = ""
    status: str = "upcoming"
    age_group: str = ""
    village: str = ""


class SchemeEnrollment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: str
    scheme_id: str
    status: str
    enrolled_date: Optional[str] = None
    benefit_received: Optional[str] = None
    missing_docs: list = Field(default_factory=list, sa_column=Column(JSON))


class AppNotification(SQLModel, table=True):
    id: str = Field(primary_key=True)
    title: str
    message: str
    type: str = "info"
    time: str = ""
    read: bool = False


class FollowUpTask(SQLModel, table=True):
    id: str = Field(primary_key=True)
    visit_id: Optional[str] = None
    patient_id: Optional[str] = None
    patient_name: str = ""
    title: str
    due: str = ""
    priority: str = "routine"
    done: bool = False
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class TrainingProgress(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    worker_id: str = "ASHA-NHM-042"
    module_id: str
    completed_lessons: list = Field(default_factory=list, sa_column=Column(JSON))
    progress_percent: int = 0
    quiz_score: Optional[int] = None
    quiz_passed: bool = False
    completed_at: Optional[str] = None
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class TrainingCertificate(SQLModel, table=True):
    id: str = Field(primary_key=True)
    worker_id: str = "ASHA-NHM-042"
    worker_name: str = "Frontline Health Worker"
    module_id: str
    module_title: str
    score: int = 100
    issued_date: str = Field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    certificate_number: str = ""
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class PatientDocument(SQLModel, table=True):
    id: str = Field(primary_key=True)
    patient_id: str = Field(index=True)
    patient_name: str = ""
    scheme_id: str = Field(index=True)
    document_type: str = Field(index=True)
    document_label: str = ""
    file_name: str = ""
    file_path: str = ""
    file_size: int = 0
    mime_type: str = "application/octet-stream"
    status: str = "uploaded"  # pending | uploaded | verified | rejected
    uploaded_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    verified_at: Optional[str] = None
    verified_by: Optional[str] = None
    notes: Optional[str] = None


