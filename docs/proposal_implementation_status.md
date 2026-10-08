# Proposal implementation status

This status cross-checks the supplied project proposal and the three-week prototype plan against the repository as it currently exists. “Implemented” means a code path exists; it does not mean clinically validated or ready for real patient data.

## Proposal objectives

| # | Proposal deliverable | Repository evidence | Status |
|---|---|---|---|
| 1 | Indic/code-mixed ASR demo with WER | Audio upload/transcription endpoint and Whisper fallback exist. No paired audio/reference transcript benchmark or WER result exists. | **Partial** — demo path exists; target-language robustness and WER are unverified. |
| 2 | Schema-validated structuring with field precision/recall | Extraction agent, Pydantic medical record, and two synthetic examples exist. The reproducible report reports exact-match field scores for only those examples. | **Partial** — implementation and smoke metric exist; annotated evaluation set is missing. |
| 3 | NHM/ICMR RAG + independent hardcoded red flags, cited cases | Retriever loads local `.txt` summaries and returns source labels; rules run independently. The text files identify themselves as summaries, not official source documents; no gold citation/flag test set exists. | **Partial** — functional prototype path; official corpus, provenance/versioning, and clinical verification are missing. |
| 4 | Deterministic PMMVY/JSY/JSSK matching with precision/recall | Deterministic rules and API/UI exist. No manually verified synthetic profile answer key exists; current rule set has additional schemes and uses preliminary assumptions. | **Partial** — code exists; criterion validation and evaluation are missing. |
| 5 | Grounded visit report and task generation | Report/task generator is integrated into draft, read-back, confirmation, and persistence flow. No annotated factual-grounding/completeness review exists; optional LLM text generation is not deterministic. | **Partial** — workflow exists; quality benchmark/review remains. |
| 6 | LangGraph supervisor and voice confirmation before persistence | Visit drafts are read back by browser SpeechSynthesis and only saved on explicit confirmation. Orchestration is a sequential Python function, not LangGraph; backend TTS returns text for browser playback rather than synthesized audio. | **Partial** — confirm-before-save works; LangGraph and Indic TTS/audio output are absent. |
| 7 | Rigorous component evaluation and multi-agent vs. monolithic-LLM ablation | `evaluation/run_offline.py` creates a transparent report. Current baseline is heuristic and not a monolithic LLM. No WER, gold scheme/protocol set, citation scoring, repeatable latency, or full ablation exists. | **Partial** — reproducible smoke report only; proposal evaluation not complete. |

## Three-week prototype plan

FastAPI, React/Vite, audio preprocessing/transcription fallback, local text retrieval, red-flag rules, API wiring, visit draft/confirmation, persistence, and setup instructions exist. The plan's end-of-week deliverable claims for measured ASR WER, RAG precision/recall, plots, screenshots, and a validated official-document corpus are not evidenced in this repository. Current frontend/browser speech functionality depends on device/browser capabilities.

## Launch status

The code can be run locally as a **synthetic-data demonstration** using the setup in `README.md`. It is not safe to launch for health-worker use or real patient data: authentication/authorization, privacy/security review, audit/retention controls, encrypted operational storage/backups, official and maintained clinical content, clinical validation, scheme-rule review, representative language/accent/noise evaluation, and field usability/ethics approval are not supplied by this repository. The UI and logic must remain worker-facing; scheme outputs are preliminary and clinical decisions stay with the trained worker and medical officer.

## Re-run the available evaluation

From the repository root:

```bash
python -m evaluation.run_offline
```

This writes `evaluation/results/offline_evaluation.md`. It reports only the two checked-in synthetic transcripts and explicitly marks unavailable metrics as not measured. It does not certify clinical correctness.
