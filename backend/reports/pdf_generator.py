"""
Professional PDF Report Generator using ReportLab.
Produces official, beautifully formatted government-grade PDFs:
1. Monthly Summary (Cover banner, Executive KPIs, Embedded Charts, Top Patients, Critical cases, Schemes)
2. Patient Registry (Color-coded risk status, clinical measurements, village filters)
3. Immunization Log (Child, vaccine, status badges, village rates)
4. Village-wise Report (Structured per village, high-risk breakdowns, comparisons)
5. Scheme Report (Enrolled, pending, missing docs audit, DBT metrics)
"""
import io
from datetime import datetime
from typing import Dict, Any, List

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

from backend.reports.chart_generator import (
    create_monthly_activity_chart,
    create_village_pie_chart,
    create_trend_line_chart,
    create_scheme_progress_chart
)


class NumberedCanvas(canvas.Canvas):
    """Custom canvas to compute total pages and stamp professional headers and footers."""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#16a34a"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(40, 812, "NATIONAL HEALTH MISSION — ASHA CO-PILOT CLINICAL DOSSIER")
            self.setFont("Helvetica", 7.5)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawRightString(555, 812, "MoHFW / NHM FIELD SURVEILLANCE")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.7)
            self.line(40, 806, 555, 806)

        # Footer
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.7)
        self.line(40, 36, 555, 36)
        
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748B"))
        gen_date = "Oct 13, 2026"
        self.drawString(40, 24, f"Generated on {gen_date} | Confidential Medical Record — ASHA Co-Pilot")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(555, 24, page_text)
        self.restoreState()


def _get_styles():
    styles = getSampleStyleSheet()
    
    styles.add(ParagraphStyle(
        name="DocTitle",
        fontName="Helvetica-Bold",
        fontSize=17,
        leading=21,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=3,
    ))
    styles.add(ParagraphStyle(
        name="DocSubtitle",
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#475569"),
        spaceAfter=10,
    ))
    styles.add(ParagraphStyle(
        name="SectionHeading",
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#16a34a"),
        spaceBefore=10,
        spaceAfter=5,
    ))
    styles.add(ParagraphStyle(
        name="TableHeader",
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=1,
    ))
    styles.add(ParagraphStyle(
        name="TableCell",
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#1E293B"),
    ))
    styles.add(ParagraphStyle(
        name="TableCellBold",
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#0F172A"),
    ))
    styles.add(ParagraphStyle(
        name="TableCellCenter",
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#1E293B"),
        alignment=1,
    ))
    styles.add(ParagraphStyle(
        name="KpiLabel",
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#475569"),
        alignment=1,
    ))
    styles.add(ParagraphStyle(
        name="KpiVal",
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=18,
        textColor=colors.HexColor("#16a34a"),
        alignment=1,
    ))
    return styles


def _build_cover_banner(styles, title: str, subtitle: str, period_str: str, worker: str = "Rekha Singh", village: str = "Ramnagar & Catchment") -> List[Any]:
    banner_data = [
        [
            Paragraph("<b>ASHA CO-PILOT · NATIONAL HEALTH MISSION</b><br/><font size=7 color='#15803d'>Ministry of Health & Family Welfare · Government of India</font>", styles["TableCell"]),
            Paragraph(f"<b>Generated On:</b> Oct 13, 2026<br/><font size=7 color='#64748B'>Date Range: {period_str}</font>", ParagraphStyle('RAlign', parent=styles["TableCell"], alignment=2)),
        ],
        [
            Paragraph(f"<b>ASHA Worker:</b> {worker} &nbsp;|&nbsp; <b>Assigned Area:</b> {village}", ParagraphStyle('MetaSub', parent=styles["TableCell"], fontSize=7.5, textColor=colors.HexColor("#334155"))),
            Paragraph("<b>Surveillance Status:</b> Active Operational", ParagraphStyle('RAlign2', parent=styles["TableCell"], fontSize=7.5, alignment=2, textColor=colors.HexColor("#16a34a"))),
        ]
    ]
    t = Table(banner_data, colWidths=[4.2 * inch, 2.9 * inch])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))

    return [
        t,
        HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#16a34a"), spaceAfter=8, spaceBefore=4),
        Paragraph(title, styles["DocTitle"]),
        Paragraph(subtitle, styles["DocSubtitle"]),
        Spacer(1, 6),
    ]


