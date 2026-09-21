# Copilot Build Prompt — Voice-First ASHA Health-Worker Co-Pilot (Semester Scope)

> Paste everything below the line into GitHub Copilot (Workspace/Agent mode) as your working brief. It is self-contained — Copilot doesn't need the original proposal doc, just this file.

---

## 0. Role & Framing

You are acting as a senior full-stack + applied-ML engineer pairing with a final-year B.Tech CS student to build a **scoped, demoable slice** of a larger academic project. Work strictly phase by phase, in order. After finishing each phase, stop, summarize what was built, list any open decisions, and wait for confirmation before moving to the next phase — do not silently jump ahead. If a requirement is ambiguous, ask one specific question rather than guessing.

## 1. Project Context (for grounding — do not rebuild this part)

This is the final-year major project **"Voice-First ASHA / Health-Worker Co-Pilot"** — a multi-agent, voice-first decision-support and documentation system for ASHA (Accredited Social Health Activist) community health workers in India. The full system design (per the project proposal) has 7 objectives: code-mixed Indic ASR, a Structuring Agent, a RAG-grounded Protocol Check Agent, a Scheme Match Agent, a Report/Task Generator Agent, LangGraph multi-agent orchestration with voice read-back, and a multi-agent-vs-single-agent evaluation ablation.

**This semester, per guide direction, we are only building three of those pieces as a working, demoable slice:**

1. A code-mixed Indic ASR pipeline (Hindi/Tamil/Telugu-English spontaneous speech → text).
2. A RAG system grounded in official NHM/ICMR clinical guideline documents.
3. A working prototype application — **frontend-heavy** — that demos both of the above end-to-end.

**Explicitly out of scope for this semester (defer to next semester):**
- LangGraph supervisor / multi-agent orchestration
- Structuring Agent (transcript → validated structured JSON medical record)
- Scheme Match Agent (PMMVY/JSY/JSSK deterministic eligibility engine)
- Report/Task Generator Agent
- Hardcoded red-flag safety rule layer
- Voice read-back/TTS confirmation loop (treat as an optional stretch goal only if time permits, never a core deliverable)
- The multi-agent vs. single-agent ablation study

Do not build agent-orchestration scaffolding (no LangGraph, no supervisor/router pattern) even in a stubbed-out form — it adds complexity we don't need yet and we'll design it properly next semester. Direct, simple API calls between frontend, ASR service, and RAG service are correct for this phase.

## 2. Hard Constraints

