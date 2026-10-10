import os
from langchain_community.vectorstores import Chroma
from embeddings import get_embedding_model, load_and_chunk_documents
import shutil

def populate_database():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_directory = os.path.join(base_dir, "data", "guidelines")
    persist_directory = os.path.join(base_dir, "chroma_db")

    # Clear existing DB if it exists
    if os.path.exists(persist_directory):
        print(f"Clearing existing database at {persist_directory}...")
        shutil.rmtree(persist_directory)

    print(f"Loading documents from {data_directory}...")
    chunks = load_and_chunk_documents(data_directory)
    
    if not chunks:
        print("No chunks were created. Database not populated.")
        return

    print(f"Creating Chroma vector store with {len(chunks)} chunks...")
    embedding_model = get_embedding_model()
    
    db = Chroma.from_documents(
        documents=chunks, 
        embedding=embedding_model,
        persist_directory=persist_directory
    )
    
    print("Database populated successfully.")

if __name__ == "__main__":
    populate_database()
