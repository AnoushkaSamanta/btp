"""
Evaluation Metrics for Speech and Transcription (WER, CMI).
- WER: Word Error Rate via jiwer (or Levenshtein word distance fallback)
- CMI: Code-Mixing Index (measures ratio of language alternation in Indic-English mix)
"""
from typing import List, Dict, Any, Union

def calculate_wer(reference: str, hypothesis: str) -> float:
    """Calculates Word Error Rate (WER) between reference and hypothesis transcripts."""
    ref = reference.strip()
    hyp = hypothesis.strip()
    if not ref:
        return 0.0 if not hyp else 1.0

    try:
        import jiwer
        return float(jiwer.wer(ref, hyp))
    except ImportError:
        # Fallback Levenshtein on words
        r_words = ref.lower().split()
        h_words = hyp.lower().split()
        d = [[0] * (len(h_words) + 1) for _ in range(len(r_words) + 1)]
        for i in range(len(r_words) + 1):
            d[i][0] = i
        for j in range(len(h_words) + 1):
            d[0][j] = j
        for i in range(1, len(r_words) + 1):
            for j in range(1, len(h_words) + 1):
                cost = 0 if r_words[i - 1] == h_words[j - 1] else 1
                d[i][j] = min(
                    d[i - 1][j] + 1,       # deletion
                    d[i][j - 1] + 1,       # insertion
                    d[i - 1][j - 1] + cost # substitution
                )
        return float(d[len(r_words)][len(h_words)] / max(len(r_words), 1))


def calculate_cmi(tokens_with_lang: List[str]) -> float:
    """
    Calculates Code-Mixing Index (CMI) as defined in Gamback & Das (2014):
    CMI = 100 * [1 - max(w_i) / n + u / n]
    Where w_i is word count in language i, n is total words, u is language-independent.
    Simplified word-script / vocabulary tag based CMI:
    tokens_with_lang: list of language tags (e.g., ['hi', 'hi', 'en', 'hi', 'en'])
    """
    if not tokens_with_lang:
        return 0.0

    counts: Dict[str, int] = {}
    total = len(tokens_with_lang)
    for tag in tokens_with_lang:
        counts[tag] = counts.get(tag, 0) + 1

    max_lang_count = max(counts.values())
    # Ratio of non-dominant language words
    cmi = 100.0 * (1.0 - (max_lang_count / max(total, 1)))
    return round(cmi, 2)


def evaluate_batch_transcripts(pairs: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Evaluates a batch of (reference, hypothesis) transcript pairs.
    Returns average WER and per-sample details.
    """
    results = []
    total_wer = 0.0
    for p in pairs:
        ref = p.get("reference", "")
        hyp = p.get("hypothesis", "")
        wer = calculate_wer(ref, hyp)
        total_wer += wer
        results.append({
            "id": p.get("id"),
            "reference": ref,
            "hypothesis": hyp,
            "wer": round(wer, 4),
        })

    avg_wer = round(total_wer / max(len(pairs), 1), 4)
    return {
        "sample_count": len(pairs),
        "average_wer": avg_wer,
        "details": results,
    }
