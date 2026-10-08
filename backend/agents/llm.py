import json
import logging
from typing import Optional

from backend.config import OLLAMA_MODEL, USE_LLM

logger = logging.getLogger(__name__)


def llm_json(prompt: str) -> Optional[dict]:
    if not USE_LLM:
        return None
    try:
        import ollama

        res = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": "Return only valid JSON. Worker-facing ASHA copilot. Never advise a patient directly."},
                {"role": "user", "content": prompt},
            ],
        )
        text = res["message"]["content"]
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            return json.loads(text[start : end + 1])
    except Exception as exc:
        logger.warning("LLM unavailable: %s", exc)
    return None


def llm_text(prompt: str) -> Optional[str]:
    if not USE_LLM:
        return None
    try:
        import ollama

        res = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": "You assist trained ASHA workers. Be concise. Never speak as if addressing an untrained patient."},
                {"role": "user", "content": prompt},
            ],
        )
        return res["message"]["content"]
    except Exception as exc:
        logger.warning("LLM unavailable: %s", exc)
    return None
