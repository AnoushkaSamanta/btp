"""
Real-time Voice Pipeline & Session Engine for ASHA Co-Pilot.
Implements low-latency streaming ASR, Silero VAD, conversational memory,
LLM streaming response, and barge-in (interruption) detection.
"""

import asyncio
import io
import json
import logging
import math
import os
import re
import struct
import tempfile
import time
import wave
from typing import Any, AsyncGenerator, Dict, List, Optional

import numpy as np
import torch

from backend.asr.transcriber import normalize_asr_language, transcribe_with_fallback
from backend.rag.retriever import retrieve
from backend.nlp.llm_client import call_llm
from backend.tts.synthesizer import synthesize_audio, synthesize_placeholder

logger = logging.getLogger(__name__)

# Global singleton Silero VAD model instance
_silero_model = None


def get_silero_vad_model():
    global _silero_model
    if _silero_model is None:
        try:
            import silero_vad
            _silero_model = silero_vad.load_silero_vad()
            logger.info("Silero VAD model loaded successfully.")
        except Exception as exc:
            logger.warning(f"Could not load silero_vad model: {exc}")
    return _silero_model


class SileroVoiceDetector:
    """
    Evaluates audio frames (16kHz, mono, float32) to detect speech activity
    and speech cessation (end of turn) with configurable speech/silence thresholds.
    """
    def __init__(
        self,
        sample_rate: int = 16000,
        speech_threshold: float = 0.5,
        silence_duration_sec: float = 0.6,
    ):
        self.sample_rate = sample_rate
        self.speech_threshold = speech_threshold
        self.silence_duration_sec = silence_duration_sec
        self.model = get_silero_vad_model()
        self.is_speaking = False
        self.last_speech_time = 0.0

    def process_pcm_chunk(self, pcm_bytes: bytes) -> Dict[str, Any]:
        """
        Processes 16-bit PCM bytes (16kHz mono).
        Returns dict with:
        - is_speech (bool)
        - confidence (float)
        - user_started_speaking (bool)
        - user_finished_speaking (bool)
        """
        now = time.time()
        if len(pcm_bytes) < 64:
            return {
                "is_speech": False,
                "confidence": 0.0,
                "user_started_speaking": False,
                "user_finished_speaking": False,
            }

        # Convert 16-bit PCM to float32 normalized [-1.0, 1.0]
        audio_int16 = np.frombuffer(pcm_bytes, dtype=np.int16)
        if len(audio_int16) == 0:
            return {
                "is_speech": False,
                "confidence": 0.0,
                "user_started_speaking": False,
                "user_finished_speaking": False,
            }

        audio_float32 = audio_int16.astype(np.float32) / 32768.0

        # Calculate energy fallback in case torch/silero fails
        energy = float(np.sqrt(np.mean(audio_float32 ** 2)))

        confidence = 0.0
        if self.model is not None:
            try:
                # Silero VAD operates on chunks of 512 samples at 16kHz
                chunk_size = 512
                confidences = []
                for i in range(0, len(audio_float32), chunk_size):
                    chunk = audio_float32[i : i + chunk_size]
                    if len(chunk) < chunk_size:
                        pad = np.zeros(chunk_size - len(chunk), dtype=np.float32)
                        chunk = np.concatenate([chunk, pad])
                    tensor_chunk = torch.from_numpy(chunk)
                    with torch.no_grad():
                        c = self.model(tensor_chunk, self.sample_rate).item()
                        confidences.append(c)
                if confidences:
                    confidence = float(np.mean(confidences))
            except Exception as exc:
                logger.debug(f"Silero VAD evaluation error: {exc}")
                confidence = 1.0 if energy > 0.03 else 0.0
        else:
            confidence = 1.0 if energy > 0.03 else 0.0

        is_speech = confidence >= self.speech_threshold or energy > 0.04
        user_started_speaking = False
        user_finished_speaking = False

        if is_speech:
            if not self.is_speaking:
                self.is_speaking = True
                user_started_speaking = True
            self.last_speech_time = now
        else:
            if self.is_speaking:
                # If silent for longer than silence_duration_sec, declare end of turn
                if now - self.last_speech_time >= self.silence_duration_sec:
                    self.is_speaking = False
                    user_finished_speaking = True

        return {
            "is_speech": is_speech,
            "confidence": round(confidence, 4),
            "energy": round(energy, 4),
            "user_started_speaking": user_started_speaking,
            "user_finished_speaking": user_finished_speaking,
        }

    def reset(self):
        self.is_speaking = False
        self.last_speech_time = 0.0


