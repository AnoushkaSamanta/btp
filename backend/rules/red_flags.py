import re
from typing import Any, Dict, List, Optional


def _parse_bp(bp: Optional[str]) -> tuple:
    if not bp:
        return None, None
    try:
        clean = str(bp).replace(" ", "").split("/")[0].replace("(systoliconly)", "")
        parts = str(bp).replace(" ", "").split("/")
        if len(parts) >= 2:
            return int(parts[0]), int(parts[1])
        if clean.isdigit():
            return int(clean), None
        return None, None
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
    
    # Check invalid BP reading
    if (sys_bp is not None and sys_bp > 300) or (dia_bp is not None and dia_bp > 200) or bp_status == "invalid_reading":
        flags.append({
            "id": "INVALID_READING",
            "severity": "high",
            "title": "INVALID_READING",
            "detail": f"Recorded blood pressure ({record.get('blood_pressure')}) exceeds physiological limits (systolic > 300 or diastolic > 200). Retake measurement.",
            "action": "Immediate cuff re-positioning and retake BP measurement. Check equipment calibration.",
            "source": "Clinical Safety Vitals Range Validation",
        })

    high_bp = bp_status in {"high", "invalid_reading"} or (sys_bp is not None and (sys_bp >= 140 or (dia_bp or 0) >= 90))
    low_bp = bp_status == "low" or (sys_bp is not None and sys_bp < 90) or "low_bp" in symptoms
    severe_bp = sys_bp is not None and (sys_bp >= 160 or (dia_bp or 0) >= 110)
    critical_low_bp = sys_bp is not None and sys_bp <= 60
    hb = record.get("hemoglobin")
    temp = record.get("temperature")

    blood_sugar = record.get("blood_sugar")
    if blood_sugar is None:
        sm = re.search(r"sugar\s*(?:levels?\s*)?(\d+)", text)
        if sm:
            blood_sugar = int(sm.group(1))

    if critical_low_bp:
        flags.append({
            "id": "CRITICAL_BP_ALERT",
            "severity": "critical",
            "title": "CRITICAL_BP_ALERT",
            "detail": f"Dangerously low systolic blood pressure ({record.get('blood_pressure')}). Shock or hemodynamic collapse risk.",
            "action": "Immediate emergency escalation to PHC/FRU. Keep patient in supine position with legs elevated.",
            "source": "Emergency Triage Guidelines",
        })
    elif low_bp:
        flags.append({
            "id": "LOW_BP_ALERT",
            "severity": "high" if (sys_bp is not None and sys_bp < 80) else "medium",
            "title": "LOW_BP_ALERT",
            "detail": f"Recorded blood pressure ({record.get('blood_pressure')}) indicates hypotension (systolic < 90 mmHg).",
            "action": "Ensure adequate hydration, check for dizziness or fainting, and refer to MO/PHC if symptomatic.",
            "source": "Clinical Protocols for Maternal & Community Health",
        })

    if pregnant and swelling and high_bp:
        flags.append({
            "id": "pre_eclampsia_pattern",
            "severity": "critical",
            "title": "Possible pre-eclampsia pattern",
            "detail": "Pregnancy + swelling + high blood pressure. Refer immediately to PHC/FRU. Do not delay for RAG confirmation.",
            "action": "Escalate to PHC/CHC now. Check proteinuria if possible. Stay with the woman until transfer.",
            "source": "Hardcoded red-flag rule (NHM maternal danger signs)",
        })
    elif high_bp and not any(f["id"] == "INVALID_READING" for f in flags):
        flags.append({
            "id": "HIGH_BP_ALERT",
            "severity": "high",
            "title": "HIGH_BP_ALERT",
            "detail": f"Recorded BP {record.get('blood_pressure')} meets hypertension threshold (>=140/90).",
            "action": "Repeat BP after rest. If still high, refer to PHC. Watch for headache, vision change, swelling.",
            "source": "Hardcoded red-flag rule",
        })

    if severe_bp:
        flags.append({
            "id": "severe_htn",
            "severity": "critical",
            "title": "Severe hypertension",
            "detail": f"BP {record.get('blood_pressure')} >= 160/110. Critical hypertensive crisis / eclampsia risk.",
            "action": "Urgent transfer to District Hospital / FRU. If trained, follow MgSO4 protocol under MO guidance.",
            "source": "Hardcoded red-flag rule — NHM EmOC",
        })

    # Blood sugar checks
    if blood_sugar is not None:
        bs_val = int(blood_sugar)
        if bs_val >= 250:
            flags.append({
                "id": "HIGH_SUGAR_ALERT",
                "severity": "critical" if bs_val > 400 else "high",
                "title": "HIGH_SUGAR_ALERT",
                "detail": f"Blood sugar level {bs_val} mg/dL is dangerously high (>= 250 mg/dL). Hyperglycemia emergency risk.",
                "action": "Immediate medical consultation / PHC referral for insulin management and hydration.",
                "source": "National Health Mission NCD Clinical Guidelines",
            })
        elif bs_val >= 126:
            flags.append({
                "id": "DIABETIC_RANGE_ALERT",
                "severity": "medium",
                "title": "DIABETIC_RANGE_ALERT",
                "detail": f"Blood sugar level {bs_val} mg/dL is in the diabetic range (126-250 mg/dL).",
                "action": "Advise fasting blood sugar test, dietary counseling, and non-emergency PHC evaluation.",
                "source": "National Health Mission NCD Clinical Guidelines",
            })

    # Combined critical threshold (BP > 180 or Sugar > 400)
    if (sys_bp is not None and sys_bp >= 180) or (blood_sugar is not None and int(blood_sugar) >= 400):
        flags.append({
            "id": "CRITICAL_ALERT",
            "severity": "critical",
            "title": "CRITICAL_ALERT",
            "detail": f"Vital signs in critical danger range (BP: {record.get('blood_pressure')}, Sugar: {blood_sugar}). Immediate emergency triage required.",
            "action": "Immediate emergency transfer to nearest hospital / CHC. Notify Medical Officer.",
            "source": "Critical Triage Protocol",
        })

    bleed_terms = ["bleeding", "khoon", "रक्तस्राव", "spotting", "vaginal bleed", "severe bleeding"]
    if any(t in text or t in " ".join(symptoms) for t in bleed_terms):
        flags.append({
            "id": "bleeding",
            "severity": "critical",
            "title": "Severe Bleeding Emergency",
            "detail": "Severe bleeding reported. Treat as medical emergency until proven otherwise.",
            "action": "Immediate referral / emergency transfer. Do not delay.",
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

    if any(t in text for t in ["no fetal", "less movement", "decreased fetal", "baby not moving", "fetal movement", "हलचल कम"]):
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

    if (temp is not None and (float(temp) > 38 or float(temp) > 100.4)) or ("fever" in text):
        flags.append({
            "id": "fever",
            "severity": "high" if pregnant else "medium",
            "title": "Fever Above 102" if "102" in text else "Fever",
            "detail": f"Temperature or fever reported in visit ({text[:50]}).",
            "action": "Rule out infection / malaria / UTI. Refer if pregnant with high fever.",
            "source": "Hardcoded red-flag rule",
        })

    if any(t in text for t in ["severe headache", "blurred vision", "tezi se dard", "धुंधला"]):
        if pregnant or "headache" in text:
            flags.append({
                "id": "neuro_danger",
                "severity": "critical",
                "title": "Headache / visual change",
                "detail": "Possible neurological danger or pre-eclampsia if pregnant.",
                "action": "Immediate referral. Check BP now.",
                "source": "Hardcoded red-flag rule",
            })
            
    # IMNCI Pediatric Red Flags
    if any(t in text for t in ["fast breathing", "chest in-drawing", "chest indrawing", "stridor"]):
        flags.append({
            "id": "imnci_pneumonia",
            "severity": "critical",
            "title": "Severe Pneumonia or Very Severe Disease",
            "detail": "Fast breathing or chest in-drawing detected.",
            "action": "Give first dose of appropriate antibiotic and refer URGENTLY to hospital.",
            "source": "IMNCI Guidelines",
        })
    # Check for missing vitals in pregnancy
    bp_val = record.get("blood_pressure")
    if pregnant and not bp_val:
        flags.append({
            "id": "BP_NOT_RECORDED",
            "severity": "medium",
            "title": "BP not recorded",
            "detail": "Pregnancy observation without blood pressure measurement. Antenatal protocol requires mandatory BP check.",
            "action": "Record blood pressure with digital or manual sphygmomanometer at next contact.",
            "source": "NHM Antenatal Care Guidelines",
        })

    # If vitals incomplete (no BP, no blood sugar, no temperature)
    has_any_vitals = bool(bp_val or blood_sugar or record.get("temperature") or record.get("hemoglobin"))
    if not has_any_vitals and (pregnant or bool(symptoms)):
        flags.append({
            "id": "VITALS_INCOMPLETE",
            "severity": "medium",
            "title": "Vitals incomplete",
            "detail": "Visit recorded without objective vital signs (BP, sugar, temperature).",
            "action": "Complete full vital signs panel during next home visit.",
            "source": "Standard Frontline Clinical Practice",
        })

    return flags


def check_red_flags(record: Any) -> List[Any]:
    if isinstance(record, list):
        text = " ".join(record).lower()
        alerts = []
        if "severe bleeding" in text or "bleeding" in text:
            alerts.append("Severe Bleeding")
        if "fever" in text:
            alerts.append("Fever Above 102")
        return alerts
    return evaluate_red_flags(record)



