from typing import Any, Dict, List, Optional

from backend.agents.protocol_check_agent import check_protocols
from backend.agents.report_generator import generate_report
from backend.agents.response_composer import compose_spoken_summary
from backend.agents.scheme_match_agent import match_household
from backend.agents.structuring_agent import extract_record
from backend.nlp.normalize import detect_language_mix, normalize_transcript
from backend.rules.red_flags import evaluate_red_flags


def classify_intents(transcript: str) -> List[str]:
    t = transcript.lower()
    intents = ["structuring", "report"]
    if any(k in t for k in ["scheme", "yojana", "pmmvy", "jsy", "jssk", "bpl", "eligible"]):
        intents.append("schemes")
    else:
        intents.append("schemes")
    if any(k in t for k in ["danger", "refer", "bp", "swelling", "bleed", "fever", "protocol", "anc"]):
        intents.append("protocol")
    else:
        intents.append("protocol")
    return sorted(set(intents))


def run_pipeline(
    transcript: str,
    language: str = "English",
    patient: Optional[Dict[str, Any]] = None,
    mode: str = "visit",
) -> Dict[str, Any]:
    """Supervisor: normalize → route specialist agents (parallel conceptually) → compose."""
    normalized = normalize_transcript(transcript)
    lang_info = detect_language_mix(normalized)
    intents = classify_intents(normalized)

    record = extract_record(normalized, patient)
    protocol = check_protocols(record, normalized) if "protocol" in intents else {"flags": [], "citations": [], "summary": "", "needs_escalation": False}
    schemes = match_household(record, patient) if "schemes" in intents else {"matches": [], "summary": "", "disclaimer": ""}
    report = generate_report(record, protocol, schemes)
    spoken = compose_spoken_summary(record, protocol, schemes, report, language=language)

    return {
        "mode": mode,
        "normalized_transcript": normalized,
        "language_mix": lang_info,
        "intents": intents,
        "record": record,
        "protocol": protocol,
        "schemes": schemes,
        "report": report["report"],
        "tasks": report["tasks"],
        "spoken_summary": spoken,
        "worker_facing": True,
        "safety_note": "Outputs are for the trained health worker only. Confirm before saving. Scheme matches are preliminary.",
    }


def run_single_agent(
    transcript: str,
    language: str = "English",
    patient: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Monolithic ablation path: one extract + red flags only (no RAG citations).
    Used to compare specialist routing vs a single combined pass.
    """
    normalized = normalize_transcript(transcript)
    lang_info = detect_language_mix(normalized)
    record = extract_record(normalized, patient)
    flags = evaluate_red_flags(record)
    protocol = {
        "flags": flags,
        "citations": [],
        "summary": "Single-agent path: red-flag rules only; guideline RAG skipped.",
        "needs_escalation": any(f.get("severity") == "critical" for f in flags),
    }
    schemes = match_household(record, patient)
    report = generate_report(record, protocol, schemes)
    spoken = compose_spoken_summary(record, protocol, schemes, report, language=language)
    return {
        "mode": "single_agent",
        "normalized_transcript": normalized,
        "language_mix": lang_info,
        "intents": ["monolithic"],
        "record": record,
        "protocol": protocol,
        "schemes": schemes,
        "report": report["report"],
        "tasks": report["tasks"],
        "spoken_summary": spoken,
        "worker_facing": True,
        "safety_note": "Ablation (single-agent). Not used for production saves.",
    }
