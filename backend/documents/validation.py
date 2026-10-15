"""
Validation helpers for uploaded medical / government identification documents.
Enforces:
- File size <= 5 MB
- Allowed extensions: JPG, JPEG, PNG, PDF, WEBP
- Basic content checks
"""
from typing import Tuple

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}


def validate_file_upload(filename: str, content_type: str, file_size: int) -> Tuple[bool, str]:
    if file_size > MAX_FILE_SIZE:
        return False, f"File size ({round(file_size / (1024*1024), 2)} MB) exceeds statutory 5 MB limit"

    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS and content_type.lower() not in ALLOWED_MIME_TYPES:
        return False, f"Unsupported file type. Allowed formats: JPG, PNG, PDF, WEBP."

    return True, ""
