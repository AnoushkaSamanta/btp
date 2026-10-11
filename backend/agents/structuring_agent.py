import re
from typing import Any, Dict, Optional

from backend.agents.llm import llm_json
from backend.nlp.normalize import normalize_transcript
from backend.schemas.medical_record import HouseholdInfo, MedicalRecord

NAME_RE = re.compile(
    r"(?:patient|woman|mataji|name is|naam|visited|visiting)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)|"
    r"([A-Za-z\u0900-\u097F][A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+){0,2}\s+(?:devi|kumari|sharma|yadav|prasad))",
    re.I,
)
AGE_RE = re.compile(r"(\d{1,2})\s*(?:years?|yrs?|saal|साल)", re.I)
BP_RE = re.compile(r"(?:BP|blood pressure|ब्लड प्रेशर)?\s*(\d{2,3})\s*/\s*(\d{2,3})", re.I)
HB_RE = re.compile(r"(?:Hb|hemoglobin|हीमोग्लोबिन)\s*[:=]?\s*(\d+(?:\.\d+)?)", re.I)
TEMP_RE = re.compile(r"(?:temp(?:erature)?|bukhar|बुखार|fever of)\s*[:=]?\s*(\d{2,3}(?:\.\d+)?)", re.I)
MONTH_RE = re.compile(r"(\d{1,2})\s*(?:month|mahine|माह|months)\s*(?:pregnant|pregnancy|ka)?", re.I)


def _symptoms(text: str) -> list:
    mapping = [
        ("swelling", ["swelling", "edema", "soojan", "सूजन", "swollen"]),
        ("headache", ["headache", "sir dard", "सिर दर्द"]),
        ("fever", ["fever", "bukhar", "बुखार"]),
        ("severe bleeding", ["severe bleeding", "khoon beh raha", "heavy bleeding"]),
        ("bleeding", ["bleeding", "khoon", "रक्तस्राव", "spotting"]),
        ("vomiting", ["vomiting", "ulti", "उल्टी"]),
        ("fatigue", ["fatigue", "weakness", "kamzori", "कमजोरी"]),
        ("decreased fetal movement", ["less movement", "baby not moving", "fetal movement"]),
        ("blurred vision", ["blurred", "dhundla", "धुंधला"]),
        ("abdominal pain", ["abdominal pain", "pet dard", "पेट दर्द"]),
    ]
    found = []
    lower = text.lower()
    for label, keys in mapping:
        if any(k.lower() in lower for k in keys):
            found.append(label)
    return found


def _pregnancy_status(pregnant: bool, postnatal: bool, base: Dict[str, Any]) -> Optional[bool]:
    if pregnant:
        return True
    if postnatal:
        return False
    tri = str(base.get("trimester") or "")
    if tri == "Postnatal":
        return False
    if tri in {"1st", "2nd", "3rd"}:
        return True
    return None


def heuristic_extract(transcript: str, patient: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    text = normalize_transcript(transcript)
    lower = text.lower()
    name = None
    m = NAME_RE.search(text)
    if m:
        name = (m.group(1) or m.group(2) or "").strip()
    age = None
    am = AGE_RE.search(text)
    if am:
        age = int(am.group(1))
    bp = None
    bm = BP_RE.search(text)
    if bm:
        bp = f"{bm.group(1)}/{bm.group(2)}"
    hb = None
    hm = HB_RE.search(text)
    if hm:
        hb = float(hm.group(1))
    temp = None
    tm = TEMP_RE.search(text)
    if tm:
        temp = float(tm.group(1))
    ga = None
    gm = MONTH_RE.search(text)
    if gm:
        ga = min(10, max(1, int(gm.group(1))))

    pregnant = any(k in lower for k in ["pregnant", "pregnancy", "garbhavati", "गर्भवती", "anc", "trimester"])
    postnatal = any(k in lower for k in ["postnatal", "postpartum", "delivery", "prasav", "प्रसव"])
    base = dict(patient or {})
    trimester = base.get("trimester")
    if any(k in lower for k in ["first trimester", "1st trimester", "early pregnancy"]):
        trimester = "1st"
    elif any(k in lower for k in ["second trimester", "2nd trimester"]):
        trimester = "2nd"
    elif any(k in lower for k in ["third trimester", "3rd trimester", "third trimester"]):
        trimester = "3rd"
    elif ga is not None:
        if ga <= 3:
            trimester = "1st"
        elif ga <= 6:
            trimester = "2nd"
        else:
            trimester = "3rd"
    swelling = any(k in lower for k in ["swelling", "soojan", "सूजन", "edema"])
    bpl = any(k in lower for k in ["bpl", "below poverty", "antyodaya"])
    first = any(k in lower for k in ["first child", "first pregnancy", "pehli", "पहली गर्भावस्था", "primi"])

    sys_bp = dia_bp = None
    if bp:
        sys_bp, dia_bp = int(bp.split("/")[0]), int(bp.split("/")[1])
    bp_status = None
    if sys_bp is not None:
        if sys_bp >= 140 or dia_bp >= 90:
            bp_status = "high"
        elif sys_bp < 90:
            bp_status = "low"
        else:
            bp_status = "normal"

    household = HouseholdInfo(
        income_category="BPL" if bpl or str(base.get("income_category", "")).upper() == "BPL" else base.get("income_category") or "APL",
        children_count=base.get("children_count"),
        family_size=base.get("family_size"),
        existing_schemes=base.get("existing_schemes") or [],
    )

    rec = MedicalRecord(
        patient_id=base.get("id") or base.get("patient_id"),
        patient_name=name or base.get("name") or base.get("patient_name"),
        age=age if age is not None else base.get("age"),
        gender=base.get("gender") or "Female",
        pregnancy_status=_pregnancy_status(pregnant, postnatal, base),
        gestational_age_months=ga,
        blood_pressure=bp or base.get("bp"),
        bp_status=bp_status,
        swelling=swelling or None,
        temperature=temp,
        symptoms=_symptoms(text),
        medications=[],
        household_info=household,
        visit_notes=transcript[:2000],
        follow_up_required=bool(_symptoms(text)) or bp_status == "high",
    )
    data = rec.model_dump()
    data["hemoglobin"] = hb if hb is not None else base.get("hemoglobin")
    data["village"] = base.get("village")
    data["trimester"] = trimester or base.get("trimester")
    data["bpl_card"] = bpl or bool(base.get("bpl_card"))
    data["aadhaar_linked"] = base.get("aadhaar_linked", True)
    data["first_living_child"] = first or bool(base.get("first_living_child"))
    data["para"] = base.get("para")
    data["pmjay_eligible"] = base.get("pmjay_eligible")
    if data["pregnancy_status"] is None and data.get("trimester") in {"1st", "2nd", "3rd"}:
        data["pregnancy_status"] = True
    return data


def extract_record(transcript: str, patient: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    heuristic = heuristic_extract(transcript, patient)
    llm = llm_json(
        "Extract a medical visit JSON with keys: patient_name, age, pregnancy_status, "
        "gestational_age_months, blood_pressure, bp_status (normal|high|low), swelling, "
        "temperature, symptoms (list), medications (list), visit_notes. "
        f"Transcript:\n{transcript}"
    )
    if isinstance(llm, dict):
        merged = {**heuristic, **{k: v for k, v in llm.items() if v not in (None, "", [])}}
        try:
            MedicalRecord.model_validate(merged)
            return merged
        except Exception:
            return heuristic
    return heuristic
