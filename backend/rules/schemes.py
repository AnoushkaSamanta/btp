from typing import Any, Dict, List, Optional


SCHEMES = [
    {
        "id": "jsy",
        "name": "JSY",
        "fullName": "Janani Suraksha Yojana",
        "description": "Cash assistance for institutional delivery for eligible pregnant women.",
        "category": "maternal",
        "benefits": [
            "Cash incentive of Rs. 1,400 for rural institutional delivery",
            "Rs. 1,000 for urban institutional delivery",
            "ASHA incentive per delivery",
        ],
        "eligibilityCriteria": [
            "BPL / low-performing state criteria as applicable",
            "Age 19 years or above",
            "Institutional delivery at government or accredited facility",
            "Typically up to 2 live births",
        ],
        "documentsRequired": ["BPL Card", "Aadhaar Card", "MCP Card", "Bank Passbook"],
        "benefitAmount": "Rs. 1,400",
        "icon": "Baby",
        "color": "primary",
        "disclaimer": "Preliminary — verify with official scheme office before enrollment.",
    },
    {
        "id": "jssk",
        "name": "JSSK",
        "fullName": "Janani Shishu Suraksha Karyakram",
        "description": "Free cashless delivery and sick newborn care in public facilities.",
        "category": "maternal",
        "benefits": ["Free delivery including C-section", "Free drugs, diagnostics, blood", "Free transport"],
        "eligibilityCriteria": ["All pregnant women delivering in government facilities", "Universal — no BPL restriction"],
        "documentsRequired": ["Aadhaar Card", "MCP Card"],
        "benefitAmount": "Free Delivery",
        "icon": "HeartHandshake",
        "color": "sky",
        "disclaimer": "Preliminary — confirm at the facility.",
    },
    {
        "id": "pmmvy",
        "name": "PMMVY",
        "fullName": "Pradhan Mantri Matru Vandana Yojana",
        "description": "Cash benefit for wage loss during pregnancy, typically first living child.",
        "category": "financial",
        "benefits": ["Rs. 5,000 in instalments (as per current guidelines)"],
        "eligibilityCriteria": ["First living child (check current MoWCD rules)", "Aadhaar-linked bank account", "Registered pregnancy"],
        "documentsRequired": ["Aadhaar Card", "Bank Passbook", "MCP Card"],
        "benefitAmount": "Rs. 5,000",
        "icon": "Wallet",
        "color": "accent",
        "disclaimer": "Preliminary — verify with Anganwadi / WCD office.",
    },
    {
        "id": "pmjay",
        "name": "PM-JAY",
        "fullName": "Ayushman Bharat PM-JAY",
        "description": "Health cover for eligible families for hospitalization including maternity complications.",
        "category": "insurance",
        "benefits": ["Up to Rs. 5 lakh per family per year at empaneled hospitals"],
        "eligibilityCriteria": ["SECC / eligible deprivation criteria or state extension lists", "Golden card where issued"],
        "documentsRequired": ["Aadhaar Card", "PMJAY Golden Card", "Ration Card"],
        "benefitAmount": "Rs. 5,00,000",
        "icon": "ShieldCheck",
        "color": "success",
        "disclaimer": "Preliminary — confirm on beneficiary portal / kiosk.",
    },
    {
        "id": "ifa",
        "name": "IFA",
        "fullName": "National Iron+ Initiative",
        "description": "Free IFA supplementation for pregnant and lactating women.",
        "category": "nutrition",
        "benefits": ["Free IFA tablets", "Deworming as per protocol"],
        "eligibilityCriteria": ["All pregnant women", "Lactating women up to 6 months"],
        "documentsRequired": ["MCP Card"],
        "benefitAmount": "Free Tablets",
        "icon": "Pill",
        "color": "primary",
        "disclaimer": "Stock availability at AWC/SC may vary.",
    },
    {
        "id": "thali",
        "name": "Annaprasana",
        "fullName": "Supplementary nutrition (Anganwadi)",
        "description": "Hot cooked meal / take-home ration for pregnant and lactating women at AWC.",
        "category": "nutrition",
        "benefits": ["Hot cooked meal or THR as per ICDS", "Weight monitoring"],
        "eligibilityCriteria": ["Registered at Anganwadi", "Pregnant or lactating"],
        "documentsRequired": ["Aadhaar Card", "Anganwadi Registration"],
        "benefitAmount": "Daily Meals",
        "icon": "Apple",
        "color": "accent",
        "disclaimer": "Preliminary — confirm at the Anganwadi centre.",
    },
]


def _bool(val: Any) -> bool:
    if isinstance(val, bool):
        return val
    if val is None:
        return False
    return str(val).lower() in {"1", "true", "yes", "bpl"}


