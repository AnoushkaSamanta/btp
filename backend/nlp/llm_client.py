"""
Unified LLM Client supporting Ollama, Groq, Gemini, or local fallback.
"""

import json
import os
import re
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

async def call_llm(
    prompt: str,
    model: str = "llama-3.1-8b",
    temperature: float = 0.0,
    response_format: Optional[Dict[str, str]] = None,
) -> str:
    """
    Call LLM with fallback chain:
    1. Ollama (local llama3 / llama-3.1-8b)
    2. Gemini / Groq / OpenAI if configured via environment variables
    3. Return empty string on failure
    """
    # 1. Try Ollama if available
    try:
        import ollama
        actual_model = os.getenv("ASHA_OLLAMA_MODEL", model)
        # Use simple format parameter if response_format requested
        format_param = "json" if response_format and response_format.get("type") == "json_object" else None
        kwargs: Dict[str, Any] = {
            "model": actual_model,
            "messages": [{"role": "user", "content": prompt}],
            "options": {"temperature": temperature},
        }
        if format_param:
            kwargs["format"] = format_param
        res = ollama.chat(**kwargs)
        content = res.get("message", {}).get("content", "")
        if content:
            return content
    except Exception as exc:
        logger.debug(f"Ollama call skipped or failed: {exc}")

    # 2. Try OpenAI-compatible API (e.g. Groq, OpenRouter, LocalAI) if API key provided
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("GROQ_API_KEY")
    if api_key:
        try:
            import httpx
            base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
            payload: Dict[str, Any] = {
                "model": os.getenv("ASHA_REMOTE_MODEL", "gpt-4o-mini"),
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
            }
            if response_format and response_format.get("type") == "json_object":
                payload["response_format"] = {"type": "json_object"}
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.post(f"{base_url}/chat/completions", headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"]
        except Exception as exc:
            logger.debug(f"Remote LLM call failed: {exc}")

    return ""
