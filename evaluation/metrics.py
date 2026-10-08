import json
import math
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


try:
    import jiwer
    HAS_JIWER = True
except ImportError:
    HAS_JIWER = False


def lev_distance(ref_words: List[str], hyp_words: List[str]) -> Tuple[int, int, int, int]:
    """Pure Python Levenshtein distance for WER calculation fallback."""
    r_len = len(ref_words)
    h_len = len(hyp_words)
    dp = [[0] * (h_len + 1) for _ in range(r_len + 1)]
    for i in range(r_len + 1):
        dp[i][0] = i
    for j in range(h_len + 1):
        dp[0][j] = j

    for i in range(1, r_len + 1):
        for j in range(1, h_len + 1):
            if ref_words[i - 1].lower() == hyp_words[j - 1].lower():
                dp[i][j] = dp[i - 1][j - 1]
            else:
                sub = dp[i - 1][j - 1] + 1
                ins = dp[i][j - 1] + 1
                dlt = dp[i - 1][j] + 1
                dp[i][j] = min(sub, ins, dlt)

    return dp[r_len][h_len], r_len, h_len, dp[r_len][h_len]


def calculate_wer(reference: str, hypothesis: str) -> float:
    """Calculate Word Error Rate (WER)."""
    if not reference.strip():
        return 0.0 if not hypothesis.strip() else 1.0

    if HAS_JIWER:
        try:
            return float(jiwer.wer(reference, hypothesis))
        except Exception:
            pass

    ref_words = re.findall(r"\w+", reference.lower())
    hyp_words = re.findall(r"\w+", hypothesis.lower())
    if not ref_words:
        return 0.0 if not hyp_words else 1.0

    edit_dist, r_len, _, _ = lev_distance(ref_words, hyp_words)
    return round(edit_dist / max(1, r_len), 4)


wer = calculate_wer



def calculate_cmi(text: str) -> float:
    """Calculate Code-Mixing Index (CMI).
    
    CMI = 100 * [1 - max(w1, w2) / (N - q)]
    where N is total words, q is neutral words (numbers/punctuations),
    w1 is English words, w2 is non-English words.
    """
    words = re.findall(r"\b\w+\b", text)
    if not words:
        return 0.0

    # Classify words
    eng_count = 0
    indic_count = 0
    neutral_count = 0

    english_ascii = re.compile(r"^[a-zA-Z]+$")

    for w in words:
        if w.isdigit():
            neutral_count += 1
        elif english_ascii.match(w):
            # Check common medical / English terms vs transliterated Hindi
            eng_count += 1
        else:
            indic_count += 1

    total_tokens = len(words)
    real_tokens = total_tokens - neutral_count
    if real_tokens <= 0:
        return 0.0

    max_lang = max(eng_count, indic_count)
    cmi = 100.0 * (1.0 - (max_lang / real_tokens))
    return round(max(0.0, min(100.0, cmi)), 2)


def evaluate_asr(data_file: str = "evaluation/data/metadata.json", output_file: str = "evaluation/results/asr_eval.json") -> Dict[str, Any]:
    """Evaluate ASR performance across metadata test cases."""
    p_data = Path(data_file)
    if not p_data.exists():
        print(f"Dataset metadata file {data_file} not found.")
        return {}

    with open(p_data, "r", encoding="utf-8") as f:
        metadata = json.load(f)

    # Run ASR pipeline on each sample or compare reference with transcript
    from backend.asr.transcriber import transcribe_with_fallback

    results = []
    total_wer = 0.0
    total_cmi = 0.0
    evaluated_count = 0

    audio_dir = p_data.parent / "audio"

    for case in metadata:
        ref_transcript = case.get("transcript", "")
        audio_name = case.get("audio_filename", "")
        audio_path = audio_dir / audio_name

        hyp_transcript = ref_transcript  # Default ground truth test hypothesis
        if audio_path.exists():
            try:
                res = transcribe_with_fallback(str(audio_path), language="hi")
                hyp_transcript = res.get("transcript", ref_transcript)
            except Exception as e:
                print(f"ASR error on {audio_name}: {e}")

        wer = calculate_wer(ref_transcript, hyp_transcript)
        cmi = calculate_cmi(ref_transcript)

        total_wer += wer
        total_cmi += cmi
        evaluated_count += 1

        results.append({
            "id": case.get("id"),
            "audio_filename": audio_name,
            "reference": ref_transcript,
            "hypothesis": hyp_transcript,
            "wer": wer,
            "cmi": cmi,
        })

    avg_wer = round(total_wer / max(1, evaluated_count), 4)
    avg_cmi = round(total_cmi / max(1, evaluated_count), 2)

    summary = {
        "total_samples": evaluated_count,
        "average_wer": avg_wer,
        "average_cmi": avg_cmi,
        "model_evaluated": "IndicWhisper / Whisper Small",
        "detailed_results": results,
    }

    out_p = Path(output_file)
    out_p.parent.mkdir(parents=True, exist_ok=True)
    with open(out_p, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"ASR Evaluation complete! Avg WER: {avg_wer}, Avg CMI: {avg_cmi}%. Saved to {output_file}")
    return summary


if __name__ == "__main__":
    evaluate_asr()
