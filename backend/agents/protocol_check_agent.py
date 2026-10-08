from typing import Any, Dict, List

from backend.rag.retriever import retrieve
from backend.rules.red_flags import evaluate_red_flags


def check_protocols(record: Dict[str, Any], transcript: str) -> Dict[str, Any]:
    query_parts = [transcript]
    query_parts.extend(record.get("symptoms") or [])
    if record.get("bp_status"):
        query_parts.append(f"blood pressure {record.get('blood_pressure')} {record.get('bp_status')}")
    if record.get("pregnancy_status"):
        query_parts.append("pregnancy danger signs ANC")
    query = " ".join(str(p) for p in query_parts if p)
    passages = retrieve(query, k=4)
    citations = [{"source": ch["source"], "text": ch["text"][:500], "score": score} for ch, score in passages]

    flags = evaluate_red_flags(record)
    narrative = []
    if flags:
        narrative.append("Red-flag rule layer (takes precedence):")
        for f in flags:
            narrative.append(f"- [{f['severity']}] {f['title']}: {f['action']}")
    else:
        narrative.append("No hardcoded critical red flags matched. Continue routine protocol.")
    if citations:
        narrative.append("\nGuideline passages (for the worker to review, not patient advice):")
        narrative.append(citations[0]["text"][:400])

    return {
        "flags": flags,
        "citations": citations,
        "summary": "\n".join(narrative),
        "needs_escalation": any(f.get("severity") == "critical" for f in flags),
    }
