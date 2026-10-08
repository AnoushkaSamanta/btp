"""
Comprehensive test suite for Phase 1 API endpoints and SQLite database connection.
Verifies all endpoints return valid JSON responses according to specifications.
"""

import os
import sys
import io
import pytest
from fastapi.testclient import TestClient

# Ensure workspace root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.main import app
from backend.db.database import engine, get_session, init_db
from backend.schemas.medical_record import MedicalRecord, HouseholdInfo

client = TestClient(app)


def test_database_init_and_session():
    """Verify SQLite database engine initializes and yields a valid session."""
    init_db()
    session_gen = get_session()
    session = next(session_gen)
    assert session is not None
    # Verify execute works
    from sqlalchemy import text
    result = session.exec(text("SELECT 1")).first()
    assert result is not None
    session.close()


def test_root_endpoint():
    """Verify GET / returns JSON service info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Voice-First ASHA Co-Pilot" in data["service"]


def test_health_endpoint():
    """Verify GET /health returns database status and registered endpoints."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "/transcribe" in data["endpoints"]
    assert "/structure" in data["endpoints"]
    assert "/protocol-check" in data["endpoints"]
    assert "/scheme-match" in data["endpoints"]
    assert "/report-generate" in data["endpoints"]
    assert "/full-pipeline" in data["endpoints"]


def test_transcribe_json_missing_file():
    """Verify POST /transcribe with JSON handles nonexistent audio path gracefully."""
    response = client.post(
        "/transcribe",
        json={"audio_path": "non_existent_sample.wav", "language": "hi"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "error"
    assert "error" in data


def test_transcribe_multipart_upload():
    """Verify POST /transcribe with multipart audio file upload returns JSON."""
    fake_audio_content = b"RIFF....WAVEfmt ...."
    audio_file = io.BytesIO(fake_audio_content)

    response = client.post(
        "/transcribe",
        files={"file": ("test.wav", audio_file, "audio/wav")},
        data={"language": "hi"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "transcript" in data
    assert "confidence" in data
    assert "model_used" in data


def test_structure_endpoint():
    """Verify POST /structure extracts structured fields into a valid MedicalRecord."""
    transcript = "Patient Sunita Devi is pregnant with high bp 160/110 and complains of fever and severe bleeding."
    response = client.post(
        "/structure",
        json={"transcript": transcript, "language": "hi"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["raw_transcript"] == transcript
    record = data["record"]
    assert record["pregnancy_status"] is True
    assert record["bp_status"] == "high"
    assert "severe bleeding" in record["symptoms"]
    assert record["follow_up_required"] is True


def test_protocol_check_endpoint_with_red_flags():
    """Verify POST /protocol-check detects red flags and returns JSON."""
    payload = {
        "symptoms": ["severe bleeding", "fever above 102"],
        "query": "What to do for severe bleeding in pregnancy?"
    }
    response = client.post("/protocol-check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["red_flags"]) >= 2
    assert any("Severe Bleeding" in rf for rf in data["red_flags"])
    assert "guidelines" in data
    assert isinstance(data["guidelines"], list)


def test_scheme_match_endpoint():
    """Verify POST /scheme-match correctly evaluates PMMVY, JSY, and JSSK."""
    patient = MedicalRecord(
        patient_name="Pooja Sharma",
        age=24,
        pregnancy_status=True,
        household_info=HouseholdInfo(
            income_category="BPL",
            caste_category="SC"
        )
    )
    response = client.post(
        "/scheme-match",
        json={"patient_record": patient.model_dump()}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    schemes = [s["scheme_name"] for s in data["eligible_schemes"]]
    assert "PMMVY" in schemes
    assert "JSY" in schemes
    assert "JSSK" in schemes


def test_report_generate_endpoint():
    """Verify POST /report-generate generates structured report and tasks."""
    patient = MedicalRecord(
        patient_name="Kavita",
        age=27,
        pregnancy_status=True,
        gestational_age_months=7,
        blood_pressure="140/90",
        bp_status="high",
        symptoms=["headache"]
    )
    red_flags = ["RED FLAG: 'Blood Pressure > 160/110' detected! ACTION: IMMEDIATE REFERRAL"]
    schemes = [{"scheme_name": "PMMVY", "benefit": "₹5,000 cash transfer"}]

    response = client.post(
        "/report-generate",
        json={
            "patient_record": patient.model_dump(),
            "red_flags": red_flags,
            "eligible_schemes": schemes
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "=== ASHA VISIT REPORT ===" in data["report"]
    assert "Kavita" in data["report"]
    assert len(data["tasks"]) > 0
    assert any("Community Health Centre" in task or "referral" in task.lower() for task in data["tasks"])


def test_full_pipeline_endpoint():
    """Verify POST /full-pipeline coordinates the full workflow and returns consolidated JSON."""
    payload = {
        "transcript": "Garbhavati mahila Sunita ko bukhar aur severe bleeding ho raha hai, high BP 160/110",
        "language": "hi"
    }
    response = client.post("/full-pipeline", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["record"]["pregnancy_status"] is True
    assert len(data["red_flags"]) > 0
    assert len(data["eligible_schemes"]) > 0
    assert len(data["tasks"]) > 0
    assert "ASHA VISIT REPORT" in data["report"]
