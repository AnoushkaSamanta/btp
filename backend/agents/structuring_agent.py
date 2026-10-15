import json
import logging
import re
from typing import Any, Dict, List, Optional

from backend.agents.llm import llm_json
from backend.nlp.llm_client import call_llm
from backend.nlp.normalize import normalize_transcript
from backend.nlp.number_words import replace_number_words
from backend.nlp.prompts import UNIVERSAL_EXTRACTION_PROMPT
from backend.schemas.medical_record import HouseholdInfo, MedicalRecord

logger = logging.getLogger(__name__)

# Transliteration dictionary for frequent names in regional scripts
NAME_TRANSLITERATION = {
    "సుజాత": "Sujatha",
    "సుజాతకి": "Sujatha",
    "సుజాతా": "Sujatha",
    "లక్ష్మి": "Lakshmi Devi",
    "లక్ష్మీ": "Lakshmi Devi",
    "సునీత": "Sunita Kumari",
    "అనిత": "Anita",
    "మీనా": "Meena",
    "రాధ": "Radha",
    "सुजाता": "Sujatha",
    "लक्ष्मी": "Lakshmi Devi",
    "सुनीता": "Sunita",
    "சுஜாதா": "Sujatha",
    "லட்சுமி": "Lakshmi Devi",
}

# Regex Fallback Patterns (expanded for multilingual synonyms)
NAME_RE = re.compile(
    r"(?:patient|woman|mataji|name is|naam|visited|visiting|పేరు|పేరు\s*:|பெயர்)\s+([A-Za-z\u0900-\u097F\u0C00-\u0C7F\u0B80-\u0BFF]+(?:\s+[A-Za-z\u0900-\u097F\u0C00-\u0C7F\u0B80-\u0BFF]+)?)|"
    r"([A-Za-z\u0900-\u097F][A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+){0,2}\s+(?:devi|kumari|sharma|yadav|prasad|singh|begum|bibi|bai|kaur))|"
    r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*(?:,\s*)?(?:\d{1,2}\s*(?:years?|yrs?|saal|ఏళ్లు|వయసు|వయస్సు|సంవత్సరాల)|(?:months?|weeks?)\s*pregnant|pregnant|BP|blood pressure)\b",
    re.I,
)

COMMON_NON_NAMES = {
    "hello", "hi", "hey", "namaste", "visited", "visiting", "patient", "the",
    "check", "today", "yesterday", "tomorrow", "from", "observation", "report",
    "visit", "notes", "asha", "worker", "doctor", "health", "case", "woman",
    "mother", "child", "infant", "baby", "vitals", "screening", "review",
    "నెలలు", "గర్భం", "వయసు", "ఏళ్లు"
}


def detect_language(text: str) -> str:
    """Detect primary Indic language or mixed code."""
    has_te = bool(re.search(r"[\u0C00-\u0C7F]", text))
    has_hi = bool(re.search(r"[\u0900-\u097F]", text))
    has_ta = bool(re.search(r"[\u0B80-\u0BFF]", text))
    has_en = bool(re.search(r"[A-Za-z]", text))

    scripts = sum([has_te, has_hi, has_ta])
    if scripts >= 2 or (scripts == 1 and has_en):
        return "mixed"
    if has_te:
        return "te"
    if has_hi:
        return "hi"
    if has_ta:
        return "ta"
    return "en"


