"""
Comprehensive metadata for Government Health & Maternity Schemes.
Includes official portal links, PDF URLs, criteria, documents, process steps,
and state-specific benefit variances (e.g., Telangana KCR Kit / PMMVY).
"""
from typing import Dict, Any, List

SCHEMES_DETAILED: List[Dict[str, Any]] = [
    {
        "id": "pmvvy",
        "name": "PMMVY",
        "fullName": "Pradhan Mantri Matru Vandana Yojana",
        "category": "Maternal",
        "benefit": "₹5,000 (Central) / up to ₹12,000 (Telangana)",
        "benefitAmount": 5000,
        "description": "Maternity benefit cash incentive for pregnant women & lactating mothers for wage compensation and health-seeking behavior.",
        # Official PMMVY portal & guidelines (with offline local PDF fallback)
        "officialPdf": "https://pmmvy.wcd.gov.in/",
        "pdfFallback": "/api/schemes/pmvvy/document",
        "portalUrl": "https://pmmvy.wcd.gov.in/",
        "portalFallback": "https://wcd.gov.in/schemes/pmmvy",
        "formsUrl": "https://pmmvy.wcd.gov.in/Home/DownloadForms",
        "offlinePdf": "pmvvy.pdf",
        "stateBenefits": {
            "Telangana": "₹12,000 (in 3 installments via KCR Kit & PMMVY convergence)",
            "Karnataka": "₹6,000 (Mathru Poorna & PMMVY convergence)",
            "Central": "₹5,000 (Standard DBT in 3 installments)",
            "Maharashtra": "₹5,000 (Standard DBT)",
            "Bihar": "₹5,000 (Standard DBT)",
            "Uttar Pradesh": "₹5,000 (Standard DBT)"
        },
        "eligibility": [
            "Pregnant women and lactating mothers (PW&LM)",
            "First living child of the family (and 2nd child if female under PMMVY 2.0)",
            "Mother's age must be 19 years or above at time of pregnancy",
            "Not in regular employment with Central/State Government or PSUs",
            "Family annual income under statutory threshold or belonging to SC/ST/BPL/EWS"
        ],
        "documents": [
            {
                "type": "aadhaar_mother",
                "label": "Aadhaar Card (Mother)",
                "description": "Mandatory identity and biometric proof of beneficiary",
                "required": True
            },
            {
                "type": "aadhaar_husband",
                "label": "Aadhaar Card (Husband)",
                "description": "Proof of spouse identity for verification",
                "required": True
            },
            {
                "type": "mcp_card",
                "label": "MCP Card",
                "description": "Mother and Child Protection card with recorded LMP & ANC registration",
                "required": True
            },
            {
                "type": "bank_passbook",
                "label": "Bank Passbook",
                "description": "Copy of bank account passbook linked with Aadhaar for DBT transfer",
                "required": True
            },
            {
                "type": "marriage_certificate",
                "label": "Marriage Certificate",
                "description": "Marriage registration certificate or joint affidavit",
                "required": False
            },
            {
                "type": "form_1a",
                "label": "Form 1A Application",
                "description": "PMMVY official registration form signed by beneficiary and ASHA",
                "required": True
            },
            {
                "type": "recent_photo",
                "label": "Recent Passport Photo",
                "description": "Recent photograph of the pregnant mother (within 6 months)",
                "required": True
            }
        ],
        "process": [
            "1. Visit nearest Anganwadi Center or Primary Health Centre within 150 days of LMP.",
            "2. Fill Form 1A with assistance from local ASHA / Anganwadi worker.",
            "3. Submit self-attested copies of Aadhaar, MCP Card, and Bank Passbook.",
            "4. Obtain official system acknowledgment receipt.",
            "5. Installment 1: ₹1,000 credited on early pregnancy registration.",
            "6. Installment 2: ₹2,000 credited after 6 months following at least one ANC checkup.",
            "7. Installment 3: ₹2,000 credited after childbirth registration & full primary infant vaccination (BCG, OPV, DPT/Pentavalent)."
        ],
        "whereToApply": "Nearest Anganwadi Centre, PHC, or online at pmmvy.wcd.gov.in",
        "processingTime": "30 days from document verification",
        "contact": "Local ASHA Worker, Anganwadi Worker, or CDPO Office"
    },
    {
        "id": "jsy",
        "name": "JSY",
        "fullName": "Janani Suraksha Yojana",
        "category": "Financial",
        "benefit": "₹1,400 (Rural) / ₹1,000 (Urban)",
        "benefitAmount": 1400,
        "description": "Safe motherhood intervention under NHM providing direct cash assistance to promote institutional deliveries in public health facilities.",
        "officialPdf": "https://nhm.gov.in/images/pdf/programmes/maternal-health/guidelines/jsy_guidelines.pdf",
        "pdfFallback": "/api/schemes/jsy/document",
        "portalUrl": "https://nhm.gov.in/",
        "portalFallback": "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309",
        "formsUrl": "https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=841&lid=309",
        "offlinePdf": "jsy.pdf",
        "stateBenefits": {
            "Telangana": "₹1,400 Rural / ₹1,000 Urban + KCR Kit delivery incentives",
            "Central": "₹1,400 Rural / ₹1,000 Urban (Low Performing States)",
            "Karnataka": "₹700 Rural / ₹600 Urban (High Performing State)",
            "Bihar": "₹1,400 Rural / ₹1,000 Urban",
            "Uttar Pradesh": "₹1,400 Rural / ₹1,000 Urban"
        },
        "eligibility": [
            "All pregnant women delivering in government health facilities in Low Performing States (LPS)",
            "BPL, SC, and ST pregnant women in High Performing States (HPS)",
            "All women aged 19 years or above up to first two live births (no parity limit in LPS)",
            "Institutional delivery conducted at PHC, CHC, or District Hospital"
        ],
        "documents": [
            {
                "type": "aadhaar_mother",
                "label": "Aadhaar Card (Mother)",
                "description": "Proof of identity and address",
                "required": True
            },
            {
                "type": "mcp_card",
                "label": "MCP Card",
                "description": "Proof of Antenatal Check-up (ANC) registration and institutional tracking",
                "required": True
            },
            {
                "type": "bank_passbook",
                "label": "Bank Passbook",
                "description": "Active bank account details for direct benefit transfer",
                "required": True
            },
            {
                "type": "bpl_card",
                "label": "BPL / Ration Card",
                "description": "Proof of Below Poverty Line status (for HPS states)",
                "required": False
            },
            {
                "type": "anc_registration_proof",
                "label": "ANC Registration Proof",
                "description": "Record of institutional antenatal checkups",
                "required": True
            }
        ],
        "process": [
            "1. Register pregnancy at Sub-Centre or PHC before 12 weeks of gestation.",
            "2. Attend at least 3 antenatal visits with ASHA guidance.",
            "3. Coordinate institutional delivery at accredited public hospital.",
            "4. ASHA worker accompanies mother during labor and hospital admission.",
            "5. JSY cash entitlement is disbursed directly at hospital discharge or via DBT within 7 days."
        ],
        "whereToApply": "Sub-Centre, Primary Health Centre, Community Health Centre, or Sub-District Hospital",
        "processingTime": "Disbursed upon discharge or within 7-14 days",
        "contact": "ASHA worker, ANM, or Medical Officer in charge of labor room"
    },
    {
        "id": "jssk",
        "name": "JSSK",
        "fullName": "Janani Shishu Suraksha Karyakram",
        "category": "Maternal",
        "benefit": "Completely Cashless (Zero Out-of-Pocket)",
        "benefitAmount": 10000,
        "description": "Entitles all pregnant women delivering in public health institutions to absolutely free delivery, C-section, medicines, diagnostics, food, and transport.",
        "officialPdf": "https://nhm.gov.in/images/pdf/programmes/maternal-health/guidelines/jssk_guidelines.pdf",
        "pdfFallback": "/api/schemes/jssk/document",
        "portalUrl": "https://nhm.gov.in/",
        "portalFallback": "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=842&lid=310",
        "formsUrl": "https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=842&lid=310",
        "offlinePdf": "jssk.pdf",
        "stateBenefits": {
            "Telangana": "100% Cashless + Free 102 transport home + Amma Vodi vehicle",
            "Central": "100% Cashless institutional care across all states",
            "Karnataka": "100% Cashless delivery + free diagnostics",
            "Maharashtra": "100% Cashless delivery + free diagnostics"
        },
        "eligibility": [
            "All pregnant women accessing public health institutions for delivery",
            "All sick newborns and infants accessing public facilities up to 1 year of age",
            "No income, poverty, or documentation barriers"
        ],
        "documents": [
            {
                "type": "aadhaar_mother",
                "label": "Aadhaar Card (Mother)",
                "description": "Identity verification (voluntary; care cannot be denied if absent)",
                "required": False
            },
            {
                "type": "mcp_card",
                "label": "MCP Card",
                "description": "Maternal health passport",
                "required": True
            },
            {
                "type": "admission_slip",
                "label": "Government Hospital Admission Slip",
                "description": "Proof of admission to public health facility",
                "required": True
            }
        ],
        "process": [
            "1. Arrive at public healthcare facility in labor or emergency via free 108 ambulance.",
            "2. Present MCP card at registration desk.",
            "3. Receive cashless treatment: free medicines, consumables, diagnostics, blood, and diet.",
            "4. Free drop-back home in dedicated 102 / JSSK vehicle upon discharge."
        ],
        "whereToApply": "All government PHCs, CHCs, Sub-District Hospitals, and Medical Colleges",
        "processingTime": "Immediate at admission",
        "contact": "Medical Officer or Hospital Helpdesk (Ayushman Mitra / ASHA)"
    },
    {
        "id": "pmjay",
        "name": "PM-JAY",
        "fullName": "Ayushman Bharat - PM Jan Arogya Yojana",
        "category": "Insurance",
        "benefit": "₹5,00,000 / family / year",
        "benefitAmount": 500000,
        "description": "World's largest government-funded health assurance scheme providing secondary and tertiary hospitalization cover.",
        "officialPdf": "https://pmjay.gov.in/sites/default/files/2020-01/PM-JAY-Guidelines.pdf",
        "pdfFallback": "/api/schemes/pmjay/document",
        "portalUrl": "https://pmjay.gov.in/",
        "portalFallback": "https://ab-hwc.nhp.gov.in/",
        "formsUrl": "https://pmjay.gov.in/",
        "offlinePdf": "pmjay.pdf",
        "stateBenefits": {
            "Telangana": "₹5,00,000 (Integrated with Aarogyasri Scheme)",
            "Central": "₹5,00,000 health cover per family per year",
            "Karnataka": "₹5,00,000 (Integrated with Arogya Karnataka)",
            "Maharashtra": "₹5,00,000 (Integrated with Mahatma Jyotirao Phule Scheme)"
        },
        "eligibility": [
            "Families listed in Socio-Economic Caste Census (SECC) 2011 database",
            "Households holding eligible State BPL Ration cards (NFSA / Antyodaya)",
            "Families with monthly income under state thresholds (e.g. Telangana < ₹2L/year)",
            "Occupational criteria for urban workers (ragpickers, drivers, street vendors, manual laborers)"
        ],
        "documents": [
            {
                "type": "aadhaar_mother",
                "label": "Aadhaar Card",
                "description": "Biometric verification for Ayushman card generation",
                "required": True
            },
            {
                "type": "ration_card",
                "label": "Ration Card",
                "description": "Food security ration card with family member roster",
                "required": True
            },
            {
                "type": "income_certificate",
                "label": "Income Certificate",
                "description": "Revenue department issued annual income certificate",
                "required": False
            },
            {
                "type": "secc_proof",
                "label": "SECC Database Proof",
                "description": "HH ID printout or Ayushman verification slip",
                "required": False
            }
        ],
        "process": [
            "1. Check eligibility at mera.pmjay.gov.in or nearest Common Service Centre (CSC).",
            "2. Complete biometric e-KYC using Aadhaar card and Ration Card.",
            "3. Generate and print Ayushman Card (Golden Card).",
            "4. Show Ayushman Card at any empaneled public or private hospital for cashless admission.",
            "5. Over 1,949 medical packages covered without cash deposit."
        ],
        "whereToApply": "Common Service Centre (CSC), Empaneled Hospital Ayushman Mitra Desk, or online",
        "processingTime": "Same-day card generation; instant authorization during hospitalization",
        "contact": "Toll-free 14555 or Hospital Ayushman Mitra"
    },
    {
        "id": "ifa",
        "name": "IFA Supplementation",
        "fullName": "National Iron Plus Initiative (NIPI) / Anemia Mukt Bharat",
        "category": "Nutrition",
        "benefit": "Free Therapeutic IFA Tablets + Syrups",
        "benefitAmount": 500,
        "description": "Universal iron-folic acid supplementation and deworming to eradicate anemia across pregnant women, adolescents, and children.",
        "officialPdf": "https://nhm.gov.in/images/pdf/programmes/child-health/guidelines/NIPI_Guidelines.pdf",
        "pdfFallback": "/api/schemes/ifa/document",
        "portalUrl": "https://nhm.gov.in/",
        "portalFallback": "https://anemiamuktbharat.info/",
        "formsUrl": "https://anemiamuktbharat.info/",
        "offlinePdf": "ifa.pdf",
        "stateBenefits": {
            "Telangana": "Free supply of IFA tablets, Iron Sucrose injections & Albendazole",
            "Central": "Universal free supply across all states",
            "Karnataka": "Universal free supply",
            "Maharashtra": "Universal free supply"
        },
        "eligibility": [
            "All pregnant women from 14 weeks of gestation onwards",
            "Lactating mothers for 180 days postpartum",
            "Adolescent girls (10-19 years) and children under 5 years",
            "Any beneficiary diagnosed with nutritional anemia"
        ],
        "documents": [
            {
                "type": "mcp_card",
                "label": "MCP Card",
                "description": "Recorded hemoglobin levels and dosage schedule",
                "required": True
            },
            {
                "type": "anc_checkup_slip",
                "label": "ANC Check-up Slip",
                "description": "Clinical screening record from VHND / PHC",
                "required": True
            }
        ],
        "process": [
            "1. Attend Village Health Sanitation and Nutrition Day (VHSND) or Sub-Centre clinic.",
            "2. Undergo digital hemoglobin screening.",
            "3. Receive free monthly blister pack of Red IFA tablets (60mg elemental iron + 500mcg folic acid).",
            "4. Receive Albendazole 400mg deworming tablet after 1st trimester.",
            "5. Receive dietary counseling on vitamin C rich foods."
        ],
        "whereToApply": "Anganwadi Center, Sub-Centre, PHC, or during monthly VHSND sessions",
        "processingTime": "Immediate on-site distribution",
        "contact": "ASHA Worker, ANM, or Anganwadi Worker"
    },
    {
        "id": "annaprasana",
        "name": "Annaprasana / Poshan",
        "fullName": "Supplementary Nutrition Programme & Poshan Abhiyaan",
        "category": "Nutrition",
        "benefit": "Free Take Home Ration (THR) + Hot Cooked Meals",
        "benefitAmount": 3000,
        "description": "Mandatory nutritional support providing Take Home Rations (THR) and complementary feeding support under the National Food Security Act, 2013.",
        # wcd.nic.in changed to wcd.gov.in (Indian government official domain change)
        "officialPdf": "https://wcd.gov.in/schemes",
        "pdfFallback": "/api/schemes/annaprasana/document",
        "portalUrl": "https://wcd.gov.in/",
        "portalFallback": "https://pib.gov.in/PressReleasePage.aspx",
        "formsUrl": "https://poshantracker.in/",
        "offlinePdf": "annaprasana.pdf",
        "stateBenefits": {
            "Telangana": "Arogya Lakshmi Scheme (Eggs, milk, hot meal daily at Anganwadi)",
            "Central": "600 kcal + 18-20g protein THR daily for pregnant/lactating women",
            "Karnataka": "Mathru Poorna hot meal program",
            "Maharashtra": "APJ Abdul Kalam Amrut Yojna"
        },
        "eligibility": [
            "Pregnant women registered at Anganwadi Centre",
            "Lactating mothers of infants up to 6 months",
            "Infants aged 6 months to 6 years (Annaprasana milestone at 6 months)"
        ],
        "documents": [
            {
                "type": "aadhaar_mother",
                "label": "Aadhaar Card",
                "description": "Identity proof for Poshan Tracker enrollment",
                "required": True
            },
            {
                "type": "ration_card",
                "label": "Ration Card",
                "description": "Household food security card",
                "required": True
            },
            {
                "type": "child_birth_certificate",
                "label": "Child's Birth Certificate",
                "description": "Birth registration certificate for infants reaching 6 months",
                "required": False
            }
        ],
        "process": [
            "1. Register beneficiary at local Anganwadi Centre on the Poshan Tracker app.",
            "2. Receive Take Home Ration (THR) or attend daily hot meal session (Arogya Lakshmi).",
            "3. Participate in monthly Annaprasana Diwas on baby's 6-month birthday to initiate semi-solid feeding.",
            "4. Monthly growth monitoring (weight and height tracking)."
        ],
        "whereToApply": "Village Anganwadi Centre",
        "processingTime": "Immediate upon Anganwadi enrollment",
        "contact": "Anganwadi Worker (AWW) and ASHA Worker"
    }
]
