"""
FastAPI application for Voice-First ASHA Co-Pilot.
Serves Phase 1 endpoints for transcription, structuring, protocol checking,
scheme matching, report generation, and full-pipeline orchestration.
"""

import os
import json
import tempfile
import logging
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, Request, UploadFile, File, Form, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlmodel import Session

from backend.db.database import get_session, init_db
from backend.schemas.medical_record import MedicalRecord, HouseholdInfo, VisitRecord
from backend.rules.red_flags import check_red_flags

logger = logging.getLogger("asha_copilot.api")
logging.basicConfig(level=logging.INFO)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for database initialization and cleanup."""
    init_db()
    logger.info("ASHA Co-Pilot API startup completed.")
    yield
    logger.info("ASHA Co-Pilot API shutdown.")

# Initialize FastAPI application
app = FastAPI(
    title="Voice-First ASHA Co-Pilot API",
    description="Decision-support and documentation backend for ASHA community health workers.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS setup for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Pydantic Request / Response Models
# ============================================================================

class TranscribeResponse(BaseModel):
    status: str = Field(..., description="'success' or 'error'")
    transcript: str = Field(default="", description="Transcribed speech text")
    confidence: float = Field(default=0.0, description="Confidence score")
    model_used: str = Field(default="none", description="Identifier of ASR model used")
    error: Optional[str] = Field(default=None, description="Error message if any")


class StructureRequest(BaseModel):
    transcript: str = Field(..., min_length=1, description="Raw transcription text to structure")
    language: Optional[str] = Field(default="hi", description="Language of transcript (hi, ta, te, en)")


class StructureResponse(BaseModel):
    status: str = Field(..., description="'success' or 'error'")
    record: MedicalRecord = Field(..., description="Structured medical record")
    raw_transcript: str = Field(..., description="Original raw transcript")
    message: Optional[str] = Field(default=None, description="Optional informational message")


class ProtocolCheckRequest(BaseModel):
    symptoms: Optional[List[str]] = Field(default_factory=list, description="List of patient symptoms")
    query: Optional[str] = Field(default=None, description="Clinical question or query text")
    patient_record: Optional[MedicalRecord] = Field(default=None, description="Optional structured record")


class ProtocolCheckResponse(BaseModel):
    status: str = Field(..., description="'success' or 'error'")
    red_flags: List[str] = Field(default_factory=list, description="Critical alerts requiring escalation")
    guidelines: List[Dict[str, Any]] = Field(default_factory=list, description="Retrieved official guidelines")
    count: int = Field(default=0, description="Total number of retrieved guideline passages")


class SchemeMatchRequest(BaseModel):
    patient_record: Optional[MedicalRecord] = Field(default=None, description="Patient medical record")
    household_info: Optional[HouseholdInfo] = Field(default=None, description="Household socioeconomic info")


class SchemeMatchResponse(BaseModel):
    status: str = Field(..., description="'success' or 'error'")
    eligible_schemes: List[Dict[str, Any]] = Field(default_factory=list, description="Schemes the patient is eligible for")
    count: int = Field(default=0, description="Number of matched schemes")
    notes: List[str] = Field(default_factory=list, description="Explanatory notes on eligibility")


class ReportGenerateRequest(BaseModel):
    patient_record: MedicalRecord = Field(..., description="Structured medical record")
    red_flags: Optional[List[str]] = Field(default_factory=list, description="Red flag warnings")
    eligible_schemes: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Matched welfare schemes")
    visit_notes: Optional[str] = Field(default=None, description="Optional field notes")


class ReportGenerateResponse(BaseModel):
    status: str = Field(..., description="'success' or 'error'")
    report: str = Field(..., description="Formatted visit summary report")
    tasks: List[str] = Field(default_factory=list, description="Follow-up action tasks for ASHA worker")
    follow_up_required: bool = Field(default=False, description="Whether immediate or routine follow-up is needed")
    summary: Dict[str, Any] = Field(default_factory=dict, description="Metadata summary of the visit")


class FullPipelineRequest(BaseModel):
    transcript: Optional[str] = Field(default=None, description="Transcript text if audio is already transcribed")
    language: Optional[str] = Field(default="hi", description="Language code")
    audio_path: Optional[str] = Field(default=None, description="Local path to audio file if provided")
    patient_record: Optional[MedicalRecord] = Field(default=None, description="Pre-structured record if available")


class FullPipelineResponse(BaseModel):
    status: str = Field(..., description="'success' or 'error'")
    transcript: str = Field(default="", description="Transcribed text")
    record: MedicalRecord = Field(..., description="Structured medical record")
    red_flags: List[str] = Field(default_factory=list, description="Identified red flags")
    guidelines: List[Dict[str, Any]] = Field(default_factory=list, description="Relevant NHM/ICMR guidelines")
    eligible_schemes: List[Dict[str, Any]] = Field(default_factory=list, description="Eligible government schemes")
    report: str = Field(default="", description="Generated visit summary report")
    tasks: List[str] = Field(default_factory=list, description="Actionable follow-up tasks")


# ============================================================================
# Helpers & Fallback Stubs for Teammate Components
# ============================================================================

def _run_transcription(audio_path: str, language: str = "hi") -> Dict[str, Any]:
    """Execute ASR transcription with preprocessing and fallback."""
    try:
        from backend.asr.preprocessor import preprocess_audio, validate_audio
        from backend.asr.transcriber import transcribe_with_fallback
    except ImportError as e:
        logger.warning(f"ASR module imports unavailable: {e}")
        return {
            "status": "error",
            "transcript": "",
            "confidence": 0.0,
            "model_used": "none",
            "error": f"ASR dependencies not available: {e}",
        }

    try:
        validation = validate_audio(audio_path)
    except Exception as e:
        return {
            "status": "error",
            "transcript": "",
            "confidence": 0.0,
            "model_used": "none",
            "error": f"Audio validation failed: {e}",
        }

    if not validation.get("is_valid"):
        return {
            "status": "error",
            "transcript": "",
            "confidence": 0.0,
            "model_used": "none",
            "error": validation.get("error_message", "Invalid audio file"),
        }

    audio_to_transcribe = audio_path
    try:
        preprocessed_path = preprocess_audio(audio_path)
        audio_to_transcribe = preprocessed_path
    except Exception as e:
        logger.warning(f"Audio preprocessing skipped/fallback: {e}")

    try:
        result = transcribe_with_fallback(audio_to_transcribe, language=language)
        return result
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        return {
            "status": "error",
            "transcript": "",
            "confidence": 0.0,
            "model_used": "none",
            "error": str(e),
        }


def _structure_transcript_stub(transcript: str) -> MedicalRecord:
    """
    Phase 1 fallback structuring logic.
    Extracts basic clinical entities from transcript before Rohan's LLM agent is integrated.
    """
    text = transcript.lower()
    symptoms = []
    if "fever" in text or "bukhar" in text:
        symptoms.append("fever")
    if "bleeding" in text or "khoon" in text:
        symptoms.append("severe bleeding")
    if "headache" in text or "sar dard" in text:
        symptoms.append("headache")
    if "swelling" in text or "soojan" in text:
        symptoms.append("swelling")
    if "vomiting" in text or "ulti" in text:
        symptoms.append("vomiting")
    if "difficulty breathing" in text or "saans" in text:
        symptoms.append("difficulty breathing")

    pregnancy_status = True if any(w in text for w in ["pregnant", "garbh", "garbhavati", "pregnancy"]) else None
    swelling = True if ("swelling" in text or "soojan" in text) else None

    bp_status = None
    blood_pressure = None
    if "140/90" in text or "160/110" in text or "high bp" in text:
        bp_status = "high"
        blood_pressure = "160/110" if "160/110" in text else "140/90"
    elif "120/80" in text or "normal bp" in text:
        bp_status = "normal"
        blood_pressure = "120/80"

    return MedicalRecord(
        patient_name=None,
        age=None,
        pregnancy_status=pregnancy_status,
        blood_pressure=blood_pressure,
        bp_status=bp_status,
        swelling=swelling,
        symptoms=symptoms,
        visit_notes=transcript,
        follow_up_required=bool(len(symptoms) > 0 or bp_status == "high"),
    )


def _match_schemes_stub(patient_record: Optional[MedicalRecord], household: Optional[HouseholdInfo]) -> List[Dict[str, Any]]:
    """
    Phase 1 deterministic rule-based scheme matcher (PMMVY, JSY, JSSK).
    """
    matches = []
    is_pregnant = patient_record.pregnancy_status if patient_record else None
    income = household.income_category if household else None
    caste = household.caste_category if household else None

    # 1. PMMVY (Pradhan Mantri Matru Vandana Yojana)
    if is_pregnant:
        matches.append({
            "scheme_name": "PMMVY",
            "full_name": "Pradhan Mantri Matru Vandana Yojana",
            "benefit": "Financial incentive of ₹5,000 in direct benefit transfers for pregnant women.",
            "criteria_met": "Patient is pregnant."
        })

    # 2. JSY (Janani Suraksha Yojana)
    if is_pregnant:
        is_bpl_or_reserved = (income and income.upper() == "BPL") or (caste and caste.upper() in ["SC", "ST"])
        matches.append({
            "scheme_name": "JSY",
            "full_name": "Janani Suraksha Yojana",
            "benefit": "Conditional cash transfer for institutional delivery (₹1,400 rural / ₹1,000 urban).",
            "criteria_met": "Pregnant patient promoting institutional delivery." + (" (Priority BPL/SC/ST)" if is_bpl_or_reserved else "")
        })

    # 3. JSSK (Janani Shishu Suraksha Karyakram)
    if is_pregnant:
        matches.append({
            "scheme_name": "JSSK",
            "full_name": "Janani Shishu Suraksha Karyakram",
            "benefit": "Completely free delivery, C-section, medicines, diagnostics, and diet at government facilities.",
            "criteria_met": "Universal entitlement for all pregnant women delivering in public health institutions."
        })

    return matches


def _generate_report_stub(
    patient_record: MedicalRecord,
    red_flags: List[str],
    eligible_schemes: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Phase 1 formatted visit report and follow-up task generator."""
    lines = []
    lines.append("=== ASHA VISIT REPORT ===")
    if patient_record.patient_name:
        lines.append(f"Patient Name: {patient_record.patient_name}")
    if patient_record.age:
        lines.append(f"Age: {patient_record.age} years")
    if patient_record.pregnancy_status:
        ga = f" ({patient_record.gestational_age_months} months)" if patient_record.gestational_age_months else ""
        lines.append(f"Pregnancy Status: Pregnant{ga}")
    if patient_record.blood_pressure:
        lines.append(f"Blood Pressure: {patient_record.blood_pressure} ({patient_record.bp_status or 'recorded'})")
    if patient_record.symptoms:
        lines.append(f"Symptoms Recorded: {', '.join(patient_record.symptoms)}")

    if red_flags:
        lines.append("\nCLINICAL ALERTS / RED FLAGS:")
        for rf in red_flags:
            lines.append(f"  - {rf}")

    if eligible_schemes:
        lines.append("\nELIGIBLE GOVERNMENT SCHEMES:")
        for s in eligible_schemes:
            lines.append(f"  - {s.get('scheme_name')}: {s.get('benefit')}")

    tasks = []
    if red_flags:
        tasks.append("IMMEDIATE ACTION: Refer patient to Community Health Centre (CHC) / Medical Officer.")
        tasks.append("Arrange ambulance / emergency transport if vital signs deteriorate.")
    if patient_record.pregnancy_status:
        tasks.append("Check iron and folic acid (IFA) tablet compliance.")
        tasks.append("Ensure registration for Antenatal Care (ANC) checkup.")
    if eligible_schemes:
        scheme_names = ", ".join([s["scheme_name"] for s in eligible_schemes])
        tasks.append(f"Collect Aadhaar and bank details for scheme registration ({scheme_names}).")
    if not tasks:
        tasks.append("Schedule next routine community health visit in 2 weeks.")

    report_text = "\n".join(lines)
    return {
        "report": report_text,
        "tasks": tasks,
        "follow_up_required": bool(red_flags or patient_record.follow_up_required),
    }


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/", tags=["Health"])
def root():
    """Root status endpoint."""
    return {
        "service": "Voice-First ASHA Co-Pilot API",
        "status": "online",
        "phase": "Phase 1 - Setup & Foundation",
        "documentation": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check(session: Session = Depends(get_session)):
    """Health check verifying API and SQLite database availability."""
    db_status = "connected"
    try:
        from sqlalchemy import text
        session.exec(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "endpoints": [
            "/transcribe",
            "/structure",
            "/protocol-check",
            "/scheme-match",
            "/report-generate",
            "/full-pipeline",
        ]
    }


@app.post("/transcribe", response_model=TranscribeResponse, tags=["ASR"])
async def transcribe_endpoint(request: Request):
    """
    Transcribe audio speech to text.
    Accepts either multipart form file upload (`file`, optional `language`)
    or JSON payload (`audio_path`, optional `language`).
    """
    content_type = request.headers.get("content-type", "")
    language = "hi"
    audio_path = None
    temp_file = None

    if "multipart/form-data" in content_type:
        form = await request.form()
        uploaded_file = form.get("file")
        language = form.get("language", "hi")

        if not uploaded_file or not hasattr(uploaded_file, "filename"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No audio file uploaded in multipart form data."
            )

        suffix = os.path.splitext(uploaded_file.filename)[1] or ".wav"
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        content = await uploaded_file.read()
        temp_file.write(content)
        temp_file.flush()
        temp_file.close()
        audio_path = temp_file.name

    elif "application/json" in content_type:
        body = await request.json()
        audio_path = body.get("audio_path")
        language = body.get("language", "hi")
        if not audio_path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing 'audio_path' in JSON request."
            )
    else:
        # Fallback check for query params or body
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Content-Type must be multipart/form-data or application/json."
        )

    try:
        result = _run_transcription(audio_path, language=str(language))
        return TranscribeResponse(
            status=result.get("status", "success"),
            transcript=result.get("transcript", ""),
            confidence=float(result.get("confidence", 0.0)),
            model_used=result.get("model_used", "none"),
            error=result.get("error"),
        )
    finally:
        # Clean up temporary upload file if one was created
        if temp_file and os.path.exists(temp_file.name):
            try:
                os.remove(temp_file.name)
            except OSError:
                pass


