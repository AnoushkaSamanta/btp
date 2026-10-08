import pytest

from backend.asr.transcriber import _usable_transcript, normalize_asr_language
from backend.agents.structuring_agent import extract_record


@pytest.mark.parametrize(
    ("language", "expected"),
    [("English", "en"), ("hi-IN", "hi"), ("Bhojpuri", "hi"), ("Tamil", "ta"), ("te-IN", "te")],
)
def test_asr_language_aliases(language, expected):
    assert normalize_asr_language(language) == expected


def test_asr_rejects_unknown_language():
    with pytest.raises(ValueError, match="Unsupported ASR language"):
        normalize_asr_language("Klingon")


def test_asr_discards_whisper_silence_hallucination():
    result = {"text": "Please take this medicine", "segments": [{"no_speech_prob": 0.93}]}
    assert _usable_transcript(result) == ""


def test_asr_keeps_speech_transcript():
    result = {"text": "  नमस्ते  ", "segments": [{"no_speech_prob": 0.02}]}
    assert _usable_transcript(result) == "नमस्ते"


def test_suggested_visit_name_is_not_sent_as_name_prefix():
    record = extract_record("Visited Lakshmi Devi 24 years, pregnant, BP 140/90.")
    assert record["patient_name"] == "Lakshmi Devi"
