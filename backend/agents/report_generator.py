from datetime import date, timedelta
from typing import Any, Dict, List

from backend.agents.llm import llm_text


def generate_report(record: Dict[str, Any], protocol: Dict[str, Any], schemes: Dict[str, Any]) -> Dict[str, Any]:
    name = record.get("patient_name") or "the woman"
    village = record.get("village") or "the village"
    facts = []
    if record.get("blood_pressure"):
        facts.append(f"BP {record['blood_pressure']}")
    if record.get("hemoglobin") is not None:
        facts.append(f"Hb {record['hemoglobin']} g/dL")
    if record.get("swelling"):
        facts.append("swelling noted")
    symptoms = record.get("symptoms") or []
    if symptoms:
        facts.append("symptoms: " + ", ".join(symptoms))

    flags = protocol.get("flags") or []
    tasks: List[Dict[str, str]] = []
    if protocol.get("needs_escalation"):
        tasks.append({"title": "Escalate to PHC/FRU", "due": "today", "priority": "critical"})
    if record.get("bp_status") == "high":
        tasks.append({"title": "Repeat BP and inform ANM/MO", "due": "today", "priority": "high"})
    if any(m.get("status") == "eligible" for m in schemes.get("matches") or []):
        tasks.append({
            "title": "Verify scheme papers (preliminary matches only)",
            "due": str(date.today() + timedelta(days=7)),
            "priority": "medium",
        })
    tasks.append({
        "title": "Revisit / follow-up",
        "due": str(date.today() + timedelta(days=14)),
        "priority": "routine",
    })

    report = (
        f"Home visit report for {name} ({village}). "
        f"Facts recorded: {'; '.join(facts) or 'see transcript'}. "
        f"Protocol: {len(flags)} flag(s); escalation={'yes' if protocol.get('needs_escalation') else 'no'}. "
        f"Schemes (preliminary): {schemes.get('summary')}. "
        "This is a documentation aid for the trained ASHA; clinical decisions remain with the worker and MO."
    )
    llm = llm_text(
        f"Write a short formal ASHA visit report using ONLY these facts. Do not invent fields.\nRecord: {record}\nFlags: {flags}\nSchemes: {schemes.get('summary')}"
    )
    if llm:
        report = llm

    return {"report": report, "tasks": tasks}
