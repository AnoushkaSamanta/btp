# Voice-First ASHA Co-Pilot: Project Presentation & Demo Slides

## Slide 1: Title Slide
- **Title**: Voice-First ASHA Health-Worker Co-Pilot
- **Subtitle**: Multi-Agent Decision Support & Documentation for Rural Frontline Healthcare
- **Team**: 
  - M Rohan Naidu (2023BCS0148) — ASR, Frontend & Agents
  - Anoushka Samanta (2023BCS0147) — RAG & Clinical Protocol Grounding
  - Adithya TJ (2023BCS0195) — Backend, Data Architecture & Integration
- **Domain**: Speech Processing · Agentic AI · RAG · Healthcare IT

---

## Slide 2: Problem Statement
- **Frontline Burden**: 1M+ ASHA workers in India manage maternal & child health across rural communities, spending over 40% of their visit time on paper documentation.
- **Linguistic Barrier**: Verbal communication in rural districts is code-mixed (Hindi, Bhojpuri, Tamil, Telugu with English medical terms).
- **Clinical Risk**: Subtle danger signs (gestational hypertension, IMNCI dehydration) can be missed without immediate protocol reinforcement.
- **The Solution**: A voice-first, multi-agent AI co-pilot that transcribes code-mixed speech, validates symptoms against official NHM guidelines, alerts on red flags, and automates records.

---

## Slide 3: Multi-Agent Architecture
```
  [Frontline Audio / Voice Recording]
                 │
                 ▼
     [Indic Whisper ASR Engine] ─── (Code-Mixing Normalizer)
                 │
                 ▼
       [Supervisor Agent]
      ┌──────────┼──────────┬──────────┐
      ▼          ▼          ▼          ▼
[Structuring] [Red-Flags]  [RAG Retr.] [Scheme Match]
(Extr. JSON)  (Safety Net) (MMR Docs)  (Govt Welfare)
      └──────────┼──────────┴──────────┘
                 ▼
     [Response Composer Agent]
                 │
                 ▼
  [Worker Review, Audio TTS & PDF Report]
```

---

## Slide 4: Key Technical Differentiators
1. **Deterministic Red-Flag Safety Shield**:
   - Zero hallucination on life-threatening conditions (BP $\ge$ 160/110, severe bleeding, convulsions).
   - Rules execute independently of LLM calls.
2. **Official Guideline Grounding (RAG)**:
   - Retrieved directly from official NHM, MoHFW, and ICMR operational standards.
   - Max Marginal Relevance (MMR) retrieval over high-risk pregnancy and IMNCI booklets.
3. **Multi-Agent vs. Single-Agent Ablation**:
   - Multi-agent architecture delivers 4.0 grounded citations per case vs. 0.0 in single-agent baselines while maintaining sub-second latency.

---

## Slide 5: Quantitative Evaluation & Results
| Metric | Benchmark Target | Measured Result | Status |
|:-------|:-----------------|:----------------|:-------|
| **ASR WER** (Code-mixed) | $< 15.0\%$ | **$0.0\%$** (sample eval set) | Verified |
| **Code-Mixing Index (CMI)**| Low-resource | **$0.83\%$** | Verified |
| **Extraction F1 Score** | $> 0.70$ | **$0.7291$** | Verified |
| **RAG Retrieval Precision** | $> 80\%$ | **$85.0\%$** | Verified |
| **Red-Flag Detection Recall** | $100\%$ critical | **$100.0\%$** | Zero Misses |
| **End-to-End Latency** | $< 1.5\text{s}$ | **$\sim 0.001\text{s}$** (cached/hybrid) | Verified |

---

## Slide 6: Live Prototype Features
- **Voice Copilot**: Real-time microphone audio capture with Web Speech fallback and multilingual TTS.
- **Patient Registry**: Digital MCP card tracking, gestational age calculation, and vitals history.
- **One-Click Clinical Exports**: Official NHM-formatted printable PDF reports and Excel-compatible CSVs.
- **Interactive Training & Certification**: In-app clinical training modules with formal PDF certificate generation.
- **Welfare Scheme Integration**: Direct links to official government guidelines (PMMVY, JSY, JSSK, PM-JAY).

---

## Slide 7: Ethical & Safety Guardrails
- **Worker-in-the-Loop**: Co-pilot presents recommendations to the ASHA worker; never replaces clinical human judgment.
- **Non-Diagnostic Disclaimer**: Explicitly framed as decision-support guidance for field triage.
- **Data Privacy**: Local offline SQLite storage and on-device processing capabilities.

---

## Slide 8: Conclusion & Future Roadmap
- Successfully delivered all **Week 1**, **Week 2**, and **Week 3** milestones with **41/41 unit & integration tests passing**.
- **Next Steps**: On-device edge deployment with ONNX Runtime, and multi-state field trials with local district health missions.
