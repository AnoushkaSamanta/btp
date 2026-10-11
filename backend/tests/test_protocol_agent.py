import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
import pytest
from backend.schemas.medical_record import MedicalRecord
from backend.agents.protocol_check_agent import ProtocolCheckAgent

@pytest.fixture
def agent():
    return ProtocolCheckAgent(k_retrieval=2)

def test_high_blood_pressure_alert(agent):
    """
    Test if the agent correctly flags high blood pressure (preeclampsia risk).
    """
    record = MedicalRecord(
        patient_name="Priya",
        pregnancy_status=True,
        gestational_age_months=8,
        bp_status="high",
        blood_pressure="170/115",
        symptoms=["swelling in feet", "headache"]
    )
    
    result = agent.analyze_record(record)
    
    assert result["requires_immediate_attention"] is True
    # The alert list should contain a reference to the BP > 160/110 rule
    assert any("160/110" in alert for alert in result["alerts"])
    # Should have fetched at least 1 guideline
    assert len(result["retrieved_protocols"]) > 0

def test_severe_bleeding_alert(agent):
    """
    Test if the agent flags severe bleeding accurately.
    """
    record = MedicalRecord(
        patient_name="Anita",
        pregnancy_status=False,
        bp_status="normal",
        blood_pressure="120/80",
        symptoms=["severe bleeding", "dizziness"]
    )
    
    result = agent.analyze_record(record)
    
    assert result["requires_immediate_attention"] is True
    assert any("Bleeding" in alert for alert in result["alerts"])

def test_normal_case(agent):
    """
    Test if a normal case returns no alerts but still fetches general wellness guidelines.
    """
    record = MedicalRecord(
        patient_name="Sunita",
        pregnancy_status=True,
        gestational_age_months=4,
        bp_status="normal",
        blood_pressure="110/75",
        symptoms=["mild nausea"]
    )
    
    result = agent.analyze_record(record)
    
    assert result["requires_immediate_attention"] is False
    assert len(result["alerts"]) == 0
    # RAG should still pull pregnancy nutrition/wellness guidelines
    assert len(result["retrieved_protocols"]) > 0
    assert "pregnant patient" in result["rag_query_used"]
