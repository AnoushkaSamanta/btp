from pathlib import Path
from typing import List, Tuple
import re

from backend.config import GUIDELINES_DIR

_CHUNKS: List[dict] = []


def _split_paragraphs(text: str, source: str) -> List[dict]:
    parts = re.split(r"\n\s*\n", text.strip())
    chunks = []
    for i, p in enumerate(parts):
        p = p.strip()
        if len(p) < 40:
            continue
        chunks.append({"id": f"{source}-{i}", "source": source, "text": p})
    return chunks


def load_chunks() -> List[dict]:
    global _CHUNKS
    if _CHUNKS:
        return _CHUNKS
    if not GUIDELINES_DIR.exists():
        return []
    for path in sorted(GUIDELINES_DIR.glob("*.txt")):
        _CHUNKS.extend(_split_paragraphs(path.read_text(encoding="utf-8"), path.stem))
    return _CHUNKS


def _tokenize(text: str) -> set:
    # `[^\W_]` matches Unicode letters and numbers across Devanagari, Tamil,
    # Telugu, and Latin scripts while excluding underscores and punctuation.
    return set(re.findall(r"[^\W_]{2,}", text.lower(), flags=re.UNICODE))


def retrieve(query: str, k: int = 4) -> List[Tuple[dict, float]]:
    if k <= 0:
        return []
    chunks = load_chunks()
    q = _tokenize(query)
    if not q:
        return []
    scored = []
    for ch in chunks:
        tokens = _tokenize(ch["text"])
        if not tokens:
            continue
        overlap = len(q & tokens)
        score = overlap / (len(q) ** 0.5 + 0.1)
        if score > 0:
            scored.append((ch, round(score, 3)))
    scored.sort(key=lambda x: x[1], reverse=True)
    # Never present arbitrary chunks as evidence when retrieval found no match.
    return scored[:k]
