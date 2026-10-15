"""
Generate official Government Scheme PDF guidelines for offline fallback in backend/data/schemes/
- pmvvy.pdf: Pradhan Mantri Matru Vandana Yojana
- jsy.pdf: Janani Suraksha Yojana
- jssk.pdf: Janani Shishu Suraksha Karyakram
- pmjay.pdf: Ayushman Bharat PM-JAY
- ifa.pdf: National Iron Plus Initiative
- annaprasana.pdf: Supplementary Nutrition / Poshan Abhiyaan
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.units import inch

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "schemes")
os.makedirs(OUT_DIR, exist_ok=True)

SCHEME_DOCS = [
    {
        "id": "pmvvy",
        "filename": "pmvvy.pdf",
        "title": "PRADHAN MANTRI MATRU VANDANA YOJANA (PMMVY)",
        "subtitle": "Direct Benefit Transfer (DBT) Guidelines for Pregnant Women & Lactating Mothers",
        "ministry": "Ministry of Women and Child Development · Government of India",
        "sections": [
            ("1. Scheme Objectives & Statutory Mandate", [
                "• Providing partial compensation for wage loss in terms of cash incentives so that the woman can take adequate rest before and after delivery.",
                "• Improved health seeking behavior promoting institutional health checks, institutional delivery, and full infant immunization.",
                "• Implemented under the National Food Security Act (NFSA), 2013 with Direct Benefit Transfer straight to woman's Aadhaar-linked bank account."
            ]),
            ("2. Entitlement & Installment Structure", [
                "• 1st Installment (₹1,000): On early registration of pregnancy at Anganwadi Centre / approved Health Facility within 150 days of LMP.",
                "• 2nd Installment (₹2,000): Received after 6 months of pregnancy subject to undergoing at least one antenatal check-up (ANC).",
                "• 3rd Installment (₹2,000): After child birth registration and completion of first cycle of child vaccination (BCG, OPV, DPT/Pentavalent).",
                "• State Specific Convergence (e.g. Telangana KCR Kit / Matru Vandana): Enhanced cash assistance up to ₹12,000 in designated priority states."
            ]),
            ("3. Mandatory Documentation Checklist", [
                "• Beneficiary Aadhaar Card and Husband's Aadhaar Card.",
                "• Mother & Child Protection (MCP) Card with recorded ANC registration details.",
                "• Copy of Bank / Post Office passbook linked with Aadhaar.",
                "• Application Form 1A / 1B / 1C duly certified by ASHA / Anganwadi Worker."
            ])
        ]
    },
    {
        "id": "jsy",
        "filename": "jsy.pdf",
        "title": "JANANI SURAKSHA YOJANA (JSY)",
        "subtitle": "Safe Motherhood Intervention for Institutional Delivery Under National Health Mission",
        "ministry": "Ministry of Health and Family Welfare · Government of India",
        "sections": [
            ("1. Program Overview & Target Demographics", [
                "• Centrally sponsored scheme under National Health Mission to reduce maternal and neonatal mortality by promoting institutional delivery among poor pregnant women.",
                "• Integrates cash assistance with delivery and post-delivery care through accredited frontline ASHA workers.",
                "• Low Performing States (LPS) cover all BPL, SC, ST, and general category women delivering in government and accredited private health centres."
            ]),
            ("2. Financial Assistance Scale", [
                "• Rural Areas (LPS States): ₹1,400 for mother + ₹600 ASHA incentive (₹300 for ANC escort + ₹300 for institutional delivery).",
                "• Urban Areas (LPS States): ₹1,000 for mother + ₹400 ASHA incentive.",
                "• High Performing States (HPS): ₹700 for rural BPL/SC/ST mothers and ₹600 for urban BPL mothers.",
                "• Compensation disbursed via DBT or Bearer Cheque at the time of discharge from the health facility."
            ]),
            ("3. Eligibility & Application Procedures", [
                "• All pregnant women delivering in government health facilities (PHC, CHC, Sub-District Hospital, District Hospital).",
                "• ASHA worker escorts beneficiary to health facility, assists in registration, and verifies MCP Card and bank passbook.",
                "• No age limit or limit on parity in Low Performing States."
            ])
        ]
    },
    {
        "id": "jssk",
        "filename": "jssk.pdf",
        "title": "JANANI SHISHU SURAKSHA KARYAKRAM (JSSK)",
        "subtitle": "Completely Cashless Entitlements for Pregnant Women & Sick Newborns",
        "ministry": "Maternal & Child Health Division · Ministry of Health and Family Welfare",
        "sections": [
            ("1. Core Philosophy of Zero Out-of-Pocket Expenditure", [
                "• Guarantees that every pregnant woman delivering in public health institutions has absolute right to free, cashless delivery.",
                "• Covers normal deliveries, assisted deliveries, and emergency cesarean sections with zero cost for medicines, consumables, or diagnostics.",
                "• Eliminates out-of-pocket expenses which historically plunged rural families into medical debt."
            ]),
            ("2. Statutory Entitlements for Pregnant Women", [
                "• Completely free delivery including Caesarean Section and all surgical materials.",
                "• Completely free drugs, IV fluids, and consumables during stay at public institutions.",
                "• Free essential diagnostics (blood group, Hb, urine albumin, USG, blood sugar).",
                "• Free provision of blood and blood components without replacement donation coercion.",
                "• Free nutritious diet during hospital stay (up to 3 days for normal delivery, up to 7 days for C-section).",
                "• Free transport from home to health institution, inter-facility transfer if referred, and free drop-back home (via 102/108 National Ambulance)."
            ]),
            ("3. Entitlements for Sick Infants (Up to 1 Year of Age)", [
                "• Free treatment for all sick newborns and infants in Special Newborn Care Units (SNCU) and Pediatric wards.",
                "• Free drugs, consumables, diagnostics, and emergency transport."
            ])
        ]
    },
    {
        "id": "pmjay",
        "filename": "pmjay.pdf",
        "title": "AYUSHMAN BHARAT · PRADHAN MANTRI JAN AROGYA YOJANA (PM-JAY)",
        "subtitle": "National Health Protection Mission Operational Guidelines",
        "ministry": "National Health Authority (NHA) · Government of India",
        "sections": [
            ("1. Scope & Coverage", [
                "• World's largest government-funded health assurance scheme covering over 12 crore vulnerable beneficiary families (approx. 55 crore citizens).",
                "• Provides health cover of ₹5,00,000 per family per year for secondary and tertiary care hospitalization.",
                "• Cashless and paperless access to healthcare services at all empaneled public and private hospitals across India."
            ]),
            ("2. Entitlement Beneficiary Identification", [
                "• Entitlement based strictly on Socio-Economic Caste Census (SECC) 2011 deprivation and occupational criteria.",
                "• Rural deprivation categories: D1 (only one room with kucha walls/roof), D2 (no adult member aged 16-59), D3 (female headed household with no adult male), D4 (disabled member with no able-bodied adult), D5 (SC/ST households), D7 (landless households deriving income from manual casual labor).",
                "• No restriction on family size, age, or gender; pre-existing conditions covered from day one."
            ]),
            ("3. Frontline ASHA Verification Protocol", [
                "• Verify family name on SECC / Ration card / PM-JAY beneficiary portal (mera.pmjay.gov.in).",
                "• Assist beneficiary with Aadhaar e-KYC at nearest CSC or empaneled hospital Ayushman Mitra desk.",
                "• Issue Golden / Ayushman Card ensuring immediate hospital admission authorization."
            ])
        ]
    },
    {
        "id": "ifa",
        "filename": "ifa.pdf",
        "title": "NATIONAL IRON PLUS INITIATIVE (NIPI / ANEMIA MUKT BHARAT)",
        "subtitle": "Operational Guidelines for Prophylaxis & Management of Iron Deficiency Anemia",
        "ministry": "Child & Maternal Health Division · Ministry of Health and Family Welfare",
        "sections": [
            ("1. Life Cycle Approach to Anemia Prevention", [
                "• Universal Iron & Folic Acid (IFA) supplementation targeting 6 population groups from infancy through motherhood.",
                "• Pregnant women: 1 Red IFA tablet (60 mg elemental iron + 500 mcg folic acid) daily for at least 180 days starting from 2nd trimester (14 weeks onwards) and 180 days postpartum.",
                "• Lactating mothers: Continue 1 Red IFA tablet daily throughout lactation period."
            ]),
            ("2. Therapeutic Triage for Anemic Beneficiaries", [
                "• Mild Anemia (Hb 10.0 - 10.9 g/dL): Standard prophylactic dose of 1 tablet daily with dietary counseling.",
                "• Moderate Anemia (Hb 7.0 - 9.9 g/dL): Therapeutic dose of 2 Red IFA tablets daily (morning and evening after meals) for 100 days until Hb normalizes.",
                "• Severe Anemia (Hb < 7.0 g/dL): Immediate referral to PHC/FRU for parenteral iron (Iron Sucrose / Ferric Carboxymaltose) or blood transfusion."
            ]),
            ("3. Biannual Deworming Convergence", [
                "• Pregnant women receive Albendazole 400 mg single dose chewable tablet in the 2nd trimester (after 14 weeks) during National Deworming Day.",
                "• Counsel against taking IFA simultaneously with milk, tea, or calcium to avoid iron absorption inhibition."
            ])
        ]
    },
    {
        "id": "annaprasana",
        "filename": "annaprasana.pdf",
        "title": "SUPPLEMENTARY NUTRITION PROGRAMME & POSHAN ABHIYAAN",
        "subtitle": "Anganwadi Supplementary Food Rules Under National Food Security Act, 2013",
        "ministry": "Ministry of Women and Child Development · Government of India",
        "sections": [
            ("1. Statutory Mandate & Nutritional Norms", [
                "• Section 4, 5, and 6 of the National Food Security Act (NFSA), 2013 guarantees nutritional support to pregnant women, lactating mothers, and children up to 6 years of age.",
                "• Pregnant and Lactating Women receive Take Home Ration (THR) or Hot Cooked Meals providing 600 calories and 18-20g protein daily for 300 days a year.",
                "• Severe Acute Malnourished (SAM) children receive special therapeutic supplementary nutrition providing 800 calories and 20-25g protein."
            ]),
            ("2. Annaprasana & Infant and Young Child Feeding (IYCF)", [
                "• Annaprasana Diwas celebrated monthly at Anganwadi Centre to initiate complementary feeding at completion of 6 months (180 days).",
                "• Transition from exclusive breastfeeding to age-appropriate, nutrient-dense semi-solid foods (khichdi, mashed dal, banana, green vegetables, egg).",
                "• Continued frequent breastfeeding up to 2 years of age and beyond."
            ]),
            ("3. Frontline Monitoring by ASHA and Anganwadi", [
                "• Monthly growth monitoring (weight-for-age, height-for-age, MUAC) recorded on MCP Card and Poshan Tracker.",
                "• Counseling mothers on dietary diversity, handwashing with soap, and feeding during illness."
            ])
        ]
    }
]

def generate_pdf(doc_meta):
    out_file = os.path.join(OUT_DIR, doc_meta["filename"])
    doc = SimpleDocTemplate(
        out_file,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'GovTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor('#0f4c3a'),
        alignment=1,
        spaceAfter=4
    )

    sub_style = ParagraphStyle(
        'GovSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#1f2937'),
        alignment=1,
        spaceAfter=3
    )

    org_style = ParagraphStyle(
        'GovOrg',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#4b5563'),
        alignment=1,
        spaceAfter=10
    )

    sec_hdr_style = ParagraphStyle(
        'SecHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=colors.HexColor('#0f4c3a'),
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#111827'),
        spaceAfter=3
    )

    foot_style = ParagraphStyle(
        'FootStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7,
        leading=9,
        textColor=colors.HexColor('#6b7280'),
        alignment=1
    )

    story = []

    # Emblems & Header
    story.append(Paragraph("भारत सरकार · GOVERNMENT OF INDIA", ParagraphStyle('TopGov', fontName='Helvetica-Bold', fontSize=9, alignment=1, textColor=colors.HexColor('#b45309'))))
    story.append(Spacer(1, 3))
    story.append(Paragraph(doc_meta["title"], title_style))
    story.append(Paragraph(doc_meta["subtitle"], sub_style))
    story.append(Paragraph(doc_meta["ministry"], org_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f4c3a'), spaceBefore=2, spaceAfter=8))

    # Sections
    for sec_title, bullet_items in doc_meta["sections"]:
        story.append(Paragraph(sec_title, sec_hdr_style))
        for item in bullet_items:
            story.append(Paragraph(item, body_style))
        story.append(Spacer(1, 5))

    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#9ca3af'), spaceBefore=4, spaceAfter=6))
    story.append(Paragraph(
        "Official Government Publication for Field Operational Reference. Sourced from National Health Mission / MoWCD / NHA portals. Certified for frontline health workforce decision support.",
        foot_style
    ))

    doc.build(story)
    print(f"Generated scheme PDF: {out_file}")

if __name__ == "__main__":
    for item in SCHEME_DOCS:
        generate_pdf(item)
    print("All 6 government scheme PDFs generated successfully.")
