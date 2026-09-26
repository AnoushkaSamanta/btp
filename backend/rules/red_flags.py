RED_FLAG_RULES = {
    "severe bleeding": "IMMEDIATE REFERRAL TO CHC OR DISTRICT HOSPITAL",
    "fever above 102": "POSSIBLE SEVERE INFECTION - REFER TO MO",
    "blood pressure > 160/110": "HIGH RISK PREGNANCY / PREECLAMPSIA - IMMEDIATE REFERRAL",
    "seizures": "MEDICAL EMERGENCY - IMMEDIATE REFERRAL",
    "unconscious": "MEDICAL EMERGENCY - IMMEDIATE AMBULANCE REFERRAL",
    "difficulty breathing": "SEVERE RESPIRATORY DISTRESS - OXYGEN AND REFERRAL",
    "extreme paleness": "SEVERE ANEMIA - REQUIRE BLOOD TRANSFUSION AT CHC",
}

def check_red_flags(symptoms: list[str]) -> list[str]:
    """
    Checks a list of extracted symptoms against predefined red flag rules.
    Returns a list of alerts if any critical symptoms are found.
    """
    alerts = []
    # Make symptoms lowercase for easier matching
    lower_symptoms = [s.lower() for s in symptoms]
    
    for symptom in lower_symptoms:
        # Check if any part of the red flag condition matches the symptom text
        for condition, action in RED_FLAG_RULES.items():
            if condition in symptom:
                alerts.append(f"🔴 RED FLAG: '{condition.title()}' detected! ACTION: {action}")
                
    # Deduplicate alerts in case of multiple matches
    return list(set(alerts))

if __name__ == "__main__":
    # Test Red Flags
    test_symptoms = ["mild headache", "patient has severe bleeding", "patient is unconscious"]
    print(f"Testing symptoms: {test_symptoms}")
    alerts = check_red_flags(test_symptoms)
    
    if alerts:
        for alert in alerts:
            print(alert)
    else:
        print("No red flags detected.")
