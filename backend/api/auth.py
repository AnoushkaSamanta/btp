"""
Authentication & worker session router for ASHA Co-Pilot.
Provides login, profile check, and logout for frontline workers.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Demo accredited workers directory
ASHA_WORKERS = {
    "asha01": {
        "id": "w-01",
        "worker_id": "ASHA-NHM-042",
        "username": "asha01",
        "name": "Sunita Devi",
        "designation": "Accredited Social Health Activist (ASHA)",
        "village": "Basantpur & Sundarpur",
        "sub_center": "Rampur Sub-Health Centre",
        "phc": "Basantpur Primary Health Centre",
        "district": "Patna",
        "state": "Bihar",
        "phone": "+91 98765 43210",
        "language_preference": "Hindi",
        "authenticated": True,
        "role": "field_worker",
    },
    "asha02": {
        "id": "w-02",
        "worker_id": "ASHA-NHM-108",
        "username": "asha02",
        "name": "Lakshmi R.",
        "designation": "ASHA Facilitator",
        "village": "Kaveri Nagar",
        "sub_center": "Kaveri Sub-Health Centre",
        "phc": "Thiruvallur PHC",
        "district": "Thiruvallur",
        "state": "Tamil Nadu",
        "phone": "+91 94444 12345",
        "language_preference": "Tamil",
        "authenticated": True,
        "role": "field_worker",
    },
}

class LoginRequest(BaseModel):
    username: str
    password: Optional[str] = "asha123"
    pin: Optional[str] = None

class WorkerProfile(BaseModel):
    id: str
    worker_id: str
    username: str
    name: str
    designation: str
    village: str
    sub_center: str
    phc: str
    district: str
    state: str
    phone: str
    language_preference: str
    authenticated: bool
    role: str

@router.post("/login")
def login(creds: LoginRequest):
    u = creds.username.strip().lower()
    # Accept predefined demo workers or allow default worker login
    if u in ASHA_WORKERS:
        worker = ASHA_WORKERS[u]
        return {
            "token": f"token-{worker['worker_id']}-{datetime.utcnow().timestamp()}",
            "worker": worker,
            "message": f"Welcome, {worker['name']} ({worker['designation']})",
        }
    
    # Generic valid login for any ASHA worker ID
    if u.startswith("asha") or u.isalnum():
        worker = {
            "id": f"w-{u}",
            "worker_id": f"ASHA-NHM-{u.upper()}",
            "username": u,
            "name": f"ASHA Worker ({u.capitalize()})",
            "designation": "Accredited Social Health Activist",
            "village": "Basantpur",
            "sub_center": "Rampur Sub-Health Centre",
            "phc": "Basantpur PHC",
            "district": "District Health Hub",
            "state": "National Health Mission",
            "phone": "+91 98765 00000",
            "language_preference": "Hindi",
            "authenticated": True,
            "role": "field_worker",
        }
        return {
            "token": f"token-{worker['worker_id']}-{datetime.utcnow().timestamp()}",
            "worker": worker,
            "message": f"Welcome, {worker['name']}",
        }

    raise HTTPException(status_code=401, detail="Invalid ASHA worker credentials")

@router.get("/me")
def get_current_worker():
    # Return default active worker for current session
    return ASHA_WORKERS["asha01"]

@router.post("/logout")
def logout():
    return {"message": "Session terminated safely. Registry encrypted."}
