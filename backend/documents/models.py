"""
SQLModel schema for Patient Scheme Documents.
Tracks uploads, status (pending, uploaded, verified, rejected), file paths, verification stamps, and notes.
"""
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


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
