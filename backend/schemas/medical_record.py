"""
Pydantic schemas for medical records and visit data collected by ASHA workers.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


class HouseholdInfo(BaseModel):
    family_size: Optional[int] = Field(default=None, ge=1, description="Total number of family members")
    income_category: Optional[str] = Field(default=None, description="BPL, APL, etc.")
    caste_category: Optional[str] = Field(default=None, description="SC, ST, OBC, General")
    children_count: Optional[int] = Field(default=None, ge=0, description="Number of children in household")
    existing_schemes: Optional[List[str]] = Field(default_factory=list, description="Government health/welfare schemes enrolled")


class MedicalRecord(BaseModel):
    patient_id: Optional[str] = Field(default=None, description="Unique identifier for patient")
    patient_name: Optional[str] = Field(default=None, description="Full name of the patient")
    age: Optional[int] = Field(default=None, ge=0, le=120, description="Age in years (0-120)")
    gender: Optional[str] = Field(default=None, description="Gender (Female, Male, Other)")
    pregnancy_status: Optional[bool] = Field(default=None, description="Whether patient is currently pregnant")
    gestational_age_months: Optional[int] = Field(default=None, ge=1, le=10, description="Gestational age in months (1-10)")
    blood_pressure: Optional[str] = Field(default=None, description="BP measurement format (e.g., '120/80' or '200')")
    bp_status: Optional[str] = Field(default=None, description="BP status rating ('normal', 'high', 'low')")
    blood_sugar: Optional[int] = Field(default=None, ge=10, le=1000, description="Blood sugar level in mg/dL")
    sugar_status: Optional[str] = Field(default=None, description="Sugar status ('normal', 'high', 'critical')")
    location: Optional[str] = Field(default=None, description="Extracted city, village, or location")
    swelling: Optional[bool] = Field(default=None, description="Presence of edema/swelling")
    temperature: Optional[float] = Field(default=None, description="Body temperature in Fahrenheit or Celsius")
    symptoms: Optional[List[str]] = Field(default_factory=list, description="List of recorded symptoms")
    medications: Optional[List[str]] = Field(default_factory=list, description="List of current medications")
    household_info: Optional[HouseholdInfo] = Field(default=None, description="Household information")
    visit_date: Optional[str] = Field(default=None, description="Date of visit (ISO format YYYY-MM-DD)")
    visit_notes: Optional[str] = Field(default=None, description="Freeform visit notes")
    language_detected: Optional[str] = Field(default=None, description="Detected input language code: te, hi, ta, en, or mixed")
    follow_up_required: Optional[bool] = Field(default=False, description="Whether follow-up visit is needed")

    @field_validator('bp_status')
    @classmethod
    def validate_bp_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_lower = v.lower()
            allowed = ["normal", "high", "low", "invalid_reading", "invalid"]
            if v_lower not in allowed:
                raise ValueError(f"bp_status must be one of {allowed}, got '{v}'")
            return v_lower
        return v

    @field_validator('sugar_status')
    @classmethod
    def validate_sugar_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_lower = v.lower()
            allowed = ["normal", "pre-diabetic", "diabetic", "high", "critical", "low"]
            if v_lower not in allowed:
                raise ValueError(f"sugar_status must be one of {allowed}, got '{v}'")
            return v_lower
        return v


class VisitRecord(BaseModel):
    patient: MedicalRecord
    transcript: str = Field(..., description="Audio transcription text")
    timestamp: str = Field(..., description="Timestamp of record creation")
    audio_path: Optional[str] = Field(default=None, description="Path to recorded audio file")