def match_schemes(record: Dict[str, Any], patient: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    ctx = {**(patient or {}), **record}
    household = record.get("household_info") or {}
    if isinstance(household, dict):
        ctx = {**ctx, **household}

    pregnant = _bool(ctx.get("pregnancy_status")) or str(ctx.get("trimester", "")).lower() in {"1st", "2nd", "3rd"}
    postnatal = str(ctx.get("trimester", "")).lower() == "postnatal"
    age = ctx.get("age")
    try:
        age_i = int(age) if age is not None else None
    except (TypeError, ValueError):
        age_i = None
    bpl = str(ctx.get("income_category") or "").upper() == "BPL" or _bool(ctx.get("bpl_card"))
    children = ctx.get("children_count")
    try:
        children_i = int(children) if children is not None else ctx.get("para")
        children_i = int(children_i) if children_i is not None else None
    except (TypeError, ValueError):
        children_i = None
    first_child = _bool(ctx.get("first_living_child")) or children_i == 0 or ctx.get("para") == 0 or (children_i is None and ctx.get("para") is None)
    aadhaar = ctx.get("aadhaar_linked", True)
    enrolled = set(ctx.get("existing_schemes") or [])

    results = []
    for scheme in SCHEMES:
        sid = scheme["id"]
        eligible = False
        reasons: List[str] = []
        blockers: List[str] = []

        if sid == "ifa":
            eligible = pregnant or postnatal
            reasons.append("IFA is indicated for all pregnant and lactating women.")
        elif sid == "jssk":
            eligible = pregnant or postnatal
            reasons.append("JSSK is universal for deliveries in government facilities.")
        elif sid == "jsy":
            if not pregnant and not postnatal:
                blockers.append("Not currently in pregnancy/postnatal window.")
            if age_i is not None and age_i < 19:
                blockers.append("Age below 19.")
            if children_i is not None and children_i >= 2 and not pregnant:
                blockers.append("More than 2 live births may be outside typical JSY cover.")
            if not bpl:
                blockers.append("BPL / LPS criteria not confirmed — still check state rules.")
            eligible = (pregnant or postnatal) and (age_i is None or age_i >= 19) and (children_i is None or children_i < 2 or pregnant)
            if eligible:
                reasons.append("Pregnant/postnatal woman meeting typical JSY age/parity screen. Confirm BPL/LPS and institutional delivery.")
            if not bpl:
                eligible = False
        elif sid == "pmmvy":
            if not pregnant and not postnatal:
                blockers.append("Needs registered pregnancy / recent delivery.")
            if not first_child:
                blockers.append("Typically first living child only — confirm current guideline.")
            eligible = (pregnant or postnatal) and first_child
            if eligible:
                reasons.append("Profile looks consistent with PMMVY first-child cash benefit. Verify Aadhaar-bank link.")
            if aadhaar is False:
                blockers.append("Aadhaar linkage missing.")
                eligible = False
        elif sid == "pmjay":
            notes_lower = str(record.get("visit_notes") or "").lower()
            loc_lower = str(record.get("location") or record.get("village") or "").lower()
            asked_pm = any(k in notes_lower for k in ["pm eligibility", "pm-jay", "ayushman", "pmjay", "pm scheme", "pm"])
            telangana_hyd = any(k in notes_lower or k in loc_lower for k in ["hyderabad", "telangana", "aarogyasri", "bhagyanagar"])
            has_critical_condition = ctx.get("bp_status") in {"high", "invalid_reading"} or ctx.get("sugar_status") in {"high", "critical", "diabetic"}
            eligible = bpl or _bool(ctx.get("pmjay_eligible")) or asked_pm or has_critical_condition
            if eligible:
                if telangana_hyd:
                    reasons.append("PM-JAY: Family income < ₹5L, Telangana resident (converged with Rajiv Aarogyasri for cashless secondary & tertiary hospital cover).")
                else:
                    reasons.append("PM-JAY: Secondary & tertiary hospital care coverage up to ₹5 Lakh per family per year across empaneled hospitals.")
            else:
                blockers.append("Not marked BPL / PM-JAY eligible in registry record. Verify SECC deprivation list or state ration card.")
        elif sid == "thali":
            eligible = (pregnant or postnatal) and bpl
            if eligible:
                reasons.append("BPL pregnant/lactating profile is typically covered under ICDS supplementary nutrition.")
            else:
                blockers.append("Needs pregnancy/postnatal window and BPL (or AWC registration).")

        status = "eligible" if eligible else "not-eligible"
        if sid in {s.lower() for s in enrolled}:
            status = "enrolled"

        confidence = "High" if status in {"eligible", "enrolled"} and not blockers else ("Medium" if eligible else "Low")

        results.append({
            "schemeId": sid,
            "name": scheme["name"],
            "fullName": scheme["fullName"],
            "status": status,
            "confidence": confidence,
            "reasons": reasons,
            "blockers": blockers,
            "disclaimer": scheme["disclaimer"],
            "benefitAmount": scheme["benefitAmount"],
        })
    return results