# -----------------------------------------------------------------------------
# 1. MONTHLY SUMMARY REPORT
# -----------------------------------------------------------------------------
def build_monthly_summary_pdf(data: Dict[str, Any]) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=40, rightMargin=40, topMargin=45, bottomMargin=45)
    styles = _get_styles()
    story = []

    period_str = f"{data['period']['from']} to {data['period']['to']}"
    story.extend(_build_cover_banner(
        styles,
        "MONTHLY CLINICAL SURVEILLANCE & PERFORMANCE DOSSIER",
        "Official primary health summary detailing domiciliary visits, maternal risks, child immunizations, and welfare scheme delivery.",
        period_str
    ))

    # Executive KPI Cards Table
    s = data["summary"]
    kpis = [
        [
            Paragraph(str(s["totalVisits"]), styles["KpiVal"]),
            Paragraph(str(s["totalPatients"]), styles["KpiVal"]),
            Paragraph(str(s["criticalPatients"] + s["highRiskPatients"]), ParagraphStyle('CritKpi', parent=styles["KpiVal"], textColor=colors.HexColor("#E11D48"))),
            Paragraph(str(s["completedImmunizations"]), ParagraphStyle('ImmKpi', parent=styles["KpiVal"], textColor=colors.HexColor("#10B981"))),
            Paragraph(str(s["schemeEnrollments"]), ParagraphStyle('SchKpi', parent=styles["KpiVal"], textColor=colors.HexColor("#8B5CF6"))),
        ],
        [
            Paragraph("Total Field Visits", styles["KpiLabel"]),
            Paragraph("Household Roster", styles["KpiLabel"]),
            Paragraph("High Risk Cases", styles["KpiLabel"]),
            Paragraph("Immunizations Given", styles["KpiLabel"]),
            Paragraph("Schemes Enrolled", styles["KpiLabel"]),
        ]
    ]
    kpi_table = Table(kpis, colWidths=[1.4 * inch] * 5)
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 14))

    # Charts Section
    story.append(Paragraph("1. Longitudinal Performance & Village Distribution", styles["SectionHeading"]))
    chart1_bytes = create_monthly_activity_chart(data.get("monthlySeries", []))
    chart2_bytes = create_village_pie_chart(data.get("villages", []))

    img1 = Image(io.BytesIO(chart1_bytes), width=4.3 * inch, height=1.9 * inch)
    img2 = Image(io.BytesIO(chart2_bytes), width=2.6 * inch, height=1.9 * inch)

    charts_table = Table([[img1, img2]], colWidths=[4.4 * inch, 2.7 * inch])
    charts_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    story.append(charts_table)
    story.append(Spacer(1, 12))

    # Trend Line Chart
    chart3_bytes = create_trend_line_chart(data.get("monthlySeries", []))
    img3 = Image(io.BytesIO(chart3_bytes), width=7.1 * inch, height=1.9 * inch)
    story.append(img3)
    story.append(Spacer(1, 14))

    # Critical Cases Table
    story.append(Paragraph("2. Critical & High-Risk Case Roster (Urgent Follow-Up Required)", styles["SectionHeading"]))
    crit_rows = [[
        Paragraph("Patient ID", styles["TableHeader"]),
        Paragraph("Beneficiary Name", styles["TableHeader"]),
        Paragraph("Village", styles["TableHeader"]),
        Paragraph("Blood Pressure", styles["TableHeader"]),
        Paragraph("Clinical Flags / Risk Factors", styles["TableHeader"]),
        Paragraph("Status", styles["TableHeader"]),
    ]]
    for p in data.get("criticalCases", [])[:8]:
        crit_rows.append([
            Paragraph(p["id"], styles["TableCellCenter"]),
            Paragraph(p["name"], styles["TableCellBold"]),
            Paragraph(p["village"], styles["TableCellCenter"]),
            Paragraph(p["bp"], styles["TableCellCenter"]),
            Paragraph(", ".join(p["riskFactors"]), styles["TableCell"]),
            Paragraph(p["status"].upper(), ParagraphStyle('C', parent=styles["TableCellCenter"], textColor=colors.HexColor("#E11D48"), fontName="Helvetica-Bold")),
        ])
    if len(crit_rows) == 1:
        crit_rows.append([Paragraph("No critical cases flagged in this observation cycle.", styles["TableCell"]) for _ in range(6)])

    t_crit = Table(crit_rows, colWidths=[0.9*inch, 1.4*inch, 1.1*inch, 1.0*inch, 1.7*inch, 1.0*inch])
    t_crit.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0284C7")),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_crit)
    story.append(Spacer(1, 14))

    # Village-wise breakdown table
    story.append(Paragraph("3. Village-wise Catchment Breakdown", styles["SectionHeading"]))
    v_rows = [[
        Paragraph("Village", styles["TableHeader"]),
        Paragraph("Total Patients", styles["TableHeader"]),
        Paragraph("Critical", styles["TableHeader"]),
        Paragraph("High Risk", styles["TableHeader"]),
        Paragraph("Visits", styles["TableHeader"]),
        Paragraph("Immunizations", styles["TableHeader"]),
        Paragraph("Coverage Rate", styles["TableHeader"]),
    ]]
    for v in data.get("villages", []):
        v_rows.append([
            Paragraph(v["name"], styles["TableCellBold"]),
            Paragraph(str(v["patients"]), styles["TableCellCenter"]),
            Paragraph(str(v["critical"]), ParagraphStyle('Vc', parent=styles["TableCellCenter"], textColor=colors.HexColor("#E11D48"), fontName="Helvetica-Bold")),
            Paragraph(str(v["highRisk"]), ParagraphStyle('Vh', parent=styles["TableCellCenter"], textColor=colors.HexColor("#D97706"))),
            Paragraph(str(v["visits"]), styles["TableCellCenter"]),
            Paragraph(str(v["immunizations"]), styles["TableCellCenter"]),
            Paragraph(f"{v['immunizationRate']}%", ParagraphStyle('Vr', parent=styles["TableCellCenter"], textColor=colors.HexColor("#16a34a"), fontName="Helvetica-Bold")),
        ])
    t_v = Table(v_rows, colWidths=[1.3*inch, 0.9*inch, 0.8*inch, 0.9*inch, 0.9*inch, 1.1*inch, 1.2*inch])
    t_v.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#16a34a")),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_v)
    story.append(Spacer(1, 14))

    # Top 10 Patients by Visits
    story.append(Paragraph("4. Top Beneficiaries by Clinical Contact Volume", styles["SectionHeading"]))
    top_rows = [[
        Paragraph("ID", styles["TableHeader"]),
        Paragraph("Beneficiary Name", styles["TableHeader"]),
        Paragraph("Village", styles["TableHeader"]),
        Paragraph("Risk Status", styles["TableHeader"]),
        Paragraph("Trimester / Stage", styles["TableHeader"]),
        Paragraph("Field Visits", styles["TableHeader"]),
    ]]
    for p in data.get("topPatients", [])[:10]:
        st_color = "#E11D48" if p.get("status") == "critical" else "#D97706" if p.get("status") == "high-risk" else "#16a34a"
        top_rows.append([
            Paragraph(p.get("id", "—"), styles["TableCellCenter"]),
            Paragraph(p.get("name", "—"), styles["TableCellBold"]),
            Paragraph(p.get("village", "—"), styles["TableCellCenter"]),
            Paragraph(p.get("status", "stable").upper(), ParagraphStyle('Tp', parent=styles["TableCellCenter"], textColor=colors.HexColor(st_color), fontName="Helvetica-Bold")),
            Paragraph(p.get("trimester") or "1st Trimester", styles["TableCellCenter"]),
            Paragraph(str(p.get("visits", 0)), styles["TableCellCenter"]),
        ])
    if len(top_rows) == 1:
        top_rows.append([Paragraph("No visit records found.", styles["TableCell"]) for _ in range(6)])

    t_top = Table(top_rows, colWidths=[0.9*inch, 1.8*inch, 1.3*inch, 1.1*inch, 1.1*inch, 0.9*inch])
    t_top.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#16a34a")),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_top)
    story.append(Spacer(1, 14))

    # Government Scheme Delivery Table
    story.append(Paragraph("5. Government Scheme Penetration & Direct Benefit Transfer Audit", styles["SectionHeading"]))
    scheme_rows = [[
        Paragraph("Scheme", styles["TableHeader"]),
        Paragraph("Full Title", styles["TableHeader"]),
        Paragraph("Enrolled", styles["TableHeader"]),
        Paragraph("Pending", styles["TableHeader"]),
        Paragraph("Missing Docs", styles["TableHeader"]),
        Paragraph("Disbursed Total (₹)", styles["TableHeader"]),
    ]]
    for sc in data.get("schemes", []):
        scheme_rows.append([
            Paragraph(sc["name"], styles["TableCellBold"]),
            Paragraph(sc["fullName"][:35], styles["TableCell"]),
            Paragraph(str(sc["enrolled"]), styles["TableCellCenter"]),
            Paragraph(str(sc["eligible"]), styles["TableCellCenter"]),
            Paragraph(str(sc["missingDocs"]), styles["TableCellCenter"]),
            Paragraph(f"₹{sc['disbursedAmount']:,}", styles["TableCellCenter"]),
        ])
    t_sch = Table(scheme_rows, colWidths=[1.0*inch, 2.2*inch, 0.9*inch, 0.9*inch, 1.0*inch, 1.1*inch])
    t_sch.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#16a34a")),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_sch)

    doc.build(story, canvasmaker=NumberedCanvas)
    return buf.getvalue()


