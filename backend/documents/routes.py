"""
Routes for patient and scheme supporting documents management.
Endpoints:
- POST /api/documents/upload: Upload supporting document (Aadhaar, MCP card, passbook, etc.)
- GET /api/documents/alerts/missing: Patients with missing required documents
- GET /api/documents/{patient_id}/{scheme_id}: Checklist of required documents & statuses
- DELETE /api/documents/{document_id}: Remove document
- PATCH /api/documents/{document_id}/status: Update status (verified, rejected, pending, uploaded)
- GET /api/documents/{patient_id}/checklist: Overall checklist for patient
"""

import os
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from sqlmodel import select

from backend.db.database import get_session
from backend.db.models import Patient, PatientDocument
from backend.documents.storage import save_uploaded_document, delete_document_file
from backend.documents.validation import validate_file_upload
from backend.schemes.scheme_data import SCHEMES_DETAILED

router = APIRouter(prefix="/api/documents", tags=["documents"])


class DocumentStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None


@router.post("/upload")
async def upload_patient_document(
    patient_id: str = Form(...),
    scheme_id: str = Form(...),
    document_type: str = Form(...),
    document_label: Optional[str] = Form(None),
    file: UploadFile = File(...),
):
    """Upload patient scheme supporting document (Aadhaar, MCP card, etc.)."""
    content = await file.read()
    file_size = len(content)

    valid, err = validate_file_upload(file.filename or "", file.content_type or "", file_size)
    if not valid:
        raise HTTPException(status_code=400, detail=err)

    lbl = document_label
    if not lbl:
        scheme_meta = next((s for s in SCHEMES_DETAILED if s["id"].lower() in (scheme_id.lower(), "annaprasana" if scheme_id.lower() == "thali" else "", "pmvvy" if scheme_id.lower() == "pmmvy" else "")), None)
        if scheme_meta:
            doc_spec = next((d for d in scheme_meta.get("documents", []) if d["type"] == document_type), None)
            if doc_spec:
                lbl = doc_spec["label"]
    if not lbl:
        lbl = document_type.replace("_", " ").title()

    file_path = save_uploaded_document(patient_id, scheme_id, document_type, file.filename or "doc.bin", content)

    session = get_session()
    try:
        pat = session.get(Patient, patient_id)
        pat_name = pat.name if pat else "Beneficiary"

        existing = session.exec(
            select(PatientDocument)
            .where(PatientDocument.patient_id == patient_id)
            .where(PatientDocument.scheme_id == scheme_id)
            .where(PatientDocument.document_type == document_type)
        ).first()

        doc_id = existing.id if existing else str(uuid.uuid4())
        if existing:
            existing.file_name = file.filename or "doc.bin"
            existing.file_path = file_path
            existing.file_size = file_size
            existing.mime_type = file.content_type or "application/octet-stream"
            existing.status = "uploaded"
            existing.document_label = lbl
            existing.uploaded_at = datetime.utcnow().isoformat()
            session.add(existing)
        else:
            rec = PatientDocument(
                id=doc_id,
                patient_id=patient_id,
                patient_name=pat_name,
                scheme_id=scheme_id,
                document_type=document_type,
                document_label=lbl,
                file_name=file.filename or "doc.bin",
                file_path=file_path,
                file_size=file_size,
                mime_type=file.content_type or "application/octet-stream",
                status="uploaded",
                uploaded_at=datetime.utcnow().isoformat(),
            )
            session.add(rec)
        session.commit()
        return {
            "success": True,
            "documentId": doc_id,
            "patientId": patient_id,
            "schemeId": scheme_id,
            "documentType": document_type,
            "status": "uploaded",
            "fileName": file.filename,
        }
    finally:
        session.close()


