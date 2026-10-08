"""
Audio preprocessor module for ASR pipeline.
Handles audio loading, resampling to 16kHz, mono conversion, noise reduction, and volume normalization.
"""

import os
import tempfile
import logging
from typing import Dict, Any, Tuple
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def reduce_noise_spectral_gating(y: np.ndarray, sr: int, n_std_thresh: float = 1.5) -> np.ndarray:
    """
    Simple spectral gating noise reduction using STFT (via librosa if available).
    """
    try:
        import librosa
        stft = librosa.stft(y)
        stft_db = librosa.amplitude_to_db(np.abs(stft), ref=np.max)

        # Estimate noise threshold from quietest 10% of frames
        noise_level = np.mean(stft_db, axis=1, keepdims=True)
        mean_noise = np.mean(noise_level)
        std_noise = np.std(noise_level)
        thresh = mean_noise + n_std_thresh * std_noise

        # Mask frequencies below threshold
        mask = stft_db > thresh
        stft_clean = stft * mask

        # Inverse STFT
        y_clean = librosa.istft(stft_clean)
        return y_clean
    except Exception as e:
        logger.warning(f"Spectral gating noise reduction skipped/failed: {e}")
        return y


def normalize_volume(y: np.ndarray, target_dBFS: float = -20.0) -> np.ndarray:
    """
    Normalize peak audio volume to avoid clipping and ensure consistent levels.
    """
    rms = np.sqrt(np.mean(y ** 2))
    if rms == 0:
        return y
    scalar = 10 ** (target_dBFS / 20) / (rms + 1e-7)
    normalized = y * scalar
    return np.clip(normalized, -1.0, 1.0)


def validate_audio(audio_path: str) -> Dict[str, Any]:
    """
    Validate audio file (format, duration, sample rate).

    Args:
        audio_path: Path to audio file

    Returns:
        dict with is_valid, duration, sample_rate, error_message
    """
    if not os.path.exists(audio_path):
        return {
            "is_valid": False,
            "duration": 0.0,
            "sample_rate": 0,
            "error_message": f"File does not exist: {audio_path}"
        }

    try:
        import soundfile as sf
        info = sf.info(audio_path)
        return {
            "is_valid": True,
            "duration": float(info.duration),
            "sample_rate": int(info.samplerate),
            "channels": int(info.channels),
            "format": str(info.format),
            "error_message": ""
        }
    except Exception as e:
        try:
            import librosa
            duration = librosa.get_duration(path=audio_path)
            sr = librosa.get_samplerate(audio_path)
            return {
                "is_valid": True,
                "duration": float(duration),
                "sample_rate": int(sr),
                "error_message": ""
            }
        except Exception as err:
            logger.error(f"Audio validation failed for {audio_path}: {err}")
            return {
                "is_valid": False,
                "duration": 0.0,
                "sample_rate": 0,
                "error_message": f"Invalid audio file: {str(err)}"
            }


def preprocess_audio(audio_path: str, target_sr: int = 16000) -> str:
    """
    Preprocess audio for ASR.

    Resample to 16 kHz, convert to mono, check for empty/near-silent input,
    normalize moderate volume differences, and save as PCM WAV. Aggressive
    spectral gating is intentionally not applied because it can remove speech
    phonemes and make recognition less reliable when there is no clean noise-only
    segment to estimate from.

    Args:
        audio_path: Path to input audio file
        target_sr: Target sample rate (default 16000)

    Returns:
        Path to preprocessed audio file
    """
    try:
        import librosa
        import soundfile as sf
    except ImportError as e:
        raise ImportError("librosa and soundfile are required for audio preprocessing. Please run 'pip install -r requirements.txt'") from e

    validation = validate_audio(audio_path)
    if not validation["is_valid"]:
        raise ValueError(f"Cannot preprocess audio: {validation['error_message']}")

    logger.info(f"Loading audio from {audio_path}...")
    y, sr = librosa.load(audio_path, sr=target_sr, mono=True)
    if y.size == 0 or validation["duration"] < 0.5:
        raise ValueError("Recording is too short. Record at least half a second of speech.")
    rms = float(np.sqrt(np.mean(np.square(y))))
    if not np.isfinite(rms) or rms < 0.001:
        raise ValueError("No clear speech was detected; the recording is silent or too quiet. Check the microphone and try again.")

    logger.info("Normalizing recording volume without spectral noise gating...")
    y_normalized = normalize_volume(y)

    temp_dir = tempfile.gettempdir()
    temp_file_path = os.path.join(temp_dir, f"preprocessed_{os.path.basename(audio_path)}")
    if not temp_file_path.endswith(".wav"):
        temp_file_path = os.path.splitext(temp_file_path)[0] + ".wav"

    logger.info(f"Saving preprocessed audio to {temp_file_path}...")
    sf.write(temp_file_path, y_normalized, target_sr, subtype='PCM_16')

    return temp_file_path