# -----------------------------------------------------------------------------
# 2. PATIENT REGISTRY PDF
# -----------------------------------------------------------------------------
def build_patient_registry_pdf(data: Dict[str, Any]) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=40, rightMargin=40, topMargin=45, bottomMargin=45)
    styles = _get_styles()
    story = []

    period_str = f"As of {datetime.now().strftime('%d %b %Y')}"
    story.extend(_build_cover_banner(
        styles,
        "MATERNAL & CHILD HEALTH PATIENT MASTER REGISTRY",
        "Comprehensive roster of enrolled households, clinical vital surveillance, and risk classification.",
        period_str
    ))

    # Summary strip
    pts = data.get("allPatients", [])
    crit_cnt = sum(1 for p in pts if p["status"] == "critical")
    high_cnt = sum(1 for p in pts if p["status"] == "high-risk")
    stable_cnt = len(pts) - crit_cnt - high_cnt

    summary_text = f"<b>Total Beneficiaries:</b> {len(pts)} &nbsp;|&nbsp; <b>Critical:</b> <font color='#E11D48'>{crit_cnt}</font> &nbsp;|&nbsp; <b>High Risk:</b> <font color='#D97706'>{high_cnt}</font> &nbsp;|&nbsp; <b>Stable:</b> <font color='#059669'>{stable_cnt}</font>"
    story.append(Paragraph(summary_text, styles["DocSubtitle"]))
    story.append(Spacer(1, 8))

    rows = [[
        Paragraph("Patient ID", styles["TableHeader"]),
        Paragraph("Beneficiary Name", styles["TableHeader"]),
        Paragraph("Age", styles["TableHeader"]),
        Paragraph("Village", styles["TableHeader"]),
        Paragraph("Gestation / Trimester", styles["TableHeader"]),
        Paragraph("BP", styles["TableHeader"]),
        Paragraph("Hb (g/dL)", styles["TableHeader"]),
        Paragraph("Risk Level", styles["TableHeader"]),
    ]]

    for p in pts:
        status_color = "#E11D48" if p["status"] == "critical" else "#D97706" if p["status"] == "high-risk" else "#059669"
        rows.append([
            Paragraph(p["id"], styles["TableCellCenter"]),
            Paragraph(p["name"], styles["TableCellBold"]),
            Paragraph(str(p["age"]), styles["TableCellCenter"]),
            Paragraph(p["village"], styles["TableCellCenter"]),
            Paragraph(p["trimester"] or "1st Trimester", styles["TableCellCenter"]),
            Paragraph(p["bp"], styles["TableCellCenter"]),
            Paragraph(str(p["hemoglobin"]), styles["TableCellCenter"]),
            Paragraph(p["status"].upper(), ParagraphStyle('R', parent=styles["TableCellCenter"], textColor=colors.HexColor(status_color), fontName="Helvetica-Bold")),
        ])

    table = Table(rows, colWidths=[0.9*inch, 1.5*inch, 0.6*inch, 1.1*inch, 1.3*inch, 0.8*inch, 0.7*inch, 0.9*inch], repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#16a34a")),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4.5),
    ]))
    story.append(table)

    doc.build(story, canvasmaker=NumberedCanvas)
    return buf.getvalue()


