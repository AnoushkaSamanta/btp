import os
from backend.rag.retriever import retrieve_guidelines

def evaluate_retrieval():
    """
    Evaluates the RAG retriever against realistic, tricky queries 
    that an ASHA worker might encounter in the field.
    """
    print("\n" + "="*50)
    print("RAG RETRIEVAL EVALUATION (REAL-WORLD SCENARIOS)")
    print("="*50)
    
    # Real-life problems a RAG faces:
    # 1. Synonyms: "high BP" instead of "hypertension"
    # 2. Complex Cases: Pregnant woman with sickle cell
    # 3. Specific details: Exact medication dosages
    
    test_cases = [
        {
            "scenario": "Synonym test (High BP vs Hypertension)",
            "query": "What should I do for a patient with high blood pressure above 160?",
            "expected_topic": "Hypertension protocols"
        },
        {
            "scenario": "Complex Case (Maternal Health + Genetic Disease)",
            "query": "How to manage a pregnant woman who has sickle cell disease?",
            "expected_topic": "Sickle Cell Operational Guidelines"
        },
        {
            "scenario": "Specific Medication Inquiry",
            "query": "What is the recommended antibiotic for a severe bacterial infection?",
            "expected_topic": "Antimicrobial guidelines"
        }
    ]
    
    for case in test_cases:
        print(f"\n[SCENARIO]: {case['scenario']}")
        print(f"[QUERY]: '{case['query']}'")
        print(f"[EXPECTING TO FIND]: {case['expected_topic']}")
        print("-" * 50)
        
        # Retrieve top 2 chunks
        results = retrieve_guidelines(case['query'], k=2)
        
        if not results:
            print("[FAILURE]: No documents retrieved!")
            continue
            
        for i, res in enumerate(results):
            source = res.metadata.get('source', 'Unknown File')
            page = res.metadata.get('page', 'Unknown Page')
            # Extract just a snippet to see what it found
            snippet = res.page_content.replace('\n', ' ')[:250] + "..."
            
            print(f"   [CHUNK] {i+1} (Source: {os.path.basename(source)} - Page {page}):")
            print(f"   > {snippet}\n")
            
    print("="*50)
    print("[EVALUATION COMPLETE]")
    print("To check for Grounding: Read the chunks above. If they answer the query accurately, the retrieval is working perfectly.")
    
if __name__ == "__main__":
    evaluate_retrieval()