@app.post("/structure", response_model=StructureResponse, tags=["Structuring"])
def structure_endpoint(req: StructureRequest):
    """
    Convert raw transcription text into a validated structured MedicalRecord.
    Integrates with Rohan's Structuring Agent when available, with clean fallback.
    """
    try:
        import importlib
        struct_agent = importlib.import_module("backend.agents.structuring_agent")
        if hasattr(struct_agent, "extract_medical_record"):
            record = struct_agent.extract_medical_record(req.transcript)
            return StructureResponse(status="success", record=record, raw_transcript=req.transcript)
    except (ImportError, ModuleNotFoundError, AttributeError):
        pass

    # Phase 1 baseline fallback
    record = _structure_transcript_stub(req.transcript)
    return StructureResponse(
        status="success",
        record=record,
        raw_transcript=req.transcript,
        message="Structured via Phase 1 baseline extractor."
    )


@app.post("/protocol-check", response_model=ProtocolCheckResponse, tags=["Protocol & Safety"])
def protocol_check_endpoint(req: ProtocolCheckRequest):
    """
    Cross-check symptoms and clinical queries against hardcoded red flags and official guidelines.
    Integrates with Anoushka's red_flags and ChromaDB RAG retriever.
    """
    symptoms = list(req.symptoms or [])
    if req.patient_record and req.patient_record.symptoms:
        symptoms.extend(req.patient_record.symptoms)

    # Check red flags using Anoushka's red-flag rules
    red_flags = check_red_flags(symptoms)

    # Query RAG retriever for relevant guidelines if query or symptoms present
    guidelines_output = []
    query_text = req.query or (" ".join(symptoms) if symptoms else None)

    if query_text:
        try:
            from backend.rag.retriever import retrieve_guidelines
            docs = retrieve_guidelines(query_text, k=2)
            for doc in docs:
                guidelines_output.append({
                    "content": getattr(doc, "page_content", str(doc)),
                    "metadata": getattr(doc, "metadata", {}),
                })
        except Exception as e:
            logger.warning(f"RAG retrieval skipped or failed: {e}")

    return ProtocolCheckResponse(
        status="success",
        red_flags=red_flags,
        guidelines=guidelines_output,
        count=len(guidelines_output)
    )