# -----------------------------------------------------------------------------
# 3. IMMUNIZATION LOG PDF
# -----------------------------------------------------------------------------
def build_immunization_log_pdf(data: Dict[str, Any]) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=40, rightMargin=40, topMargin=45, bottomMargin=45)
    styles = _get_styles()
    story = []

    period_str = f"As of {datetime.now().strftime('%d %b %Y')}"
    story.extend(_build_cover_banner(
        styles,
        "UNIVERSAL IMMUNIZATION PROGRAM (UIP) CLINICAL LOG",
        "Official infant and maternal vaccine register tracking doses administered, scheduled due dates, and default defaulters.",
        period_str
    ))

    imms = data.get("allImmunizations", [])
    comp = sum(1 for i in imms if i["status"] == "completed")
    due = sum(1 for i in imms if i["status"] == "due")
    over = sum(1 for i in imms if i["status"] == "overdue")
    rate = round(comp / len(imms) * 100) if imms else 0

    kpi_bar = f"<b>Total Doses Tracked:</b> {len(imms)} &nbsp;|&nbsp; <b>Completed:</b> {comp} ({rate}%) &nbsp;|&nbsp; <b>Due Now:</b> {due} &nbsp;|&nbsp; <b>Defaulters / Overdue:</b> <font color='#E11D48'>{over}</font>"
    story.append(Paragraph(kpi_bar, styles["DocSubtitle"]))
    story.append(Spacer(1, 8))

    rows = [[
        Paragraph("Record ID", styles["TableHeader"]),
        Paragraph("Child / Beneficiary", styles["TableHeader"]),
        Paragraph("Vaccine Dose", styles["TableHeader"]),
        Paragraph("Village", styles["TableHeader"]),
        Paragraph("Due Date", styles["TableHeader"]),
        Paragraph("Given Date", styles["TableHeader"]),
        Paragraph("Status", styles["TableHeader"]),
    ]]

    for im in imms:
        st_color = "#059669" if im["status"] == "completed" else "#E11D48" if im["status"] == "overdue" else "#D97706"
        rows.append([
            Paragraph(im["id"], styles["TableCellCenter"]),
            Paragraph(im["childName"], styles["TableCellBold"]),
            Paragraph(f"{im['vaccine']} (Dose {im['doseNumber']})", styles["TableCell"]),
            Paragraph(im["village"], styles["TableCellCenter"]),
            Paragraph(im["dueDate"], styles["TableCellCenter"]),
            Paragraph(im["givenDate"], styles["TableCellCenter"]),
            Paragraph(im["status"].upper(), ParagraphStyle('ISt', parent=styles["TableCellCenter"], textColor=colors.HexColor(st_color), fontName="Helvetica-Bold")),
        ])

    table = Table(rows, colWidths=[0.9*inch, 1.6*inch, 1.6*inch, 1.1*inch, 0.9*inch, 0.9*inch, 0.8*inch], repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#16a34a")),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4.5),
    ]))
    story.append(table)

    doc.build(story, canvasmaker=NumberedCanvas)
    return buf.getvalue()


