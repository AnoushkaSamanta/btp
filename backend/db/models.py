from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel, Column, JSON


class Patient(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    age: int = 0
    village: str = ""
    phone: str = ""
    status: str = "routine"
    trimester: str = "1st"
    lmp_date: str = ""
    gravida: int = 1
    para: int = 0
    risk_factors: list = Field(default_factory=list, sa_column=Column(JSON))
    last_visit: str = ""
    next_visit: str = ""
    blood_group: str = ""
    weight: float = 0.0
    bp: str = ""
    hemoglobin: float = 0.0
    aadhaar_linked: bool = True
    bpl_card: bool = False
    jsy_registered: bool = False
    pmjay_eligible: bool = False
    income_category: str = "APL"
    children_count: int = 0
    first_living_child: bool = False
    gender: str = "Female"


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
