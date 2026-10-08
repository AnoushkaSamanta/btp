# Offline evaluation report

Generated with `python -m evaluation.run_offline` from the checked-in synthetic examples.

## Scope and limits

This is a smoke-sized, deterministic evaluation on the **2 synthetic transcripts** in `data/evaluation/sample_transcripts.json`. These examples are not real patient data and are not an independently adjudicated benchmark. Values below describe this sample only; they are not clinical performance claims.

## Structured field extraction

Exact-match field scores against the fields labeled in the sample JSON. A field omitted from a case's gold annotation is not treated as a negative label.

| Field | TP | FP | FN | Precision | Recall | F1 |
|---|---:|---:|---:|---:|---:|---:|
| `patient_name` | 2 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| `age` | 2 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| `pregnancy_status` | 1 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| `blood_pressure` | 1 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| `bp_status` | 1 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| `swelling` | 1 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| `hemoglobin` | 1 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| `first_living_child` | 1 | 0 | 0 | 100.0% | 100.0% | 100.0% |

## Pipeline and ablation smoke comparison

The current `run_pipeline` is a sequential Python function pipeline; it is **not LangGraph**. `run_single_agent` is a heuristic single-pass baseline with rule checks; it is **not a monolithic LLM**. Timing is local wall-clock time for one tiny input, without ASR, and is not a latency benchmark. Citation count is not citation correctness.

| Case | Labeled fields | Extracted name | Rule flags | Retrieved chunks | Pipeline ms | Heuristic baseline ms |
|---|---:|---|---:|---:|---:|---:|
| e1 | 6 | Lakshmi Devi | 1 | 4 | 2.0 | 0.3 |
| e2 | 4 | Sunita Kumari | 1 | 4 | 0.6 | 0.3 |

## Not measured / data required

- **ASR WER / code-mixing-stratified WER:** no paired audio and human transcript benchmark is checked in.
- **Protocol citation accuracy and red-flag precision/recall:** no independently reviewed case set with gold citations/flags is checked in. Rules need clinical review before safety claims.
- **Scheme precision/recall:** no manually verified household answer key is checked in. Scheme outputs remain preliminary.
- **Report completeness / factual grounding:** no human scoring rubric or annotations are checked in.
- **Voice-to-voice task completion and representative latency:** no repeatable audio benchmark is checked in; browser speech support varies by browser/device.
- **Multi-agent vs. monolithic-LLM ablation:** not implemented as specified in the proposal; current comparison is only the proxy described above.

## Reproducibility

The script uses the configured local pipeline. If optional Ollama integration is enabled, results may vary with model/version; record those settings when comparing runs.
