import re
from typing import Dict, Any, Tuple

GREETINGS = {
    "hello", "hi", "hey", "namaste", "namaskar", "salaam", "pranam",
    "good morning", "good afternoon", "good evening", "how are you",
    "test", "testing", "ok", "okay", "bye", "goodbye", "thanks", "thank you"
}

MEDICAL_KEYWORDS = [
    # Vitals & clinical measurements
    "bp", "blood pressure", "systolic", "diastolic", "sugar", "blood sugar",
    "glucose", "rbs", "fbs", "hemoglobin", "hb", "weight", "wt", "temperature",
    "temp", "pulse", "heart rate", "spo2", "vitals",
    # Pregnancy & maternal
    "pregnant", "pregnancy", "trimester", "anc", "pnc", "delivery", "weeks",
    "month", "months", "postnatal", "postpartum", "gravida", "para", "lmp",
    "fetal", "baby", "garbhavati", "prasav", "maah", "mahine",
    # Symptoms & conditions
    "fever", "bukhar", "swelling", "soojan", "edema", "headache", "sir dard",
    "pain", "dard", "vomiting", "ulti", "bleeding", "khoon", "cough", "khansi",
    "cold", "diarrhea", "dast", "weakness", "kamzori", "fatigue", "dizziness",
    "chakkar", "seizure", "convulsion", "anemia", "hypertension", "diabetes",
    # Patient indicators & age
    "years", "year", "yrs", "yr", "saal", "age", "visited", "visiting",
    "patient", "devi", "kumari", "sharma", "yadav", "prasad", "singh",
    # Welfare & health programs
    "bpl", "apl", "aadhaar", "mcp", "mcp card", "jsy", "pmmvy", "pmjay",
    "ayushman", "jssk", "ration", "poshan", "immunization", "vaccine", "teeka"
]

def validate_visit_input(text: str) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Validates user input to ensure it represents a meaningful visit note
    or clinical observation rather than a greeting or non-medical text.

    Returns:
        (is_valid, error_message, metadata)
    """
    cleaned = text.strip()
    if not cleaned:
        return False, "Input is empty. Please enter your visit observations.", {"reason": "empty"}

    lower = cleaned.lower()
    # Strip basic punctuation
    normalized_words = re.sub(r"[^\w\s]", "", lower).split()
    normalized_text = " ".join(normalized_words)

    # 1. Pure greeting check
    if normalized_text in GREETINGS or (len(normalized_words) <= 2 and any(w in GREETINGS for w in normalized_words)):
        return False, (
            "I couldn't find a visit note in your input. Please describe your observation.\n\n"
            "Example:\n"
            "\"Lakshmi Devi, 8 months pregnant, BP 140/90, swelling in feet.\"\n\n"
            "Or click a sample on the right."
        ), {"reason": "greeting"}

    # 2. Check for medical keywords / indicators
    matched_keywords = [kw for kw in MEDICAL_KEYWORDS if kw in lower or kw in normalized_words]

    # Special check: numbers after BP or blood pressure
    has_bp_number = bool(re.search(r"\b(?:\d{2,3}\s*/\s*\d{2,3})\b", cleaned))
    has_sugar_number = bool(re.search(r"\b(?:sugar|glucose|rbs)\s*[:=]?\s*\d{2,3}\b", lower))
    has_age = bool(re.search(r"\b\d{1,2}\s*(?:years?|yrs?|saal)\b", lower))

    if not matched_keywords and not has_bp_number and not has_sugar_number and not has_age:
        # Check text length and density
        if len(cleaned) < 25:
            return False, (
                "I couldn't find a visit note in your input. Please describe your observation.\n\n"
                "Example:\n"
                "\"Lakshmi Devi, 8 months pregnant, BP 140/90, swelling in feet.\"\n\n"
                "Or click a sample on the right."
            ), {"reason": "no_medical_keywords"}

    return True, "", {"matched_keywords": matched_keywords}
