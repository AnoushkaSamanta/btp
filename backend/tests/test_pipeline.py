"""
Tests for scheme rules, red flags, structuring, and pipeline.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.agents.structuring_agent import extract_record
from backend.agents.supervisor import run_pipeline, run_single_agent
from backend.rules.red_flags import evaluate_red_flags
from backend.rules.schemes import match_schemes
from evaluation.metrics import wer


def test_red_flag_preeclampsia_pattern():
    flags = evaluate_red_flags({
        "pregnancy_status": True,
        "swelling": True,
        "blood_pressure": "150/95",
        "bp_status": "high",
        "symptoms": ["swelling"],
        "visit_notes": "pregnant with swelling",
    })
    ids = {f["id"] for f in flags}
    assert "pre_eclampsia_pattern" in ids


def test_scheme_pmmvy_first_child():
    matches = match_schemes({
        "pregnancy_status": True,
        "age": 22,
        "first_living_child": True,
        "aadhaar_linked": True,
        "income_category": "BPL",
        "bpl_card": True,
        "trimester": "1st",
    })
    pmmvy = next(m for m in matches if m["schemeId"] == "pmmvy")
    jssk = next(m for m in matches if m["schemeId"] == "jssk")
    assert pmmvy["status"] == "eligible"
    assert jssk["status"] == "eligible"


def test_structuring_bp_and_name():
    rec = extract_record(
        "Visited Sunita Kumari, 28 years, pregnant 6 months, BP 150/96, swelling in feet, BPL family, first child."
    )
    assert rec["blood_pressure"] == "150/96"
    assert rec["bp_status"] == "high"
    assert rec["swelling"] is True
    assert "swelling" in rec["symptoms"]


def test_pipeline_confirmation_fields():
    out = run_pipeline(
        "Lakshmi Devi 24 years pregnant third trimester BP 140/90 swelling headache. BPL. Refer PHC.",
        language="English",
        patient={"id": "p1", "name": "Lakshmi Devi", "village": "Ramnagar", "trimester": "3rd", "bpl_card": True, "income_category": "BPL", "age": 24},
    )
    assert out["spoken_summary"]
    assert out["worker_facing"] is True
    assert out["record"]["blood_pressure"] == "140/90"
    assert any(f["severity"] == "critical" for f in out["protocol"]["flags"])


def test_wer_zero():
    assert wer("hello world", "hello world") == 0.0


def test_eight_months_maps_third_trimester():
    rec = extract_record("Visited Lakshmi Devi, 24 years, eight months pregnant, BP 140/90, swelling in feet.")
    assert rec["gestational_age_months"] == 8
    assert rec["trimester"] == "3rd"
    assert rec["blood_pressure"] == "140/90"


def test_single_agent_skips_rag_citations():
    transcript = "Lakshmi Devi 24 years pregnant BP 140/90 swelling headache. BPL."
    multi = run_pipeline(transcript)
    single = run_single_agent(transcript)
    assert len(multi["protocol"]["citations"]) >= 1
    assert single["protocol"]["citations"] == []
    assert any(f["severity"] == "critical" for f in multi["protocol"]["flags"])
    assert any(f["severity"] == "critical" for f in single["protocol"]["flags"])