@app.post("/scheme-match", response_model=SchemeMatchResponse, tags=["Schemes"])
def scheme_match_endpoint(req: SchemeMatchRequest):
    """
    Evaluate eligibility for government health schemes (PMMVY, JSY, JSSK).
    Integrates with Rohan's scheme rules / agent when available, with deterministic fallback.
    """
    household = req.household_info
    if req.patient_record and req.patient_record.household_info:
        household = req.patient_record.household_info

    try:
        import importlib
        scheme_module = importlib.import_module("backend.rules.schemes")
        if hasattr(scheme_module, "match_schemes"):
            matched = scheme_module.match_schemes(req.patient_record, household)
            return SchemeMatchResponse(status="success", eligible_schemes=matched, count=len(matched))
    except (ImportError, ModuleNotFoundError, AttributeError):
        pass

    matches = _match_schemes_stub(req.patient_record, household)
    return SchemeMatchResponse(
        status="success",
        eligible_schemes=matches,
        count=len(matches),
        notes=["Evaluated via Phase 1 deterministic rule criteria."]
    )


@app.post("/report-generate", response_model=ReportGenerateResponse, tags=["Reporting"])
def report_generate_endpoint(req: ReportGenerateRequest):
    """
    Generate formatted visit summary report and actionable task list for ASHA worker.
    Integrates with Rohan's Report Generator agent when available.
    """
    try:
        import importlib
        rep_agent = importlib.import_module("backend.agents.report_generator")
        if hasattr(rep_agent, "generate_report"):
            res = rep_agent.generate_report(req.patient_record, req.red_flags, req.eligible_schemes)
            return ReportGenerateResponse(
                status="success",
                report=res.get("report", ""),
                tasks=res.get("tasks", []),
                follow_up_required=res.get("follow_up_required", False),
                summary={"source": "agent"}
            )
    except (ImportError, ModuleNotFoundError, AttributeError):
        pass

    result = _generate_report_stub(req.patient_record, req.red_flags or [], req.eligible_schemes or [])
    return ReportGenerateResponse(
        status="success",
        report=result["report"],
        tasks=result["tasks"],
        follow_up_required=result["follow_up_required"],
        summary={"source": "Phase 1 template generator"}
    )


