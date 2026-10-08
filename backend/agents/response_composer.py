from typing import Any, Dict


def compose_spoken_summary(record: Dict[str, Any], protocol: Dict[str, Any], schemes: Dict[str, Any], report: Dict[str, Any], language: str = "English") -> str:
    name = record.get("patient_name") or "the woman"
    bp = record.get("blood_pressure") or "not recorded"
    flags = protocol.get("flags") or []
    crit = [f["title"] for f in flags if f.get("severity") == "critical"]
    eligible = [m["name"] for m in schemes.get("matches") or [] if m.get("status") == "eligible"]
    hi = language.lower().startswith("hi") or language.lower() == "hindi"

    if hi:
        parts = [
            f"Maine note kiya: {name}. Blood pressure {bp}.",
        ]
        if crit:
            parts.append("Turant dhyan: " + ", ".join(crit) + ". Yeh AI salah nahi, protocol flag hai. Aap faisla karein.")
        if eligible:
            parts.append("Preliminary scheme check: " + ", ".join(eligible) + ". Office se verify karein.")
        parts.append("Confirm karein tabhi save hoga.")
        return " ".join(parts)

    parts = [
        f"I noted: {name}. Blood pressure {bp}.",
    ]
    if record.get("symptoms"):
        parts.append("Symptoms: " + ", ".join(record["symptoms"]) + ".")
    if crit:
        parts.append("Urgent protocol flags: " + "; ".join(crit) + ". You decide next steps; this is not patient advice.")
    elif flags:
        parts.append("Non-critical flags were raised for your review.")
    else:
        parts.append("No critical hardcoded red flags matched.")
    if eligible:
        parts.append("Preliminary scheme matches: " + ", ".join(eligible) + ". Verify with the official office.")
    tasks = report.get("tasks") or []
    if tasks:
        parts.append("Follow-up tasks: " + "; ".join(t["title"] for t in tasks[:3]) + ".")
    parts.append("Please confirm to save, or correct any field.")
    return " ".join(parts)
