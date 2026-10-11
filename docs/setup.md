# ASHA Co-Pilot: System Setup & Demo Guide

## 1. Overview
The **Voice-First ASHA Health-Worker Co-Pilot** is an AI decision-support and visit documentation platform designed for frontline Accredited Social Health Activists (ASHAs) in rural India.

### Core Capabilities
- **Indic Code-Mixed ASR**: Transcribes multilingual Hindi, Bhojpuri, and English speech.
- **Deterministic Red-Flag Rules**: Instant, zero-hallucination alerts for critical maternal and child conditions (pre-eclampsia, severe bleeding, dehydration, convulsions).
- **RAG Protocol Grounding**: Semantic retrieval from official NHM, MoHFW, and ICMR operational guidelines and IMNCI chart booklets.
- **Welfare Scheme Matching**: Eligibility screening for PMMVY, JSY, JSSK, and PM-JAY.
- **Automated Clinical Documentation**: Instant generation of structured visit summaries, follow-up task lists, and exportable medical records.

---

## 2. Prerequisites & Environment Setup

### System Requirements
- Python 3.10+
- Node.js 18+ and npm
- Windows, macOS, or Linux

### Installation
```bash
# 1. Clone repository
git clone https://github.com/AnoushkaSamanta/btp.git
cd btp

# 2. Setup Python environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt

# 3. Setup Frontend dependencies
cd frontend
npm install
cd ..
```

---

## 3. Running the Application

### Option A: Quickstart Script
```bash
# In Git Bash or Linux/macOS:
bash run.sh
```

### Option B: Manual Execution

#### Terminal 1 — Backend FastAPI Server:
```bash
python -m uvicorn backend.main:app --reload --port 8000
```
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

#### Terminal 2 — Frontend React / Vite:
```bash
cd frontend
npm run dev
```
- Frontend UI: [http://localhost:5173](http://localhost:5173)

---

## 4. End-to-End Demo Script

### Scenario 1: High-Risk Antenatal Care (Pre-eclampsia Detection)
1. Open [http://localhost:5173](http://localhost:5173) and navigate to **Voice Copilot**.
2. Set Language to **Hindi** or **English**.
3. Record or paste the following text:
   > *"Garbhavati mahila Sunita Devi ko sar me bahut tez dard aur chehre pe soojan hai, blood pressure 165/110 mmHg hai."*
4. Click **Send** or stop recording.
5. **Expected Output**:
   - Red Flag Alert: `Severe hypertension / Pre-eclampsia risk (Critical)`
   - RAG Protocol: Official NHM EmOC protocol recommendations (MgSO4 protocol under MO guidance, immediate PHC/FRU referral).
   - Schemes: PMMVY & JSY eligible.
   - Tasks: Immediate referral transport & doctor consultation generated.

### Scenario 2: Pediatric Emergency (Severe Dehydration)
1. Switch to **Voice Copilot** and input:
   > *"2 saal ke bacche ko do din se dast hai, aankhein andar dhas gayi hain aur paani nahi pee paa raha."*
2. **Expected Output**:
   - Red Flag Alert: `IMNCI Severe Dehydration (Critical)`
   - Guideline Citation: IMNCI Plan C intravenous fluid resuscitation & urgent hospital referral.

### Scenario 3: Routine Visit & Clinical Report Export
1. In **Patients**, select an active pregnant woman.
2. Complete a visit checkup.
3. In **Reports**, preview the visit summary and click **Export PDF Report** or **Export CSV** to obtain official NHM-formatted visit documentation.

---

## 5. Verification & Testing

```bash
# Run all 41 backend unit & integration tests
pytest backend/tests

# Run offline & RAG evaluation suites
python evaluation/run_all.py
python evaluation/run_week3_eval.py
python evaluation/results/generate_plots.py

# Build frontend production bundle
cd frontend && npm run build
```