@app.post("/full-pipeline", response_model=FullPipelineResponse, tags=["Orchestration"])
async def full_pipeline_endpoint(request: Request):
    """
    Execute full Phase 1 linear pipeline:
    Transcribe (if audio provided) -> Structure -> Protocol Check -> Scheme Match -> Report Generate.
    Returns complete consolidated JSON response.
    """
    content_type = request.headers.get("content-type", "")
    transcript = ""
    patient_record = None

    if "multipart/form-data" in content_type:
        form = await request.form()
        uploaded_file = form.get("file")
        language = form.get("language", "hi")
        if uploaded_file and hasattr(uploaded_file, "filename"):
            suffix = os.path.splitext(uploaded_file.filename)[1] or ".wav"
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
            try:
                temp_file.write(await uploaded_file.read())
                temp_file.flush()
                temp_file.close()
                asr_res = _run_transcription(temp_file.name, language=str(language))
                transcript = asr_res.get("transcript", "")
            finally:
                if os.path.exists(temp_file.name):
                    try:
                        os.remove(temp_file.name)
                    except OSError:
                        pass
        else:
            transcript = str(form.get("transcript", ""))
    elif "application/json" in content_type:
        body = await request.json()
        transcript = body.get("transcript", "")
        audio_path = body.get("audio_path")
        language = body.get("language", "hi")
        if not transcript and audio_path:
            asr_res = _run_transcription(audio_path, language=str(language))
            transcript = asr_res.get("transcript", "")
        if body.get("patient_record"):
            patient_record = MedicalRecord(**body["patient_record"])
    else:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Content-Type must be multipart/form-data or application/json."
        )

    # 1. Structure
    if not patient_record:
        patient_record = _structure_transcript_stub(transcript or "No audio transcript recorded.")

    # 2. Protocol Check
    symptoms = list(patient_record.symptoms or [])
    red_flags = check_red_flags(symptoms)

    guidelines = []
    if symptoms or transcript:
        try:
            from backend.rag.retriever import retrieve_guidelines
            docs = retrieve_guidelines(" ".join(symptoms) if symptoms else transcript, k=2)
            for d in docs:
                guidelines.append({
                    "content": getattr(d, "page_content", str(d)),
                    "metadata": getattr(d, "metadata", {})
                })
        except Exception as e:
            logger.warning(f"RAG retrieval skipped in pipeline: {e}")

    # 3. Scheme Match
    eligible_schemes = _match_schemes_stub(patient_record, patient_record.household_info)

    # 4. Report & Tasks Generate
    report_res = _generate_report_stub(patient_record, red_flags, eligible_schemes)

    return FullPipelineResponse(
        status="success",
        transcript=transcript,
        record=patient_record,
        red_flags=red_flags,
        guidelines=guidelines,
        eligible_schemes=eligible_schemes,
        report=report_res["report"],
        tasks=report_res["tasks"],
    )
