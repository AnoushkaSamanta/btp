import re
from typing import Dict, List

DEVANAGARI = re.compile(r"[\u0900-\u097F]")
TAMIL = re.compile(r"[\u0B80-\u0BFF]")
TELUGU = re.compile(r"[\u0C00-\u0C7F]")

NUM_WORDS = {
    "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4",
    "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9",
    "ten": "10", "eleven": "11", "twelve": "12",
    "ek": "1", "do": "2", "teen": "3", "char": "4", "paanch": "5",
}


def detect_language_mix(text: str) -> Dict[str, object]:
    scripts: List[str] = []
    if DEVANAGARI.search(text):
        scripts.append("hi")
    if TAMIL.search(text):
        scripts.append("ta")
    if TELUGU.search(text):
        scripts.append("te")
    latin = bool(re.search(r"[A-Za-z]", text))
    if latin:
        scripts.append("en")
    return {
        "scripts": scripts or ["en"],
        "code_mixed": len(set(scripts)) > 1,
        "primary": scripts[0] if scripts else "en",
    }


def normalize_transcript(text: str) -> str:
    if not text:
        return ""
    cleaned = text.replace("\u00a0", " ").strip()
    cleaned = re.sub(r"\s+", " ", cleaned)
    for word, digit in NUM_WORDS.items():
        cleaned = re.sub(rf"\b{word}\b", digit, cleaned, flags=re.I)
    cleaned = cleaned.replace("बी पी", "BP").replace("बीपी", "BP")
    cleaned = cleaned.replace("blood pressure", "BP")
    cleaned = re.sub(r"\bhb\b", "Hb", cleaned, flags=re.I)
    cleaned = re.sub(r"(\d+)\s*/\s*(\d+)", r"\1/\2", cleaned)
    return cleaned
