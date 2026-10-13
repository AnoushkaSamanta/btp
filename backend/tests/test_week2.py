"""
Unit and integration test suite for Week 2 Adithya's deliverables:
- Parsing RAG results into structured responses (backend/agents/response_composer.py)
- ASR & RAG component API endpoints:
  - /transcribe endpoint (multipart audio, audio_path JSON, fallbacks)
  - /protocol-check endpoint (RAG guideline retrieval, red flags, citations)
  - /full-pipeline endpoint (end-to-end integration and structured responses)
"""

import os
import sys
import io
import pytest
from fastapi.testclient import TestClient

# Ensure workspace root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.main import app
from backend.agents.response_composer import (
    parse_rag_results,
    compose_structured_response,
    compose_spoken_summary,
)

client = TestClient(app)


# ==============================================================================
# SECTION 1: Response Composer & RAG Parsing Tests
# ==============================================================================

def test_parse_rag_results_empty():
    """Verify parse_rag_results handles empty or None protocol dictionaries safely."""
    res_none = parse_rag_results(None)
    assert res_none["needs_escalation"] is False
    assert res_none["triage_urgency"] == "routine"
    assert len(res_none["critical_flags"]) == 0
    assert len(res_none["citations"]) == 0

    res_empty = parse_rag_results({})
    assert res_empty["needs_escalation"] is False
    assert res_empty["triage_urgency"] == "routine"


def test_parse_rag_results_with_critical_flags():
    """Verify parse_rag_results classifies severe flags into critical triage."""
    protocol_input = {
        "needs_escalation": True,
        "summary": "Severe pre-eclampsia risk detected.",
        "flags": [
            {
                "title": "Severe Pre-Eclampsia",
                "action": "Immediate referral to FRU / District Hospital with MgSO4 loading dose",
                "severity": "critical",
            },
            {
                "title": "Mild Pedal Edema",
                "action": "Advise rest and salt monitoring",
                "severity": "moderate",
            },
        ],
        "citations": [
            {
                "source": "STG_HighRiskPregnancy.pdf",
                "text": "Women presenting with BP >= 160/110 mmHg and proteinuria must receive urgent care.",
                "score": 0.89,
            }
        ],
    }

    parsed = parse_rag_results(protocol_input)
    assert parsed["needs_escalation"] is True
    assert parsed["triage_urgency"] == "critical"
    assert len(parsed["critical_flags"]) == 1
    assert parsed["critical_flags"][0]["title"] == "Severe Pre-Eclampsia"
    assert len(parsed["warnings"]) == 1
    assert parsed["warnings"][0]["title"] == "Mild Pedal Edema"
    assert len(parsed["citations"]) == 1
    assert parsed["citations"][0]["source"] == "STG_HighRiskPregnancy.pdf"
    assert "Immediate referral" in parsed["action_items"][0]


def test_compose_spoken_summary_english():
    """Verify English spoken summary correctly includes patient vitals and flags."""
    record = {
        "patient_name": "Kavita Devi",
        "blood_pressure": "165/110",
        "symptoms": ["severe headache", "blurred vision"],
    }
    protocol = {
        "flags": [{"title": "Severe Pre-Eclampsia", "severity": "critical"}],
        "needs_escalation": True,
    }
    schemes = {"matches": [{"name": "PMMVY", "status": "eligible"}]}
    report = {"tasks": [{"title": "Arrange ambulance to District Hospital"}]}

    spoken = compose_spoken_summary(record, protocol, schemes, report, language="English")
    assert "Kavita Devi" in spoken
    assert "165/110" in spoken
    assert "Severe Pre-Eclampsia" in spoken
    assert "Urgent protocol flags" in spoken
    assert "PMMVY" in spoken


