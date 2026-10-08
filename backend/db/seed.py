from datetime import date, timedelta
from sqlmodel import Session, select

from backend.db.models import AppNotification, Immunization, Patient, SchemeEnrollment, Visit


def seed_if_empty(session: Session) -> None:
    if session.exec(select(Patient)).first():
        return

    patients = [
        Patient(
            id="p1", name="Lakshmi Devi", age=24, village="Ramnagar", phone="+91 98765 43210",
            status="critical", trimester="3rd", lmp_date="2025-01-15", gravida=2, para=1,
            risk_factors=["Gestational diabetes", "Previous C-section", "Anemia"],
            last_visit="2026-09-20", next_visit="2026-09-28", blood_group="B+", weight=68.5,
            bp="140/90", hemoglobin=8.2, bpl_card=True, jsy_registered=True, pmjay_eligible=True,
            income_category="BPL", children_count=1, first_living_child=False,
        ),
        Patient(
            id="p2", name="Sunita Kumari", age=28, village="Basantpur", phone="+91 98765 43211",
            status="high-risk", trimester="2nd", lmp_date="2025-05-20", gravida=3, para=2,
            risk_factors=["Hypertension", "Advanced maternal age"],
            last_visit="2026-09-22", next_visit="2026-10-05", blood_group="O+", weight=62.0,
            bp="130/85", hemoglobin=10.5, bpl_card=True, jsy_registered=True,
            income_category="BPL", children_count=2, first_living_child=False,
        ),
        Patient(
            id="p3", name="Priya Sharma", age=22, village="Ramnagar", phone="+91 98765 43212",
            status="stable", trimester="1st", lmp_date="2025-08-10", gravida=1, para=0,
            risk_factors=["Mild anemia"],
            last_visit="2026-09-25", next_visit="2026-10-10", blood_group="A+", weight=55.0,
            bp="118/75", hemoglobin=11.0, bpl_card=True, income_category="BPL",
            children_count=0, first_living_child=True,
        ),
        Patient(
            id="p4", name="Geeta Yadav", age=26, village="Khusrupur", phone="+91 98765 43213",
            status="routine", trimester="Postnatal", lmp_date="2025-11-01", gravida=2, para=2,
            risk_factors=[], last_visit="2026-09-24", next_visit="2026-10-02",
            blood_group="AB+", weight=58.0, bp="115/72", hemoglobin=12.5,
            bpl_card=True, jsy_registered=True, income_category="BPL",
            children_count=2, first_living_child=False,
        ),
        Patient(
            id="p5", name="Anita Prasad", age=30, village="Basantpur", phone="+91 98765 43214",
            status="high-risk", trimester="2nd", lmp_date="2025-06-05", gravida=4, para=3,
            risk_factors=["Previous stillbirth", "Thyroid disorder"],
            last_visit="2026-09-18", next_visit="2026-09-29", blood_group="B-", weight=65.0,
            bp="125/80", hemoglobin=9.8, bpl_card=False, income_category="APL",
            children_count=3, first_living_child=False,
        ),
        Patient(
            id="p6", name="Rina Kumari", age=19, village="Khusrupur", phone="+91 98765 43215",
            status="stable", trimester="1st", lmp_date="2025-09-01", gravida=1, para=0,
            risk_factors=["Young maternal age"], last_visit="2026-09-26", next_visit="2026-10-12",
            blood_group="O-", weight=48.0, bp="110/70", hemoglobin=11.5,
            bpl_card=True, income_category="BPL", children_count=0, first_living_child=True,
        ),
    ]
    for p in patients:
        session.add(p)

    visits = [
        Visit(id="v1", patient_id="p1", patient_name="Lakshmi Devi", village="Ramnagar", time="09:00", date="2026-09-28", status="completed", type="ANC Check-up (3rd Trimester)", notes="BP elevated. Advised rest and low-salt diet. Referred to PHC for glucose test.", trimester="3rd", confirmed=True),
        Visit(id="v2", patient_id="p3", patient_name="Priya Sharma", village="Ramnagar", time="10:30", date="2026-09-28", status="completed", type="ANC Registration", notes="First ANC visit. Registered. IFA tablets distributed.", trimester="1st", confirmed=True),
        Visit(id="v3", patient_id="p6", patient_name="Rina Kumari", village="Khusrupur", time="12:00", date="2026-09-28", status="scheduled", type="ANC Check-up (1st Trimester)", trimester="1st"),
        Visit(id="v4", patient_id="p5", patient_name="Anita Prasad", village="Basantpur", time="14:00", date="2026-09-28", status="scheduled", type="High-Risk Follow-up", trimester="2nd"),
        Visit(id="v5", patient_id="p4", patient_name="Geeta Yadav", village="Khusrupur", time="15:30", date="2026-09-28", status="scheduled", type="Postnatal Visit", trimester="Postnatal"),
        Visit(id="v6", patient_id="p2", patient_name="Sunita Kumari", village="Basantpur", time="16:30", date="2026-09-28", status="pending", type="BP Monitoring", trimester="2nd"),
        Visit(id="u1", patient_id="p1", patient_name="Lakshmi Devi", village="Ramnagar", time="09:00", date="2026-09-30", status="scheduled", type="ANC Check-up (3rd Trimester)", trimester="3rd"),
        Visit(id="u2", patient_id="p2", patient_name="Sunita Kumari", village="Basantpur", time="11:00", date="2026-10-05", status="scheduled", type="ANC Check-up (2nd Trimester)", trimester="2nd"),
        Visit(id="u3", patient_id="p4", patient_name="Geeta Yadav", village="Khusrupur", time="10:00", date="2026-10-02", status="scheduled", type="Postnatal Follow-up", trimester="Postnatal"),
        Visit(id="u4", patient_id="p5", patient_name="Anita Prasad", village="Basantpur", time="14:00", date="2026-10-03", status="scheduled", type="Thyroid Panel Review", trimester="2nd"),
    ]
    for v in visits:
        session.add(v)

    imms = [
        Immunization(id="i1", patient_name="Lakshmi Devi", patient_id="p1", vaccine="Td", dose_number=2, due_date="2026-09-25", status="overdue", age_group="Pregnant", village="Ramnagar"),
        Immunization(id="i2", patient_name="Sunita Kumari", patient_id="p2", vaccine="Td", dose_number=1, due_date="2026-09-30", status="due", age_group="Pregnant", village="Basantpur"),
        Immunization(id="i3", patient_name="Priya Sharma", patient_id="p3", vaccine="Td", dose_number=1, due_date="2026-10-05", status="upcoming", age_group="Pregnant", village="Ramnagar"),
        Immunization(id="i4", patient_name="Rina Kumari", patient_id="p6", vaccine="Td", dose_number=1, due_date="2026-10-10", status="upcoming", age_group="Pregnant", village="Khusrupur"),
        Immunization(id="i5", patient_name="Geeta Yadav - Baby", patient_id="p4", vaccine="BCG", dose_number=1, due_date="2026-09-20", status="completed", age_group="Newborn", village="Khusrupur"),
        Immunization(id="i6", patient_name="Geeta Yadav - Baby", patient_id="p4", vaccine="OPV-0", dose_number=1, due_date="2026-09-20", status="completed", age_group="Newborn", village="Khusrupur"),
        Immunization(id="i7", patient_name="Geeta Yadav - Baby", patient_id="p4", vaccine="Hep-B", dose_number=1, due_date="2026-09-20", status="completed", age_group="Newborn", village="Khusrupur"),
        Immunization(id="i8", patient_name="Geeta Yadav - Baby", patient_id="p4", vaccine="Pentavalent", dose_number=1, due_date="2026-10-04", status="upcoming", age_group="6 weeks", village="Khusrupur"),
        Immunization(id="i9", patient_name="Anita Prasad", patient_id="p5", vaccine="Td", dose_number=2, due_date="2026-09-28", status="due", age_group="Pregnant", village="Basantpur"),
        Immunization(id="i10", patient_name="Lakshmi Devi", patient_id="p1", vaccine="Td", dose_number=1, due_date="2026-08-28", status="completed", age_group="Pregnant", village="Ramnagar"),
    ]
    for i in imms:
        session.add(i)

    enrollments = [
        ("p1", "jsy", "enrolled", "2026-01-20", "Rs. 1,400", []),
        ("p1", "pmmvy", "eligible", None, None, []),
        ("p1", "pmjay", "enrolled", "2026-01-18", "Active - Rs. 5L cover", []),
        ("p1", "ifa", "enrolled", "2026-01-15", None, []),
        ("p1", "jssk", "enrolled", "2026-01-15", None, []),
        ("p2", "jsy", "enrolled", "2026-05-25", "Rs. 1,400", []),
        ("p2", "pmmvy", "pending-docs", None, None, ["Bank Passbook", "Anganwadi Registration"]),
        ("p2", "ifa", "enrolled", "2026-05-22", None, []),
        ("p3", "jsy", "eligible", None, None, []),
        ("p3", "pmmvy", "eligible", None, None, []),
        ("p3", "ifa", "enrolled", "2026-08-12", None, []),
        ("p3", "jssk", "enrolled", "2026-08-12", None, []),
        ("p4", "jsy", "enrolled", "2025-11-05", "Rs. 1,400", []),
        ("p4", "pmmvy", "not-eligible", None, None, []),
        ("p4", "ifa", "enrolled", "2025-11-05", None, []),
        ("p4", "jssk", "enrolled", "2025-11-05", None, []),
        ("p5", "jsy", "enrolled", "2026-06-08", "Rs. 1,400", []),
        ("p5", "pmmvy", "not-eligible", None, None, []),
        ("p5", "ifa", "enrolled", "2026-06-08", None, []),
        ("p5", "jssk", "enrolled", "2026-06-08", None, []),
        ("p6", "jsy", "eligible", None, None, []),
        ("p6", "pmmvy", "eligible", None, None, []),
        ("p6", "ifa", "enrolled", "2026-09-02", None, []),
        ("p2", "jssk", "enrolled", "2026-05-22", None, []),
        ("p1", "thali", "eligible", None, None, []),
        ("p3", "thali", "pending-docs", None, None, ["BPL Card"]),
        ("p6", "thali", "eligible", None, None, []),
        ("p4", "pmjay", "eligible", None, None, []),
        ("p5", "pmjay", "pending-docs", None, None, ["PMJAY Golden Card"]),
    ]
    for pid, sid, st, ed, br, docs in enrollments:
        session.add(SchemeEnrollment(patient_id=pid, scheme_id=sid, status=st, enrolled_date=ed, benefit_received=br, missing_docs=docs))

    notes = [
        AppNotification(id="n1", title="Critical: Lakshmi Devi", message="BP 140/90 with gestational diabetes. Needs immediate PHC referral.", type="alert", time="5 min ago", read=False),
        AppNotification(id="n2", title="Immunization Overdue", message="Lakshmi Devi - Td dose 2 overdue by 3 days.", type="alert", time="1 hour ago", read=False),
        AppNotification(id="n3", title="Visit Reminder", message="Anita Prasad visit at 2:00 PM today - High-risk follow-up.", type="reminder", time="2 hours ago", read=False),
        AppNotification(id="n4", title="Scheme Enrollment", message="Priya Sharma is eligible for PMMVY. Documents needed: Bank Passbook.", type="info", time="3 hours ago", read=True),
        AppNotification(id="n5", title="Training Completed", message="You completed ANC Check-up Protocol.", type="success", time="Yesterday", read=True),
        AppNotification(id="n6", title="New Patient Registered", message="Rina Kumari registered at Khusrupur Anganwadi.", type="info", time="Yesterday", read=True),
    ]
    for n in notes:
        session.add(n)

    session.commit()


