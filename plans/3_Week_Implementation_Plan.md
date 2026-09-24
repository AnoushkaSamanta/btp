# 3-Week Ideal Implementation Plan: ASHA Co-Pilot (Demo Prototype)

## Project Overview
This 3-week plan focuses on building a working prototype application to demo our work, ensuring the minimum deliverables are completed on schedule:
1. **Indic ASR for code-mixed data**
2. **RAG system with official docs**
3. **A working prototype application (to demo the work)**

---

## 📅 WEEK 1: FOUNDATION & SETUP
**Goal:** Environment ready, independent core modules established (ASR and RAG).

### Rohan (Part 1 - Indic ASR for Code-Mixed Data)
| Build | File |
|-------|------|
| Setup audio processing environment & requirements | `requirements.txt` |
| Research & integrate Indic ASR model for code-mixed data | `backend/asr/transcriber.py` |
| Build audio preprocessor for ASR | `backend/asr/preprocessor.py` |
| Build Pydantic schema for medical record | `backend/schemas/medical_record.py` |

### Anoushka (Part 3 - RAG System with Official Docs)
| Build | File |
|-------|------|
| Collect & ingest official NHM/ICMR docs | `data/guidelines/` |
| Build embeddings generation script | `backend/rag/embeddings.py` |
| Build ChromaDB retriever for official docs | `backend/rag/retriever.py` |
| Build red-flag rules | `backend/rules/red_flags.py` |

### Adithya (Part 4 - Architecture)
| Build | File |
|-------|------|
| Set up basic FastAPI application structure | `backend/main.py` |
| Set up basic data models | `backend/db/models.py` |
| Set up database connection | `backend/db/database.py` |

**Deliverables (End of Week 1):** 
- Basic ASR script functioning and transcribing code-mixed audio.
- Pydantic schema ready for medical record.
- Document chunks successfully stored in vector DB and retrieval function working.
- Red-flag rules defined.
- Base API running locally + DB connected.

---

## 📅 WEEK 2: CORE DEVELOPMENT & PROTOTYPE UI
**Goal:** Core logic connected to backend, frontend prototype initialized.

### Rohan (Part 2 - Prototype Application)
| Build | File |
|-------|------|
| Build Frontend React/Vite project structure | `frontend/package.json` |
| Build MicInput component for voice recording | `frontend/src/components/MicInput.jsx` |
| Build simple ReportView to show transcribed text | `frontend/src/components/ReportView.jsx` |
| Build App layout | `frontend/src/App.jsx` |
| Build frontend entry point | `frontend/src/main.jsx` |

### Anoushka (Part 3 - RAG System)
| Build | File |
|-------|------|
| Create Protocol Check Agent using RAG docs | `backend/agents/protocol_check_agent.py` |
| Refine embeddings & retrieval accuracy for medical domain | `backend/rag/retriever.py` |
| Test protocol retrieval with sample queries | `Notes` |

### Adithya (Part 4 - Integration)
| Build | File |
|-------|------|
| Expose ASR and RAG components via API endpoints | `backend/main.py` |
| Build /transcribe endpoint | `backend/main.py` |
| Build /protocol-check endpoint | `backend/main.py` |
| Build /full-pipeline endpoint | `backend/main.py` |
| Build logic to parse RAG results into structured responses | `backend/agents/response_composer.py` |

**Deliverables (End of Week 2):**
- Frontend capable of recording audio and pinging backend.
- API endpoints fully exposed for ASR and RAG lookups.
- Protocol check agent successfully queries official docs based on transcriptions.

---

## 📅 WEEK 3: INTEGRATION & WORKING DEMO
**Goal:** End-to-End System working as a prototype.

### Rohan (Part 1 & 2 - Integration)
| Build | File |
|-------|------|
| Connect MicInput component to API endpoints | `frontend/src/App.jsx` |
| Test ASR accuracy and UI latency | `Notes` |
| Measure WER on sample code-mixed audio | `Notes` |
| Finalize UI polish for the working prototype demo | `frontend/src/main.jsx` |
| Create frontend screenshots for demo | `evaluation/results/` |

### Anoushka (Part 3 - Refinement)
| Build | File |
|-------|------|
| Link RAG results directly to Transcribed text in pipeline | `Integration` |
| Test system end-to-end with simulated health cases | `Integration` |
| Test red-flag detection with critical cases | `Notes` |
| Measure retrieval precision/recall | `Notes` |
| Create RAG accuracy plots | `evaluation/results/` |

### Adithya (Part 4 - Deployment & Demo)
| Build | File |
|-------|------|
| Fix integration bugs across components | `All files` |
| Setup instructions & scripts for demo run | `README.md` |
| Prepare demo documentation | `docs/setup.md` |
| Prepare presentation slides | `Slides` |
| Run end-to-end demo validation | `Notes` |

**Deliverables (End of Week 3):**
- Fully integrated frontend UI and backend services.
- ASR evaluation report (WER) + Frontend demo working.
- RAG evaluation report + Protocol Check Agent working.
- **Working prototype application** ready for presentation.
- RAG correctly providing official guidelines based on Indic ASR outputs.

---
