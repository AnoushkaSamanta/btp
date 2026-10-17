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
        age = record.get("age")
        if record.get("patient_name"):
            p_name = record["patient_name"]
        elif age and age <= 12:
            p_name = f"{age} बरीस के लईका"
        elif record.get("pregnancy_status"):
            p_name = "गर्भवती मेहरारू"
        else:
            p_name = "मरीज"
        p_loc = record.get("village") or record.get("location")
        p_loc_str = f", {p_loc} के" if p_loc and p_loc not in ["दिन", "day", "days"] else ""
        bp_text = f"ब्लड प्रेशर {bp}" if bp else "ब्लड प्रेशर दर्ज नइखे"
        sugar_text = f", शुगर {sugar}" if sugar else ""
        parts = [
            f"हम नोट कइनी: {p_name}{p_loc_str}। {bp_text}{sugar_text}।",
        ]
        if crit:
            parts.append("तुरंत ध्यान दीं: " + ", ".join(crit) + "। अस्पताल रेफर करीं।")
        elif flag_titles:
            parts.append("अलर्ट: " + ", ".join(flag_titles) + "।")
        if eligible:
            parts.append("योजना: " + ", ".join(eligible) + "।")
        parts.append("पुष्टि करीं तब सहेजल जाई।")
        return " ".join(parts)

    if hi:
        age = record.get("age")
        if record.get("patient_name"):
            p_name = record["patient_name"]
        elif age and age <= 12:
            p_name = f"{age} साल का बच्चा"
        elif record.get("pregnancy_status"):
            p_name = "गर्भवती महिला"
        else:
            p_name = "मरीज"

        p_loc = record.get("village") or record.get("location")
        p_loc_str = f", {p_loc} निवासी" if p_loc and p_loc not in ["दिन", "day", "days"] else ""
        bp_text = f"रक्तचाप {bp}" if bp else "रक्तचाप दर्ज नहीं है"
        sugar_text = f", ब्लड शुगर {sugar} मिलीग्राम" if sugar else ""

        parts = [
            f"मैंने नोट किया: {p_name}{p_loc_str}। {bp_text}{sugar_text}।",
        ]
        if crit:
            parts.append("तुरंत ध्यान दें: " + ", ".join(crit) + "। तुरंत अस्पताल रेफर करें।")
        elif flag_titles:
            parts.append("अलर्ट: " + ", ".join(flag_titles) + "।")
        if eligible:
            parts.append("योजना पात्रता: " + ", ".join(eligible) + "।")
        parts.append("सहेजने के लिए पुष्टि करें।")
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