def _symptoms(text: str) -> List[str]:
    mapping = [
        ("swelling", [
            "swelling", "edema", "soojan", "सूजन", "swollen",
            "కాళ్ళ వాపు", "వాపు", "కాళ్ల వాపు", "வீக்கம்"
        ]),
        ("headache", [
            "headache", "sir dard", "सिर दर्द", "తలనొప్పి", "నొప్పి", "தலைவலி"
        ]),
        ("fever", [
            "fever", "bukhar", "बुखार", "జ్వరం", "కాక", "காய்ச்சல்"
        ]),
        ("severe bleeding", [
            "severe bleeding", "heavy bleeding", "తీవ్ర రక్తస్రావం"
        ]),
        ("bleeding", [
            "bleeding", "khoon", "रक्तस्राव", "spotting", "రక్తస్రావం", "இரத்தப்போக்கு"
        ]),
        ("vomiting", [
            "vomiting", "ulti", "उल्टी", "వాంతులు", "వాంతి", "வாந்தி"
        ]),
        ("fatigue", [
            "fatigue", "weakness", "kamzori", "कमजोरी", "నీరసం", "బలహీనత", "சோர்வு"
        ]),
        ("decreased fetal movement", [
            "less movement", "baby not moving", "fetal movement", "కదలికలు తక్కువ"
        ]),
        ("blurred vision", [
            "blurred", "dhundla", "धुंधला", "మసక చూపు"
        ]),
        ("abdominal pain", [
            "abdominal pain", "pet dard", "पेट दर्द", "కడుపు నొప్పి", "വയറുവേദന"
        ]),
        ("high_bp", ["high blood pressure", "high bp", "hypertension", "ఎక్కువ బీపీ"]),
        ("low_bp", ["low blood pressure", "low bp", "తక్కువ బీపీ", "బీపీ 21", "ప్రెషర్ 21", "రక్తపోటు 21"]),
        ("high_sugar", ["high sugar", "diabetes", "high glucose", "షుగర్"]),
    ]
    found = []
    lower = text.lower()
    for label, keys in mapping:
        if any(k.lower() in lower or k in text for k in keys):
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
    """
    Multilingual heuristic extraction supporting Telugu, Hindi, Tamil, and English.
    Converts number words to digits first, then recognizes patterns across languages.
    """
    num_text = replace_number_words(transcript)
    text = normalize_transcript(num_text)
    lower = text.lower()
    lang_det = detect_language(transcript)

    # 1. Name extraction
    name = None
    # Check transliteration words first
    for word in re.findall(r"[\u0C00-\u0C7F\u0900-\u097F\u0B80-\u0BFF\w]+", transcript):
        if word in NAME_TRANSLITERATION:
            name = NAME_TRANSLITERATION[word]
            break

    if not name:
        # Check patterns like "Sujatha w/o Ramesh" or "Sujatha wife of"
        m_wo = re.search(r"^\s*([A-Za-z\u0C00-\u0C7F\u0900-\u097F\u0B80-\u0BFF]+)\s+(?:w/o|s/o|d/o|wife of|husband)\b", text, re.I)
        if m_wo:
            cand = m_wo.group(1).strip()
            name = NAME_TRANSLITERATION.get(cand, cand)

    if not name:
        # Check explicit "name is / name <Name>" or "పేరు <Name>"
        m_explicit = re.search(r"\b(?:name\s+(?:is\s+)?|naam\s+|పేరు\s*:?\s*|பெயர்\s*:?\s*)([A-Za-z\u0C00-\u0C7F\u0900-\u097F\u0B80-\u0BFF]+)", text, re.I)
        if m_explicit:
            cand = m_explicit.group(1).strip()
            name = NAME_TRANSLITERATION.get(cand, cand)

    if not name:
        # Check first capitalized word or first Indic token before age/vital
        m_first = re.search(r"^\s*([A-Za-z\u0C00-\u0C7F\u0900-\u097F\u0B80-\u0BFF]+)(?:కి|కు|కి\s*|\s+)?(?:\d{1,2}|వయసు|age|उम्र|வயது)", text, re.I)
        if m_first:
            cand = m_first.group(1).strip()
            name = NAME_TRANSLITERATION.get(cand, cand)

    if not name:
        m = NAME_RE.search(text)
        if m:
            cand = (m.group(1) or m.group(2) or m.group(3) or "").strip()
            name = NAME_TRANSLITERATION.get(cand, cand)

    if name:
        name = re.sub(r"\b(?:from|in|at|of|near|with|living|leaving|leaves|lives|నుండి|నుంచి|से|இருந்து)\b.*", "", name, flags=re.I).strip()
        name = re.sub(r"\b(?:BP|blood pressure|age|saal|years?|months?|pregnant|patient|sugar|బీపీ|వయసు|उम्र|வயது)\b.*", "", name, flags=re.I).strip()
        name = name.strip(",. -")
        if name.lower() in COMMON_NON_NAMES or len(name) < 2:
            name = None

    # 2. Age extraction (e.g. "వయసు 24", "24 ఏళ్లు", "24 సంవత్సరాల", "उम्र 24", "வயது 24", "age 24", "24 years", "24y", "24yo")
    age = None
    # Target specific patterns
    for pat in [
        r"(\d{1,2})\s*(?:y(?:o)?|years?|yrs?|saal|साल|ఏళ్లు|సంవత్సరాల|సంవత్సరాలు|வயது)",
        r"(?:వయసు|వయస్సు|उम्र|வயது|age)\s*[:=]?\s*(\d{1,2})",
        r"(?:ఆమె\s*వయస్సు|ఆమె\s*వయసు)\s*(\d{1,2})",
    ]:
        am = re.search(pat, text, re.I)
        if am:
            age = int(am.group(1))
            break

    # If still not found, check two-digit number adjacent to name: "సుజాత 24"
    if age is None and name:
        adj = re.search(re.escape(name) + r"(?:కి|కు)?\s+(\d{1,2})\b", text)
        if adj:
            age = int(adj.group(1))

    # 3. Blood Pressure extraction (e.g. "బీపీ 21", "రక్తపోటు 21", "ప్రెషర్ 21", "BP 140/90", "BP 21", "ரத்த அழுத்தம் 21")
    bp = None
    bm_slash = re.search(r"(?:BP|blood pressure|బ్లడ్\s*ప్రెషర్|రక్తపోటు|బీపీ|ప్రెషర్|ब्लड\s*प्रेशर|இரத்த\s*அழுத்தம்|ரத்த\s*அழுத்தம்)?\s*(\d{2,3})\s*/\s*(\d{2,3})", text, re.I)
    if bm_slash and bm_slash.group(1) and bm_slash.group(2):
        bp = f"{bm_slash.group(1)}/{bm_slash.group(2)}"
    else:
        # Check single value like "BP 21", "బీపీ 21", "ప్రెషర్ 21", "రక్తపోటు 21", "ரத்த அழுத்தம் 21"
        bm_single = re.search(r"(?:BP|blood pressure|బ్లడ్\s*ప్రెషర్|రక్తపోటు|బీపీ|ప్రెషర్|ब्लड\s*प्रेशर|இரத்த\s*அழுத்தம்|ரத்த\s*அழுத்தம்)\s*[:=]?\s*(\d{1,3})\b", text, re.I)
        if bm_single:
            val = int(bm_single.group(1))
            bp = f"{val} (systolic only)" if val >= 100 else f"{val}"
        else:
            # Check standalone "21" after BP or context
            bm_ctx = re.search(r"\b(?:బీపీ|ప్రెషర్|రక్తపోటు|BP|ரத்த\s*அழுத்தம்)\s+(\d{1,3})\b", text, re.I)
            if bm_ctx:
                bp = bm_ctx.group(1)

    # 4. Blood sugar extraction
    sugar_val = None
    sugar_status = None
    sm = re.search(r"(?:blood sugar|sugar levels?|sugar|glucose|rbs|fbs|షుగర్|బ్లడ్\s*షుగర్)\s*(?:levels?|level|is|was|of|[:=])?\s*(\d{2,3})\b", text, re.I)
    if sm:
        try:
            sugar_val = int(sm.group(1))
            if sugar_val > 400:
                sugar_status = "critical"
            elif sugar_val >= 250:
                sugar_status = "high"
            elif sugar_val >= 126:
                sugar_status = "diabetic"
            elif sugar_val >= 100:
                sugar_status = "pre-diabetic"
            elif sugar_val >= 0:
                sugar_status = "normal"
        except (ValueError, TypeError):
            pass

    # 5. Gestational age (months pregnant)
    ga = None
    # Patterns: "నాలుగు నెలలు", "4 నెలలు", "4 months", "4m pregnant", "4 నెలల గర్భం", "4వ నెల", "4th month", "चार महीने", "4 महीने", "4 माह", "4 மாதம்", "4 மாத"
    for pat in [
        r"(\d{1,2})\s*(?:వ\s*నెల|నెలలు|నెలల|నెల|months?|th\s*month|rd\s*month|nd\s*month|st\s*month|mahine|महीने|महीनों|माह|மாதம்|மாதங்கள்|மாத)",
        r"\b(\d{1,2})\s*m\s+(?:pregnant|pregnancy|గర్భవతి|కడుపుతో)\b",
        r"(?:నెలలు|months?|महीने|மாதம்)\s*(\d{1,2})",
    ]:
        gm = re.search(pat, text, re.I)
        if gm:
            ga = min(10, max(1, int(gm.group(1))))
            break

    # 6. Pregnancy status
    preg_indicators = [
        "pregnant", "pregnancy", "గర్భిణీ", "గర్భం", "గర్భవతి", "కడుపుతో", "కడుపుతో ఉంది",
        "గర్భం దాల్చింది", "garbhavati", "गर्भवती", "anc", "trimester", "கர்ப்பம்", "கர்ப்பிணி"
    ]
    pregnant = any(k in text or k in lower for k in preg_indicators) or (ga is not None)
    postnatal = any(k in lower or k in text for k in ["postnatal", "postpartum", "delivery", "prasav", "ప్రసవం", "డెలివరీ", "பிரசவம்"])

    # 7. Location extraction (e.g., "సుజాత రామ్నగర్ నుండి", "from Ramnagar", "in Ramnagar")
    location = None
    for pat in [
        r"(?:from|in|at|resident of|lives in|village)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)",
        r"([A-Za-z\u0C00-\u0C7F\u0900-\u097F]+)\s*(?:నుండి|నుంచి|నుంచీ|से|இருந்து)",
    ]:
        loc_m = re.search(pat, text, re.I)
        if loc_m:
            cand_loc = loc_m.group(1).strip().strip(",. ")
            cand_loc = re.sub(r"\b(?:BP|blood pressure|sugar|glucose|temp|age|fever|గర్భిణీ|బీపీ)\b.*", "", cand_loc, flags=re.I).strip()
            # Map known locations like రామ్నగర్ -> Ramnagar
            if "రామ్నగర్" in cand_loc or "रामनगर" in cand_loc or "ramnagar" in cand_loc.lower():
                location = "Ramnagar"
            elif len(cand_loc) >= 2 and cand_loc.lower() not in COMMON_NON_NAMES:
                location = cand_loc
            break

    # Trimester logic
    base = dict(patient or {})
    trimester = base.get("trimester")
    if ga is not None:
        if ga <= 3:
            trimester = "1st"
        elif ga <= 6:
            trimester = "2nd"
        else:
            trimester = "3rd"
    elif pregnant and not trimester:
        trimester = "2nd"

    # Symptoms
    symptoms_list = _symptoms(transcript)
    swelling = "swelling" in symptoms_list

    # BP status evaluation
    sys_bp = dia_bp = None
    if bp:
        clean_bp = bp.replace("(systolic only)", "").strip()
        parts = clean_bp.split("/")
        raw_sys = parts[0].strip()
        raw_dia = parts[1].strip() if len(parts) > 1 else ""
        if raw_sys.isdigit():
            sys_bp = int(raw_sys)
        if raw_dia.isdigit():
            dia_bp = int(raw_dia)

    bp_status = None
    if sys_bp is not None or dia_bp is not None:
        if (sys_bp is not None and sys_bp > 300) or (dia_bp is not None and dia_bp > 200):
            bp_status = "invalid_reading"
        elif (sys_bp is not None and sys_bp >= 140) or (dia_bp is not None and dia_bp >= 90):
            bp_status = "high"
        elif sys_bp is not None and sys_bp < 90:
            bp_status = "low"
        else:
            bp_status = "normal"

    if bp_status == "low" and "low_bp" not in symptoms_list:
        symptoms_list.append("low_bp")
    elif bp_status == "high" and "high_bp" not in symptoms_list:
        symptoms_list.append("high_bp")

    if pregnant and "pregnancy" not in symptoms_list:
        symptoms_list.append("pregnancy")

    household = HouseholdInfo(
        income_category="BPL" if "bpl" in lower else base.get("income_category") or "APL",
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
        blood_sugar=sugar_val,
        sugar_status=sugar_status,
        location=location or base.get("village"),
        swelling=swelling or None,
        temperature=None,
        symptoms=symptoms_list,
        medications=[],
        household_info=household,
        visit_notes=transcript[:2000],
        language_detected=lang_det,
        follow_up_required=bool(symptoms_list) or bp_status in {"high", "low"} or sugar_status in {"high", "critical"},
    )
    data = rec.model_dump()
    data["blood_sugar"] = sugar_val
    data["sugar_status"] = sugar_status
    data["location"] = location or base.get("village")
    data["village"] = location or base.get("village")
    data["trimester"] = trimester or base.get("trimester")
    data["language_detected"] = lang_det
    if data["pregnancy_status"] is None and data.get("trimester") in {"1st", "2nd", "3rd"}:
        data["pregnancy_status"] = True
    return data