def refresh_demo_calendar(session: Session) -> None:
    """Keep seeded demo visits/immunizations aligned with today's date."""
    today = date.today()
    visit_dates = {
        "v1": today,
        "v2": today,
        "v3": today,
        "v4": today,
        "v5": today,
        "v6": today,
        "u1": today + timedelta(days=2),
        "u2": today + timedelta(days=5),
        "u3": today + timedelta(days=2),
        "u4": today + timedelta(days=3),
    }
    for vid, d in visit_dates.items():
        row = session.get(Visit, vid)
        if row:
            row.date = d.isoformat()
            session.add(row)

    imm_dates = {
        "i1": today - timedelta(days=5),
        "i2": today,
        "i3": today + timedelta(days=5),
        "i4": today + timedelta(days=10),
        "i5": today - timedelta(days=10),
        "i6": today - timedelta(days=10),
        "i7": today - timedelta(days=10),
        "i8": today + timedelta(days=4),
        "i9": today,
        "i10": today - timedelta(days=30),
    }
    for iid, d in imm_dates.items():
        row = session.get(Immunization, iid)
        if row:
            row.due_date = d.isoformat()
            session.add(row)

    next_visits = {
        "p1": today.isoformat(),
        "p2": (today + timedelta(days=5)).isoformat(),
        "p3": (today + timedelta(days=12)).isoformat(),
        "p4": (today + timedelta(days=2)).isoformat(),
        "p5": (today + timedelta(days=1)).isoformat(),
        "p6": (today + timedelta(days=12)).isoformat(),
    }
    for pid, nd in next_visits.items():
        p = session.get(Patient, pid)
        if p:
            p.next_visit = nd
            session.add(p)
    session.commit()
