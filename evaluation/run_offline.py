"""Generate a transparent offline report from the checked-in synthetic cases.

This deliberately does not claim ASR, clinical, scheme, or user-study validation:
the repository does not contain the audio, adjudicated labels, or official corpus
needed to measure those outcomes.
"""

import json
import time
from collections import defaultdict
from pathlib import Path

from backend.agents.structuring_agent import extract_record
from backend.agents.supervisor import run_pipeline, run_single_agent
from evaluation.metrics import field_f1

ROOT = Path(__file__).resolve().parent.parent
KEYS = [
    "patient_name", "age", "pregnancy_status", "blood_pressure", "bp_status",
    "swelling", "hemoglobin", "first_living_child",
]


def _pct(value: float) -> str:
    return f"{value * 100:.1f}%"


def main() -> None:
    cases = json.loads((ROOT / "data/evaluation/sample_transcripts.json").read_text(encoding="utf-8"))
    totals = defaultdict(lambda: {"tp": 0, "fp": 0, "fn": 0})
    case_rows = []
    ablation_rows = []
    for case in cases:
        gold = case.get("gold") or {}
        start = time.perf_counter()
        record = extract_record(case["transcript"])
        extract_ms = (time.perf_counter() - start) * 1000
        for key in KEYS:
            score = field_f1(gold, record, [key])
            for metric in ("tp", "fp", "fn"):
                totals[key][metric] += score[metric]

        start = time.perf_counter()
        multi = run_pipeline(case["transcript"])
        multi_ms = (time.perf_counter() - start) * 1000
        start = time.perf_counter()
        single = run_single_agent(case["transcript"])
        single_ms = (time.perf_counter() - start) * 1000
        case_rows.append(
            f"| {case['id']} | {len(gold)} | {multi['record'].get('patient_name') or '—'} | "
            f"{len(multi['protocol']['flags'])} | {len(multi['protocol']['citations'])} | "
            f"{multi_ms:.1f} | {single_ms:.1f} |"
        )
        ablation_rows.append((multi_ms, single_ms))

    fields = []
    for key in KEYS:
        tp, fp, fn = (totals[key][m] for m in ("tp", "fp", "fn"))
        p = tp / (tp + fp) if tp + fp else 0.0
        r = tp / (tp + fn) if tp + fn else 0.0
        f = 2 * p * r / (p + r) if p + r else 0.0
        fields.append(f"| `{key}` | {tp} | {fp} | {fn} | {_pct(p)} | {_pct(r)} | {_pct(f)} |")

    text = """# Offline evaluation report

Generated with `python -m evaluation.run_offline` from the checked-in synthetic examples.

## Scope and limits

This is a smoke-sized, deterministic evaluation on the **{n} synthetic transcripts** in `data/evaluation/sample_transcripts.json`. These examples are not real patient data and are not an independently adjudicated benchmark. Values below describe this sample only; they are not clinical performance claims.

## Structured field extraction

Exact-match field scores against the fields labeled in the sample JSON. A field omitted from a case's gold annotation is not treated as a negative label.

| Field | TP | FP | FN | Precision | Recall | F1 |
|---|---:|---:|---:|---:|---:|---:|
{fields}

## Pipeline and ablation smoke comparison

The current `run_pipeline` is a sequential Python function pipeline; it is **not LangGraph**. `run_single_agent` is a heuristic single-pass baseline with rule checks; it is **not a monolithic LLM**. Timing is local wall-clock time for one tiny input, without ASR, and is not a latency benchmark. Citation count is not citation correctness.

| Case | Labeled fields | Extracted name | Rule flags | Retrieved chunks | Pipeline ms | Heuristic baseline ms |
|---|---:|---|---:|---:|---:|---:|
{rows}

## Not measured / data required

- **ASR WER / code-mixing-stratified WER:** no paired audio and human transcript benchmark is checked in.
- **Protocol citation accuracy and red-flag precision/recall:** no independently reviewed case set with gold citations/flags is checked in. Rules need clinical review before safety claims.
- **Scheme precision/recall:** no manually verified household answer key is checked in. Scheme outputs remain preliminary.
- **Report completeness / factual grounding:** no human scoring rubric or annotations are checked in.
- **Voice-to-voice task completion and representative latency:** no repeatable audio benchmark is checked in; browser speech support varies by browser/device.
- **Multi-agent vs. monolithic-LLM ablation:** not implemented as specified in the proposal; current comparison is only the proxy described above.

## Reproducibility

The script uses the configured local pipeline. If optional Ollama integration is enabled, results may vary with model/version; record those settings when comparing runs.
""".format(n=len(cases), fields="\n".join(fields) or "| — | 0 | 0 | 0 | 0% | 0% | 0% |", rows="\n".join(case_rows))

    out = ROOT / "evaluation/results/offline_evaluation.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text, encoding="utf-8")
    print(f"Wrote {out.relative_to(ROOT)} ({len(cases)} synthetic cases)")


if __name__ == "__main__":
    main()
