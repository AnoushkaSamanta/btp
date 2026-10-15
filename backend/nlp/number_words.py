"""
Number words mapping for Telugu, Hindi, Tamil, and English.
Converts written number words into numerical digits for code-mixed speech.
"""

import re
from typing import Dict

# Telugu number words to digits
TELUGU_NUMBERS: Dict[str, int] = {
    "సున్నా": 0,
    "ఒకటి": 1, "ఒక": 1,
    "రెండు": 2,
    "మూడు": 3,
    "నాలుగు": 4, "నలుగురు": 4,
    "ఐదు": 5,
    "ఆరు": 6,
    "ఏడు": 7,
    "ఎనిమిది": 8,
    "తొమ్మిది": 9,
    "పది": 10,
    "పదకొండు": 11,
    "పన్నెండు": 12,
    "పదమూడు": 13,
    "పద్నాలుగు": 14,
    "పదిహేను": 15,
    "పదహారు": 16,
    "పదిహేడు": 17,
    "పద్దెనిమిది": 18,
    "పంతొమ్మిది": 19,
    "ఇరవై": 20, "ఇరవై ఒకటి": 21, "ఇరవై రెండు": 22, "ఇరవై మూడు": 23, "ఇరవై నాలుగు": 24,
    "ఇరవై ఐదు": 25, "ఇరవై ఆరు": 26, "ఇరవై ఏడు": 27, "ఇరవై ఎనిమిది": 28, "ఇరవై తొమ్మిది": 29,
    "ముప్పై": 30, "ముప్పై ఒకటి": 31, "ముప్పై రెండు": 32, "ముప్పై మూడు": 33, "ముప్పై నాలుగు": 34, "ముప్పై ఐదు": 35,
    "నలభై": 40, "యాభై": 50, "అరవై": 60, "డెబ్బై": 70, "ఎనభై": 80, "తొంభై": 90, "వంద": 100,
}

# Hindi number words
HINDI_NUMBERS: Dict[str, int] = {
    "शून्य": 0, "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पाँच": 5, "पांच": 5,
    "छह": 6, "सात": 7, "आठ": 8, "नौ": 9, "दस": 10,
    "ग्यारह": 11, "बारह": 12, "तेरह": 13, "चौदह": 14, "पंद्रह": 15, "सोलह": 16,
    "सत्रह": 17, "अठारह": 18, "उन्नीस": 19, "बीस": 20, "इक्कीस": 21, "बाईस": 22,
    "तेईस": 23, "चौबीस": 24, "पच्चीस": 25, "छब्बीस": 26, "सत्ताईस": 27, "अट्ठाइस": 28,
    "उनतीस": 29, "तीस": 30, "इकतीस": 31, "बत्तीस": 32, "तैंतीस": 33, "चौंतीस": 34,
    "पैंतीस": 35, "छत्तीस": 36, "सैंतीस": 37, "अड़तीस": 38, "उनतालीस": 39, "चालीस": 40,
    "पचास": 50, "साठ": 60, "सत्तर": 70, "अस्सी": 80, "नब्बे": 90, "सौ": 100,
}

# Tamil number words
TAMIL_NUMBERS: Dict[str, int] = {
    "பூஜ்ஜியம்": 0, "ஒன்று": 1, "இரண்டு": 2, "மூன்று": 3, "நான்கு": 4,
    "ஐந்து": 5, "ஆறு": 6, "ஏழு": 7, "எட்டு": 8, "ஒன்பது": 9, "பத்து": 10,
    "பதினொன்று": 11, "பன்னிரண்டு": 12, "இருபது": 20, "இருபத்தியொன்று": 21, "இருபத்தி நான்கு": 24,
    "முப்பது": 30, "நாற்பது": 40, "ஐம்பது": 50, "நூறு": 100,
}

# English number words
ENGLISH_NUMBERS: Dict[str, int] = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
    "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19, "twenty": 20,
    "twenty one": 21, "twenty two": 22, "twenty three": 23, "twenty four": 24, "twenty five": 25,
    "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90,
}

def replace_number_words(text: str) -> str:
    """Replaces number words in Telugu, Hindi, Tamil, and English with digit strings."""
    if not text:
        return ""
    
    result = text
    # Combine multi-word expressions first (longest first)
    all_maps = [TELUGU_NUMBERS, HINDI_NUMBERS, TAMIL_NUMBERS, ENGLISH_NUMBERS]
    combined: Dict[str, int] = {}
    for m in all_maps:
        combined.update(m)
    
    # Sort keys by descending length so multi-word tokens (e.g. "ఇరవై నాలుగు") get matched before "ఇరవై"
    sorted_words = sorted(combined.keys(), key=lambda k: len(k), reverse=True)
    
    for word in sorted_words:
        pattern = r"(?<!\w)" + re.escape(word) + r"(?!\w)"
        result = re.sub(pattern, str(combined[word]), result, flags=re.IGNORECASE)
        
    return result