- **Every tool, library, model, dataset, and hosting option must be free or open-source.** No paid API keys, no paid tiers required to run or demo the project. Where a "free tier" of a hosted API is used (e.g. Groq, Gemini free tier), make it swappable for a fully local/open-source alternative (e.g. Ollama) via a config flag, so the project has no hard paid dependency.
- Prioritize a **local-first, reproducible** setup: anyone should be able to `git clone` and run it without paid credentials, using either free-tier keys they add themselves or fully local models.
- The application is **frontend-heavy for this phase** — the backend should be the minimum needed to serve ASR inference and RAG retrieval/generation as clean APIs. Do not over-engineer the backend (no auth system, no user accounts, no persistent database beyond what's needed to demo — file-based or SQLite is fine).
- Keep the codebase organized as a clean monorepo so agents/orchestration can be added next semester without a rewrite.

## 3. Tech Stack (choose freely within these free/open-source families — confirm exact picks with me before locking them in for Phase 0)

| Layer | Free/OSS options to choose from |
|---|---|
| ASR | AI4Bharat IndicConformer or IndicWhisper (self-hosted), or `faster-whisper` multilingual as a fallback if Indic models are too heavy to run locally; Bhashini API (free, government) as an alternative |
| Audio preprocessing | `torchaudio`, `librosa` |
| RAG vector store | ChromaDB or FAISS (local, no server needed) |
| Embeddings | Multilingual sentence-transformer, e.g. `paraphrase-multilingual-mpnet-base-v2` (HuggingFace, free) |
| RAG generation LLM | Local via Ollama (Llama-3/Mistral) **or** a free-tier hosted API (Groq, Gemini free tier) behind a config flag |
| Backend API | FastAPI (Python) |
| Data store (if needed) | SQLite for dev; keep swappable to Postgres later |
| Schema validation | Pydantic |
| Frontend | React or Next.js (your call — Next.js preferred if we want easy free deployment on Vercel) |
| Deployment (for demo only) | Vercel (frontend, free tier) + Render/Railway free tier or local Docker Compose (backend) — local docker-compose is the safe default; only pursue free hosted deployment if time permits |

## 4. Phase-Wise Plan

### Phase 0 — Repo Scaffold & Environment
**Goal:** A clean, runnable skeleton before any ML work starts.
- Set up a monorepo: `/backend` (FastAPI), `/frontend` (React/Next.js), `/data` (raw + processed datasets, gitignored appropriately), `/eval` (evaluation scripts and reports), `/docs` (architecture notes).
- Python virtualenv / `pyproject.toml` or `requirements.txt` with pinned versions.
- `.env.example` documenting every config value (model paths, API keys if using free-tier hosted LLM, vector DB path).
- Basic CI-less local run instructions in `README.md`: one command (or docker-compose) to bring up backend + frontend locally.
- Confirm final tech stack choices from Section 3 with me before proceeding.

**Deliverable:** Repo that runs `hello world` on both frontend and backend, with README instructions a stranger could follow.

---

### Phase 1 — Indic Code-Mixed ASR Pipeline
**Goal:** A working ASR service that transcribes code-mixed Hindi/Tamil/Telugu-English speech, with a reported Word Error Rate.
- Stand up the chosen ASR model as a local inference module (or a thin wrapper around the Bhashini API as a fallback path).
- Build the audio preprocessing step: resampling, mono conversion, basic noise handling (`torchaudio`/`librosa`).
- Wrap it as a FastAPI endpoint: `POST /asr/transcribe` accepting an audio file/blob, returning the transcript (and language-mix info if the model exposes it).
- Download and prepare evaluation data:
  - IndicVoices (AI4Bharat) — Hindi/Tamil/Telugu subsets, prioritizing code-switched utterances.
  - CoSTA code-switched evaluation sets (CMI-scored) as the primary benchmark.
- Write an evaluation script that computes WER overall and **CMI-stratified WER** (Code-Mixing Index buckets), and dumps a results table/JSON to `/eval`.
- Add a minimal self-collected mini eval set (even 10–20 short recorded clips of code-mixed speech we simulate ourselves) to sanity-check real-world behavior beyond benchmark data.

**Deliverable:** `/asr/transcribe` endpoint + an evaluation report (`/eval/asr_results.md` or `.json`) with WER and CMI-stratified WER numbers, checked into the repo.

---

### Phase 2 — RAG System Over NHM/ICMR Protocols
**Goal:** A retrieval-augmented question-answering service grounded in official clinical guideline documents, with citations.
- Source and download NHM guideline PDFs (nhm.gov.in) and ICMR guideline PDFs (icmr.gov.in) relevant to home-visit / RMNCH+A protocols.
- Build an ingestion pipeline: PDF text extraction → chunking (sensible chunk size/overlap for guideline-style text) → embedding (multilingual sentence-transformer) → indexing into ChromaDB/FAISS.
- Build a `POST /rag/query` endpoint: takes a natural-language question (in English or code-mixed text), retrieves top-k relevant chunks, and generates a grounded answer via the chosen LLM (local Ollama or free-tier API), **always returning the source chunk(s)/citations alongside the answer** — never an ungrounded answer.
- Write a small curated test set of realistic protocol questions (e.g. "danger signs in pregnancy", "what to do for a child with diarrhea") with expected source documents, and a lightweight retrieval-quality check script (did the right document/chunk get retrieved).
- Keep this component clearly separate/stateless from the ASR service — no orchestration layer between them yet, they're just two independent APIs the frontend will call.

**Deliverable:** `/rag/query` endpoint + ingested vector store + a small retrieval-quality eval report in `/eval`.

---

### Phase 3 — Frontend Demo Application (primary focus of this semester)
**Goal:** A polished, demoable web app that ties Phase 1 and Phase 2 together for a live demo to the guide — this is where most of the semester's effort should go.
- UI/UX for a healthcare-field-worker-facing tool: clean, mobile-friendly (ASHA workers use phones), minimal cognitive load, large touch targets, clear states (recording / processing / done / error).
- **Voice capture panel:** record-in-browser or upload-audio widget → sends to `/asr/transcribe` → shows live/near-live transcript with a loading state.
- **Protocol assistant panel:** a chat-style interface where the worker (or reviewer) can type/ask a clinical question and get a grounded answer from `/rag/query`, with the source guideline excerpt shown/expandable alongside the answer (this is the demo-critical "trust" feature — always show what it's grounded in).
- **Visit transcript view:** a simple screen showing the raw transcript from a recording, alongside any protocol snippets the reviewer manually looked up for it — this is a lightweight mockup of what the future Structuring/Protocol agents will do automatically next semester. Do not attempt automatic structuring here; keep it manual/demo-level.
- Responsive design, sensible empty/error/loading states throughout, and basic accessibility (labels, contrast, keyboard navigation).
- Component structure that's easy to extend — this frontend will eventually need to render agent outputs, follow-up task lists, and scheme flags next semester, so keep data-fetching and display components decoupled.

**Deliverable:** A running frontend that a guide can click through live: record/upload speech → see transcript → ask a protocol question → see a grounded, cited answer.

---

### Phase 4 — Integration, Polish & Demo Packaging
**Goal:** Everything wired together, reliable, and easy to demo or hand off.
- End-to-end wiring: frontend → ASR API → RAG API, with sensible timeouts and error handling (what happens if ASR fails, if RAG retrieval returns nothing relevant, if the model is still loading).
- Docker Compose (or equivalent) so backend + frontend can be started with one command for a live demo or for the guide to run themselves.
- Optional stretch, time permitting: a free-tier deployed version (Vercel for frontend + Render/Railway free tier for backend) so it can be demoed via a link instead of locally. Only pursue this after everything works locally.
- Write a short `DEMO.md`: a 5–10 minute demo script (what to click, what to say, what result to expect) for presenting to the guide.

**Deliverable:** One-command local run, working demo script, and (optionally) a live hosted demo link.

---

### Phase 5 — Evaluation Write-Up & Handoff Notes for Next Semester
**Goal:** Turn this semester's work into report-ready material and a clean starting point for the agentic work next semester.
- Consolidate Phase 1 and Phase 2 evaluation results (WER/CMI-stratified WER, retrieval quality) into a single `/eval/semester_results.md` suitable for lifting into the project report.
- Document architecture decisions made (model choices, chunking strategy, why particular free/OSS tools were picked) in `/docs/architecture.md`.
- Write a short `/docs/next_semester.md` noting exactly where the Structuring Agent, Protocol Check Agent's red-flag rule layer, Scheme Match Agent, Report/Task Generator Agent, and LangGraph orchestration should plug into the existing ASR/RAG services — so next semester starts from a clear seam, not a rewrite.

**Deliverable:** Report-ready evaluation doc + architecture doc + a clear map of where agentic work resumes next semester.

## 5. Target Multi-Agent Architecture (Reference Only — Do Not Build This Semester)

This section exists so the codebase is built with the right seams, and so `/docs/next_semester.md` (Phase 5) can be concrete rather than vague. **Do not implement any of this now** — no LangGraph install, no supervisor/router code, no stub agent classes. Treat it purely as the target shape to document and design toward.

**Overall pipeline (full system, future state):**

1. ASHA worker speaks (code-mixed Hindi/Tamil/Telugu-English) → **ASR layer** (this semester's Phase 1 service) transcribes it.
2. Text normalization + language-ID cleans code-mix artifacts.
3. A **LangGraph supervisor** reads the transcript, decides which specialized agents are relevant, and invokes them — often more than one, in parallel:
   - **Structuring Agent** — free-form transcript → validated structured JSON medical record (LLM few-shot extraction + Pydantic schema validation).
   - **Protocol Check Agent** — retrieves relevant clinical guideline passages via the RAG service (this semester's Phase 2 service) *and* separately runs a hardcoded, non-negotiable red-flag rule layer against the structured fields (e.g. pregnancy + swelling + high BP) — the rule layer always fires regardless of what the RAG/LLM output, so retrieval failure can never silently miss a critical case.
   - **Scheme Match Agent** — deterministic SQL/rule-engine lookup of the household's structured profile against PMMVY/JSY/JSSK eligibility criteria (not LLM reasoning — eligibility is too high-stakes to leave to model judgement).
   - **Report/Task Generator Agent** — drafts the formal visit report and follow-up task list, grounded strictly in the structured record (no fields not already present in it).
4. A **Response Composer** merges all agent outputs into one coherent natural-language summary.
5. **Voice read-back (TTS)** reads the summary back to the worker for confirmation or correction before anything is persisted.
6. On confirmation, the structured record, protocol flags, scheme matches, and follow-up tasks are saved to a persistent store, time-stamped against that patient's visit history.

**Why this matters for how you build this semester's slice:**
- The ASR service (Phase 1) should be usable as-is by the future Supervisor — keep its input/output contract (audio in, transcript + language-mix metadata out) clean and self-contained, not entangled with any UI-specific logic.
- The RAG service (Phase 2) should be directly callable by the future Protocol Check Agent — keep `/rag/query` generic (question in, grounded answer + citations out) rather than hardcoding it to the chat-UI use case only.
- The frontend's component structure (Phase 3) should anticipate rendering additional agent outputs later (structured record fields, protocol flags, scheme matches, task lists) without a rewrite — this is why Phase 3 asks you to keep data-fetching and display components decoupled.
- `/docs/next_semester.md` (Phase 5) should map each future agent above to where it plugs into the services built this semester.

## 6. Working Agreement

- Build and confirm one phase at a time; don't pre-build later phases "for convenience."
- Every model/library/service choice must stay free/open-source — flag it explicitly if you're about to introduce anything that isn't.
- Keep the ASR and RAG services independent and stateless for now; resist the urge to add any agent/orchestration scaffolding even in stub form.
- Favor a working, demoable slice over completeness — this is a mid-project checkpoint, not the final submission.
