"""
ASR Transcriber module for code-mixed Indic speech (Hindi, Tamil, Telugu, English).
"""

import os
import logging
from typing import Dict, Any, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lazy loading whisper to allow module import without instant heavy GPU/CPU model loading
_whisper_model = None

def get_whisper_model(model_name: str = "small"):
    """Lazy initialization of the Whisper model."""
    global _whisper_model
    if _whisper_model is None:
        try:
            import whisper
            logger.info(f"Loading Whisper model '{model_name}'...")
            _whisper_model = whisper.load_model(model_name)
            logger.info("Whisper model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load Whisper model '{model_name}': {e}")
            raise e
    return _whisper_model


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
        kwargs = {}
        if language:
            kwargs["language"] = language
            
        result = model.transcribe(audio_path, **kwargs)
        transcript = result.get("text", "").strip()
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
            "confidence": 0.0,
            "model_used": "None",
            "status": "error",
            "error": f"File not found: {audio_path}"
        }

    # Attempt primary model (OpenAI Whisper / IndicWhisper)
    try:
        transcript = transcribe(audio_path, language=language)
        return {
            "transcript": transcript,
            "confidence": 0.85,  # Placeholder standard confidence score for whisper outputs
            "model_used": "openai-whisper-small",
            "status": "success"
        }
    except Exception as primary_error:
        logger.warning(f"Primary whisper transcription failed: {primary_error}. Trying fallback mechanism...")
        
        # Fallback simulation/handling (e.g. OpenAI API / Bhashini API or basic fallback)
        try:
            # Example fallback logic using standard whisper tiny/cpu or API mock placeholder
            model_fallback = get_whisper_model(model_name="tiny")
            result = model_fallback.transcribe(audio_path, language=language)
            transcript = result.get("text", "").strip()
            return {
                "transcript": transcript,
                "confidence": 0.70,
                "model_used": "openai-whisper-tiny-fallback",
                "status": "success"
            }
        except Exception as fallback_error:
            logger.error(f"Fallback transcription failed: {fallback_error}")
            return {
                "transcript": "",
                "confidence": 0.0,
                "model_used": "None",
                "status": "error",
                "error": f"Primary: {str(primary_error)} | Fallback: {str(fallback_error)}"
            }