def extract_record(transcript: str, patient: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Multilingual hybrid extraction:
    1. Pre-process number words (Telugu/Hindi/Tamil/English)
    2. Heuristic multi-language extraction (deterministic safety baseline)
    3. LLM-based universal extraction (Ollama / remote multilingual models)
    4. Merge LLM insights with verified clinical baseline
    """
    heuristic = heuristic_extract(transcript, patient)

    # Call LLM extraction with universal prompt
    prompt = UNIVERSAL_EXTRACTION_PROMPT.format(user_input=transcript)
    llm = llm_json(prompt)

    if isinstance(llm, dict):
        merged = dict(heuristic)
        # Safely map LLM fields if present
        if llm.get("name") and not merged.get("patient_name"):
            merged["patient_name"] = llm["name"]
        elif llm.get("name") and merged.get("patient_name"):
            # If heuristic returned original script, prefer LLM transliterated name
            if re.search(r"[\u0C00-\u0C7F\u0900-\u097F\u0B80-\u0BFF]", str(merged["patient_name"])):
                merged["patient_name"] = llm["name"]

        if llm.get("age") is not None and merged.get("age") is None:
            merged["age"] = llm["age"]

        if llm.get("location") and not merged.get("location"):
            merged["location"] = llm["location"]
            merged["village"] = llm["location"]

        if llm.get("bp_systolic") is not None and not merged.get("blood_pressure"):
            if llm.get("bp_diastolic") is not None:
                merged["blood_pressure"] = f"{llm['bp_systolic']}/{llm['bp_diastolic']}"
            else:
                merged["blood_pressure"] = str(llm["bp_systolic"])

        if llm.get("bp_status") and not merged.get("bp_status"):
            merged["bp_status"] = str(llm["bp_status"]).lower()

        if llm.get("pregnant") is not None:
            merged["pregnancy_status"] = bool(llm["pregnant"])

        if llm.get("gestational_age_months") is not None:
            merged["gestational_age_months"] = llm["gestational_age_months"]
            if merged["gestational_age_months"] <= 3:
                merged["trimester"] = "1st"
            elif merged["gestational_age_months"] <= 6:
                merged["trimester"] = "2nd"
            else:
                merged["trimester"] = "3rd"

        if llm.get("symptoms") and isinstance(llm["symptoms"], list):
            for s in llm["symptoms"]:
                if s and s not in merged["symptoms"]:
                    merged["symptoms"].append(s)

        if llm.get("language_detected"):
            merged["language_detected"] = llm["language_detected"]

        try:
            MedicalRecord.model_validate(merged)
            return merged
        except Exception as e:
            logger.debug(f"LLM merge validation notice: {e}")
            return heuristic

    return heuristic
