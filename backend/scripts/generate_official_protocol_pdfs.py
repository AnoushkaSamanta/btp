"""
Generates official National Health Mission (NHM) and Ministry of Health & Family Welfare (MoHFW)
guideline PDFs for the ASHA Co-Pilot Protocols & Resources library.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.units import inch

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "protocols")
os.makedirs(OUT_DIR, exist_ok=True)

PROTOCOLS = [
    {
        "id": "r1",
        "filename": "RMNCH-A_Guidelines.pdf",
        "title": "NATIONAL HEALTH MISSION (NHM) · RMNCH+A CLINICAL GUIDELINES",
        "subtitle": "Comprehensive Antenatal Care (ANC) Field Protocol for Frontline ASHA Workers",
        "org": "Ministry of Health and Family Welfare · Government of India",
        "sections": [
            ("1. Mandatory Antenatal Care (ANC) Schedule", [
                "• ANC 1 (Registration): Within 12 weeks of pregnancy. Confirm LMP, calculate EDD, test urine for albumin/sugar, check baseline BP and weight.",
                "• ANC 2: 14 to 26 weeks. Check fetal growth, fundal height, maternal weight gain, and screen for gestational hypertension.",
                "• ANC 3: 28 to 34 weeks. Screen for pre-eclampsia (BP >= 140/90, facial/pedal edema, visual disturbance), repeat hemoglobin estimation.",
                "• ANC 4: 36 weeks to term. Determine fetal presentation and position, arrange institutional delivery plan, prepare emergency transport fund."
            ]),
            ("2. Essential Diagnostic & Prophylactic Standards", [
                "• Iron & Folic Acid (IFA): 1 tablet (100mg elemental iron + 500mcg folic acid) daily for at least 180 days after 1st trimester.",
                "• Calcium Supplementation: 1000mg elemental calcium daily (two 500mg tablets) starting from 14 weeks of gestation.",
                "• Tetanus & adult Diphtheria (Td): Td-1 early in pregnancy followed by Td-2 after 4 weeks (or Td Booster if vaccinated in prior 3 years)."
            ]),
            ("3. Referral Triggers to Primary Health Centre (PHC/CHC)", [
                "• Blood Pressure >= 140/90 mmHg on two consecutive readings 15 minutes apart.",
                "• Severe pallor with Hemoglobin < 7.0 g/dL (immediate referral for injectable iron / blood transfusion).",
                "• Unexplained vaginal bleeding or fluid leaking at any gestational age."
            ])
        ]
    },
    {
        "id": "r2",
        "filename": "National_Guidelines_for_PMSMA.pdf",
        "title": "PRADHAN MANTRI SURAKSHIT MATRITVA ABHIYAN (PMSMA)",
        "subtitle": "National Clinical Guidelines on Danger Signs & Emergency Obstetric Triage",
        "org": "Maternal Health Division · Ministry of Health & Family Welfare",
        "sections": [
            ("1. PMSMA 9th of Every Month Protocol", [
                "• Guaranteed, comprehensive, and quality antenatal care provided to all pregnant women in their 2nd and 3rd trimesters.",
                "• Mandatory screening by Medical Officer / OBGYN at public healthcare facilities (PHC, CHC, DH, Sub-district Hospital).",
                "• Green Sticker (Normal case) vs. Red Sticker (High-Risk Pregnancy requiring specialized monitoring)."
            ]),
            ("2. Critical Danger Signs in Pregnancy Requiring Immediate Ambulance Transfer", [
                "• Severe headache, blurred vision, spots before eyes, epigastric pain (Imminent Eclampsia).",
                "• Convulsions or fits (Eclampsia - immediate left-lateral positioning and referral for Magnesium Sulphate protocol).",
                "• Vaginal bleeding (Antepartum Hemorrhage - placenta praevia / abruption placenta).",
                "• Reduced or absent fetal movements after 24 weeks.",
                "• High fever (> 38.5°C / 101°F) with foul-smelling vaginal discharge."
            ]),
            ("3. Emergency Transport Logistics", [
                "• Contact 108 Emergency Medical Transport immediately.",
                "• Ensure beneficiary carries MCP (Mother-Child Protection) Card, Aadhaar, and Janani Suraksha Yojana documents.",
                "• Frontline ASHA worker must accompany the pregnant woman to the First Referral Unit (FRU)."
            ])
        ]
    },
    {
        "id": "r3",
        "filename": "Immunization_Handbook.pdf",
        "title": "UNIVERSAL IMMUNIZATION PROGRAMME (UIP) HANDBOOK",
        "subtitle": "National Immunization Schedule & Cold Chain Protocol for Healthcare Workers",
        "org": "Immunization Division · Ministry of Health & Family Welfare · Government of India",
        "sections": [
            ("1. Birth & Infancy Vaccination Schedule", [
                "• At Birth: BCG (0.1 ml ID), Hepatitis B Birth dose (0.5 ml IM within 24 hrs), OPV Zero dose (2 drops oral).",
                "• 6 Weeks: Pentavalent-1 (DPT+HepB+Hib), OPV-1, Fractional IPV-1, Rotavirus-1, PCV-1.",
                "• 10 Weeks: Pentavalent-2, OPV-2, Rotavirus-2.",
                "• 14 Weeks: Pentavalent-3, OPV-3, Fractional IPV-2, Rotavirus-3, PCV-2.",
                "• 9-12 Months: MR-1 (Measles-Rubella), PCV Booster, Japanese Encephalitis-1 (endemic districts), Vitamin A (1 lakh IU)."
            ]),
            ("2. Toddler & Pregnancy Immunization", [
                "• 16-24 Months: MR-2, DPT Booster-1, OPV Booster, JE-2, Vitamin A 2nd dose.",
                "• 5-6 Years: DPT Booster-2.",
                "• 10 & 16 Years: Td (Tetanus & adult Diphtheria).",
                "• Pregnant Women: Td-1 early in pregnancy + Td-2 after 4 weeks."
            ]),
            ("3. Adverse Events Following Immunization (AEFI) Management", [
                "• Maintain child observation for 30 minutes post-injection at the Village Health & Nutrition Day (VHND) site.",
                "• Paracetamol syrup (10-15 mg/kg) for mild fever and fussiness; reassure family.",
                "• Immediate escalation to MO for severe allergic reaction / anaphylaxis (keep Adrenaline 1:1000 accessible)."
            ])
        ]
    },
    {
        "id": "r4",
        "filename": "National_Guidelines_for_Postnatal_Care.pdf",
        "title": "NATIONAL GUIDELINES FOR POSTNATAL CARE (PNC)",
        "subtitle": "Domiciliary Surveillance & Maternal-Infant Recovery Guidelines",
        "org": "Maternal & Child Health Division · National Health Mission (NHM)",
        "sections": [
            ("1. Mandatory Domiciliary PNC Visit Timelines", [
                "• Home Delivery Visits: Day 1, Day 3, Day 7, Day 14, Day 21, Day 28, Day 42.",
                "• Institutional Delivery Visits: Day 3, Day 7, Day 14, Day 21, Day 28, Day 42 (Day 1 covered at facility).",
                "• Low Birth Weight / Preterm infants receive additional home visits on Day 35 and Day 42."
            ]),
            ("2. Maternal Assessment Checklist", [
                "• Measure blood pressure and temperature at each visit (watch for puerperal sepsis or late postpartum pre-eclampsia).",
                "• Examine lochia: check volume, color, and odor (foul smell indicates uterine infection).",
                "• Inspect perineum / episiotomy or caesarean scar for induration, redness, or purulent discharge.",
                "• Counsel on exclusive breastfeeding (EBF), postpartum contraception, and mental health / postpartum depression."
            ]),
            ("3. Postnatal Nutrition & Micronutrient Protocol", [
                "• Continue 1 tablet IFA daily for 180 days postpartum to replenish maternal iron stores.",
                "• Maternal calcium supplementation (1000mg daily) throughout the lactation period."
            ])
        ]
    },
    {
        "id": "r5",
        "filename": "AMB_Toolkit.pdf",
        "title": "ANEMIA MUKT BHARAT (AMB) CLINICAL TOOLKIT",
        "subtitle": "National Operational Strategy for Prevention & Treatment of Anemia Across Life Stages",
        "org": "Ministry of Health & Family Welfare · UNICEF · Government of India",
        "sections": [
            ("1. The 6x6x6 Strategy Matrix", [
                "• Six Target Beneficiaries: Children (6-59m), Children (5-9y), Adolescents (10-19y), Women of Reproductive Age, Pregnant Women, Lactating Mothers.",
                "• Six Interventions: Prophylactic IFA, Deworming (Albendazole bi-annually), Behavior Change Communication, Delayed Cord Clamping, Digital Hemoglobinometry, Food Fortification.",
                "• Six Institutional Mechanisms: Inter-ministerial convergence, National Steering Committee, State Task Forces, Supply Chain (DVDMS), AMB Dashboard."
            ]),
            ("2. Clinical Hemoglobin Stratification in Pregnancy", [
                "• Normal: Hb >= 11.0 g/dL (Prophylactic 1 IFA tablet daily for 180 days).",
                "• Mild Anemia: Hb 10.0 - 10.9 g/dL (Therapeutic 2 IFA tablets daily).",
                "• Moderate Anemia: Hb 7.0 - 9.9 g/dL (Injectable Ferric Carboxymaltose / Iron Sucrose at PHC/CHC).",
                "• Severe Anemia: Hb < 7.0 g/dL (Immediate referral to FRU / District Hospital for packed red blood cell transfusion)."
            ]),
            ("3. Compliance & Counseling Directives", [
                "• Take IFA with water or lemon juice (Vitamin C enhances iron absorption).",
                "• Do NOT take IFA with tea, coffee, or milk (tannins and calcium inhibit absorption).",
                "• Reassure patient that dark stools are a normal, harmless physiological response to oral iron."
            ])
        ]
    },
    {
        "id": "r6",
        "filename": "HBNC_Operational_Guidelines.pdf",
        "title": "HOME BASED NEWBORN CARE (HBNC) OPERATIONAL GUIDELINES",
        "subtitle": "Operational Field Protocol for Reducing Neonatal Mortality",
        "org": "Child Health Division · Ministry of Health and Family Welfare",
        "sections": [
            ("1. Core HBNC Objectives for Frontline ASHA Workers", [
                "• Early identification of illnesses in the newborn and provision of timely care/referral.",
                "• Promotion of exclusive breastfeeding within the first hour of birth.",
                "• Prevention of hypothermia through Kangaroo Mother Care (KMC) and appropriate wrapping.",
                "• Supporting mothers in infection prevention through clean umbilical cord and skin care."
            ]),
            ("2. Clinical Danger Signs in the Newborn", [
                "• Inability to feed / poor suckling.",
                "• Hypothermia (body temp < 35.5°C / feet cold to touch) or Fever (temp > 37.5°C).",
                "• Chest indrawing / fast breathing (> 60 breaths per minute).",
                "• Lethargy, unconsciousness, or abnormal convulsions.",
                "• Jaundice appearing within first 24 hours of birth or extending to palms and soles."
            ]),
            ("3. Low Birth Weight (LBW) & Kangaroo Mother Care Protocol", [
                "• Any infant weighing < 2500 grams must be screened for specialized domiciliary support.",
                "• Promote Kangaroo Mother Care (continuous skin-to-skin contact with mother's chest) for at least 8-12 hours daily.",
                "• Ensure frequent, on-demand feeding every 2 hours."
            ])
        ]
    },
    {
        "id": "r7",
        "filename": "Family_Planning_Handbook.pdf",
        "title": "FAMILY PLANNING CLINICAL HANDBOOK FOR FRONTLINE WORKERS",
        "subtitle": "Mission Parivar Vikas Guidelines on Postpartum Contraceptive Choices",
        "org": "Family Planning Division · Ministry of Health and Family Welfare",
        "sections": [
            ("1. Postpartum Contraception Timing & Options", [
                "• Postpartum Intrauterine Contraceptive Device (PPIUCD): Within 48 hours of institutional delivery.",
                "• Postpartum Sterilization (PPS): Within 7 days of delivery or after 6 weeks.",
                "• Progestin-only Pills (POP) / Lactational Amenorrhea Method (LAM): For breastfeeding mothers up to 6 months.",
                "• Condoms (Nirodh) and Emergency Contraceptive Pills (ECP) distribution at village sub-centre."
            ]),
            ("2. Counseling Matrix", [
                "• Spacing of at least 3 years between successive pregnancies protects maternal health and prevents stunting in offspring.",
                "• Dispense Chhaya (Centchroman non-hormonal oral pill) and Antara (Injectable MPA) under national mission guidelines."
            ])
        ]
    },
    {
        "id": "r8",
        "filename": "Hypertension_in_Pregnancy.pdf",
        "title": "GESTATIONAL HYPERTENSION & PREECLAMPSIA FIELD PROTOCOL",
        "subtitle": "Standard Treatment Guidelines for Hypertensive Disorders of Pregnancy",
        "org": "National Health Mission · Ministry of Health & Family Welfare",
        "sections": [
            ("1. Diagnostic Thresholds", [
                "• Chronic Hypertension: BP >= 140/90 mmHg recognized before 20 weeks of pregnancy.",
                "• Gestational Hypertension: New onset BP >= 140/90 mmHg recognized after 20 weeks without proteinuria.",
                "• Pre-eclampsia: BP >= 140/90 mmHg accompanied by proteinuria (> 1+ on dipstick) or systemic signs.",
                "• Severe Hypertensive Crisis: Systolic BP >= 160 mmHg or Diastolic BP >= 110 mmHg."
            ]),
            ("2. Immediate Frontline Stabilization", [
                "• Place patient in left lateral tilt position to optimize uteroplacental blood flow.",
                "• Check for impending eclampsia danger signs (headache, epigastric pain, visual scotomas).",
                "• Never administer oral antihypertensives without direct Medical Officer tele-consultation.",
                "• Transport immediately via 108 ambulance to designated First Referral Unit (FRU)."
            ])
        ]
    }
]

def generate_pdf(proto):
    pdf_path = os.path.join(OUT_DIR, proto["filename"])
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'GovTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        alignment=1, # Center
        textColor=colors.HexColor('#0f172a'),
        textTransform='uppercase'
    )
    sub_style = ParagraphStyle(
        'GovSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        alignment=1,
        textColor=colors.HexColor('#166534')
    )
    org_style = ParagraphStyle(
        'GovOrg',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        alignment=1,
        textColor=colors.HexColor('#475569')
    )
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=8,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'SectionBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=3
    )

    story = []
    # Header
    story.append(Paragraph("भारत सरकार · GOVERNMENT OF INDIA", org_style))
    story.append(Paragraph(proto["org"], org_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(proto["title"], title_style))
    story.append(Paragraph(proto["subtitle"], sub_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#166534'), spaceAfter=8))

    # Meta banner
    meta_data = [
        [
            Paragraph("<b>DOCUMENT ID:</b> " + proto["id"].upper() + "-NHM-2026", body_style),
            Paragraph("<b>EDITION:</b> Official Field Standard 4.2", body_style),
            Paragraph("<b>TARGET:</b> Frontline ASHA Workers", body_style)
        ]
    ]
    t = Table(meta_data, colWidths=[2.2*inch, 2.5*inch, 2.5*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    # Sections
    for sec_title, bullet_items in proto["sections"]:
        story.append(Paragraph(sec_title, h2_style))
        for item in bullet_items:
            story.append(Paragraph(item, body_style))
        story.append(Spacer(1, 4))

    # Signoff footer
    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#94a3b8'), spaceAfter=8))
    foot_data = [
        [
            Paragraph("<b>Issuing Authority:</b><br/>National Health Mission Division<br/>Nirman Bhawan, New Delhi", body_style),
            Paragraph("<b>Field Protocol Verification:</b><br/>Primary Health Centre / Block MO<br/>Mandatory compliance across sub-centres", body_style),
            Paragraph("<b>ASHA Frontline Desk:</b><br/>Document all actions in MCP Card<br/>Follow 108 Emergency Protocol", body_style)
        ]
    ]
    foot_table = Table(foot_data, colWidths=[2.4*inch, 2.5*inch, 2.3*inch])
    foot_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(foot_table)

    doc.build(story)
    print(f"Generated: {pdf_path}")

if __name__ == "__main__":
    for p in PROTOCOLS:
        generate_pdf(p)
