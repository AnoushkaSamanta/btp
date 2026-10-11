import os
import re
from pathlib import Path
from typing import List, Tuple
from langchain_community.vectorstores import Chroma
from backend.rag.embeddings import get_embedding_model, load_and_chunk_documents
from backend.config import GUIDELINES_DIR

_DB = None
_CHUNKS: List[dict] = []

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROMA_DB_DIR = os.path.join(BASE_DIR, "chroma_db")


def get_db():
    global _DB
    if _DB is not None:
        return _DB

    if not os.path.exists(CHROMA_DB_DIR):
        return None

    try:
        embedding_model = get_embedding_model()
        _DB = Chroma(persist_directory=CHROMA_DB_DIR, embedding_function=embedding_model)
        return _DB
    except Exception as e:
        print(f"Warning: Could not open Chroma DB: {e}")
        return None


def _split_paragraphs(text: str, source: str) -> List[dict]:
    parts = re.split(r"\n\s*\n", text.strip())
    chunks = []
    for i, p in enumerate(parts):
        p = p.strip()
        if len(p) < 40:
            continue
        chunks.append({"id": f"{source}-{i}", "source": source, "text": p, "page": 1})
    return chunks


def load_chunks() -> List[dict]:
    global _CHUNKS
    if _CHUNKS:
        return _CHUNKS
    if not GUIDELINES_DIR.exists():
        return []
    for path in sorted(GUIDELINES_DIR.glob("*.txt")):
        try:
            _CHUNKS.extend(_split_paragraphs(path.read_text(encoding="utf-8"), path.stem))
        except Exception:
            pass
    return _CHUNKS


def _tokenize(text: str) -> set:
    return set(re.findall(r"[^\W_]{2,}", text.lower(), flags=re.UNICODE))


def _text_retrieve(query: str, k: int = 4) -> List[Tuple[dict, float]]:
    chunks = load_chunks()
    q = _tokenize(query)
    if not q or not chunks:
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
    return scored[:k]


def retrieve(query: str, k: int = 4) -> List[Tuple[dict, float]]:
    """
    Retrieve top k chunks for a given query.
    Returns a list of tuples containing (chunk_dict, score).
    Prefers Chroma MMR search if available; falls back smoothly to text search.
    """
    if k <= 0:
        return []

    db = get_db()
    if db:
        try:
            results = db.max_marginal_relevance_search(query, k=k, fetch_k=20)
            if results:
                formatted_results = []
                for doc in results:
                    formatted_results.append((
                        {
                            "source": os.path.basename(doc.metadata.get("source", "unknown")),
                            "text": doc.page_content,
                            "page": doc.metadata.get("page", 0)
                        },
                        1.0
                    ))
                return formatted_results
        except Exception as e:
            print(f"Error during Chroma retrieval: {e}")

    # Fallback to local guidelines text search
    return _text_retrieve(query, k=k)


class GuidelineChunk:
    def __init__(self, data: dict):
        self._data = data
        self.page_content = data.get("text", "")
        self.metadata = {
            "source": data.get("source", "unknown"),
            "page": data.get("page", 0)
        }

    def __getitem__(self, item):
        return self._data[item]

    def get(self, key, default=None):
        return self._data.get(key, default)


def retrieve_guidelines(query: str, k: int = 4) -> List[GuidelineChunk]:
    results = retrieve(query, k=k)
    return [GuidelineChunk(item[0]) for item in results]


def ingest_documents_to_chroma(data_dir: str = None) -> bool:
    load_chunks()
    return True
