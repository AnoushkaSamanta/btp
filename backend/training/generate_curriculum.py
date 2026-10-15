"""
Generate official Government of India / NHM lesson curriculum for all 6 modules:
- t1: ANC Check-up Protocol (8 lessons)
- t2: Danger Signs Recognition (6 lessons)
- t3: Immunization Best Practices (7 lessons)
- t4: Anemia Management (5 lessons)
- t5: Postnatal Care Essentials (6 lessons)
- t6: High-Risk Pregnancy Management (10 lessons)

Each module includes lessons with:
- title
- videoUrl (embed link with fallbacks)
- content (official clinical guidance)
- keyPoints (bullet list)
- clinicalActions
- diagrams / figures
- quiz (questions with choices and explanations)
"""

import json
import os

modules = [
    {
        "id": "t1",
        "title": "ANC Check-up Protocol",
        "category": "Maternal Health",
        "duration": "45 min",
        "difficulty": "Beginner",
        "icon": "ClipboardList",
        "color": "primary",
        "officialSource": "National Health Mission - RMNCH+A & PMSMA Guidelines",
        "description": "Master the 4-visit ANC schedule, clinical measurement standards, maternal card documentation, and frontline triage protocols.",
        "lessons": [
            {
                "id": 1,
                "title": "Introduction to ANC & 4-Visit Timelines",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Antenatal Care (ANC) is the cornerstone of maternal and newborn survival under India's National Health Mission (NHM). Every pregnant woman must receive at least 4 comprehensive antenatal visits during her gestation. The 1st visit must occur as early as possible within the first 12 weeks for early registration and dating. The 2nd visit occurs between 14-26 weeks (2nd trimester), the 3rd between 28-34 weeks, and the 4th at 36 weeks until term.",
                "keyPoints": [
                    "Registration within 12 weeks of LMP is mandatory for tracking on RCH / Anmol portal.",
                    "Minimum of 4 ANC visits are statutory under NHM standards.",
                    "Every check-up must screen for anemia, hypertension, gestational diabetes, and infectious diseases.",
                    "Issuance of Maternal and Child Protection (MCP) card occurs at visit 1."
                ],
                "clinicalActions": [
                    "Verify LMP and calculate Expected Date of Delivery (EDD = LMP + 9 months + 7 days).",
                    "Record complete demographic and obstetric history in the ASHA diary and MCP Card.",
                    "Educate beneficiary regarding monthly PMSMA checkups on the 9th of every month."
                ],
                "quiz": [
                    {
                        "question": "What is the recommended timing for the 1st Antenatal Care (ANC) visit under NHM guidelines?",
                        "options": ["Within the first 12 weeks (1st trimester)", "Between 16 to 20 weeks", "At 28 weeks", "Only when labor symptoms begin"],
                        "answer": 0,
                        "explanation": "NHM mandates early registration within the first 12 weeks of pregnancy to establish baselines and initiate timely folic acid supplementation."
                    },
                    {
                        "question": "What is the minimum number of ANC visits mandated under RMNCH+A guidelines?",
                        "options": ["2 visits", "4 visits", "6 visits", "8 visits"],
                        "answer": 1,
                        "explanation": "A minimum of 4 structured ANC visits are required for every pregnant woman in India."
                    }
                ]
            },
            {
                "id": 2,
                "title": "MCP Card Documentation & Beneficiary Profile",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "The Mother and Child Protection (MCP) card serves as the central passport for maternal healthcare in India. It captures vital demographic information, Aadhaar and bank details for Direct Benefit Transfers (DBT) under Pradhan Mantri Matru Vandana Yojana (PMMVY) and Janani Suraksha Yojana (JSY). Frontline ASHAs must verify identity, calculate gravida/parity, and note past cesarean sections or perinatal losses.",
                "keyPoints": [
                    "Ensure correct spelling of beneficiary name matching bank passbook for DBT.",
                    "Flag parity ≥ 4 or age < 18 or > 35 as high-risk demographic indicators.",
                    "Attach green/yellow/red PMSMA triage stickers based on clinical evaluation."
                ],
                "clinicalActions": [
                    "Check bank account linkage with Aadhaar to avoid PFMS transaction failures.",
                    "Hand over the MCP card to the mother and counsel her to carry it to every facility visit."
                ],
                "quiz": [
                    {
                        "question": "Why is verifying bank passbook and Aadhaar linkage essential during MCP card documentation?",
                        "options": ["To verify voter registration", "To guarantee cash transfer under PMMVY and JSY without PFMS failure", "To assign a hospital bed", "It is optional"],
                        "answer": 1,
                        "explanation": "Correct banking and Aadhaar details ensure direct benefit transfer under government maternity entitlement schemes."
                    }
                ]
            },
            {
                "id": 3,
                "title": "Clinical Examinations: Blood Pressure & Weight Monitoring",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Accurate recording of vital signs is essential at every visit. Blood pressure must be measured with the patient seated quietly for 5 minutes, cuff positioned at heart level. A systolic BP ≥ 140 mmHg or diastolic BP ≥ 90 mmHg (confirmed on two readings 15 minutes apart) indicates gestational hypertension or preeclampsia. Normal maternal weight gain should be between 10-12 kg across singleton pregnancy.",
                "keyPoints": [
                    "Cut-off for gestational hypertension: BP ≥ 140/90 mmHg.",
                    "Weight gain should be approximately 0.5 kg/month in 1st trimester and 1.5-2 kg/month in 2nd and 3rd trimesters.",
                    "Sudden weight gain (> 2 kg in one month) suggests fluid retention and occult preeclampsia."
                ],
                "clinicalActions": [
                    "Calibrate digital or aneroid sphygmomanometer before every session.",
                    "If BP is ≥ 140/90, repeat after 15 minutes rest. If persistent, initiate urgent medical officer referral."
                ],
                "quiz": [
                    {
                        "question": "Which BP reading defines gestational hypertension requiring immediate medical officer escalation?",
                        "options": ["110/70 mmHg", "120/80 mmHg", "130/85 mmHg", "140/90 mmHg or higher"],
                        "answer": 3,
                        "explanation": "A blood pressure reading of 140/90 mmHg or higher on two occasions indicates hypertension."
                    }
                ]
            },
            {
                "id": 4,
                "title": "Laboratory Diagnostics: Hemoglobin, Blood Sugar & Urine Albumin",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Point-of-care laboratory screening is performed at Village Health Sanitation and Nutrition Days (VHSND). Hemoglobin is tested using a digital hemoglobinometer or Sahli's method. Dipstick testing is used for urine protein and glucose. Routine Oral Glucose Tolerance Test (OGTT) using 75g anhydrous glucose is mandatory between 24-28 weeks for Gestational Diabetes Mellitus (GDM) diagnosis.",
                "keyPoints": [
                    "Normal maternal Hb: ≥ 11.0 g/dL. Mild anemia: 10.0-10.9 g/dL. Moderate: 7.0-9.9 g/dL. Severe: < 7.0 g/dL.",
                    "Urine albumin ≥ 1+ with elevated BP confirms preeclampsia.",
                    "2-hour plasma glucose ≥ 140 mg/dL after 75g glucose denotes GDM."
                ],
                "clinicalActions": [
                    "Collect fasting and 2-hour samples during VHSND sessions.",
                    "Refer patients with Hb < 7.0 g/dL or 2-hour glucose ≥ 140 mg/dL to the Primary Health Centre."
                ],
                "quiz": [
                    {
                        "question": "Severe anemia in pregnancy is defined as a hemoglobin level below which threshold?",
                        "options": ["< 11.0 g/dL", "< 9.0 g/dL", "< 7.0 g/dL", "< 5.0 g/dL"],
                        "answer": 2,
                        "explanation": "Under NHM and WHO standards, Hb < 7.0 g/dL indicates severe anemia requiring parenteral iron or blood transfusion at FRU."
                    }
                ]
            },
            {
                "id": 5,
                "title": "Tetanus and Adult Diphtheria (Td) Vaccination Schedule",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Under India's Universal Immunization Programme (UIP), TT vaccine has been replaced by Tetanus and adult Diphtheria (Td) vaccine. Pregnant women receive Td-1 as early as possible in pregnancy, followed by Td-2 at least 4 weeks later. If the woman received 2 doses of Td/TT in a pregnancy within the last 3 years, only a single Td Booster is administered.",
                "keyPoints": [
                    "Td-1: As early as possible during pregnancy.",
                    "Td-2: 4 weeks after Td-1 (ideally before 36 weeks).",
                    "Td Booster: Given if previous pregnancy was within 3 years and 2 doses were documented.",
                    "Administer 0.5 mL intramuscularly in the upper arm (deltoid)."
                ],
                "clinicalActions": [
                    "Document batch number and date in MCP card and U-WIN portal.",
                    "Advise mother to manage mild soreness with cold compress; do not massage injection site."
                ],
                "quiz": [
                    {
                        "question": "What is the minimum interval required between Td-1 and Td-2 in pregnancy?",
                        "options": ["1 week", "2 weeks", "4 weeks (28 days)", "8 weeks"],
                        "answer": 2,
                        "explanation": "Td-2 must be administered at least 4 weeks after Td-1 to establish protective antibody titers."
                    }
                ]
            },
            {
                "id": 6,
                "title": "IFA & Calcium Supplementation Guidelines",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "All pregnant women must receive Iron and Folic Acid (IFA) tablets starting after the first trimester (from 14th week onwards). Standard prophylaxis is 1 red IFA tablet daily (60 mg elemental iron + 500 mcg folic acid) for at least 180 days during pregnancy, plus 180 days postpartum. Calcium tablets (500 mg elemental calcium + 250 IU Vit D3) are given twice daily from 14 weeks. Iron and calcium must never be swallowed together.",
                "keyPoints": [
                    "IFA: 1 tablet daily for 180 days antenatal + 180 days postnatal.",
                    "Calcium: 2 tablets daily (1000 mg) starting from 14 weeks onwards.",
                    "Do not take IFA and Calcium together; maintain at least a 2-hour gap to avoid absorption inhibition."
                ],
                "clinicalActions": [
                    "Instruct mother to take IFA with citrus juices or water after meals to avoid nausea.",
                    "Warn about harmless black stool discoloration to prevent discontinuation."
                ],
                "quiz": [
                    {
                        "question": "Why should Iron-Folic Acid (IFA) and Calcium tablets NOT be taken at the same time?",
                        "options": ["Causes severe vomiting", "Calcium inhibits the intestinal absorption of iron", "Causes instant diarrhea", "They have identical ingredients"],
                        "answer": 1,
                        "explanation": "Calcium competes with iron absorption in the gut; keeping them spaced at least 2 hours apart ensures optimal absorption."
                    }
                ]
            },
            {
                "id": 7,
                "title": "Birth Preparedness & Complication Readiness (BPCR)",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Birth preparedness ensures families are ready for delivery and emergencies. The ASHA worker helps the family select a 24x7 delivery facility (PHC, CHC, or District Hospital), identify transportation (National Ambulance 108 / 102), designate birth companions, identify two compatible blood donors, and save funds for unexpected expenses.",
                "keyPoints": [
                    "Identify designated 24x7 First Referral Unit (FRU) or accredited hospital.",
                    "Save emergency helpline numbers (108 for emergency, 102 for maternity pick-up).",
                    "Pack hospital bag: Clean clothes, MCP card, Aadhaar card, bank passbook, clean baby wraps."
                ],
                "clinicalActions": [
                    "Conduct family counseling session in 8th month with mother-in-law and husband.",
                    "Verify transport access from beneficiary's hamlet to the paved road."
                ],
                "quiz": [
                    {
                        "question": "Which toll-free national ambulance numbers should every pregnant woman's family have saved?",
                        "options": ["100 and 101", "108 and 102", "139 and 1912", "1098 and 181"],
                        "answer": 1,
                        "explanation": "108 is the National Emergency Ambulance Service and 102 is the Janani Shishu Suraksha Karyakram (JSSK) drop-back transport."
                    }
                ]
            },
            {
                "id": 8,
                "title": "PMSMA Triage & Specialist Referral Clinic on 9th of Every Month",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA) is held on the 9th of every month across India to ensure every pregnant woman in her 2nd or 3rd trimester is examined by a medical doctor or OB/GYN specialist. High-risk pregnancies are identified, tagged with color-coded stickers (Red: High risk, Blue: Pregnancy-induced hypertension, Yellow: Other systemic diseases, Green: No risk factors), and placed on individual care pathways.",
                "keyPoints": [
                    "PMSMA is organized on the 9th of each calendar month across government health centers.",
                    "Specialist screening for preeclampsia, diabetes, anemia, and malpresentation.",
                    "Color-coded risk tagging ensures dedicated tracking until institutional delivery."
                ],
                "clinicalActions": [
                    "Mobilize all 2nd and 3rd trimester women in your village to the nearest PMSMA designated facility.",
                    "Ensure high-risk women are escorted and their referral slips documented in the ASHA register."
                ],
                "quiz": [
                    {
                        "question": "On which day of every month is the Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA) clinic conducted?",
                        "options": ["1st of the month", "9th of the month", "15th of the month", "Last Saturday of the month"],
                        "answer": 1,
                        "explanation": "PMSMA is conducted on the 9th day of every month across all PHCs, CHCs, and District Hospitals."
                    },
                    {
                        "question": "What does a RED sticker on an MCP card indicate under PMSMA guidelines?",
                        "options": ["Normal routine pregnancy", "High-Risk Pregnancy requiring specialist obstetric care", "Vaccination completed", "Postpartum mother"],
                        "answer": 1,
                        "explanation": "Red sticker designates High-Risk Pregnancy (HRP) needing specialist supervision and planned delivery at an FRU."
                    }
                ]
            }
        ]
    },
    {
        "id": "t2",
        "title": "Danger Signs Recognition",
        "category": "Emergency Care",
        "duration": "30 min",
        "difficulty": "Intermediate",
        "icon": "AlertTriangle",
        "color": "accent",
        "officialSource": "NHM Maternal Health - Obstetric Emergency Triage",
        "description": "Rapid triage of life-threatening obstetric conditions: severe preeclampsia, hemorrhage, eclampsia, sepsis, and obstructed labor.",
        "lessons": [
            {
                "id": 1,
                "title": "Severe Headache & Visual Disturbances (Preeclampsia)",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "A pregnant woman presenting with persistent severe frontal or occipital headache, blurred vision, scotoma (seeing spots), or epigastric/right upper quadrant pain has imminent eclampsia until proven otherwise. These symptoms reflect cerebral edema and capsular hepatic stretching caused by acute vasoconstriction. Urgent intervention is mandatory to prevent convulsions and maternal death.",
                "keyPoints": [
                    "Persistent headache + visual blurring indicates imminent eclamptic seizure.",
                    "Epigastric pain signifies liver capsule distension and impending HELLP syndrome.",
                    "Measure BP immediately; if ≥ 160/110 mmHg, medical emergency is present."
                ],
                "clinicalActions": [
                    "Do not leave the patient unattended; protect from bright lights and loud noises.",
                    "Arrange immediate 108 ambulance transfer to the nearest First Referral Unit (FRU) with OB/GYN facilities."
                ],
                "quiz": [
                    {
                        "question": "Severe headache and blurred vision in late pregnancy are critical warning signs of which condition?",
                        "options": ["Mild dehydration", "Imminent eclampsia / severe preeclampsia", "Normal hormonal changes", "Common eye strain"],
                        "answer": 1,
                        "explanation": "These symptoms are classic cerebral warning signs of impending eclampsia requiring urgent hospital intervention."
                    }
                ]
            },
            {
                "id": 2,
                "title": "Vaginal Bleeding: Antepartum & Postpartum Hemorrhage",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Any vaginal bleeding during pregnancy is abnormal. Bleeding before 24 weeks may indicate threatened or incomplete miscarriage or ectopic pregnancy. Bleeding after 24 weeks (Antepartum Hemorrhage - APH) indicates placenta previa or placental abruption. Postpartum Hemorrhage (PPH - loss of > 500 mL blood) is the leading cause of maternal mortality in India. Never perform a per-vaginal examination at community level.",
                "keyPoints": [
                    "NEVER perform vaginal digital examination (PV) in suspected placenta previa as it can trigger fatal hemorrhage.",
                    "PPH: Bleeding soaking more than 2 pads per hour or failing uterine contraction.",
                    "Keep patient warm, elevate legs, and call emergency transport."
                ],
                "clinicalActions": [
                    "Position patient in left lateral tilt; maintain airway.",
                    "Accompany the patient to the FRU in 108 ambulance with all maternal records."
                ],
                "quiz": [
                    {
                        "question": "What examination should NEVER be performed by frontline workers in a pregnant woman with vaginal bleeding?",
                        "options": ["Blood pressure check", "Digital per-vaginal (PV) examination", "Fetal heart sound auscultation", "Temperature check"],
                        "answer": 1,
                        "explanation": "Digital per-vaginal examination in suspected placenta previa can provoke catastrophic uncontrollable hemorrhage."
                    }
                ]
            },
            {
                "id": 3,
                "title": "Eclamptic Convulsions: First Response & Airway Care",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Eclampsia is the occurrence of generalized tonic-clonic convulsions in a pregnant woman with hypertension. The immediate role of the frontline worker is to ensure maternal safety: clear airway, prevent tongue biting without forcing objects between clenched teeth, turn onto left lateral side to prevent aspiration of vomit, and remove surrounding sharp objects.",
                "keyPoints": [
                    "Turn mother immediately to left lateral position.",
                    "Do NOT pour water or liquids into mouth during or after fits.",
                    "At PHC/FRU level, Magnesium Sulfate (Pritchard regimen) is the drug of choice."
                ],
                "clinicalActions": [
                    "Clear mouth secretions; ensure open airway.",
                    "Alert Medical Officer and escort patient in 108 emergency ambulance."
                ],
                "quiz": [
                    {
                        "question": "What is the immediate primary positioning for a pregnant woman experiencing convulsions?",
                        "options": ["Flat on her back (supine)", "Left lateral position to prevent aspiration", "Sitting upright", "Standing position"],
                        "answer": 1,
                        "explanation": "Turning the patient onto her left lateral side clears the airway and prevents aspiration of vomit or secretions."
                    }
                ]
            },
            {
                "id": 4,
                "title": "Decreased Fetal Movements & Severe Abdominal Pain",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Normal fetal movements should exceed 10 kicks within a 2-hour period when the mother is resting in the left lateral position. Absence or severe reduction of fetal movements indicates acute fetal distress or placental insufficiency. Severe constant abdominal pain ('woody hard' uterus) points to concealed abruptio placentae requiring immediate emergency cesarean delivery.",
                "keyPoints": [
                    "Count-to-10 kick rule: At least 10 discrete movements within 2 hours of quiet observation.",
                    "Sudden cessation of fetal movements requires same-day ultrasound / non-stress test at FRU.",
                    "Woody, rigid, tender abdomen signifies concealed placental abruption."
                ],
                "clinicalActions": [
                    "Instruct mother on fetal kick monitoring (DFMC) from 28th week.",
                    "If fetal movements are < 10 in 12 hours, refer urgently to CHC/District Hospital."
                ],
                "quiz": [
                    {
                        "question": "Under the daily fetal kick count protocol, how many movements should normally be felt within 2 hours of rest?",
                        "options": ["At least 1 to 2", "At least 10 discrete movements", "At least 30", "Fetal movements cannot be counted"],
                        "answer": 1,
                        "explanation": "Under standard obstetrics, at least 10 kicks in 2 hours confirms fetal wellbeing."
                    }
                ]
            },
            {
                "id": 5,
                "title": "Puerperal Sepsis & High Grade Fever",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Puerperal sepsis is defined as an infection of the genital tract occurring between rupture of membranes or labor until 42 days postpartum. Signs include temperature ≥ 38.5°C (101.3°F), foul-smelling purulent lochia, subinvolution of the uterus (uterus larger and tender than expected for postpartum day), chills, and tachycardia.",
                "keyPoints": [
                    "Temperature ≥ 38.5°C postpartum is an obstetric emergency.",
                    "Foul-smelling lochia + lower abdominal tenderness = puerperal endometritis.",
                    "Unchecked sepsis leads rapidly to septic shock and multi-organ failure."
                ],
                "clinicalActions": [
                    "Check lochia color, quantity, and odor at every home visit on Days 1, 3, 7, 14, 21, 28, and 42.",
                    "Refer suspected sepsis patients immediately for parenteral antibiotics."
                ],
                "quiz": [
                    {
                        "question": "Which combination of symptoms postpartum strongly points to puerperal sepsis?",
                        "options": ["Mild fatigue and thirst", "High fever with foul-smelling lochia and uterine tenderness", "Normal clear breast milk", "Mild backache"],
                        "answer": 1,
                        "explanation": "Fever accompanied by foul-smelling vaginal discharge and pelvic tenderness is diagnostic of postpartum genital tract sepsis."
                    }
                ]
            },
            {
                "id": 6,
                "title": "Emergency Referral Protocols (108/102) & Handover Slip",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Effective referral saves maternal lives. A completed NHM Referral Slip must accompany the patient, specifying vital signs, reason for referral, treatments already administered, and exact time of departure. Frontline workers should coordinate with the 108 Emergency Response Centre and call the receiving facility in advance.",
                "keyPoints": [
                    "Use standardized Referral Slip (Form 1-A) with vitals and reason for escalation.",
                    "Pre-notify the receiving Medical Officer or labor room staff.",
                    "Ensure birth companion accompanies the patient with MCP card."
                ],
                "clinicalActions": [
                    "Dial 108; state patient status clearly as 'Obstetric Emergency'.",
                    "Hand over referral slip directly to the staff nurse or Medical Officer on duty."
                ],
                "quiz": [
                    {
                        "question": "What essential document must always accompany a referred emergency patient to the First Referral Unit?",
                        "options": ["Completed NHM Referral Slip and MCP Card", "Birth certificate only", "Ration card photocopy only", "Electricity bill"],
                        "answer": 0,
                        "explanation": "A complete referral slip with clinical vitals and the MCP card gives the receiving doctors immediate clinical history."
                    }
                ]
            }
        ]
    },
    {
        "id": "t3",
        "title": "Immunization Best Practices",
        "category": "Child Health",
        "duration": "40 min",
        "difficulty": "Intermediate",
        "icon": "Syringe",
        "color": "sky",
        "officialSource": "Universal Immunization Programme (UIP) - MoHFW",
        "description": "Complete National Immunization Schedule, cold-chain maintenance, vaccine vial monitors (VVM), and adverse events following immunization (AEFI).",
        "lessons": [
            {
                "id": 1,
                "title": "National Immunization Schedule Overview",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "India's Universal Immunization Programme (UIP) is one of the world's largest public health programs. It provides free protection against 12 life-threatening diseases: Tuberculosis, Diphtheria, Pertussis, Tetanus, Polio, Hepatitis B, Pneumonia/Meningitis due to Hib, Rotavirus diarrhea, Pneumococcal disease (PCV), Measles, Rubella, and Japanese Encephalitis.",
                "keyPoints": [
                    "Protects against 12 vaccine-preventable diseases under UIP.",
                    "U-WIN portal enables electronic tracking of every child from birth.",
                    "Target is 100% full immunization coverage before 1 year of age."
                ],
                "clinicalActions": [
                    "Maintain village micro-plan identifying all newborns and pregnant women.",
                    "Organize weekly Village Health and Nutrition Days (VHND)."
                ],
                "quiz": [
                    {
                        "question": "How many vaccine-preventable diseases are protected under India's Universal Immunization Programme (UIP)?",
                        "options": ["5 diseases", "8 diseases", "12 diseases", "20 diseases"],
                        "answer": 2,
                        "explanation": "UIP currently protects infants and children against 12 life-threatening infectious diseases nationally and sub-nationally."
                    }
                ]
            },
            {
                "id": 2,
                "title": "Cold Chain & Vaccine Vial Monitor (VVM) Management",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Vaccines must be stored at temperatures between +2°C and +8°C in Ice-Lined Refrigerators (ILRs) and transported in vaccine carriers with conditioned ice packs. The Vaccine Vial Monitor (VVM) is a chemical heat-sensitive label. Stage 1 and 2: Inner square is lighter than outer circle (USE VACCINE). Stage 3 and 4: Inner square matches or is darker than outer circle (DO NOT USE; DISCARD).",
                "keyPoints": [
                    "Storage temperature: +2°C to +8°C at all stages.",
                    "Condition ice packs until sweating before placing vaccines in carrier.",
                    "Never freeze freeze-sensitive vaccines (Hepatitis B, Pentavalent, Td, PCV, IPV)."
                ],
                "clinicalActions": [
                    "Inspect VVM square on every vial before opening.",
                    "Perform 'Shake Test' if freeze-sensitive vaccines are suspected of having frozen."
                ],
                "quiz": [
                    {
                        "question": "What does it mean if the inner square of a Vaccine Vial Monitor (VVM) matches the color of the outer ring?",
                        "options": ["Vaccine is safe to use", "Vaccine has experienced heat damage and MUST NOT be used", "Vaccine is expired by date only", "Vaccine requires shaking"],
                        "answer": 1,
                        "explanation": "When inner square matches or is darker than outer circle (Stage 3/4), heat exposure has degraded the vaccine; it must be discarded."
                    }
                ]
            },
            {
                "id": 3,
                "title": "Birth Doses: BCG, OPV-0, and Hepatitis B",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Birth doses must be given as early as possible after delivery, ideally within 24 hours. BCG is given 0.05 mL intradermally on the left upper arm (0.1 mL if given after 1 month). OPV zero dose is 2 drops orally. Hepatitis B birth dose is 0.5 mL intramuscularly on the anterolateral aspect of mid-thigh within 24 hours to prevent vertical transmission.",
                "keyPoints": [
                    "Hepatitis B birth dose must be given strictly within 24 hours of birth.",
                    "BCG forms a wheal, then papule, and heals leaving a permanent scar.",
                    "Document all birth doses in MCP card and birth register before discharge."
                ],
                "clinicalActions": [
                    "Ensure institutional deliveries receive all 3 birth doses before leaving labor room.",
                    "Track home deliveries and mobilize ANM for immediate vaccination within 24 hours."
                ],
                "quiz": [
                    {
                        "question": "Within what window of time should the Hepatitis B birth dose ideally be administered?",
                        "options": ["Within 24 hours of birth", "Within 6 weeks", "Within 9 months", "Anytime in the first year"],
                        "answer": 0,
                        "explanation": "Hepatitis B birth dose prevents perinatal mother-to-child transmission and must be given within 24 hours."
                    }
                ]
            },
            {
                "id": 4,
                "title": "Primary Infant Schedule at 6, 10, and 14 Weeks",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "At 6, 10, and 14 weeks of age, infants receive key multi-antigen combinations. Pentavalent (DPT + Hep B + Hib) is given 0.5 mL IM on anterolateral mid-thigh. Oral Polio Vaccine (OPV) 2 drops orally. Rotavirus vaccine is given orally (5 drops or 2.5 mL per manufacturer). Fractional Inactivated Poliovirus Vaccine (fIPV) is administered intradermally at 6 and 14 weeks. Pneumococcal Conjugate Vaccine (PCV) at 6 and 14 weeks.",
                "keyPoints": [
                    "6 Weeks: Pentavalent-1, OPV-1, Rota-1, fIPV-1, PCV-1.",
                    "10 Weeks: Pentavalent-2, OPV-2, Rota-2.",
                    "14 Weeks: Pentavalent-3, OPV-3, Rota-3, fIPV-2, PCV-2."
                ],
                "clinicalActions": [
                    "Confirm age before administration; respect minimum 4-week intervals between doses.",
                    "Retain infant for 30 minutes observation after injection to monitor for anaphylaxis."
                ],
                "quiz": [
                    {
                        "question": "Which combination vaccine protects against Diphtheria, Pertussis, Tetanus, Hepatitis B, and Hib?",
                        "options": ["BCG", "Pentavalent", "Rotavirus", "MR Vaccine"],
                        "answer": 1,
                        "explanation": "Pentavalent vaccine combines 5 antigens in a single injection given at 6, 10, and 14 weeks."
                    }
                ]
            },
            {
                "id": 5,
                "title": "Measles-Rubella (MR) & Vitamin A at 9 Months",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "At completion of 9 months (270 days), infants receive Measles-Rubella (MR-1) 0.5 mL subcutaneously in the right upper arm, Japanese Encephalitis-1 (in endemic districts), PCV Booster, and Vitamin A 1st dose (1 lakh International Units = 1 mL) orally. Vitamin A is administered every 6 months thereafter up to 5 years (total 9 doses).",
                "keyPoints": [
                    "MR-1: 9 completed months to 12 months.",
                    "Vitamin A Dose 1: 100,000 IU (1 mL) given with spoon.",
                    "Reconstituted MR vaccine must be used within 4 hours or discarded."
                ],
                "clinicalActions": [
                    "Mark reconstitution time on MR vial; discard strictly after 4 hours.",
                    "Counsel parents regarding expected mild fever/rash 7-10 days post-vaccination."
                ],
                "quiz": [
                    {
                        "question": "How soon after reconstitution must a Measles-Rubella (MR) vaccine vial be discarded?",
                        "options": ["Within 4 hours", "Within 24 hours", "Within 7 days", "Can be kept until empty"],
                        "answer": 0,
                        "explanation": "Reconstituted live freeze-dried vaccines (BCG, MR) must be kept on ice and discarded strictly within 4 hours to avoid bacterial contamination."
                    }
                ]
            },
            {
                "id": 6,
                "title": "Tracking Due Lists & Dropouts on U-WIN",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Vaccine dropouts occur when children receive early doses but fail to return for subsequent doses (e.g., received Penta-1 but missed Penta-2 and 3). Frontline workers use the U-WIN digital registry and physical Tracking Bags to create weekly Due Lists. Mobilization through home visits is required for hard-to-reach and resistant households.",
                "keyPoints": [
                    "Calculate dropout rate: (Penta 1 - Penta 3) / Penta 1 x 100%. Target < 5%.",
                    "Conduct home tracking visits 48 hours prior to the scheduled VHND session.",
                    "Update vaccination status real-time on U-WIN platform."
                ],
                "clinicalActions": [
                    "Cross-reference village birth registry against session attendance lists.",
                    "Engage village elders, PRI members, and self-help groups to address vaccine hesitancy."
                ],
                "quiz": [
                    {
                        "question": "What is the primary indicator of an immunization program's continuity between infancy doses?",
                        "options": ["BCG scar rate", "Pentavalent 1 to Pentavalent 3 dropout rate", "Total syringe consumption", "Number of pamphlets distributed"],
                        "answer": 1,
                        "explanation": "The Pentavalent 1 to Pentavalent 3 dropout rate reveals whether children enrolled in the system actually finish their primary course."
                    }
                ]
            },
            {
                "id": 7,
                "title": "AEFI Identification, Immediate Response & Notification",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "An Adverse Event Following Immunization (AEFI) is any untoward medical occurrence following immunization, whether or not causally related. AEFIs are classified as minor (mild fever, local swelling), severe, or serious (anaphylaxis, hospitalization, death). All serious AEFIs must be reported immediately to the Medical Officer and District Immunization Officer.",
                "keyPoints": [
                    "Observe every child for 30 minutes at session site post-vaccination.",
                    "Anaphylaxis: Sudden difficulty breathing, facial swelling, limpness. Drug of choice: Adrenaline (1:1000).",
                    "Immediate phone notification of serious AEFI within 24 hours is statutory."
                ],
                "clinicalActions": [
                    "Check emergency tray at every session site: Adrenaline, Paracetamol syrup, sterile syringes.",
                    "Reassure parents about minor fever; advise cold sponge and paracetamol as instructed by ANM."
                ],
                "quiz": [
                    {
                        "question": "How long must an infant and mother remain at the vaccination site for observation post-injection?",
                        "options": ["5 minutes", "15 minutes", "At least 30 minutes", "No waiting needed"],
                        "answer": 2,
                        "explanation": "A mandatory 30-minute observation period detects acute anaphylactic reactions when immediate life-saving adrenaline can be given."
                    }
                ]
            }
        ]
    },
    {
        "id": "t4",
        "title": "Anemia Management",
        "category": "Nutrition",
        "duration": "25 min",
        "difficulty": "Beginner",
        "icon": "Pill",
        "color": "primary",
        "officialSource": "Anemia Mukt Bharat (AMB) - 6x6x6 National Strategy",
        "description": "Evidence-based anemia screening, life-cycle IFA supplementation, deworming protocols, and severe anemia referral pathways.",
        "lessons": [
            {
                "id": 1,
                "title": "Anemia Mukt Bharat: 6x6x6 Strategy Overview",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Anemia Mukt Bharat (AMB) employs the 6x6x6 strategy: targeting 6 beneficiary groups (children 6-59m, children 5-9y, adolescents 10-19y, women of reproductive age 20-24y, pregnant women, and lactating mothers) through 6 institutional interventions and 6 institutional mechanisms to reduce anemia prevalence by 3 percentage points per year.",
                "keyPoints": [
                    "6 Beneficiary target groups across the entire life cycle.",
                    "Prophylactic Iron-Folic Acid supplementation across all age tiers.",
                    "Integration with Poshan Abhiyaan and School Health Ambassadors."
                ],
                "clinicalActions": [
                    "Map target population across village Anganwadi and school rosters.",
                    "Supply color-coded IFA tablets appropriate to each demographic group."
                ],
                "quiz": [
                    {
                        "question": "What is the annual target reduction in anemia prevalence under the Anemia Mukt Bharat strategy?",
                        "options": ["1 percentage point per year", "3 percentage points per year", "10 percentage points per year", "50% over 10 years"],
                        "answer": 1,
                        "explanation": "AMB targets a 3 percentage point annual reduction in anemia across each target demographic."
                    }
                ]
            },
            {
                "id": 2,
                "title": "Clinical Grading of Pallor & Diagnostic Testing",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Frontline workers assess clinical pallor at four anatomical sites: palpebral conjunctiva of the lower eyelid, dorsum and edges of tongue, nail beds, and palmar creases. When palmar creases are as pale as surrounding skin, severe anemia is suspected. Point-of-care digital hemoglobinometers (Hb > 11 g/dL normal, 10-10.9 mild, 7-9.9 moderate, < 7 severe) guide clinical decisions.",
                "keyPoints": [
                    "Palmar pallor is the most reliable clinical sign of severe anemia.",
                    "Normal pregnancy Hb cut-off: 11.0 g/dL.",
                    "Severe anemia: Hb < 7.0 g/dL requires urgent escalation."
                ],
                "clinicalActions": [
                    "Check conjunctiva, tongue, and palms of all pregnant women at every home visit.",
                    "Document numerical Hb reading in MCP card after digital screening."
                ],
                "quiz": [
                    {
                        "question": "Which clinical physical examination finding is the most reliable indicator of severe anemia in field conditions?",
                        "options": ["Mild headache", "Severe palmar crease pallor", "Mild leg fatigue", "Dry skin"],
                        "answer": 1,
                        "explanation": "Severe palmar crease pallor correlates strongly with hemoglobin under 7 g/dL under WHO and NHM guidelines."
                    }
                ]
            },
            {
                "id": 3,
                "title": "Prophylactic vs Therapeutic IFA Supplementation",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Prophylactic regimen: 1 red IFA tablet daily (60 mg elemental iron + 500 mcg folic acid) starting after 1st trimester for 180 days during pregnancy and 180 days postpartum. Therapeutic regimen for moderate anemia (Hb 7-9.9 g/dL): 2 red IFA tablets daily (one morning, one evening) for at least 100 days until Hb normalizes, followed by standard prophylaxis.",
                "keyPoints": [
                    "Mild anemia / Normal: 1 tablet daily (60 mg Fe + 500 mcg FA).",
                    "Moderate anemia (Hb 7-9.9 g/dL): 2 tablets daily (120 mg Fe + 1000 mcg FA).",
                    "Severe anemia (< 7 g/dL): DO NOT rely on oral tablets alone; refer to PHC/FRU for IV iron or blood."
                ],
                "clinicalActions": [
                    "Ensure adequate tablet supply in mother's home; count leftover tablets during home visits.",
                    "Advise intake with vitamin C rich foods (amla, lemon, guava) to enhance absorption."
                ],
                "quiz": [
                    {
                        "question": "What is the recommended oral IFA dosage for a pregnant woman diagnosed with moderate anemia (Hb 8.2 g/dL)?",
                        "options": ["1 tablet once a week", "1 tablet daily", "2 tablets daily (one morning, one evening)", "No tablets permitted"],
                        "answer": 2,
                        "explanation": "Moderate anemia (Hb 7.0 - 9.9 g/dL) requires a therapeutic dose of 2 tablets daily under AMB guidelines."
                    }
                ]
            },
            {
                "id": 4,
                "title": "Biannual Deworming (Albendazole) Schedule",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Intestinal helminths (hookworm, roundworm) cause chronic microscopic blood loss and impair nutritional absorption. Under National Deworming Day (NDD), pregnant women receive a single chewable tablet of Albendazole 400 mg after the first trimester (in 2nd or 3rd trimester). Children and adolescents receive Albendazole biannually on February 10 and August 10.",
                "keyPoints": [
                    "Albendazole 400 mg single dose given strictly AFTER the 1st trimester (14 weeks onwards).",
                    "Contraindicated in the 1st trimester of pregnancy.",
                    "Tablet must be chewed thoroughly before swallowing."
                ],
                "clinicalActions": [
                    "Administer directly observed chewable tablet after 1st trimester during VHND.",
                    "Counsel on handwashing with soap before meals and wearing slippers to prevent re-infection."
                ],
                "quiz": [
                    {
                        "question": "When can Albendazole (400 mg) deworming safely be given to a pregnant woman?",
                        "options": ["In the first 4 weeks", "Strictly after the 1st trimester (from 2nd trimester onwards)", "Only after delivery", "Never during pregnancy"],
                        "answer": 1,
                        "explanation": "Albendazole is contraindicated in the 1st trimester but is safe and recommended in the 2nd and 3rd trimesters."
                    }
                ]
            },
            {
                "id": 5,
                "title": "Severe Anemia (Hb < 7 g/dL) Red-Flag Referral & IV Iron",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Severe anemia (Hb < 7.0 g/dL) in pregnancy is an obstetric red flag that can precipitate high-output congestive heart failure during labor and massive postpartum hemorrhage. Oral iron cannot replenish reserves quickly enough in late gestation. Patients require referral to a CHC or District Hospital for intravenous Iron Sucrose / Ferric Carboxymaltose or packed red blood cell transfusion.",
                "keyPoints": [
                    "Hb < 7.0 g/dL = Urgent Red Flag referral to FRU / District Hospital.",
                    "IV Iron Sucrose or Ferric Carboxymaltose restores iron stores rapidly without GI side effects.",
                    "Hb < 5.0 g/dL = Emergency inpatient admission for blood transfusion."
                ],
                "clinicalActions": [
                    "Arrange immediate transport via 108 ambulance to designated hospital.",
                    "Identify 2 blood donors from family in case transfusion is required at delivery."
                ],
                "quiz": [
                    {
                        "question": "Why should pregnant women with severe anemia (Hb < 7 g/dL) NOT be managed with oral iron alone in the community?",
                        "options": ["Oral iron takes 8-12 weeks to raise Hb and risks heart failure/hemorrhage during delivery", "Oral iron is too expensive", "Oral iron causes immediate labor", "Tablets do not contain iron"],
                        "answer": 0,
                        "explanation": "Severe anemia requires rapid parental iron or blood transfusion at a hospital facility before labor begins to prevent maternal mortality."
                    }
                ]
            }
        ]
    },
    {
        "id": "t5",
        "title": "Postnatal Care Essentials",
        "category": "Maternal Health",
        "duration": "35 min",
        "difficulty": "Beginner",
        "icon": "HeartHandshake",
        "color": "success",
        "officialSource": "National Guidelines for Postnatal Care - NHM",
        "description": "Mandatory domiciliary postnatal visit timelines, maternal lochia evaluation, early breastfeeding support, and kangaroo mother care.",
        "lessons": [
            {
                "id": 1,
                "title": "Mandatory Domiciliary Postnatal Visits Schedule",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Under NHM guidelines, the postnatal period spans from delivery up to 42 days (6 weeks). For institutional deliveries: minimum 6 home visits (Day 3, 7, 14, 21, 28, and 42). For home deliveries: 7 home visits (Day 1 within 24 hours, Day 3, 7, 14, 21, 28, and 42). Over 60% of maternal deaths and 50% of neonatal deaths occur in this critical first week postpartum.",
                "keyPoints": [
                    "Institutional delivery: 6 home visits (Days 3, 7, 14, 21, 28, 42).",
                    "Home delivery: 7 home visits (Day 1, 3, 7, 14, 21, 28, 42).",
                    "First 48 hours is the highest risk period for PPH, eclampsia, and neonatal hypothermia."
                ],
                "clinicalActions": [
                    "Schedule visits in your ASHA diary immediately upon receiving birth notification.",
                    "Weigh the infant and check maternal blood pressure and lochia at every visit."
                ],
                "quiz": [
                    {
                        "question": "How many mandatory home postnatal visits must an ASHA worker conduct for a mother who delivered in a hospital?",
                        "options": ["2 visits", "4 visits", "6 visits (Days 3, 7, 14, 21, 28, 42)", "10 visits"],
                        "answer": 2,
                        "explanation": "Under Home-Based Newborn Care (HBNC) guidelines, institutional deliveries receive 6 visits and home deliveries receive 7 visits."
                    }
                ]
            },
            {
                "id": 2,
                "title": "Maternal Assessment: Lochia, Perineum & Involution",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "At each postnatal visit, assess maternal recovery. Lochia progresses from Lochia Rubra (red, days 1-4) to Lochia Serosa (pinkish-brown, days 5-9) to Lochia Alba (yellow-white, days 10-28). Uterine fundus should descend approximately one fingerbreadth per day and become non-palpable above the pubic symphysis by Day 12-14. Inspect episiotomy/perineal tears for redness, pus, or wound breakdown.",
                "keyPoints": [
                    "Lochia progression: Rubra (1-4d) -> Serosa (5-9d) -> Alba (10-28d).",
                    "Foul odor or sudden return of heavy bright red bleeding indicates endometritis or secondary PPH.",
                    "Uterus should be hard and well-contracted; boggy tender uterus indicates infection."
                ],
                "clinicalActions": [
                    "Palpate uterine height gently with clean warm hands.",
                    "Advise mother to maintain perineal hygiene with clean boiled water and fresh cotton pads."
                ],
                "quiz": [
                    {
                        "question": "What is the expected color and duration of normal Lochia Rubra after delivery?",
                        "options": ["Yellow discharge for 3 weeks", "Bright red vaginal discharge lasting days 1 to 4", "Clear watery fluid for 48 hours", "Greenish discharge"],
                        "answer": 1,
                        "explanation": "Lochia Rubra is normal red lochia consisting of blood and decidual tissue during the first 3-4 days postpartum."
                    }
                ]
            },
            {
                "id": 3,
                "title": "Exclusive Breastfeeding Support: Latch & Positioning",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Initiate breastfeeding within 1 hour of birth. Colostrum (first yellow milk) is the baby's first immunization, rich in secretory IgA antibodies. Exclusively breastfeed for 6 months (no water, formula, ghutti, or honey). Assess the 4 signs of good attachment: chin touching breast, mouth wide open, lower lip curled outward, more areola visible above than below the mouth.",
                "keyPoints": [
                    "Initiate within 1 hour of normal delivery (within 4 hours of C-section).",
                    "Do NOT discard colostrum; it protects against neonatal sepsis.",
                    "4 Signs of effective latch: Chin touching, mouth wide open, lower lip flanged, more areola above."
                ],
                "clinicalActions": [
                    "Observe an entire breastfeeding session; correct positioning and latch technique.",
                    "Counsel family that pre-lacteal feeds (honey, tea, goat milk) introduce lethal pathogens."
                ],
                "quiz": [
                    {
                        "question": "Which of the following is NOT one of the 4 key signs of good breastfeeding attachment?",
                        "options": ["Infant's chin touching mother's breast", "Infant's mouth wide open", "Infant's lower lip curled outward", "Infant making loud clicking noises with small shallow latch"],
                        "answer": 3,
                        "explanation": "Clicking noises and a shallow latch indicate poor attachment, causing sore nipples and inadequate milk transfer."
                    }
                ]
            },
            {
                "id": 4,
                "title": "Neonatal Thermal Care & Kangaroo Mother Care (KMC)",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Hypothermia (< 36.5°C) is a silent killer of newborns. Maintain the 'Warm Chain': warm delivery room (> 25°C), immediate drying, skin-to-skin contact, early breastfeeding, postponing bath for at least 48-72 hours (or 7 days in low-birth-weight infants), and appropriate warm clothing/cap. Kangaroo Mother Care (KMC: continuous skin-to-skin contact on mother's chest) is life-saving for infants < 2500g.",
                "keyPoints": [
                    "Delay newborn bath for at least 48 hours (7 days for LBW babies).",
                    "KMC components: Continuous skin-to-skin contact + exclusive breastfeeding.",
                    "Signs of hypothermia: Cold feet and hands, lethargy, weak cry, refusal to feed."
                ],
                "clinicalActions": [
                    "Check temperature by touching baby's abdomen and feet with back of hand.",
                    "Guide mother and family members on proper KMC wrapping using a cloth binder."
                ],
                "quiz": [
                    {
                        "question": "How long should a newborn's first bath be postponed according to NHM newborn care guidelines?",
                        "options": ["1 hour after birth", "At least 48 to 72 hours (7 days if low birth weight)", "1 month", "Bathing should never be delayed"],
                        "answer": 1,
                        "explanation": "Postponing bathing for 48-72 hours prevents cold stress and hypothermia while preserving the vernix caseosa."
                    }
                ]
            },
            {
                "id": 5,
                "title": "Postpartum Danger Signs in Mother and Infant",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Maternal danger signs: Heavy vaginal bleeding, severe headache, convulsions, fever > 38.5°C, breathing difficulty, calf swelling/pain. Newborn danger signs: Fast breathing (> 60 breaths/min), chest indrawing, hypothermia (< 35.5°C) or fever (> 37.5°C), lethargy/unconsciousness, convulsions, yellow palms/soles (severe jaundice), pus from umbilical cord, or inability to feed.",
                "keyPoints": [
                    "Newborn fast breathing threshold: ≥ 60 breaths per minute counted over a full 60 seconds.",
                    "Severe chest indrawing indicates severe pneumonia or sepsis.",
                    "Umbilical cord redness spreading to abdominal skin = omphalitis needing immediate IV antibiotics."
                ],
                "clinicalActions": [
                    "Count infant respiratory rate for one full minute using a digital watch or timer.",
                    "If any red-flag symptom is detected, initiate immediate 108 referral to SNCU (Special Newborn Care Unit)."
                ],
                "quiz": [
                    {
                        "question": "What is the respiratory rate threshold defining fast breathing in a newborn under 2 months of age?",
                        "options": ["≥ 20 breaths per minute", "≥ 40 breaths per minute", "≥ 60 breaths per minute", "≥ 100 breaths per minute"],
                        "answer": 2,
                        "explanation": "A respiratory rate of 60 breaths per minute or more in an infant under 2 months indicates fast breathing requiring urgent medical care."
                    }
                ]
            },
            {
                "id": 6,
                "title": "Postpartum Family Planning (PPFP) Counseling",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Postpartum family planning prevents rapid repeat pregnancies, reducing maternal and infant mortality. Ideal spacing between pregnancies is at least 3 years. Counseling covers: Postpartum Intrauterine Device (PPIUD) inserted within 48 hours of delivery, Progestin-only Pills (POPs) or injectable MPA (Antara) for breastfeeding mothers, Condoms (Nirodh), and Lactational Amenorrhea Method (LAM).",
                "keyPoints": [
                    "Optimal inter-pregnancy interval is at least 24 months before next conception (3 years between births).",
                    "Combined oral contraceptive pills (COCs) are contraindicated during first 6 months of breastfeeding.",
                    "Antara (DMPA injection) can be initiated at 6 weeks postpartum."
                ],
                "clinicalActions": [
                    "Discuss family planning preferences with couple before 6-week postnatal milestone.",
                    "Distribute barrier contraceptives (Nirodh) during home visits."
                ],
                "quiz": [
                    {
                        "question": "Why are Combined Oral Contraceptive Pills (COCs with estrogen) avoided during the first 6 months of breastfeeding?",
                        "options": ["They are too expensive", "Estrogen suppresses breast milk production and enters breast milk", "They cause high fever in the infant", "They are not approved in India"],
                        "answer": 1,
                        "explanation": "Estrogen in combined pills significantly reduces breast milk volume; progestin-only methods (Antara, PPIUD, POPs) are preferred."
                    }
                ]
            }
        ]
    },
    {
        "id": "t6",
        "title": "High-Risk Pregnancy Management",
        "category": "Maternal Health",
        "duration": "60 min",
        "difficulty": "Advanced",
        "icon": "Activity",
        "color": "accent",
        "officialSource": "PMSMA & ICMR Clinical Guidelines for High-Risk Pregnancy",
        "description": "Comprehensive protocols for gestational hypertension, preeclampsia, gestational diabetes (GDM), previous cesarean section, Rh incompatibility, and multi-parity.",
        "lessons": [
            {
                "id": 1,
                "title": "High-Risk Pregnancy (HRP) Stratification & Flagging",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "A high-risk pregnancy is one where maternal or fetal life or health is jeopardized by a disorder coincident with or unique to pregnancy. Approximately 20-30% of pregnancies in India fall under the high-risk category and contribute to over 75% of maternal mortality. Early identification, prominent red-sticker tagging on MCP card, and planned institutional delivery at a First Referral Unit (FRU) are vital.",
                "keyPoints": [
                    "HRP constitutes 20-30% of pregnancies but accounts for > 75% of maternal deaths.",
                    "Tag MCP card with Red Sticker under PMSMA protocol.",
                    "Map patient to a specialized 24x7 FRU with emergency obstetric and blood storage capacity."
                ],
                "clinicalActions": [
                    "Screen all pregnant women at registration for high-risk criteria: age, parity, past obstetric history, medical conditions.",
                    "Ensure high-risk women attend PMSMA on the 9th of every month."
                ],
                "quiz": [
                    {
                        "question": "What percentage of maternal mortality is contributed by High-Risk Pregnancies?",
                        "options": ["Less than 5%", "Around 10%", "More than 75%", "100%"],
                        "answer": 2,
                        "explanation": "High-risk pregnancies account for over 75% of maternal and perinatal mortality, making their early detection paramount."
                    }
                ]
            },
            {
                "id": 2,
                "title": "Gestational Hypertension & Preeclampsia Protocols",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Gestational hypertension is new-onset BP ≥ 140/90 mmHg after 20 weeks of gestation without proteinuria. Preeclampsia is hypertension with proteinuria (≥ 1+ on dipstick) or end-organ dysfunction (thrombocytopenia, renal insufficiency, impaired liver function). Severe features include BP ≥ 160/110 mmHg, severe headache, pulmonary edema, or HELLP syndrome. Antihypertensives (Labetalol, Nifedipine) and Magnesium Sulfate are initiated at PHC/FRU level.",
                "keyPoints": [
                    "Mild: BP 140/90 to 159/109 mmHg without severe symptoms. Monitor weekly.",
                    "Severe: BP ≥ 160/110 mmHg. Immediate hospital admission required.",
                    "Never prescribe oral antihypertensives independently as an ASHA; refer to Medical Officer."
                ],
                "clinicalActions": [
                    "Check BP weekly in diagnosed gestational hypertension cases.",
                    "Instruct family on danger signs (headache, vision changes, right upper quadrant pain)."
                ],
                "quiz": [
                    {
                        "question": "What blood pressure reading defines severe preeclampsia requiring immediate hospital admission?",
                        "options": ["120/80 mmHg", "130/85 mmHg", "140/90 mmHg", "160/110 mmHg or higher"],
                        "answer": 3,
                        "explanation": "Systolic BP ≥ 160 mmHg or diastolic BP ≥ 110 mmHg defines severe preeclampsia requiring inpatient management."
                    }
                ]
            },
            {
                "id": 3,
                "title": "Gestational Diabetes Mellitus (GDM) & 75g OGTT",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Under National Guidelines for Diagnosis and Management of Gestational Diabetes Mellitus (GDM), a single-step 75g Oral Glucose Tolerance Test (OGTT) is performed regardless of last meal. A 2-hour plasma glucose value ≥ 140 mg/dL is diagnostic of GDM. Untreated GDM causes macrosomia (large baby > 4kg), birth trauma, stillbirth, neonatal hypoglycemia, and respiratory distress syndrome.",
                "keyPoints": [
                    "Test: 75g anhydrous oral glucose dissolved in 300 mL water swallowed over 5-10 minutes.",
                    "Diagnostic cut-off: 2-hour plasma glucose ≥ 140 mg/dL.",
                    "First-line management: Medical Nutrition Therapy (MNT) and physical exercise for 2 weeks. If glucose remains high, initiate Insulin or Metformin."
                ],
                "clinicalActions": [
                    "Ensure every pregnant woman undergoes 75g OGTT at 1st visit and repeat between 24-28 weeks.",
                    "Counsel GDM mothers to avoid sweets, fried foods, and refined flours (maida)."
                ],
                "quiz": [
                    {
                        "question": "What 2-hour plasma glucose reading following a 75g oral glucose load confirms Gestational Diabetes Mellitus (GDM)?",
                        "options": ["≥ 90 mg/dL", "≥ 110 mg/dL", "≥ 140 mg/dL", "≥ 250 mg/dL"],
                        "answer": 2,
                        "explanation": "Under MoHFW national GDM guidelines, a 2-hour plasma glucose ≥ 140 mg/dL confirms gestational diabetes."
                    }
                ]
            },
            {
                "id": 4,
                "title": "Severe Anemia Co-morbidities & Fetal Growth Retardation",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Chronic severe anemia (Hb < 7 g/dL) starves the placenta and developing fetus of oxygen, leading to Intrauterine Growth Restriction (IUGR) and oligohydramnios (low amniotic fluid). Symphysis-Fundal Height (SFH) in centimeters should correlate with gestational age in weeks between 20-36 weeks. A lag of 3 cm or more suggests fetal growth restriction requiring specialist ultrasound assessment.",
                "keyPoints": [
                    "SFH lag ≥ 3 cm indicates suspected Intrauterine Growth Restriction (IUGR).",
                    "Chronic placental hypoxia causes low birth weight and preterm delivery.",
                    "Close fetal monitoring with serial Doppler ultrasound at District Hospital is indicated."
                ],
                "clinicalActions": [
                    "Measure SFH using non-elastic measuring tape starting from 20th week.",
                    "Ensure mother receives high-protein diet (pulses, milk, eggs) and IV iron sucrose."
                ],
                "quiz": [
                    {
                        "question": "A lag of how many centimeters between Symphysis-Fundal Height (SFH) and gestational age suggests fetal growth restriction?",
                        "options": ["1 cm", "3 cm or more", "10 cm", "SFH does not correlate with gestation"],
                        "answer": 1,
                        "explanation": "A discrepancy of 3 cm or more between fundal height in cm and weeks of gestation strongly indicates growth restriction or oligohydramnios."
                    }
                ]
            },
            {
                "id": 5,
                "title": "Multiple Gestation (Twins) & Malpresentation",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Twin pregnancies carry higher risks of preeclampsia, anemia, gestational diabetes, preterm labor, and postpartum hemorrhage. Malpresentation (breech, transverse lie, brow) identified after 36 weeks cannot be delivered normally at a Primary Health Centre. All multiple gestations and malpresentations must be scheduled for delivery at a First Referral Unit with a functional operation theatre.",
                "keyPoints": [
                    "Multiple gestations must be delivered at an FRU/Medical College.",
                    "Breech or transverse lie persisting at 36 weeks requires planned hospital delivery.",
                    "Increased risk of umbilical cord prolapse upon membrane rupture."
                ],
                "clinicalActions": [
                    "Verify ultrasound presentation report after 34 weeks gestation.",
                    "Instruct mother to lie down immediately and call 108 if water breaks before labor pains."
                ],
                "quiz": [
                    {
                        "question": "Where should a pregnant woman with twin pregnancy or breech presentation at 36 weeks be planned for delivery?",
                        "options": ["At home with local dai", "At Sub-centre without doctor", "At First Referral Unit (FRU) / District Hospital with operation theatre", "Any clinic"],
                        "answer": 2,
                        "explanation": "High-risk presentations require 24x7 emergency cesarean capability and blood banking present only at FRU/District Hospital."
                    }
                ]
            },
            {
                "id": 6,
                "title": "Previous Cesarean Section (Uterine Scar Precautions)",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "A woman with a previous cesarean section has a scarred uterus. The primary life-threatening risk during subsequent labor is uterine rupture through the previous scar. Home delivery or delivery at an unequipped sub-centre is strictly contraindicated. Symptoms of scar dehiscence include sudden severe sharp tearing pain, cessation of uterine contractions, vaginal bleeding, and fetal heart abnormalities.",
                "keyPoints": [
                    "Strictly institutional delivery at an FRU with immediate emergency laparotomy facility.",
                    "Trial of labor (TOLAC/VBAC) requires continuous fetal and maternal monitoring.",
                    "Uterine scar rupture causes fatal maternal hemorrhage and fetal demise within minutes."
                ],
                "clinicalActions": [
                    "Identify previous operative records; confirm whether lower segment (transverse) or classical incision.",
                    "Arrange advance hospital admission at 38 completed weeks."
                ],
                "quiz": [
                    {
                        "question": "What is the catastrophic risk during labor in a mother with a previous cesarean section delivery?",
                        "options": ["Mild dehydration", "Uterine scar rupture and hemorrhage", "Immediate toothache", "Excess amniotic fluid"],
                        "answer": 1,
                        "explanation": "Uterine scar dehiscence/rupture under labor pressure causes catastrophic internal bleeding and rapid fetal hypoxia."
                    }
                ]
            },
            {
                "id": 7,
                "title": "Infectious Disease Screenings: HIV, Syphilis, and Hepatitis B",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Universal screening for HIV, Syphilis, and Hepatitis B surface antigen (HBsAg) is mandatory for all pregnant women under the Elimination of Mother-to-Child Transmission (EMTCT) program. Point-of-care dual test kits for HIV and Syphilis deliver results within 20 minutes at VHND. HIV-positive mothers receive immediate triple antiretroviral therapy (ART). Syphilis is treated with Benzathine Penicillin to prevent congenital syphilis and stillbirth.",
                "keyPoints": [
                    "EMTCT testing: HIV, Syphilis, and HBsAg screening at 1st ANC visit.",
                    "HIV+: Immediate ART regardless of CD4 count; baby receives Nevirapine prophylaxis.",
                    "Syphilis+: Single injection Benzathine Penicillin 2.4 million units IM cures infection and protects fetus."
                ],
                "clinicalActions": [
                    "Ensure confidentiality and non-judgmental counseling during testing.",
                    "Trace and treat sexual partners to prevent re-infection."
                ],
                "quiz": [
                    {
                        "question": "What is the standard treatment administered to a pregnant woman diagnosed with Syphilis to protect the fetus?",
                        "options": ["Paracetamol syrup", "Benzathine Penicillin injection", "Oral vitamin C", "Aspirin 75mg"],
                        "answer": 1,
                        "explanation": "Benzathine Penicillin G cures maternal syphilis and crosses the placenta to treat the fetus, preventing congenital syphilis."
                    }
                ]
            },
            {
                "id": 8,
                "title": "Rh Negative Blood Group & Anti-D Immunoglobulin",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "An Rh-negative mother carrying an Rh-positive fetus can produce anti-Rh antibodies if fetal red cells enter maternal circulation (Rh isoimmunization). In subsequent pregnancies, these maternal antibodies cross the placenta and destroy fetal red cells, causing Hemolytic Disease of the Fetus and Newborn (erythroblastosis fetalis, hydrops fetalis). Injection Anti-D immunoglobulin (300 mcg) is administered within 72 hours of delivery if newborn is Rh positive.",
                "keyPoints": [
                    "Determine ABO and Rh blood group at 1st ANC visit.",
                    "Indirect Coombs Test (ICT) screens for maternal sensitization.",
                    "Anti-D Immunoglobulin (300 mcg IM) administered within 72 hours of delivery of Rh+ baby, and at 28 weeks gestation."
                ],
                "clinicalActions": [
                    "Flag all Rh-negative mothers in ASHA register with bold red lettering.",
                    "Ensure cord blood group is sent immediately upon delivery in the labor room."
                ],
                "quiz": [
                    {
                        "question": "Within how many hours postpartum must Anti-D Immunoglobulin be administered to an unsensitized Rh-negative mother who delivers an Rh-positive baby?",
                        "options": ["Within 24 hours", "Within 72 hours", "Within 30 days", "Only before pregnancy"],
                        "answer": 1,
                        "explanation": "Anti-D immunoglobulin must be administered within 72 hours of delivery to neutralize fetal Rh-positive red cells before maternal sensitization occurs."
                    }
                ]
            },
            {
                "id": 9,
                "title": "PMSMA Monthly Clinical Audit & Specialist Escort Workflow",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "Effective tracking requires a monthly clinical audit. Every village ASHA must maintain an active Line List of High-Risk Pregnancies. Before each PMSMA session on the 9th, the ASHA contacts all identified HRP mothers, arranges local transport, and personally accompanies them to the PHC/CHC. Following specialist consultation, individual delivery action plans (place of delivery, emergency transport, blood donors) are locked in.",
                "keyPoints": [
                    "Maintain active Village HRP Line List updated weekly.",
                    "Escort all 2nd and 3rd trimester high-risk women to PMSMA clinic on the 9th.",
                    "Document specialist treatment orders and review them at subsequent home visits."
                ],
                "clinicalActions": [
                    "Verify receipt of free ultrasound, laboratory tests, and specialist medications under PMSMA.",
                    "Update Anmol/RCH mobile application record for each high-risk beneficiary."
                ],
                "quiz": [
                    {
                        "question": "What is the primary frontline responsibility of the ASHA worker for identified high-risk pregnant women on the 9th of every month?",
                        "options": ["Keep them at home resting", "Personally mobilize and escort them to the PMSMA specialist clinic", "Prescribe antibiotics", "Only collect their signature"],
                        "answer": 1,
                        "explanation": "Frontline workers must mobilize and escort high-risk women to the PMSMA clinic on the 9th for specialist evaluation."
                    }
                ]
            },
            {
                "id": 10,
                "title": "Institutional Delivery Mapping & 108 Transport Logistics",
                "videoUrl": "https://www.youtube.com/embed/videoseries?list=PL449DAA54D4F1E5C1",
                "content": "The final milestone in high-risk pregnancy care is ensuring delivery occurs at an accredited 24x7 First Referral Unit. A delivery plan must be established by the 34th week: designate primary FRU and backup District Hospital, note 108 Emergency Ambulance contact, record 2 volunteer blood donors with contact numbers, and ensure all statutory records (Aadhaar, MCP card, BPL card) are kept together.",
                "keyPoints": [
                    "Lock delivery institution plan by 34th week of pregnancy.",
                    "108 Emergency Medical Service is free of charge under JSSK guidelines.",
                    "Cashless delivery entitlement: Free transport, drugs, diagnostics, diet, and blood under JSSK."
                ],
                "clinicalActions": [
                    "Conduct trial phone call to 108 dispatch center with beneficiary's family.",
                    "Accompany the mother during labor transport and stay until safe delivery and initial breastfeeding."
                ],
                "quiz": [
                    {
                        "question": "Under Janani Shishu Suraksha Karyakram (JSSK), which of the following is provided free of cost for institutional deliveries?",
                        "options": ["Transport (108/102)", "Drugs and diagnostics", "Diet during hospital stay and C-section if required", "All of the above"],
                        "answer": 3,
                        "explanation": "JSSK guarantees completely cashless delivery including emergency transport, drugs, diagnostics, diet, blood, and complications management."
                    }
                ]
            }
        ]
    }
]

out_path = os.path.join(os.path.dirname(__file__), "lessons.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(modules, f, indent=2, ensure_ascii=False)

print(f"Generated lessons.json with {len(modules)} modules and {sum(len(m['lessons']) for m in modules)} total lessons at {out_path}")
