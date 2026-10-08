"""
Unit test suite for Week 1 Rohan's deliverables:
- Audio preprocessor logic fallback & validation
- ASR Transcriber
- Medical Record Pydantic Schemas
"""

import os
import sys
import tempfile
import numpy as np
import pytest
from pydantic import ValidationError

# Ensure backend package is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.asr.preprocessor import preprocess_audio, validate_audio, normalize_volume, reduce_noise_spectral_gating
from backend.asr.transcriber import transcribe, transcribe_with_fallback
from backend.schemas.medical_record import MedicalRecord, HouseholdInfo, VisitRecord


def test_validate_audio_nonexistent():
    """Test audio validation utility with missing file."""
    invalid_res = validate_audio("non_existent_file.wav")
    assert invalid_res["is_valid"] is False
    assert "does not exist" in invalid_res["error_message"] or "Invalid" in invalid_res["error_message"]


def test_normalize_volume():
    """Test volume normalization with dummy numpy signal."""
    signal = np.array([0.1, -0.2, 0.3, -0.4, 0.5], dtype=np.float32)
    normalized = normalize_volume(signal, target_dBFS=-20.0)
    assert len(normalized) == len(signal)
    assert np.max(np.abs(normalized)) <= 1.0


def test_reduce_noise_spectral_gating():
    """Test noise reduction function with dummy numpy signal."""
    signal = np.random.normal(0, 0.1, 16000).astype(np.float32)
    clean_signal = reduce_noise_spectral_gating(signal, sr=16000)
    assert len(clean_signal) > 0


def test_transcribe_fallback_nonexistent():
    """Test transcribe fallback with missing file."""
    res = transcribe_with_fallback("non_existent_audio.wav")
    assert res["status"] == "error"
    assert res["transcript"] == ""
    assert res["confidence"] is None


def test_medical_record_valid():
    """Test creating a valid MedicalRecord object."""
    record = MedicalRecord(
        patient_id="PAT123",
        patient_name="Sunita Devi",
        age=28,
        gender="Female",
        pregnancy_status=True,
        gestational_age_months=6,
        blood_pressure="120/80",
        bp_status="normal",
        symptoms=["headache", "fatigue"],
        medications=["Folic Acid", "Iron Supplement"],
        household_info=HouseholdInfo(
            family_size=5,
            income_category="BPL",
            caste_category="OBC",
            children_count=2,
            existing_schemes=["PMMVY"]
        )
    )

    assert record.patient_name == "Sunita Devi"
    assert record.age == 28
    assert record.bp_status == "normal"
    assert record.household_info.income_category == "BPL"


def test_medical_record_invalid_age():
    """Test validation failure for age out of bounds."""
    with pytest.raises(ValidationError):
        MedicalRecord(age=150)


def test_medical_record_invalid_gestational_age():
    """Test validation failure for gestational age out of bounds."""
    with pytest.raises(ValidationError):
        MedicalRecord(gestational_age_months=12)


def test_medical_record_invalid_bp_status():
    """Test validation failure for invalid bp_status string."""
    with pytest.raises(ValidationError):
        MedicalRecord(bp_status="extremely_high")


def test_visit_record():
    """Test creating a VisitRecord object containing MedicalRecord."""
    med_rec = MedicalRecord(patient_name="Anita", age=30)
    visit = VisitRecord(
        patient=med_rec,
        transcript="Patient complains of minor fever.",
        timestamp="2026-09-23T23:00:00Z"
    )
    assert visit.patient.patient_name == "Anita"
    assert visit.transcript == "Patient complains of minor fever."


if __name__ == "__main__":
    pytest.main(["-v", __file__])
