import os
from langchain_community.vectorstores import Chroma
from backend.rag.embeddings import get_embedding_model, load_and_chunk_documents

# Define where ChromaDB will store its data on disk
CHROMA_DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "chroma_db")

def ingest_documents_to_chroma(data_dir: str):
    """
    Reads documents, creates chunks, and stores them in ChromaDB.
    """
    print("Loading and chunking documents...")
    chunks = load_and_chunk_documents(data_dir)
    if not chunks:
        print("No chunks to index.")
        return None
    
    print(f"Storing {len(chunks)} chunks into ChromaDB at {CHROMA_DB_DIR}...")
    embedding_model = get_embedding_model()
    
    # Create and persist the vector database
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_model,
        persist_directory=CHROMA_DB_DIR
    )
    vectorstore.persist()
    print("Documents successfully ingested into ChromaDB.")
    return vectorstore

def retrieve_guidelines(query: str, k: int = 3):
    """
    Queries ChromaDB for the top k most relevant guidelines based on the query.
    """
    embedding_model = get_embedding_model()
    
    if not os.path.exists(CHROMA_DB_DIR):
        print("Chroma database not found. Please ingest documents first.")
        return []
        
    # Load the existing vector database
    vectorstore = Chroma(
        persist_directory=CHROMA_DB_DIR,
        embedding_function=embedding_model
    )
    
    # Perform similarity search with Maximal Marginal Relevance (MMR)
    # This ensures we get diverse guidelines rather than repeating the same paragraph
    retriever = vectorstore.as_retriever(
        search_type="mmr", 
        search_kwargs={"k": k, "fetch_k": k * 3}
    )
    try:
        results = retriever.invoke(query)
    except AttributeError:
        # Fallback for older LangChain versions
        results = retriever.get_relevant_documents(query)
        
    return results

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_directory = os.path.join(base_dir, "data", "guidelines")
    
    # 1. Ingest Documents (Will only run if the DB folder doesn't exist yet)
    if not os.path.exists(CHROMA_DB_DIR):
        ingest_documents_to_chroma(data_directory)
    
    # 2. Test Retrieval
    test_query = "What should be done for a patient with severe bleeding?"
    print(f"\n--- Testing Query: '{test_query}' ---")
    results = retrieve_guidelines(test_query, k=2)
    
    if not results:
        print("No results found.")
    
    for i, res in enumerate(results):
        print(f"\nResult {i+1}:")
        print(res.page_content)
        print(f"Source: {res.metadata.get('source', 'Unknown')} (Page {res.metadata.get('page', 'N/A')})")
