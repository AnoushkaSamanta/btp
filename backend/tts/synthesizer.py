"""Browser TTS is primary. Backend returns spoken text; optional local synth later."""


def synthesize_placeholder(text: str, language: str = "hi") -> dict:
    return {
        "engine": "client-speech-synthesis",
        "text": text,
        "language": language,
        "audio_url": None,
        "note": "Play this text with the browser SpeechSynthesis API for Indic/English read-back.",
    }
