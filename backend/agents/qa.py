from backend.rag.retriever import retrieve


def answer_worker_query(query: str, language: str = "English") -> dict:
    passages = retrieve(query, k=3)
    sources = [f"{p['source']}" for p, _ in passages]
    body_bits = [p["text"] for p, _ in passages]
    text = "\n\n".join(body_bits[:2]) if body_bits else (
        "No relevant passage was found in the local guideline index. "
        "Do not infer a protocol from this result; check the current official guidance or ask the Medical Officer."
    )
    preface = (
        "For you as the ASHA (not to read as patient advice):\n\n"
        if not language.lower().startswith("hi")
        else "ASHA ke liye (patient ko seedha salah nahi):\n\n"
    )
    return {
        "text": preface + text,
        "sources": sources,
        "citations": [{"source": p["source"], "text": p["text"][:400]} for p, s in passages],
    }
