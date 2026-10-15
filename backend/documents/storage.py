"""
Storage layer for patient scheme documents.
Saves uploaded files safely to backend/documents/uploads/{patient_id}/{scheme_id}/{filename}
Supports retrieval, deletion, and local serving.
"""
import os
import shutil
from pathlib import Path
from typing import Optional

BASE_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(BASE_UPLOAD_DIR, exist_ok=True)


def get_patient_scheme_dir(patient_id: str, scheme_id: str) -> str:
    clean_p = "".join(c for c in patient_id if c.isalnum() or c in ("-", "_"))
    clean_s = "".join(c for c in scheme_id if c.isalnum() or c in ("-", "_"))
    target = os.path.join(BASE_UPLOAD_DIR, clean_p, clean_s)
    os.makedirs(target, exist_ok=True)
    return target


def save_uploaded_document(patient_id: str, scheme_id: str, doc_type: str, filename: str, content: bytes) -> str:
    folder = get_patient_scheme_dir(patient_id, scheme_id)
    ext = "." + filename.split(".")[-1].lower() if "." in filename else ".bin"
    safe_name = f"{doc_type}{ext}"
    dest = os.path.join(folder, safe_name)
    with open(dest, "wb") as f:
        f.write(content)
    return dest


def delete_document_file(file_path: str) -> bool:
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception:
        pass
    return False
