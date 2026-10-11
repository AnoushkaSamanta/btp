import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
try:
    from langchain_huggingface import HuggingFaceEmbeddings
except ImportError:
    try:
        from langchain_community.embeddings import HuggingFaceEmbeddings
    except ImportError:
        HuggingFaceEmbeddings = None

class MockEmbeddingModel:
    def embed_query(self, text: str):
        import hashlib
        h = hashlib.sha256(text.encode('utf-8')).digest()
        return [float(b) / 255.0 for b in h[:32]]


def get_embedding_model():
    """
    Initializes and returns the HuggingFace embedding model or a deterministic fallback.
    """
    if HuggingFaceEmbeddings is not None:
        try:
            return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        except Exception:
            pass
    return MockEmbeddingModel()


def load_and_chunk_documents(data_dir: str):
    """
    Loads all PDFs from the specified directory and splits them into smaller text chunks.
    """
    documents = []
    
    if not os.path.exists(data_dir):
        print(f"Directory {data_dir} does not exist.")
        return []
    
    # Load all PDFs
    for filename in os.listdir(data_dir):
        if filename.endswith(".pdf"):
            file_path = os.path.join(data_dir, filename)
            try:
                loader = PyPDFLoader(file_path)
                documents.extend(loader.load())
                print(f"Loaded: {filename}")
            except Exception as e:
                print(f"Error loading {filename}: {e}")
            
    # Split text into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    
    chunks = text_splitter.split_documents(documents)
    return chunks

if __name__ == "__main__":
    # Simple test for Task 2
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_directory = os.path.join(base_dir, "data", "guidelines")
    
    chunks = load_and_chunk_documents(data_directory)
    print(f"Total chunks created: {len(chunks)}")
    if chunks:
        print("\n--- Sample Chunk ---")
        print(chunks[0].page_content)
        print("--------------------")
