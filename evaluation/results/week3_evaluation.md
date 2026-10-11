# Week 3 RAG & Red-Flag Evaluation Report

## Overall Metrics
- **Average RAG Precision:** 0.00%
- **Average RAG Recall:** 0.00%

## Detailed Case Analysis

### Case: case-001
**Description:** A 25-year-old pregnant woman in her second trimester reports severe headache, blurred vision, and swelling in her hands and face. Her blood pressure is 150/100 mmHg.

**RAG Retrieval:**
- Expected: STG_HighRiskPregnancy.pdf, STG_Hypertension.pdf
- Retrieved: nhm_rmncha
- *Recall: 0% | Precision: 0%*

**Red-Flag Detection:**
- Expected (Human logic): Severe headache, Blurred vision, Swelling in hands/face, High Blood Pressure (150/100)
- Triggered (System logic): Possible pre-eclampsia pattern, Headache / visual change
- Extracted context: Pregnant: True, BP: 150/100, Symptoms: swelling, headache, blurred vision

---

### Case: case-002
**Description:** A 6-month-old infant is brought with a cough and fast breathing (55 breaths per minute) for the last 3 days. No chest in-drawing is observed.

**RAG Retrieval:**
- Expected: imnci_chart_booklet.pdf
- Retrieved: nhm_rmncha, schemes_notes, icmr_community
- *Recall: 0% | Precision: 0%*

**Red-Flag Detection:**
- Expected (Human logic): Fast breathing (55 bpm)
- Triggered (System logic): Severe Pneumonia or Very Severe Disease
- Extracted context: Pregnant: None, BP: None, Symptoms: 

---

### Case: case-003
**Description:** A 30-year-old woman presents with high fever, chills, and lower abdominal pain. She had a normal vaginal delivery 5 days ago. Foul-smelling vaginal discharge is present.

**RAG Retrieval:**
- Expected: STG_HighRiskPregnancy.pdf, National_Antimicrobial_Guidelines.pdf
- Retrieved: schemes_notes, icmr_community, nhm_rmncha
- *Recall: 0% | Precision: 0%*

**Red-Flag Detection:**
- Expected (Human logic): High fever, Lower abdominal pain, Foul-smelling discharge postpartum
- Triggered (System logic): Fever
- Extracted context: Pregnant: False, BP: None, Symptoms: fever, abdominal pain

---

### Case: case-004
**Description:** A 1-year-old child presents with loose stools for 4 days. The child is irritable, has sunken eyes, and skin pinch goes back slowly. He is drinking eagerly.

**RAG Retrieval:**
- Expected: imnci_chart_booklet.pdf
- Retrieved: schemes_notes, icmr_community, nhm_rmncha
- *Recall: 0% | Precision: 0%*

**Red-Flag Detection:**
- Expected (Human logic): Sunken eyes, Skin pinch goes back slowly, Irritable
- Triggered (System logic): Severe Dehydration
- Extracted context: Pregnant: None, BP: None, Symptoms: 

---

### Case: case-005
**Description:** A 20-year-old primigravida at 38 weeks gestation complains of decreased fetal movements for the past 12 hours. Her vitals are normal.

**RAG Retrieval:**
- Expected: STG_HighRiskPregnancy.pdf
- Retrieved: schemes_notes, icmr_community, nhm_rmncha
- *Recall: 0% | Precision: 0%*

**Red-Flag Detection:**
- Expected (Human logic): Decreased fetal movements
- Triggered (System logic): Decreased fetal movement
- Extracted context: Pregnant: None, BP: None, Symptoms: decreased fetal movement

---
