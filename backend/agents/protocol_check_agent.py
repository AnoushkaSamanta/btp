import json
from typing import Dict, Any, List

from backend.schemas.medical_record import MedicalRecord
from backend.rules.red_flags import check_red_flags
from backend.rag.retriever import retrieve_guidelines

class ProtocolCheckAgent:
    def __init__(self, k_retrieval: int = 3):
        self.k_retrieval = k_retrieval

    def _build_search_query(self, record: MedicalRecord) -> str:
        """
        Constructs a targeted search query for the RAG system based on the patient's record.
        """
        query_parts = []
        
        # Add primary symptoms
        if record.symptoms:
            query_parts.append(f"symptoms: {', '.join(record.symptoms)}")
        
        # Add crucial patient context
        if record.pregnancy_status:
            month_str = f"at {record.gestational_age_months} months" if record.gestational_age_months else ""
            query_parts.append(f"pregnant patient {month_str}")
        elif record.age is not None:
            if record.age <= 5:
                query_parts.append("pediatric/child")
            elif record.age >= 60:
                query_parts.append("geriatric/elderly")
        
        # Add vitals if abnormal
        if record.bp_status in ['high', 'low']:
            query_parts.append(f"blood pressure {record.bp_status} ({record.blood_pressure})")
            
        if not query_parts:
            return "general health guidelines"
            
        return " ".join(query_parts)

    def analyze_record(self, record: MedicalRecord) -> Dict[str, Any]:
        """
        Main entry point for the agent. Analyzes a medical record,
        checks for red flags, and retrieves relevant medical protocols.
        """
        # Prepare a list of conditions for red flag checking
        conditions_to_check = list(record.symptoms) if record.symptoms else []
        if record.blood_pressure and record.bp_status == 'high':
            # Format the BP so the rule engine can catch it if it crosses thresholds
            conditions_to_check.append(f"blood pressure > {record.blood_pressure}")
            
        # 1. Rule-based check for red flags
        alerts = check_red_flags(conditions_to_check)
        
        # 2. Build targeted query for RAG
        search_query = self._build_search_query(record)
        
        # 3. Retrieve relevant guidelines
        # Ensure we capture documents and metadata correctly
        raw_guidelines = retrieve_guidelines(search_query, k=self.k_retrieval)
        
        formatted_guidelines = []
        for doc in raw_guidelines:
            formatted_guidelines.append({
                "content": doc.page_content,
                "source": doc.metadata.get("source", "Unknown"),
                "page": doc.metadata.get("page", "N/A")
            })

        # 4. Construct final structured response
        response = {
            "patient_id": record.patient_id,
            "alerts": alerts,
            "requires_immediate_attention": len(alerts) > 0,
            "rag_query_used": search_query,
            "retrieved_protocols": formatted_guidelines
        }
        
        return response

if __name__ == "__main__":
    # Simple test for the agent
    agent = ProtocolCheckAgent()
    
    test_record = MedicalRecord(
        patient_name="Sita Devi",
        age=28,
        pregnancy_status=True,
        gestational_age_months=7,
        bp_status="high",
        blood_pressure="165/110",
        symptoms=["severe headache", "swelling", "blurry vision"]
    )
    
    result = agent.analyze_record(test_record)
    print(json.dumps(result, indent=2))
