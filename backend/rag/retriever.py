import os
from typing import List, Tuple
from langchain_community.vectorstores import Chroma
from backend.rag.embeddings import get_embedding_model

_DB = None

def get_db():
    global _DB
    if _DB is not None:
        return _DB
        
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    persist_directory = os.path.join(base_dir, "chroma_db")
    
    if not os.path.exists(persist_directory):
        print(f"Warning: Database at {persist_directory} does not exist. Please run populate_db.py")
        return None
        
    embedding_model = get_embedding_model()
    _DB = Chroma(persist_directory=persist_directory, embedding_function=embedding_model)
    return _DB

def retrieve(query: str, k: int = 4) -> List[Tuple[dict, float]]:
    """
    Retrieve top k chunks for a given query.
    Returns a list of tuples containing (chunk_dict, score).
    """
    if k <= 0:
        return []
        
    db = get_db()
    if not db:
        return []
        
    # Using max_marginal_relevance_search for better diversity and recall
    try:
        results = db.max_marginal_relevance_search(query, k=k, fetch_k=20)
        formatted_results = []
        for doc in results:
            formatted_results.append((
                {
                    "source": os.path.basename(doc.metadata.get("source", "unknown")),
                    "text": doc.page_content,
                    "page": doc.metadata.get("page", 0)
                },
                1.0 # MMR doesn't natively return scores in this Langchain method without a wrapper
            ))
        return formatted_results
    except Exception as e:
        print(f"Error during retrieval: {e}")
        return []