def test_compose_spoken_summary_hindi():
    """Verify Hindi spoken summary generates appropriate localized alerts."""
    record = {
        "patient_name": "Sunita",
        "blood_pressure": "140/90",
        "symptoms": ["fever"],
    }
    protocol = {
        "flags": [{"title": "Fever in pregnancy", "severity": "critical"}],
        "needs_escalation": True,
    }
    schemes = {"matches": [{"name": "JSY", "status": "eligible"}]}
    report = {"tasks": [{"title": "PHC checkup"}]}

    spoken = compose_spoken_summary(record, protocol, schemes, report, language="hi")
    assert "Maine note kiya: Sunita" in spoken
    assert "Turant dhyan" in spoken
    assert "JSY" in spoken


def test_compose_structured_response():
    """Verify compose_structured_response generates complete unified schema."""
    record = {
        "patient_name": "Meena Kumari",
        "age": 26,
        "pregnancy_status": True,
        "gestational_age_months": 7,
        "blood_pressure": "130/85",
        "bp_status": "normal",
        "symptoms": ["fatigue"],
    }
    protocol = {
        "flags": [],
        "citations": [{"source": "ASHA_Module_7.pdf", "text": "Ensure IFA tablets."}],
        "summary": "Routine second trimester checkup.",
        "needs_escalation": False,
    }
    schemes = {
        "matches": [{"name": "PMMVY", "status": "eligible"}],
        "disclaimer": "Verify at Panchayat office.",
    }
    report = {
        "tasks": [{"title": "Distribute IFA tablets"}],
    }

    structured = compose_structured_response(record, protocol, schemes, report)
    assert structured["status"] == "success"
    assert structured["triage_urgency"] == "routine"
    assert structured["patient"]["name"] == "Meena Kumari"
    assert structured["patient"]["pregnancy_status"] is True
    assert structured["protocol_findings"]["summary"] == "Routine second trimester checkup."
    assert "PMMVY" in structured["welfare_schemes"]["eligible"]
    assert "Distribute IFA tablets" in structured["action_plan"]["tasks"]
    assert len(structured["spoken_summary"]) > 0
    assert "ASHA" in structured["disclaimer"]


# ==============================================================================
# SECTION 2: ASR & Protocol Check API Endpoints Tests
# ==============================================================================

