"""
ASR Transcriber module for code-mixed Indic speech (Hindi, Tamil, Telugu, English).
"""

import os
import shutil
import logging
from typing import Dict, Any, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure ffmpeg binary is in PATH for whisper / pydub
if not shutil.which("ffmpeg"):
    potential_ffmpeg_paths = [
        r"C:\Users\loq\.antigravity-ide\extensions\kilocode.kilo-code-7.8.8-win32-x64\bin",
        r"C:\ffmpeg\bin",
        r"C:\Program Files\ffmpeg\bin",
    ]
    for p in potential_ffmpeg_paths:
        if os.path.exists(os.path.join(p, "ffmpeg.exe")):
            os.environ["PATH"] = p + os.pathsep + os.environ.get("PATH", "")
            break

# Lazy loading avoids importing Whisper or downloading model weights at API startup.
_whisper_models: Dict[str, Any] = {}
ASR_LANGUAGE_ALIASES = {
    "hindi": "hi", "hi-in": "hi", "hi": "hi",
    "bhojpuri": "hi",  # Whisper has no Bhojpuri language code, so this is a Hindi transcription fallback.
    "english": "en", "en-us": "en", "en-in": "en", "en": "en",
    "tamil": "ta", "ta-in": "ta", "ta": "ta",
    "telugu": "te", "te-in": "te", "te": "te",
}


def normalize_asr_language(language: str) -> str:
    normalized = ASR_LANGUAGE_ALIASES.get(language.strip().lower())
    if not normalized:
        raise ValueError("Unsupported ASR language. Use English, Hindi, Tamil, Telugu, or Bhojpuri (Hindi fallback).")
    return normalized


def _usable_transcript(result: Dict[str, Any]) -> str:
    """Reject empty/silence-only Whisper output instead of acting on a guess."""
    segments = result.get("segments") or []
    if segments and all(float(segment.get("no_speech_prob", 0.0)) >= 0.6 for segment in segments):
        return ""
    return str(result.get("text") or "").strip()

def get_whisper_model(model_name: Optional[str] = None):
    """Lazy initialization of the Whisper model."""
    from backend.config import WHISPER_MODEL
    import whisper

    selected_model = model_name or WHISPER_MODEL
    if selected_model not in _whisper_models:
        try:
            logger.info("Loading Whisper model '%s'...", selected_model)
            _whisper_models[selected_model] = whisper.load_model(selected_model)
            logger.info("Whisper model '%s' loaded successfully.", selected_model)
        except Exception as exc:
            logger.error("Failed to load Whisper model '%s': %s", selected_model, exc)
            raise
    return _whisper_models[selected_model]


def transcribe(audio_path: str, language: str = "hi") -> str:
    """
    Transcribe code-mixed Hindi/Tamil/Telugu-English speech.

    Args:
        audio_path: Path to audio file (.wav, .mp3, .m4a)
        language: Language code (hi, ta, te, en)

    Returns:
        Transcribed text as string
    """
    if not os.path.exists(audio_path):
        logger.error(f"Audio file not found: {audio_path}")
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    try:
        model = get_whisper_model()
        logger.info(f"Transcribing audio file: {audio_path} with language={language}")
        
        # transcribe call
        kwargs = {"condition_on_previous_text": False}
        if language:
            kwargs["language"] = language
            
        result = model.transcribe(audio_path, **kwargs)
        transcript = _usable_transcript(result)
        if not transcript:
            raise RuntimeError("No clear speech was recognized. Check the recording and try again.")
        logger.info("Transcription completed successfully.")
        return transcript

    except Exception as e:
        logger.error(f"Error during transcription: {e}")
        raise RuntimeError(f"Transcription failed: {str(e)}") from e


def transcribe_with_fallback(audio_path: str, language: str = "hi") -> Dict[str, Any]:
    """
    Try IndicWhisper / Whisper first, fallback if unavailable/error.
    Returns dict with transcript, confidence, and model_used.

    Args:
        audio_path: Path to audio file (.wav, .mp3, .m4a)
        language: Language code (hi, ta, te, en)

    Returns:
        Dict with keys: transcript, confidence, model_used, status
    """
    if not os.path.exists(audio_path):
        logger.error(f"Audio file not found: {audio_path}")
        return {
            "transcript": "",
            "confidence": None,
            "model_used": "None",
            "status": "error",
            "error": f"File not found: {audio_path}"
        }

    # Attempt primary model (OpenAI Whisper / IndicWhisper)
    try:
        from backend.config import WHISPER_MODEL

        transcript = transcribe(audio_path, language=language)
        return {
            "transcript": transcript,
            # Whisper's basic transcription API does not provide calibrated
            # utterance confidence. Do not manufacture a confidence score.
            "confidence": None,
            "model_used": f"openai-whisper-{WHISPER_MODEL}",
            "status": "success"
        }
    except Exception as primary_error:
        logger.warning(f"Primary whisper transcription failed: {primary_error}. Trying fallback mechanism...")
        if "No clear speech was recognized" in str(primary_error):
            return {
                "transcript": "",
                "confidence": None,
                "model_used": f"openai-whisper-{WHISPER_MODEL}",
                "status": "error",
                "error": str(primary_error),
            }
        
        # Retry with the smaller local model; model caching is keyed by model name.
        try:
            # Example fallback logic using standard whisper tiny/cpu or API mock placeholder
            model_fallback = get_whisper_model(model_name="tiny")
            result = model_fallback.transcribe(audio_path, language=language, condition_on_previous_text=False)
            transcript = _usable_transcript(result)
            if not transcript:
                raise RuntimeError("No clear speech was recognized. Check the recording and try again.")
            return {
                "transcript": transcript,
                "confidence": None,
                "model_used": "openai-whisper-tiny-fallback",
                "status": "success"
            }
        except Exception as fallback_error:
            logger.error(f"Fallback transcription failed: {fallback_error}")
            return {
                "transcript": "",
                "confidence": None,
                "model_used": "None",
                "status": "error",
                "error": f"Primary: {str(primary_error)} | Fallback: {str(fallback_error)}"
            }
