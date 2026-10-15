"""
Excel (.xlsx) Report Generator for ASHA Co-Pilot.
Builds multi-sheet, beautifully styled workbooks using openpyxl:
- Sheet 1: Executive Summary & KPI metrics
- Sheet 2: Patient Master Registry
- Sheet 3: Clinical Visits Log
- Sheet 4: Government Schemes Status
- Sheet 5: Child Immunization Tracker
Includes bold headers, frozen panes, currency/date formats, and auto-adjusted column widths.
"""
import io
from typing import Dict, Any
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter


HEADER_FILL = PatternFill(start_color="16A34A", end_color="16A34A", fill_type="solid")
SUBHEADER_FILL = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")
ZEBRA_FILL = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
WHITE_FILL = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")

CRITICAL_FILL = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")
HIGH_RISK_FILL = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")
STABLE_FILL = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")

HEADER_FONT = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
SUBHEADER_FONT = Font(name="Calibri", size=10, bold=True, color="166534")
TITLE_FONT = Font(name="Calibri", size=14, bold=True, color="0F172A")
REGULAR_FONT = Font(name="Calibri", size=10, color="1E293B")
BOLD_FONT = Font(name="Calibri", size=10, bold=True, color="0F172A")

THIN_BORDER = Border(
    left=Side(style='thin', color='E2E8F0'),
    right=Side(style='thin', color='E2E8F0'),
    top=Side(style='thin', color='E2E8F0'),
    bottom=Side(style='thin', color='E2E8F0')
)


def _style_header_row(ws, row_idx: int, col_count: int):
    for c in range(1, col_count + 1):
        cell = ws.cell(row=row_idx, column=c)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = THIN_BORDER


def _auto_fit_columns(ws):
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            val_str = str(cell.value or '')
            if '\n' in val_str:
                val_str = max(val_str.split('\n'), key=len)
            max_len = max(max_len, len(val_str))
        ws.column_dimensions[col_letter].width = max(max_len + 3, 12)