def test_transcribe_endpoint_json_missing_file():
    """Verify POST /transcribe with nonexistent audio path returns graceful error."""
    response = client.post(
        "/transcribe",
        json={"audio_path": "non_existent_audio_file.wav", "language": "hi"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "error"
    assert "not found" in data["error"].lower()
    assert data["transcript"] == ""
    assert data["model_used"] == "whisper-fallback"


def test_transcribe_endpoint_multipart_file():
    """Verify POST /transcribe with file upload succeeds and returns valid metadata."""
    dummy_wav = b"RIFF....WAVEfmt ...."
    audio_stream = io.BytesIO(dummy_wav)
    response = client.post(
        "/transcribe",
        files={"file": ("recording.wav", audio_stream, "audio/wav")},
        data={"language": "en"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "transcript" in data
    assert "confidence" in data
    assert "model_used" in data
    assert data["language"] == "en"


def test_transcribe_endpoint_audio_alias():
    """Verify POST /transcribe accepts 'audio' field name as well as 'file'."""
    dummy_wav = b"RIFF....WAVEfmt ...."
    audio_stream = io.BytesIO(dummy_wav)
    response = client.post(
        "/transcribe",
        files={"audio": ("sample_visit.wav", audio_stream, "audio/wav")},
        data={"language": "hi"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "transcript" in data


def test_transcribe_endpoint_base64_payload():
    """Verify POST /transcribe with audio_base64 string decodes and transcribes."""
    import base64
    dummy_wav = b"RIFF....WAVEfmt ...."
    encoded = base64.b64encode(dummy_wav).decode("utf-8")
    response = client.post(
        "/transcribe",
        json={"audio_base64": f"data:audio/wav;base64,{encoded}", "language": "hi"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "transcript" in data


def test_transcribe_endpoint_empty_file_rejected():
    """Verify POST /transcribe rejects empty audio files with HTTP 400."""
    empty_stream = io.BytesIO(b"")
    response = client.post(
        "/transcribe",
        files={"file": ("empty.wav", empty_stream, "audio/wav")},
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_protocol_check_with_critical_symptoms():
    """Verify POST /protocol-check detects severe symptoms, triggers escalation & parses RAG."""
    payload = {
        "symptoms": ["severe bleeding", "severe headache", "convulsions"],
        "query": "Patient having severe bleeding and high BP 160/110 in 3rd trimester",
    }
    response = client.post("/protocol-check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["needs_escalation"] is True
    assert data["triage_urgency"] == "critical"
    assert len(data["red_flags"]) >= 1
    assert any("Severe Bleeding" in f for f in data["red_flags"])
    assert len(data["critical_flags"]) >= 1
    assert "guidelines" in data
    assert "protocol_citations" in data
    assert "parsed_protocol" in data


def test_protocol_check_query_only():
    """Verify POST /protocol-check works when providing only a guideline query."""
    payload = {
        "query": "management of gestational hypertension and preeclampsia"
    }
    response = client.post("/protocol-check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "guidelines" in data
    assert "summary" in data


def test_protocol_check_empty_payload_rejected():
    """Verify POST /protocol-check rejects completely empty payloads with HTTP 400."""
    response = client.post("/protocol-check", json={})
    assert response.status_code == 400


# ==============================================================================
# SECTION 3: Full Pipeline Integration Tests
# ==============================================================================

def test_full_pipeline_text_transcript_critical():
    """Verify POST /full-pipeline processes clinical visit and outputs structured decision support."""
    payload = {
        "transcript": "Visited Sunita Devi 26 years pregnant 6 months with severe bleeding and blood pressure 160/110. BPL family, first child.",
        "language": "en",
    }
    response = client.post("/full-pipeline", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["needs_escalation"] is True
    assert data["triage_urgency"] == "critical"
    assert "Sunita Devi" in data["record"]["patient_name"]
    assert data["record"]["bp_status"] == "high"
    assert len(data["red_flags"]) >= 1
    assert "protocol_citations" in data
    assert "PMMVY" in data["eligible_schemes"] or len(data["eligible_schemes"]) > 0
    assert "ASHA VISIT REPORT" in data["report"]
    assert len(data["tasks"]) > 0
    assert "spoken_summary" in data
    assert "structured_response" in data
    assert data["structured_response"]["status"] == "success"
    assert data["worker_facing"] is True


def test_full_pipeline_audio_file_upload():
    """Verify POST /full-pipeline accepts audio recording upload and executes full pipeline."""
    dummy_wav = b"RIFF....WAVEfmt ...."
    audio_stream = io.BytesIO(dummy_wav)
    response = client.post(
        "/full-pipeline",
        files={"audio": ("visit_audio.wav", audio_stream, "audio/wav")},
        data={"language": "en"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "transcript" in data
    assert "record" in data
    assert "report" in data
    assert "spoken_summary" in data


def test_full_pipeline_hindi_language_support():
    """Verify POST /full-pipeline handles Hindi language configuration and produces Hindi summary."""
    payload = {
        "transcript": "Radha Devi 22 saal pregnant 7 mahina BP 140/90 swelling in feet and headache.",
        "language": "hi",
    }
    response = client.post("/full-pipeline", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "spoken_summary" in data
    assert "Maine note kiya" in data["spoken_summary"] or len(data["spoken_summary"]) > 0


def test_full_pipeline_empty_request_rejected():
    """Verify POST /full-pipeline rejects request without audio or transcript with HTTP 400."""
    response = client.post("/full-pipeline", json={})
    assert response.status_code == 400
    assert "neither audio recording nor text transcript" in response.json()["detail"].lower()