# -----------------------------------------------------------------------------
# 4. VILLAGE-WISE REPORT PDF
# -----------------------------------------------------------------------------
def build_village_wise_pdf(data: Dict[str, Any]) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=40, rightMargin=40, topMargin=45, bottomMargin=45)
    styles = _get_styles()
    story = []

    period_str = f"As of {datetime.now().strftime('%d %b %Y')}"
    story.extend(_build_cover_banner(
        styles,
        "VILLAGE-WISE CATCHMENT DOSSIER & COMPARATIVE DEMOGRAPHICS",
        "Granular health indicators structured per village unit: high-risk burden, visit volume, and immunization completion rates.",
        period_str
    ))

    # Comparative Chart
    chart2_bytes = create_village_pie_chart(data.get("villages", []))
    img = Image(io.BytesIO(chart2_bytes), width=4.5 * inch, height=2.3 * inch)
    story.append(img)
    story.append(Spacer(1, 12))

    for idx, v in enumerate(data.get("villages", [])):
        story.append(Paragraph(f"Village: {v['name'].upper()}", styles["SectionHeading"]))
        
        # Summary row for this village
        v_summary = [
            [
                Paragraph("Total Beneficiaries", styles["KpiLabel"]),
                Paragraph("Critical Risk Cases", styles["KpiLabel"]),
                Paragraph("High Risk Monitored", styles["KpiLabel"]),
                Paragraph("Immunization Rate", styles["KpiLabel"]),
            ],
            [
                Paragraph(str(v["patients"]), styles["KpiVal"]),
                Paragraph(str(v["critical"]), ParagraphStyle('Cr', parent=styles["KpiVal"], textColor=colors.HexColor("#E11D48"))),
                Paragraph(str(v["highRisk"]), ParagraphStyle('Hr', parent=styles["KpiVal"], textColor=colors.HexColor("#D97706"))),
                Paragraph(f"{v['immunizationRate']}%" if v.get('immunizationRate') is not None else "—", ParagraphStyle('Ir', parent=styles["KpiVal"], textColor=colors.HexColor("#059669"))),
            ]
        ]
        t_vsum = Table(v_summary, colWidths=[1.75 * inch] * 4)
        t_vsum.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_vsum)
        story.append(Spacer(1, 6))

        # Patient roster in this village
        v_pats = v.get("patientList", [])
        p_rows = [[
            Paragraph("ID", styles["TableHeader"]),
            Paragraph("Name", styles["TableHeader"]),
            Paragraph("Age", styles["TableHeader"]),
            Paragraph("Gestation", styles["TableHeader"]),
            Paragraph("BP", styles["TableHeader"]),
            Paragraph("Hb", styles["TableHeader"]),
            Paragraph("Risk Status", styles["TableHeader"]),
        ]]
        for p in v_pats:
            st_color = "#E11D48" if p["status"] == "critical" else "#D97706" if p["status"] == "high-risk" else "#059669"
            p_rows.append([
                Paragraph(p["id"], styles["TableCellCenter"]),
                Paragraph(p["name"], styles["TableCellBold"]),
                Paragraph(str(p["age"]), styles["TableCellCenter"]),
                Paragraph(p["trimester"] or "—", styles["TableCellCenter"]),
                Paragraph(p["bp"], styles["TableCellCenter"]),
                Paragraph(str(p["hemoglobin"]), styles["TableCellCenter"]),
                Paragraph(p["status"].upper(), ParagraphStyle('PSt', parent=styles["TableCellCenter"], textColor=colors.HexColor(st_color), fontName="Helvetica-Bold")),
            ])
        t_p = Table(p_rows, colWidths=[0.8*inch, 1.8*inch, 0.6*inch, 1.3*inch, 0.9*inch, 0.7*inch, 0.9*inch])
        t_p.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#16a34a")),
            ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0, 0), (-1, -1), 3.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ]))
        story.append(t_p)
        story.append(Spacer(1, 12))

    doc.build(story, canvasmaker=NumberedCanvas)
    return buf.getvalue()


