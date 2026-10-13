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
