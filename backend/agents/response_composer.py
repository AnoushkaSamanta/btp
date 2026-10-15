from typing import Any, Dict


def compose_spoken_summary(record: Dict[str, Any], protocol: Dict[str, Any], schemes: Dict[str, Any], report: Dict[str, Any], language: str = "English") -> str:
    name = record.get("patient_name") or "the woman"
    loc = record.get("location") or record.get("village")
    loc_str = f" from {loc}" if loc else ""
    bp = record.get("blood_pressure")
    bp_status = record.get("bp_status")
    bp_str = f"{bp} ({bp_status})" if (bp and bp_status) else (bp or "not recorded")
    sugar = record.get("blood_sugar")
    sugar_status = record.get("sugar_status")
    sugar_str = f", blood sugar {sugar} mg/dL ({sugar_status})" if sugar else ""

    flags = protocol.get("flags") or []
    flag_titles = [f["title"] for f in flags]
    crit = [f["title"] for f in flags if f.get("severity") == "critical"]
    eligible = [m["name"] for m in schemes.get("matches") or [] if m.get("status") == "eligible"]
    lang_lower = language.lower()
    hi = lang_lower.startswith("hi") or lang_lower == "hindi"
    bho = lang_lower.startswith("bho") or "bhojpuri" in lang_lower

    if bho:
        parts = [
            f"Ham note kar lihili: {name}{loc_str}। Blood pressure {bp_str}{sugar_str}।",
        ]
        if crit:
            parts.append("Turant dhyan dihin: " + ", ".join(crit) + "। Protocol alert ba, agla faisla raua kareen।")
        elif flag_titles:
            parts.append("Alerts: " + ", ".join(flag_titles) + "।")
        if eligible:
            parts.append("Yojana jaanch: " + ", ".join(eligible) + "।")
        parts.append("Aawaz se confirm kareen tabhi save hoi।")
        return " ".join(parts)

    if hi:
        parts = [
            f"Maine note kiya: {name}{loc_str}. Blood pressure {bp_str}{sugar_str}.",
        ]
        if crit:
            parts.append("Turant dhyan: " + ", ".join(crit) + ". Yeh AI salah nahi, protocol flag hai. Aap faisla karein.")
        elif flag_titles:
            parts.append("Alerts: " + ", ".join(flag_titles) + ".")
        if eligible:
            parts.append("Preliminary scheme check: " + ", ".join(eligible) + ". Office se verify karein.")
        parts.append("Confirm karein tabhi save hoga.")
        return " ".join(parts)

    parts = [
        f"I noted: {name}{loc_str}. Blood pressure {bp_str}{sugar_str}.",
    ]
    if record.get("symptoms"):
        parts.append("Symptoms: " + ", ".join(record["symptoms"]) + ".")
    if crit:
        parts.append("Urgent protocol flags: " + "; ".join(crit) + ". You decide next steps; this is not patient advice.")
    elif flag_titles:
        parts.append("Protocol alerts: " + "; ".join(flag_titles) + ".")
    else:
        parts.append("No critical hardcoded red flags matched.")
    if eligible:
        parts.append("Preliminary scheme matches: " + ", ".join(eligible) + ". Verify with the official office.")
    tasks = report.get("tasks") or []
    if tasks:
        parts.append("Follow-up tasks: " + "; ".join(t["title"] for t in tasks[:3]) + ".")
    parts.append("Please confirm to save, or correct any field.")
    return " ".join(parts)
