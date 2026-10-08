# ASHA Co-Pilot Evaluation Suite & Benchmark

This directory contains the automated evaluation framework and benchmarking datasets for the **Voice-First ASHA Co-Pilot** system.

---

## 📊 Evaluation Overview

The suite evaluates three key dimensions of the system:
1. **Speech Recognition Performance**: Word Error Rate (WER) and Code-Mixing Index (CMI) on spontaneous Hindi-English code-switched home-visit speech.
2. **Structured Medical Entity Extraction**: Field-level Precision, Recall, and F1 score against annotated ground truth.
3. **Multi-Agent vs. Single-Agent Ablation Study**: Comparative evaluation measuring Extraction F1, Scheme Match Accuracy, RAG Citation Count, and Pipeline Latency.

---

## 📁 Directory Structure

```
evaluation/
├── data/
│   ├── audio/          # 50-100 recorded .wav files (or simulated inputs)
│   ├── transcripts/    # Ground-truth verbatim transcripts
│   └── metadata.json   # 10+ annotated test cases with ground-truth records & rules
├── metrics.py          # ASR evaluation script (calculates WER & CMI)
├── ablation.py         # Multi-Agent vs. Single-Agent ablation study
├── run_all.py          # Master evaluation runner
└── results/
    ├── asr_eval.json   # Generated ASR evaluation results
    ├── ablation.json   # Generated ablation metrics comparison
    └── plots/
        └── ablation_plot.png  # Visual comparison chart
```

---

## 🚀 Running the Evaluation Framework

### 1. Run the Full Suite (Recommended)
```bash
python evaluation/run_all.py
```

### 2. Run ASR Metrics Only (WER & CMI)
```bash
python evaluation/metrics.py
```

### 3. Run Ablation Study Only (Multi-Agent vs. Single-Agent)
```bash
python evaluation/ablation.py
```

---

## 📐 Metrics Explanation

### 1. Word Error Rate (WER)
\[
\text{WER} = \frac{S + D + I}{N}
\]
where $S$ is substitutions, $D$ is deletions, $I$ is insertions, and $N$ is total words in ground truth reference.

### 2. Code-Mixing Index (CMI)
\[
\text{CMI} = 100 \times \left(1 - \frac{\max(w_{\text{eng}}, w_{\text{indic}})}{N - q}\right)
\]
Measures the degree of language alternation between Hindi and English words in spontaneous speech.

### 3. Field-Level F1 Score
Calculates accuracy across key clinical fields (`patient_name`, `age`, `blood_pressure`, `bp_status`, `pregnancy_status`, `symptoms`, `hemoglobin`, `bpl_card`).

### 4. Scheme Match Accuracy
Percentage of ground-truth welfare schemes correctly identified by the deterministic rule engine.

---

## 🎙️ Recording & Annotation Guidelines for Team

1. **Simulating Visit Audio**: Record audio in `.wav` format at 16kHz mono using realistic code-mixed Hindi-English phrases (e.g. *"Visited Lakshmi Devi 24 years, 8 months pregnant, BP 140/90, swelling in feet"*).
2. **Placing Audio Files**: Save audio recordings under `evaluation/data/audio/`.
3. **Updating Ground Truth**: Add new case annotations into `evaluation/data/metadata.json`.
