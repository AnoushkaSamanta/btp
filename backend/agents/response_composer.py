"""
Response Composer Agent for ASHA Co-Pilot (Week 2 Deliverable - Adithya).
Parses RAG retrieval results, protocol check alerts, and medical records
into standardized, structured responses and multi-lingual spoken summaries.
"""

from typing import Any, Dict, List, Optional


def parse_rag_results(protocol: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Parses raw RAG citations, guideline snippets, and protocol flags
    into a standardized clinical decision support structure.
    
    Categorizes protocol findings into critical flags, non-critical warnings,
    actionable recommendations, and formatted guideline citations.
    """
    if not protocol:
        return {
            "needs_escalation": False,
            "triage_urgency": "routine",
            "summary": "No specific protocol flags or guideline matches found.",
            "critical_flags": [],
            "warnings": [],
            "citations": [],
            "guideline_excerpts": [],
            "action_items": [],
        }

    flags = protocol.get("flags") or []
    citations_raw = protocol.get("citations") or []
    summary_text = protocol.get("summary") or ""
    needs_escalation = bool(protocol.get("needs_escalation", False))

    critical_flags = []
    warnings = []
    action_items = []

    for f in flags:
        if isinstance(f, dict):
            severity = str(f.get("severity", "")).lower()
            title = f.get("title") or f.get("flag") or "Protocol Alert"
            action = f.get("action") or f.get("recommendation") or "Review protocol"
            flag_entry = {
                "title": title,
                "action": action,
                "severity": severity or ("critical" if needs_escalation else "moderate"),
            }
            if severity == "critical":
                critical_flags.append(flag_entry)
            else:
                warnings.append(flag_entry)
            
            if action and action not in action_items:
                action_items.append(action)
        elif isinstance(f, str):
            if "critical" in f.lower() or "severe" in f.lower() or "emergency" in f.lower():
                critical_flags.append({"title": f, "action": "Immediate referral", "severity": "critical"})
            else:
                warnings.append({"title": f, "action": "Monitor and document", "severity": "moderate"})

    # Parse and format citations
    formatted_citations = []
    guideline_excerpts = []
    for c in citations_raw:
        if isinstance(c, dict):
            src = c.get("source") or "Official Guideline"
            txt = c.get("text") or c.get("content") or ""
            score = c.get("score")
            citation_entry = {
                "source": src,
                "excerpt": txt[:300].strip(),
                "full_text": txt.strip(),
            }
            if score is not None:
                citation_entry["score"] = score
            formatted_citations.append(citation_entry)
            if txt:
                guideline_excerpts.append(f"{src}: {txt[:200].strip()}...")
        elif isinstance(c, str):
            formatted_citations.append({
                "source": "Official Guideline",
                "excerpt": c[:300].strip(),
                "full_text": c.strip(),
            })
            guideline_excerpts.append(c[:200].strip())

    if critical_flags:
        triage_urgency = "critical"
        needs_escalation = True
    elif warnings:
        triage_urgency = "moderate"
    else:
        triage_urgency = "routine"

    return {
        "needs_escalation": needs_escalation,
        "triage_urgency": triage_urgency,
        "summary": summary_text or ("Critical protocol escalation required." if needs_escalation else "Standard protocol checks passed."),
        "critical_flags": critical_flags,
        "warnings": warnings,
        "citations": formatted_citations,
        "guideline_excerpts": guideline_excerpts,
        "action_items": action_items,
    }


def compose_structured_response(
    record: Dict[str, Any],
    protocol: Dict[str, Any],
    schemes: Optional[Dict[str, Any]] = None,
    report: Optional[Dict[str, Any]] = None,
    language: str = "English",
) -> Dict[str, Any]:
    """
    Synthesizes multi-agent pipeline outputs into a unified structured clinical response.
    Combines structured records, parsed RAG findings, scheme eligibility, and action plans.
    """
    parsed_rag = parse_rag_results(protocol)
    schemes_dict = schemes or {}
    report_dict = report or {}

    matches = schemes_dict.get("matches") or []
    eligible_schemes = [
        m["name"] for m in matches if isinstance(m, dict) and m.get("status") in {"eligible", "enrolled"}
    ]
    if not eligible_schemes and isinstance(schemes_dict.get("eligible"), list):
        eligible_schemes = [s for s in schemes_dict["eligible"] if isinstance(s, str)]

    tasks = report_dict.get("tasks") or []
    formatted_tasks = []
    for t in tasks:
        if isinstance(t, dict):
            formatted_tasks.append(t.get("title") or t.get("action") or str(t))
        elif isinstance(t, str):
            formatted_tasks.append(t)

    # Derive spoken summary
    spoken = compose_spoken_summary(record, protocol, schemes_dict, report_dict, language=language)

    return {
        "status": "success",
        "triage_urgency": parsed_rag["triage_urgency"],
        "needs_escalation": parsed_rag["needs_escalation"],
        "patient": {
            "name": record.get("patient_name") or "Unknown Patient",
            "age": record.get("age"),
            "pregnancy_status": record.get("pregnancy_status", False),
            "gestational_age_months": record.get("gestational_age_months"),
            "blood_pressure": record.get("blood_pressure") or record.get("bp") or "Not recorded",
            "bp_status": record.get("bp_status") or "normal",
            "symptoms": record.get("symptoms") or [],
        },
        "protocol_findings": {
            "summary": parsed_rag["summary"],
            "critical_flags": parsed_rag["critical_flags"],
            "warnings": parsed_rag["warnings"],
            "guidelines": parsed_rag["guideline_excerpts"],
            "citations": parsed_rag["citations"],
            "action_items": parsed_rag["action_items"],
        },
        "welfare_schemes": {
            "eligible": eligible_schemes,
            "matches": matches,
            "disclaimer": schemes_dict.get("disclaimer", "Preliminary eligibility — verify at scheme office."),
        },
        "action_plan": {
            "tasks": formatted_tasks or ["Routine follow-up visit scheduled."],
            "immediate_actions": parsed_rag["action_items"] if parsed_rag["needs_escalation"] else [],
        },
        "spoken_summary": spoken,
        "disclaimer": "This information is intended for trained health workers (ASHAs) as protocol guidance. Not a substitute for clinical medical advice.",
    }


def compose_spoken_summary(
    record: Dict[str, Any],
    protocol: Dict[str, Any],
    schemes: Dict[str, Any],
    report: Dict[str, Any],
    language: str = "English",
) -> str:
    """
    Composes a natural, conversational spoken summary for the health worker
    in English, Hindi, or Code-Mixed/Hinglish format.
    """
    name = record.get("patient_name") or "the woman"
    bp = record.get("blood_pressure") or record.get("bp") or "not recorded"
    flags = protocol.get("flags") or []
    crit = [
        f["title"] if isinstance(f, dict) else str(f)
        for f in flags
        if (isinstance(f, dict) and f.get("severity") == "critical")
        or (isinstance(f, str) and ("critical" in f.lower() or "severe" in f.lower()))
    ]
    eligible = [
        m["name"] for m in schemes.get("matches") or [] if isinstance(m, dict) and m.get("status") == "eligible"
    ]
    if not eligible and isinstance(schemes.get("eligible"), list):
        eligible = [str(x) for x in schemes["eligible"]]

    lang_lower = (language or "English").lower()
    is_hindi = lang_lower.startswith("hi") or lang_lower == "hindi"
    is_bhojpuri_or_mixed = "bho" in lang_lower or "mix" in lang_lower

    if is_hindi or is_bhojpuri_or_mixed:
        parts = [
            f"Maine note kiya: {name}. Blood pressure {bp}.",
        ]
        if record.get("symptoms"):
            syms = ", ".join(record["symptoms"])
            parts.append(f"Lakshan: {syms}.")
        if crit:
            parts.append("Turant dhyan: " + ", ".join(crit) + ". Yeh AI salah nahi, protocol flag hai. Kripya turant refer karein.")
        elif flags:
            parts.append("Kuch non-critical protocol points check karne ke liye hain.")
        else:
            parts.append("Koi emergency red flag nahi mila.")

        if eligible:
            parts.append("Preliminary scheme check: " + ", ".join(eligible) + ". Office se verify karein.")
        
        tasks = report.get("tasks") or []
        if tasks:
            task_titles = [t["title"] if isinstance(t, dict) else str(t) for t in tasks[:2]]
            parts.append("Follow-up: " + "; ".join(task_titles) + ".")

        parts.append("Confirm karein tabhi record save hoga.")
        return " ".join(parts)

    # Default: English
    parts = [
        f"I noted: {name}. Blood pressure {bp}.",
    ]
    if record.get("symptoms"):
        parts.append("Symptoms: " + ", ".join(record["symptoms"]) + ".")
    if crit:
        parts.append("Urgent protocol flags: " + "; ".join(crit) + ". Immediate referral recommended under protocol. You decide next steps; this is not patient advice.")
    elif flags:
        parts.append("Non-critical flags were raised for your review.")
    else:
        parts.append("No critical hardcoded red flags matched.")

    if eligible:
        parts.append("Preliminary scheme matches: " + ", ".join(eligible) + ". Verify with the official office.")
    
    tasks = report.get("tasks") or []
    if tasks:
        task_titles = [t["title"] if isinstance(t, dict) else str(t) for t in tasks[:3]]
        parts.append("Follow-up tasks: " + "; ".join(task_titles) + ".")
    
    parts.append("Please confirm to save, or correct any field.")
    return " ".join(parts)