@router.get("/alerts/missing")
def get_missing_document_alerts():
    """Return list of patients with missing mandatory scheme documents for Dashboard alerts."""
    session = get_session()
    try:
        patients = session.exec(select(Patient)).all()
        all_docs = session.exec(select(PatientDocument)).all()
        doc_map = {(d.patient_id, d.scheme_id, d.document_type) for d in all_docs}

        alerts = []
        for p in patients:
            for s in SCHEMES_DETAILED[:4]:
                missing_for_p = [
                    d["label"]
                    for d in s.get("documents", [])
                    if d["required"] and (p.id, s["id"], d["type"]) not in doc_map
                ]
                if missing_for_p:
                    alerts.append({
                        "patientId": p.id,
                        "patientName": p.name,
                        "village": p.village or "Ramnagar",
                        "schemeId": s["id"],
                        "schemeName": s["name"],
                        "missingDoc": missing_for_p[0],
                        "missingCount": len(missing_for_p),
                        "missingList": missing_for_p,
                    })

        return {
            "totalPatientsWithMissingDocs": len(set(a["patientId"] for a in alerts)),
            "alerts": alerts[:8],
        }
    finally:
        session.close()


@router.get("/{patient_id}/{scheme_id}")
def get_patient_scheme_documents(patient_id: str, scheme_id: str):
    """Return checklist of required documents and upload status for a patient & scheme."""
    session = get_session()
    try:
        uploaded_records = session.exec(
            select(PatientDocument)
            .where(PatientDocument.patient_id == patient_id)
            .where(PatientDocument.scheme_id == scheme_id)
        ).all()
        uploaded_map = {r.document_type: r for r in uploaded_records}

        normalized_id = scheme_id.lower()
        if normalized_id == "thali":
            normalized_id = "annaprasana"
        elif normalized_id == "pmmvy":
            normalized_id = "pmvvy"

        scheme_meta = next((s for s in SCHEMES_DETAILED if s["id"].lower() == normalized_id or s["name"].lower() == scheme_id.lower()), None)
        required_specs = scheme_meta.get("documents", []) if scheme_meta else []

        docs_list = []
        for spec in required_specs:
            uploaded = uploaded_map.get(spec["type"])
            if uploaded:
                docs_list.append({
                    "id": uploaded.id,
                    "type": spec["type"],
                    "label": spec["label"],
                    "description": spec["description"],
                    "required": spec["required"],
                    "status": uploaded.status,
                    "fileName": uploaded.file_name,
                    "fileSize": uploaded.file_size,
                    "uploadedAt": uploaded.uploaded_at,
                    "verifiedAt": uploaded.verified_at,
                    "notes": uploaded.notes,
                })
            else:
                docs_list.append({
                    "id": None,
                    "type": spec["type"],
                    "label": spec["label"],
                    "description": spec["description"],
                    "required": spec["required"],
                    "status": "pending",
                    "fileName": None,
                    "fileSize": None,
                    "uploadedAt": None,
                    "verifiedAt": None,
                    "notes": None,
                })

        total_req = len([d for d in docs_list if d["required"]])
        total_up = len([d for d in docs_list if d["status"] in ("uploaded", "verified") and d["required"]])
        all_done = total_up >= total_req if total_req > 0 else True

        return {
            "patientId": patient_id,
            "schemeId": scheme_id,
            "documents": docs_list,
            "progress": f"{total_up}/{total_req} uploaded",
            "progressPercent": round((total_up / max(total_req, 1)) * 100),
            "complete": all_done,
        }
    finally:
        session.close()


@router.delete("/{document_id}")
def delete_patient_document(document_id: str):
    """Remove an uploaded document and its physical storage."""
    session = get_session()
    try:
        doc = session.get(PatientDocument, document_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        delete_document_file(doc.file_path)
        session.delete(doc)
        session.commit()
        return {"success": True, "deletedDocumentId": document_id}
    finally:
        session.close()


@router.patch("/{document_id}/status")
def update_document_status(document_id: str, body: DocumentStatusUpdate):
    """Update verification status (verified, rejected, pending, uploaded)."""
    session = get_session()
    try:
        doc = session.get(PatientDocument, document_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        doc.status = body.status
        if body.status == "verified":
            doc.verified_at = datetime.utcnow().isoformat()
            doc.verified_by = "ASHA-NHM-042"
        if body.notes:
            doc.notes = body.notes
        session.add(doc)
        session.commit()
        session.refresh(doc)
        return {
            "success": True,
            "documentId": doc.id,
            "status": doc.status,
            "verifiedAt": doc.verified_at,
            "notes": doc.notes,
        }
    finally:
        session.close()
