import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
import pytest
from backend.rag.embeddings import get_embedding_model, load_and_chunk_documents
from backend.rag.retriever import ingest_documents_to_chroma, retrieve_guidelines, CHROMA_DB_DIR
from backend.rules.red_flags import check_red_flags

def test_red_flags():
    symptoms = ["patient has severe bleeding", "fever above 102", "mild cough"]
    alerts = check_red_flags(symptoms)
    
    assert len(alerts) == 2, f"Expected 2 alerts, got {len(alerts)}"
    assert any("Severe Bleeding" in a for a in alerts), "Missing severe bleeding alert"
    assert any("Fever Above 102" in a for a in alerts), "Missing fever alert"

def test_embeddings_model():
    model = get_embedding_model()
    assert model is not None, "Failed to initialize embedding model"
    
    # Test embedding a simple string
    emb = model.embed_query("test query for medical guideline")
    assert len(emb) > 0, "Embedding vector is empty"
    assert isinstance(emb, list), "Embedding is not a list"

def test_end_to_end_rag():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_directory = os.path.join(base_dir, "data", "guidelines")
    
    # Check if we can load chunks
    chunks = load_and_chunk_documents(data_directory)
    assert chunks is not None, "load_and_chunk_documents returned None"
    
    if len(chunks) > 0:
        # Check ingestion
        if not os.path.exists(CHROMA_DB_DIR):
            vectorstore = ingest_documents_to_chroma(data_directory)
            assert vectorstore is not None, "Ingestion failed to return vectorstore"
            assert os.path.exists(CHROMA_DB_DIR), "ChromaDB directory not created"
            
        # Check retrieval
        test_query = "What is the recommended treatment for antimicrobial resistance?"
        results = retrieve_guidelines(test_query, k=1)
        assert len(results) > 0, "Retrieval failed to return any documents"
        assert hasattr(results[0], 'page_content'), "Result document missing page_content"
