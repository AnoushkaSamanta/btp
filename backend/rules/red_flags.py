from typing import Any, Dict, List, Optional


def _parse_bp(bp: Optional[str]) -> tuple:
    if not bp:
        return None, None
    try:
        parts = str(bp).replace(" ", "").split("/")
        return int(parts[0]), int(parts[1])
    except (ValueError, IndexError):
        return None, None


def evaluate_red_flags(record: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Hardcoded safety net — always runs, independent of RAG/LLM."""
    flags: List[Dict[str, Any]] = []
    text = " ".join(
        [
            str(record.get("visit_notes") or ""),
            " ".join(record.get("symptoms") or []),
        ]
    ).lower()
    symptoms = [s.lower() for s in (record.get("symptoms") or [])]
    pregnant = bool(record.get("pregnancy_status"))
    swelling = bool(record.get("swelling"))
    sys_bp, dia_bp = _parse_bp(record.get("blood_pressure"))
    bp_status = (record.get("bp_status") or "").lower()
    high_bp = bp_status == "high" or (sys_bp is not None and (sys_bp >= 140 or (dia_bp or 0) >= 90))
    severe_bp = sys_bp is not None and (sys_bp >= 160 or (dia_bp or 0) >= 110)
    hb = record.get("hemoglobin")
    temp = record.get("temperature")

    if pregnant and swelling and high_bp:
        flags.append({
            "id": "pre_eclampsia_pattern",
            "severity": "critical",
            "title": "Possible pre-eclampsia pattern",
            "detail": "Pregnancy + swelling + high blood pressure. Refer immediately to PHC/FRU. Do not delay for RAG confirmation.",
            "action": "Escalate to PHC/CHC now. Check proteinuria if possible. Stay with the woman until transfer.",
            "source": "Hardcoded red-flag rule (NHM maternal danger signs)",
        })
    elif pregnant and high_bp:
        flags.append({
            "id": "gestational_htn",
            "severity": "high",
            "title": "High blood pressure in pregnancy",
            "detail": f"Recorded BP {record.get('blood_pressure')} meets hypertension threshold (>=140/90).",
            "action": "Repeat BP after rest. If still high, refer to PHC. Watch for headache, vision change, swelling.",
            "source": "Hardcoded red-flag rule",
        })

    if severe_bp and pregnant:
        flags.append({
            "id": "severe_htn",
            "severity": "critical",
            "title": "Severe hypertension",
            "detail": "BP >= 160/110. High eclampsia risk.",
            "action": "Urgent transfer to District Hospital / FRU. If trained, follow MgSO4 protocol under MO guidance.",
            "source": "Hardcoded red-flag rule — NHM EmOC",
        })

    bleed_terms = ["bleeding", "khoon", "रक्तस्राव", "spotting", "vaginal bleed"]
    if pregnant and any(t in text or t in " ".join(symptoms) for t in bleed_terms):
        flags.append({
            "id": "bleeding",
            "severity": "critical",
            "title": "Vaginal bleeding in pregnancy",
            "detail": "Bleeding reported. Treat as obstetric emergency until proven otherwise.",
            "action": "Immediate referral. Do not do internal examination in the field.",
            "source": "Hardcoded red-flag rule",
        })

    if any(t in text for t in ["convulsion", "seizure", "fit", "दौरा", "unconscious", "बेहोश"]):
        flags.append({
            "id": "convulsion",
            "severity": "critical",
            "title": "Convulsions / loss of consciousness",
            "detail": "Possible eclampsia or other emergency.",
            "action": "Protect airway, urgent ambulance to FRU.",
            "source": "Hardcoded red-flag rule",
        })

    if pregnant and any(t in text for t in ["no fetal", "less movement", "decreased fetal", "baby not moving", "हलचल कम"]):
        flags.append({
            "id": "dfm",
            "severity": "high",
            "title": "Decreased fetal movement",
            "detail": "Reduced baby movements reported.",
            "action": "Refer same day for fetal assessment.",
            "source": "Hardcoded red-flag rule",
        })

    if hb is not None:
        try:
            hb_f = float(hb)
            if hb_f < 7:
                flags.append({
                    "id": "severe_anemia",
                    "severity": "critical",
                    "title": "Severe anemia",
                    "detail": f"Hb {hb_f} g/dL is below 7.",
                    "action": "Urgent FRU referral for IV iron / transfusion as per MO.",
                    "source": "Hardcoded red-flag rule — Anemia Mukt Bharat",
                })
            elif hb_f < 10 and pregnant:
                flags.append({
                    "id": "moderate_anemia",
                    "severity": "medium",
                    "title": "Moderate anemia in pregnancy",
                    "detail": f"Hb {hb_f} g/dL. Follow IFA protocol and diet counseling.",
                    "action": "2 IFA tablets daily if 7–9.9; counsel diet; recheck Hb.",
                    "source": "Hardcoded red-flag rule — IFA protocol",
                })
        except (TypeError, ValueError):
            pass

    if temp is not None:
        try:
            t = float(temp)
            if t > 38 or t > 100.4:
                flags.append({
                    "id": "fever",
                    "severity": "high" if pregnant else "medium",
                    "title": "Fever",
                    "detail": f"Temperature {t} recorded.",
                    "action": "Rule out infection / malaria / UTI. Refer if pregnant with high fever.",
                    "source": "Hardcoded red-flag rule",
                })
        except (TypeError, ValueError):
            pass

    if any(t in text for t in ["severe headache", "blurred vision", "tezi se dard", "धुंधला"]):
        if pregnant:
            flags.append({
                "id": "neuro_danger",
                "severity": "critical",
                "title": "Headache / visual change in pregnancy",
                "detail": "Danger sign of pre-eclampsia.",
                "action": "Immediate referral. Check BP now.",
                "source": "Hardcoded red-flag rule",
            })

    return flags