# -----------------------------------------------------------------------------
# 5. SCHEME REPORT PDF
# -----------------------------------------------------------------------------
def build_scheme_report_pdf(data: Dict[str, Any]) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=40, rightMargin=40, topMargin=45, bottomMargin=45)
    styles = _get_styles()
    story = []

    period_str = f"As of {datetime.now().strftime('%d %b %Y')}"
    story.extend(_build_cover_banner(
        styles,
        "GOVERNMENT HEALTH SCHEMES AUDIT & BENEFIT DISBURSEMENT REPORT",
        "Statutory monitoring of PMMVY, JSY, JSSK, PM-JAY, IFA, and Poshan Abhiyaan: enrollments, missing documents, and DBT transfers.",
        period_str
    ))

    # Scheme progress chart
    chart4_bytes = create_scheme_progress_chart(data.get("schemes", []))
    img = Image(io.BytesIO(chart4_bytes), width=7.1 * inch, height=2.4 * inch)
    story.append(img)
    story.append(Spacer(1, 14))

    # Schemes Breakdown Table
    rows = [[
        Paragraph("Scheme", styles["TableHeader"]),
        Paragraph("Full Official Designation", styles["TableHeader"]),
        Paragraph("Per-Capita Entitlement (₹)", styles["TableHeader"]),
        Paragraph("Enrolled", styles["TableHeader"]),
        Paragraph("Pending", styles["TableHeader"]),
        Paragraph("Missing Docs", styles["TableHeader"]),
        Paragraph("Total Disbursed (₹)", styles["TableHeader"]),
    ]]

    for sc in data.get("schemes", []):
        rows.append([
            Paragraph(sc["name"], styles["TableCellBold"]),
            Paragraph(sc["fullName"], styles["TableCell"]),
            Paragraph(f"₹{sc['benefitAmount']:,}", styles["TableCellCenter"]),
            Paragraph(str(sc["enrolled"]), styles["TableCellCenter"]),
            Paragraph(str(sc["eligible"]), styles["TableCellCenter"]),
            Paragraph(str(sc["missingDocs"]), ParagraphStyle('Ms', parent=styles["TableCellCenter"], textColor=colors.HexColor("#D97706"), fontName="Helvetica-Bold")),
            Paragraph(f"₹{sc['disbursedAmount']:,}", ParagraphStyle('Ds', parent=styles["TableCellCenter"], fontName="Helvetica-Bold", textColor=colors.HexColor("#059669"))),
        ])

    table = Table(rows, colWidths=[1.0*inch, 2.2*inch, 1.1*inch, 0.7*inch, 0.7*inch, 0.8*inch, 1.0*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#16a34a")),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(table)
    story.append(Spacer(1, 14))

    # Missing Documentation Warning Alert Callout
    callout_data = [
        [
            Paragraph("<b>COMPLIANCE DIRECTIVE ON PENDING DOCUMENTATION:</b><br/><font size=7.5 color='#334155'>Beneficiaries with missing Aadhaar seeding, MCP Card registration, or Bank Passbook copies must be verified within 15 days to avoid DBT subsidy lapses under PMMVY 2.0 and JSY guidelines.</font>", styles["TableCell"])
        ]
    ]
    t_callout = Table(callout_data, colWidths=[7.1 * inch])
    t_callout.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FEF3C7")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#F59E0B")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(t_callout)

    doc.build(story, canvasmaker=NumberedCanvas)
    return buf.getvalue()


def build_visit_note_pdf(data: Dict[str, Any]) -> bytes:
    """
    Generates a professional clinical Visit Note PDF report:
    - Header: National Health Mission / ASHA Co-Pilot + "Official Visit Note"
    - ASHA worker, sector, date, patient details
    - Structured clinical fields (Name, Age, BP, Sugar, Symptoms, Trimester)
    - Clinical alerts & protocol recommendations
    - Welfare schemes eligibility assessment
    - Follow-up clinical action tasks
    - Footer with timestamp and authenticity notes
    """
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=45
    )
    styles = _get_styles()
    story = []

    # Title Banner
    worker_name = data.get("worker_name") or "Rekha Singh"
    patient_name = data.get("patient_name") or data.get("name") or "Not provided"
    visit_date = data.get("date") or datetime.now().strftime("%B %d, %Y")
    village = data.get("village") or data.get("location") or "Not provided"

    header_data = [
        [
            Paragraph("<b>NATIONAL HEALTH MISSION</b><br/><font size=8 color='#64748B'>MINISTRY OF HEALTH & FAMILY WELFARE · ASHA CO-PILOT</font>", styles["DocTitle"]),
            Paragraph(f"<b>CLINICAL VISIT NOTE</b><br/><font size=8 color='#16a34a'>OFFICIAL FIELD RECORD</font><br/><font size=7 color='#64748B'>DATE: {visit_date.upper()}</font>", ParagraphStyle('HRight', parent=styles["TableCell"], alignment=2))
        ]
    ]
    t_head = Table(header_data, colWidths=[4.2 * inch, 2.9 * inch])
    t_head.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_head)
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#16a34a"), spaceAfter=12))

    # Meta Info Card
    meta_data = [
        [
            Paragraph("<b>ASHA Worker:</b>", styles["TableCellBold"]),
            Paragraph(worker_name, styles["TableCell"]),
            Paragraph("<b>Sector / Village:</b>", styles["TableCellBold"]),
            Paragraph(village, styles["TableCell"]),
        ],
        [
            Paragraph("<b>Patient Name:</b>", styles["TableCellBold"]),
            Paragraph(f"<b>{patient_name}</b>", styles["TableCellBold"]),
            Paragraph("<b>Age / Trimester:</b>", styles["TableCellBold"]),
            Paragraph(f"{data.get('age', 'Not provided')} Yrs · {data.get('trimester', 'Not provided')}", styles["TableCell"]),
        ]
    ]
    t_meta = Table(meta_data, colWidths=[1.5 * inch, 2.1 * inch, 1.5 * inch, 2.0 * inch])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 14))

    # Section 1: Structured Clinical Fields
    story.append(Paragraph("1. Structured Clinical Observations & Vitals", styles["SectionHeading"]))
    story.append(Spacer(1, 4))

    bp_val = data.get("blood_pressure") or data.get("bp") or "Not provided"
    bp_st = data.get("bp_status") or "Not evaluated"
    sugar_val = f"{data['blood_sugar']} mg/dL" if data.get("blood_sugar") else "Not provided"
    sugar_st = data.get("sugar_status") or "Not evaluated"
    symptoms = ", ".join(data.get("symptoms") or []) or "None reported"

    vitals_data = [
        [
            Paragraph("Vital / Metric", styles["TableHeader"]),
            Paragraph("Recorded Value", styles["TableHeader"]),
            Paragraph("Clinical Classification", styles["TableHeader"]),
        ],
        [
            Paragraph("Blood Pressure (BP)", styles["TableCellBold"]),
            Paragraph(str(bp_val), styles["TableCell"]),
            Paragraph(str(bp_st).upper(), ParagraphStyle('bpSt', parent=styles["TableCell"], textColor=colors.HexColor("#DC2626") if "high" in str(bp_st).lower() else colors.HexColor("#059669"))),
        ],
        [
            Paragraph("Blood Sugar", styles["TableCellBold"]),
            Paragraph(str(sugar_val), styles["TableCell"]),
            Paragraph(str(sugar_st).upper(), styles["TableCell"]),
        ],
        [
            Paragraph("Reported Symptoms", styles["TableCellBold"]),
            Paragraph(symptoms, styles["TableCell"]),
            Paragraph("Documented by ASHA", styles["TableCell"]),
        ],
        [
            Paragraph("Pregnancy Status", styles["TableCellBold"]),
            Paragraph(str(data.get("trimester") or "Not provided"), styles["TableCell"]),
            Paragraph("ANC Surveillance", styles["TableCell"]),
        ]
    ]
    t_vitals = Table(vitals_data, colWidths=[2.2 * inch, 2.5 * inch, 2.4 * inch])
    t_vitals.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#16a34a")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_vitals)
    story.append(Spacer(1, 14))

    # Section 2: Clinical Alerts & Protocol Guidance
    story.append(Paragraph("2. Clinical Protocol Flags & Safety Directives", styles["SectionHeading"]))
    story.append(Spacer(1, 4))

    flags = data.get("flags") or data.get("protocol_flags") or []
    if flags:
        flag_rows = [[
            Paragraph("Severity", styles["TableHeader"]),
            Paragraph("Alert / Directive", styles["TableHeader"]),
            Paragraph("Required Clinical Action", styles["TableHeader"]),
        ]]
        for f in flags:
            sev = f.get("severity") or "high"
            sev_color = "#DC2626" if sev == "critical" else "#D97706"
            flag_rows.append([
                Paragraph(f"<b>[{sev.upper()}]</b>", ParagraphStyle('fSev', parent=styles["TableCellCenter"], textColor=colors.HexColor(sev_color))),
                Paragraph(f.get("title") or "Clinical Alert", styles["TableCellBold"]),
                Paragraph(f.get("action") or f.get("detail") or "Refer to Primary Health Centre.", styles["TableCell"]),
            ])
        t_flags = Table(flag_rows, colWidths=[1.1 * inch, 2.5 * inch, 3.5 * inch])
        t_flags.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(t_flags)
    else:
        story.append(Paragraph("<font color='#64748B'>No critical emergency flags identified on current observation. Routine protocol applies.</font>", styles["TableCell"]))
    story.append(Spacer(1, 14))

    # Section 3: Welfare Schemes
    story.append(Paragraph("3. Welfare Scheme Eligibility Assessment", styles["SectionHeading"]))
    story.append(Spacer(1, 4))
    schemes = data.get("schemes") or []
    if schemes:
        sc_rows = [[
            Paragraph("Scheme", styles["TableHeader"]),
            Paragraph("Status", styles["TableHeader"]),
            Paragraph("Key Qualification Reasons", styles["TableHeader"]),
        ]]
        for sc in schemes:
            st = sc.get("status") or "eligible"
            st_color = "#059669" if st in {"eligible", "enrolled"} else "#D97706"
            sc_rows.append([
                Paragraph(sc.get("name") or "Scheme", styles["TableCellBold"]),
                Paragraph(f"<b>{st.upper()}</b>", ParagraphStyle('scSt', parent=styles["TableCellCenter"], textColor=colors.HexColor(st_color))),
                Paragraph("; ".join(sc.get("reasons") or ["Meets frontline eligibility criteria."]), styles["TableCell"]),
            ])
        t_sc = Table(sc_rows, colWidths=[1.8 * inch, 1.4 * inch, 3.9 * inch])
        t_sc.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#16a34a")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(t_sc)
    else:
        story.append(Paragraph("<font color='#64748B'>Verify BPL status and Aadhaar credentials for scheme entitlements.</font>", styles["TableCell"]))
    story.append(Spacer(1, 14))

    # Section 4: Clinical Summary / Visit Notes
    if data.get("report") or data.get("visit_notes"):
        story.append(Paragraph("4. Clinical Narrative & Field Notes", styles["SectionHeading"]))
        story.append(Spacer(1, 4))
        notes_text = str(data.get("report") or data.get("visit_notes") or "")
        story.append(Paragraph(notes_text.replace("\n", "<br/>"), styles["TableCell"]))
        story.append(Spacer(1, 14))

    # Footer Notice
    footer_text = f"Generated by ASHA Co-Pilot Clinical Intelligence Platform on {datetime.now().strftime('%b %d, %Y at %H:%M')}. Frontline Health Record for official clinical verification only."
    story.append(Paragraph(f"<font size=7 color='#94A3B8'>{footer_text}</font>", styles["TableCellCenter"]))

    doc.build(story, canvasmaker=NumberedCanvas)
    return buf.getvalue()