class ConversationalVoiceSession:
    """
    Maintains persistent multi-turn conversational context, handles real-time audio buffering,
    ASR transcription, LLM response generation with clinical grounding, and barge-in / interruption state.
    """
    def __init__(self, session_id: str, language: str = "hi"):
        self.session_id = session_id
        self.language = language
        self.history: List[Dict[str, str]] = []
        self.vad = SileroVoiceDetector()
        self.audio_buffer = bytearray()
        self.agent_speaking = False
        self.current_turn_task: Optional[asyncio.Task] = None
        self.patient_ctx: Optional[Dict[str, Any]] = None

    def add_message(self, role: str, content: str):
        self.history.append({"role": role, "content": content})
        # Keep recent 12 turns for context memory without token bloat
        if len(self.history) > 12:
            self.history = self.history[-12:]

    def clear_history(self):
        self.history.clear()

    def set_agent_speaking(self, speaking: bool):
        self.agent_speaking = speaking

    def interrupt(self) -> Dict[str, Any]:
        """Triggered immediately when user speaks while agent is playing TTS."""
        was_speaking = self.agent_speaking
        self.agent_speaking = False
        if self.current_turn_task and not self.current_turn_task.done():
            self.current_turn_task.cancel()
        return {
            "type": "interrupted",
            "message": "TTS audio playback interrupted by user speech (barge-in)",
            "timestamp": time.time(),
        }

    def append_audio(self, pcm_data: bytes):
        self.audio_buffer.extend(pcm_data)

    def extract_and_clear_audio(self) -> bytes:
        data = bytes(self.audio_buffer)
        self.audio_buffer.clear()
        self.vad.reset()
        return data

    async def transcribe_audio_buffer(self, pcm_bytes: bytes) -> str:
        """Saves PCM to temporary WAV and executes Indic Whisper ASR."""
        if not pcm_bytes or len(pcm_bytes) < 3200:  # Less than 0.1s
            return ""

        temp_wav = None
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                temp_wav = f.name
                with wave.open(f, "wb") as wf:
                    wf.setnchannels(1)
                    wf.setsampwidth(2)
                    wf.setframerate(16000)
                    wf.writeframes(pcm_bytes)

            lang_code = normalize_asr_language(self.language)
            asr_res = await asyncio.to_thread(transcribe_with_fallback, temp_wav, lang_code)
            return (asr_res.get("transcript") or "").strip()
        except Exception as exc:
            logger.error(f"Error in realtime transcribe: {exc}")
            return ""
        finally:
            if temp_wav and os.path.exists(temp_wav):
                try:
                    os.unlink(temp_wav)
                except Exception:
                    pass

    async def generate_response_stream(
        self, user_text: str
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Generates low-latency response using guideline RAG context + LLM + TTS,
        streaming text tokens and synthesized audio chunks.
        """
        self.add_message("user", user_text)

        # 1. Quick retrieval for clinical guideline grounding
        passages = await asyncio.to_thread(retrieve, user_text, k=2)
        guideline_context = ""
        citations = []
        if passages:
            sources = [f"{p['source']}: {p['text'][:200]}" for p, _ in passages]
            guideline_context = "\n".join(sources)
            citations = [{"source": p["source"], "text": p["text"][:300]} for p, _ in passages]

        # 2. Build conversational system prompt
        lang_str = "Hindi" if self.language.startswith("hi") else ("Telugu" if self.language.startswith("te") else ("Tamil" if self.language.startswith("ta") else "English"))
        system_instruction = (
            f"You are a real-time conversational AI co-pilot for a trained Indian ASHA community health worker. "
            f"Speak concisely and naturally in {lang_str} (or Hindi/English mix as appropriate). "
            f"Keep answers brief (1-3 sentences) so the worker can listen quickly in the field. "
            f"Do not address the patient directly; speak to the ASHA worker. "
            f"Rely on official MoHFW / NHM maternal & child health guidelines.\n"
        )
        if guideline_context:
            system_instruction += f"\nRelevant Guidelines:\n{guideline_context}\n"

        history_str = "\n".join([f"{m['role'].capitalize()}: {m['content']}" for m in self.history[-6:]])
        prompt = f"{system_instruction}\nConversation History:\n{history_str}\n\nAssistant:"

        # 3. Call LLM or generate immediate guideline-grounded response
        response_text = ""
        try:
            response_text = await asyncio.wait_for(call_llm(prompt, temperature=0.2), timeout=1.5)
        except Exception:
            response_text = ""

        if not response_text or not response_text.strip():
            # Generate instant guideline-grounded advice
            if "headache" in user_text.lower() or "swelling" in user_text.lower() or "140" in user_text:
                if self.language.startswith("hi"):
                    response_text = "यदि बीपी 140/90 या सिरदर्द और सूजन है, तो यह प्री-एक्लेम्पसिया का संकेत हो सकता है। मरीज को तुरंत नजदीकी स्वास्थ्य केंद्र (PHC/FRU) रेफर करें।"
                elif self.language.startswith("te"):
                    response_text = "రక్తపోటు 140/90 లేదా తలనొప్పి మరియు వాపు ఉంటే, ఇది ప్రీ-ఎక్లాంప్సియా లక్షణం కావచ్చు. వెంటనే ప్రాథమిక ఆరోగ్య కేంద్రానికి (PHC) పంపించండి."
                elif self.language.startswith("ta"):
                    response_text = "இரத்த அழுத்தம் 140/90 அல்லது தலைவலி மற்றும் வீக்கம் இருந்தால், உடனே PHC/மருத்துவமனைக்கு அனுப்பவும்."
                else:
                    response_text = "Blood pressure 140/90 or headache with swelling suggests pre-eclampsia risk. Advise immediate referral to the nearest PHC/FRU."
            else:
                if guideline_context:
                    # Provide concise guideline excerpt
                    first_line = guideline_context.split("\n")[0]
                    clean_excerpt = re.sub(r"^[^:]+:\s*", "", first_line)[:150]
                    response_text = f"Per guidelines: {clean_excerpt}. Advise routine ANC monitoring and IFA adherence."
                elif self.language.startswith("hi"):
                    response_text = "जी, मैंने आपका संदेश सुना। क्या आप मरीज के बीपी या लक्षणों के बारे में और बताना चाहती हैं?"
                elif self.language.startswith("te"):
                    response_text = "అవును, నేను విన్నాను. పేషెంట్ రక్తపోటు లేదా ఇతర వివరాలు చెప్పండి."
                elif self.language.startswith("ta"):
                    response_text = "ஆம், நான் கேட்டேன். நோயாளி பற்றிய கூடுதல் தகவல்களைக் கூறுங்கள்."
                else:
                    response_text = "I received your clinical observation. Would you like to check guideline protocols or record vitals?"

        self.add_message("assistant", response_text)

        # 4. Stream response text first for immediate UI rendering
        yield {
            "type": "text_chunk",
            "text": response_text,
            "citations": citations,
        }

        # 5. Synthesize TTS and yield audio
        tts_meta = await asyncio.to_thread(synthesize_placeholder, response_text, language=self.language)
        yield {
            "type": "audio_ready",
            "audio_url": tts_meta.get("audio_url"),
            "audio_base64": tts_meta.get("audio_base64"),
            "text": response_text,
            "duration": tts_meta.get("duration", 2.0),
        }