def generate_comprehensive_excel(data: Dict[str, Any]) -> bytes:
    wb = Workbook()
    
    # -------------------------------------------------------------
    # SHEET 1: EXECUTIVE SUMMARY
    # -------------------------------------------------------------
    ws_summary = wb.active
    ws_summary.title = "Executive Summary"
    ws_summary.views.sheetView[0].showGridLines = True

    # Title Banner
    ws_summary.merge_cells("A1:E1")
    title_cell = ws_summary["A1"]
    title_cell.value = "NATIONAL HEALTH MISSION — ASHA CO-PILOT CLINICAL REPORT"
    title_cell.font = TITLE_FONT
    title_cell.alignment = Alignment(horizontal="left", vertical="center")
    ws_summary.row_dimensions[1].height = 28

    ws_summary["A2"].value = f"Reporting Period: {data['period']['from']} to {data['period']['to']} | Generated: {data['period']['month']}"
    ws_summary["A2"].font = Font(name="Calibri", size=9, italic=True, color="64748B")

    # KPI Table
    ws_summary.cell(row=4, column=1, value="CORE METRIC").font = BOLD_FONT
    ws_summary.cell(row=4, column=2, value="RECORD COUNT").font = BOLD_FONT
    ws_summary.cell(row=4, column=3, value="STATUS / TARGET").font = BOLD_FONT
    _style_header_row(ws_summary, 4, 3)

    metrics = [
        ("Total Household Beneficiaries", data["summary"]["totalPatients"], "Active Roster"),
        ("Critical High-Risk Cases", data["summary"]["criticalPatients"], "Immediate Medical Escalation"),
        ("High-Risk Monitored", data["summary"]["highRiskPatients"], "Weekly Surveillance"),
        ("Total Clinical Visits Conducted", data["summary"]["totalVisits"], "Field Domiciliary"),
        ("Completed Visits", data["summary"]["completedVisits"], f"100% of Scheduled"),
        ("Total Immunization Doses Tracked", data["summary"]["totalImmunizations"], "Child Health"),
        ("Immunization Doses Completed", data["summary"]["completedImmunizations"], "Protected"),
        ("Immunizations Overdue", data["summary"]["overdueImmunizations"], "Catch-up Urgent"),
        ("Government Scheme Enrollments", data["summary"]["schemeEnrollments"], "Social Benefit Transfers"),
    ]

    for idx, (m_label, m_val, m_status) in enumerate(metrics, start=5):
        ws_summary.cell(row=idx, column=1, value=m_label).font = REGULAR_FONT
        c_val = ws_summary.cell(row=idx, column=2, value=m_val)
        c_val.font = BOLD_FONT
        c_val.alignment = Alignment(horizontal="center")
        c_status = ws_summary.cell(row=idx, column=3, value=m_status)
        c_status.font = REGULAR_FONT
        
        fill = ZEBRA_FILL if idx % 2 == 0 else WHITE_FILL
        for c in range(1, 4):
            ws_summary.cell(row=idx, column=c).fill = fill
            ws_summary.cell(row=idx, column=c).border = THIN_BORDER

    # Village Level Breakdown
    v_start = len(metrics) + 7
    ws_summary.cell(row=v_start - 1, column=1, value="CATCHMENT VILLAGE SUMMARY").font = BOLD_FONT
    headers_v = ["Village", "Patients", "Critical", "Visits", "Immunizations", "Imm Coverage Rate"]
    for c_i, h in enumerate(headers_v, start=1):
        ws_summary.cell(row=v_start, column=c_i, value=h)
    _style_header_row(ws_summary, v_start, len(headers_v))

    for idx, v in enumerate(data.get("villages", []), start=v_start + 1):
        ws_summary.cell(row=idx, column=1, value=v["name"]).font = BOLD_FONT
        ws_summary.cell(row=idx, column=2, value=v["patients"]).alignment = Alignment(horizontal="center")
        ws_summary.cell(row=idx, column=3, value=v["critical"]).alignment = Alignment(horizontal="center")
        ws_summary.cell(row=idx, column=4, value=v["visits"]).alignment = Alignment(horizontal="center")
        ws_summary.cell(row=idx, column=5, value=v["immunizations"]).alignment = Alignment(horizontal="center")
        rate_val = f"{v['immunizationRate']}%" if v.get("immunizationRate") is not None else "—"
        c_rate = ws_summary.cell(row=idx, column=6, value=rate_val)
        c_rate.alignment = Alignment(horizontal="center")
        c_rate.font = BOLD_FONT
        
        fill = ZEBRA_FILL if idx % 2 == 0 else WHITE_FILL
        for c in range(1, len(headers_v) + 1):
            ws_summary.cell(row=idx, column=c).fill = fill
            ws_summary.cell(row=idx, column=c).border = THIN_BORDER

    _auto_fit_columns(ws_summary)

    # -------------------------------------------------------------
    # SHEET 2: PATIENTS REGISTRY
    # -------------------------------------------------------------
    ws_patients = wb.create_sheet(title="Patient Registry")
    ws_patients.views.sheetView[0].showGridLines = True
    headers_p = ["Patient ID", "Beneficiary Name", "Age", "Village", "Gestational Stage", "Blood Pressure", "Hemoglobin (g/dL)", "Risk Level", "Contact Phone"]
    for c_i, h in enumerate(headers_p, start=1):
        ws_patients.cell(row=1, column=c_i, value=h)
    _style_header_row(ws_patients, 1, len(headers_p))
    ws_patients.freeze_panes = "A2"

    for idx, p in enumerate(data.get("allPatients", []), start=2):
        ws_patients.cell(row=idx, column=1, value=p["id"]).font = REGULAR_FONT
        ws_patients.cell(row=idx, column=2, value=p["name"]).font = BOLD_FONT
        ws_patients.cell(row=idx, column=3, value=p["age"]).alignment = Alignment(horizontal="center")
        ws_patients.cell(row=idx, column=4, value=p["village"]).font = REGULAR_FONT
        ws_patients.cell(row=idx, column=5, value=p["trimester"] or "1st Trimester").font = REGULAR_FONT
        ws_patients.cell(row=idx, column=6, value=p["bp"]).alignment = Alignment(horizontal="center")
        ws_patients.cell(row=idx, column=7, value=p["hemoglobin"]).alignment = Alignment(horizontal="center")
        
        c_risk = ws_patients.cell(row=idx, column=8, value=p["status"].upper())
        c_risk.alignment = Alignment(horizontal="center")
        c_risk.font = BOLD_FONT
        if p["status"] == "critical":
            c_risk.fill = CRITICAL_FILL
        elif p["status"] == "high-risk":
            c_risk.fill = HIGH_RISK_FILL
        else:
            c_risk.fill = STABLE_FILL

        ws_patients.cell(row=idx, column=9, value=p["phone"]).font = REGULAR_FONT

        for c in range(1, len(headers_p) + 1):
            if c != 8:
                ws_patients.cell(row=idx, column=c).fill = ZEBRA_FILL if idx % 2 == 0 else WHITE_FILL
            ws_patients.cell(row=idx, column=c).border = THIN_BORDER

    _auto_fit_columns(ws_patients)

    # -------------------------------------------------------------
    # SHEET 3: VISITS LOG
    # -------------------------------------------------------------
    ws_visits = wb.create_sheet(title="Visits Log")
    ws_visits.views.sheetView[0].showGridLines = True
    headers_v = ["Visit ID", "Patient ID", "Beneficiary Name", "Village", "Date", "Status", "Clinical Surveillance Notes"]
    for c_i, h in enumerate(headers_v, start=1):
        ws_visits.cell(row=1, column=c_i, value=h)
    _style_header_row(ws_visits, 1, len(headers_v))
    ws_visits.freeze_panes = "A2"

    for idx, v in enumerate(data.get("allVisits", []), start=2):
        ws_visits.cell(row=idx, column=1, value=v.get("id", "—")).font = REGULAR_FONT
        ws_visits.cell(row=idx, column=2, value=v.get("patientId", "—")).font = REGULAR_FONT
        ws_visits.cell(row=idx, column=3, value=v.get("patientName", "Beneficiary")).font = BOLD_FONT
        ws_visits.cell(row=idx, column=4, value=v.get("village", "Ramnagar")).font = REGULAR_FONT
        ws_visits.cell(row=idx, column=5, value=v.get("date", "—")).alignment = Alignment(horizontal="center")
        
        c_st = ws_visits.cell(row=idx, column=6, value=v.get("status", "completed").upper())
        c_st.alignment = Alignment(horizontal="center")
        c_st.font = BOLD_FONT
        if v.get("status") == "completed":
            c_st.fill = STABLE_FILL
        else:
            c_st.fill = HIGH_RISK_FILL

        ws_visits.cell(row=idx, column=7, value=v.get("notes", "Routine checkup")).font = REGULAR_FONT

        for c in range(1, len(headers_v) + 1):
            if c != 6:
                ws_visits.cell(row=idx, column=c).fill = ZEBRA_FILL if idx % 2 == 0 else WHITE_FILL
            ws_visits.cell(row=idx, column=c).border = THIN_BORDER

    _auto_fit_columns(ws_visits)

    # -------------------------------------------------------------
    # SHEET 4: IMMUNIZATION TRACKER
    # -------------------------------------------------------------
    ws_imms = wb.create_sheet(title="Immunizations")
    ws_imms.views.sheetView[0].showGridLines = True
    headers_im = ["Record ID", "Child / Beneficiary", "Vaccine Name", "Dose #", "Village", "Due Date", "Given Date", "Status"]
    for c_i, h in enumerate(headers_im, start=1):
        ws_imms.cell(row=1, column=c_i, value=h)
    _style_header_row(ws_imms, 1, len(headers_im))
    ws_imms.freeze_panes = "A2"

    for idx, im in enumerate(data.get("allImmunizations", []), start=2):
        ws_imms.cell(row=idx, column=1, value=im["id"]).font = REGULAR_FONT
        ws_imms.cell(row=idx, column=2, value=im["childName"]).font = BOLD_FONT
        ws_imms.cell(row=idx, column=3, value=im["vaccine"]).font = REGULAR_FONT
        ws_imms.cell(row=idx, column=4, value=im["doseNumber"]).alignment = Alignment(horizontal="center")
        ws_imms.cell(row=idx, column=5, value=im["village"]).font = REGULAR_FONT
        ws_imms.cell(row=idx, column=6, value=im["dueDate"]).alignment = Alignment(horizontal="center")
        ws_imms.cell(row=idx, column=7, value=im["givenDate"]).alignment = Alignment(horizontal="center")
        
        c_st = ws_imms.cell(row=idx, column=8, value=im["status"].upper())
        c_st.alignment = Alignment(horizontal="center")
        c_st.font = BOLD_FONT
        if im["status"] == "completed":
            c_st.fill = STABLE_FILL
        elif im["status"] == "overdue":
            c_st.fill = CRITICAL_FILL
        else:
            c_st.fill = HIGH_RISK_FILL

        for c in range(1, len(headers_im) + 1):
            if c != 8:
                ws_imms.cell(row=idx, column=c).fill = ZEBRA_FILL if idx % 2 == 0 else WHITE_FILL
            ws_imms.cell(row=idx, column=c).border = THIN_BORDER

    _auto_fit_columns(ws_imms)

    # -------------------------------------------------------------
    # SHEET 5: GOVERNMENT SCHEMES
    # -------------------------------------------------------------
    ws_schemes = wb.create_sheet(title="Schemes Audit")
    ws_schemes.views.sheetView[0].showGridLines = True
    headers_s = ["Scheme Code", "Scheme Full Title", "Statutory Benefit (₹)", "Enrolled", "Eligible (Pending)", "Missing Docs Count", "Disbursed Total (₹)", "Potential Value (₹)"]
    for c_i, h in enumerate(headers_s, start=1):
        ws_schemes.cell(row=1, column=c_i, value=h)
    _style_header_row(ws_schemes, 1, len(headers_s))
    ws_schemes.freeze_panes = "A2"

    for idx, s in enumerate(data.get("schemes", []), start=2):
        ws_schemes.cell(row=idx, column=1, value=s["name"]).font = BOLD_FONT
        ws_schemes.cell(row=idx, column=2, value=s["fullName"]).font = REGULAR_FONT
        c_amt = ws_schemes.cell(row=idx, column=3, value=s["benefitAmount"])
        c_amt.number_format = '₹#,##0'
        c_amt.alignment = Alignment(horizontal="right")

        ws_schemes.cell(row=idx, column=4, value=s["enrolled"]).alignment = Alignment(horizontal="center")
        ws_schemes.cell(row=idx, column=5, value=s["eligible"]).alignment = Alignment(horizontal="center")
        ws_schemes.cell(row=idx, column=6, value=s["missingDocs"]).alignment = Alignment(horizontal="center")

        c_disb = ws_schemes.cell(row=idx, column=7, value=s["disbursedAmount"])
        c_disb.number_format = '₹#,##0'
        c_disb.alignment = Alignment(horizontal="right")
        c_disb.font = BOLD_FONT

        c_pot = ws_schemes.cell(row=idx, column=8, value=s["potentialAmount"])
        c_pot.number_format = '₹#,##0'
        c_pot.alignment = Alignment(horizontal="right")

        for c in range(1, len(headers_s) + 1):
            ws_schemes.cell(row=idx, column=c).fill = ZEBRA_FILL if idx % 2 == 0 else WHITE_FILL
            ws_schemes.cell(row=idx, column=c).border = THIN_BORDER

    _auto_fit_columns(ws_schemes)

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()
