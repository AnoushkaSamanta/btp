import { getPreferences } from '@/lib/preferences';

export function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) {
    throw new Error('There is no data to export yet.');
  }
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const escape = (value: unknown) => {
    const text = Array.isArray(value) ? value.join('; ') : String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  };
  const content = [headers.map(escape).join(','), ...rows.map((row) => headers.map((key) => escape(row[key])).join(','))].join('\r\n');
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadText(filename: string, content: string, mimeType = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function downloadClinicalPdf(filename: string, reportData: Record<string, unknown>): Promise<string> {
  const patientNameRaw = String(reportData.patient_name || reportData.patientName || 'Patient').replace(/[^\w]/g, '');
  const dateStr = new Date().toISOString().split('T')[0];
  const targetFilename = filename || `visit-note_${patientNameRaw || 'Patient'}_${dateStr}.pdf`;

  try {
    const res = await fetch('/api/visits/export/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = targetFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      return targetFilename;
    }
  } catch (err) {
    console.warn('Backend PDF endpoint error, falling back to browser print:', err);
  }

  const printWindow = window.open('', '_blank', 'width=850,height=1000');
  if (!printWindow) {
    downloadText(targetFilename.replace(/\.pdf$/, '.txt'), JSON.stringify(reportData, null, 2));
    return targetFilename;
  }

  const patientName = escapeHtml(reportData.patient_name || reportData.patientName || '—');
  const patientId = escapeHtml(reportData.patient_id || reportData.patientId || reportData.id || 'REG-' + Math.floor(100000 + Math.random() * 900000));
  const village = escapeHtml(reportData.village || reportData.location || '—');
  const age = escapeHtml(reportData.age ? `${reportData.age} Yrs` : '—');
  const bp = escapeHtml(reportData.blood_pressure || reportData.bp || '—');
  const bpStatus = escapeHtml(reportData.bp_status || '—');
  const sugar = escapeHtml(reportData.blood_sugar ? `${reportData.blood_sugar} mg/dL` : '—');
  const sugarStatus = escapeHtml(reportData.sugar_status || '—');
  const hb = escapeHtml(reportData.hemoglobin ? `${reportData.hemoglobin} g/dL` : '—');
  const trimester = escapeHtml(reportData.trimester || '1st');
  const worker = escapeHtml(reportData.worker_name || getPreferences().workerName || 'Frontline Health Worker');
  const sector = escapeHtml(getPreferences().sector || 'Primary Health Sub-Centre');
  const workerId = escapeHtml(getPreferences().workerId || 'ASHA-NHM-042');
  const reportText = escapeHtml(reportData.report || reportData.report_text || reportData.summary || reportData.visit_notes || 'Routine antenatal / non-communicable health surveillance visit documented.');
  
  const symptoms = Array.isArray(reportData.symptoms) ? reportData.symptoms : [];
  const symptomsStr = symptoms.length ? symptoms.map(escapeHtml).join(', ') : 'None documented';

  const flags = Array.isArray(reportData.flags) ? reportData.flags as Array<Record<string, string>> : [];
  const schemes = Array.isArray(reportData.schemes) ? reportData.schemes as Array<Record<string, unknown>> : [];

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>GOVERNMENT OF INDIA - NHM CLINICAL FORM 4B - ${patientName}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          * { box-sizing: border-box; }
          body {
            font-family: "Times New Roman", Times, Georgia, serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 20px 24px;
            font-size: 11pt;
            line-height: 1.35;
          }
          .govt-top {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .emblem-text {
            font-size: 13pt;
            font-weight: bold;
            letter-spacing: 1.5px;
            text-transform: uppercase;
          }
          .dept-text {
            font-size: 10.5pt;
            font-weight: bold;
            letter-spacing: 0.5px;
          }
          .sub-dept {
            font-size: 9.5pt;
            font-style: italic;
          }
          .form-badge {
            display: inline-block;
            font-size: 8.5pt;
            font-weight: bold;
            border: 1px solid #000;
            padding: 2px 8px;
            margin-top: 4px;
            text-transform: uppercase;
            font-family: Arial, sans-serif;
          }
          .meta-strip {
            display: flex;
            justify-content: space-between;
            font-size: 9pt;
            font-family: Arial, sans-serif;
            border-bottom: 1px dashed #000;
            padding-bottom: 6px;
            margin-bottom: 12px;
          }
          .section-hdr {
            font-family: Arial, sans-serif;
            font-size: 9.5pt;
            font-weight: bold;
            text-transform: uppercase;
            background: #f0f0f0;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 3px 6px;
            margin: 10px 0 6px 0;
            letter-spacing: 0.5px;
          }
          table.data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5pt;
            font-family: Arial, sans-serif;
            margin-bottom: 8px;
          }
          table.data-table th, table.data-table td {
            border: 1px solid #333;
            padding: 4px 6px;
            text-align: left;
            vertical-align: top;
          }
          table.data-table th {
            background: #f7f7f7;
            font-weight: bold;
            width: 25%;
          }
          .clinical-notes {
            border: 1px solid #333;
            padding: 8px;
            min-height: 50px;
            font-size: 10pt;
            font-family: "Courier New", Courier, monospace;
            background: #fafafa;
            white-space: pre-wrap;
          }
          .alert-box {
            border: 2px solid #b91c1c;
            background: #fff5f5;
            padding: 6px 8px;
            margin-top: 6px;
            font-family: Arial, sans-serif;
          }
          .alert-title {
            color: #b91c1c;
            font-weight: bold;
            font-size: 9.5pt;
            text-transform: uppercase;
          }
          .scheme-box {
            border: 1px solid #047857;
            background: #f0fdf4;
            padding: 6px 8px;
            margin-top: 6px;
            font-family: Arial, sans-serif;
          }
          .official-sign {
            margin-top: 28px;
            display: flex;
            justify-content: space-between;
            font-family: Arial, sans-serif;
            font-size: 9pt;
            page-break-inside: avoid;
          }
          .sign-box {
            width: 200px;
            text-align: center;
          }
          .sign-line {
            border-bottom: 1px solid #000;
            height: 40px;
            margin-bottom: 4px;
          }
          .statutory-foot {
            border-top: 1px solid #000;
            margin-top: 24px;
            padding-top: 6px;
            font-size: 7.5pt;
            color: #444;
            text-align: center;
            font-family: Arial, sans-serif;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="govt-top">
          <div class="emblem-text">भारत सरकार · GOVERNMENT OF INDIA</div>
          <div class="dept-text">MINISTRY OF HEALTH & FAMILY WELFARE</div>
          <div class="sub-dept">National Health Mission (NHM) · Directorate of Maternal & Child Health</div>
          <div class="form-badge">FORM 4B: ASHA FRONTLINE CLINICAL SURVEILLANCE & TRIAGE RECORD</div>
        </div>

        <div class="meta-strip">
          <div><strong>RECORD ID:</strong> ${patientId}</div>
          <div><strong>DATE:</strong> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <div><strong>SECTOR/PHC:</strong> ${sector}</div>
          <div><strong>ASHA ID:</strong> ${workerId} (${worker})</div>
        </div>

        <div class="section-hdr">1. BENEFICIARY IDENTIFICATION & REGISTRY DETAILS</div>
        <table class="data-table">
          <tr>
            <th>Beneficiary Name</th>
            <td><strong>${patientName}</strong></td>
            <th>Village / Ward</th>
            <td>${village}</td>
          </tr>
          <tr>
            <th>Age / Gender</th>
            <td>${age} / Female</td>
            <th>Gestational Window</th>
            <td>${trimester} Trimester</td>
          </tr>
          <tr>
            <th>Primary Symptoms</th>
            <td colspan="3">${symptomsStr}</td>
          </tr>
        </table>

        <div class="section-hdr">2. VITALS & CLINICAL OBSERVATIONS</div>
        <table class="data-table">
          <tr>
            <th>Blood Pressure (BP)</th>
            <td><strong>${bp}</strong> (${bpStatus})</td>
            <th>Blood Glucose / Sugar</th>
            <td><strong>${sugar}</strong> (${sugarStatus})</td>
          </tr>
          <tr>
            <th>Hemoglobin (Hb)</th>
            <td>${hb}</td>
            <th>Clinical Triage Status</th>
            <td><strong>${flags.some(f => f.severity === 'critical' || f.severity === 'high') ? 'URGENT MEDICAL OFFICER ESCALATION' : 'ROUTINE COMMUNITY FOLLOW-UP'}</strong></td>
          </tr>
        </table>

        <div class="section-hdr">3. CHIEF CLINICAL NARRATIVE (RECORDED AT SUB-CENTRE / DOMICILIARY VISIT)</div>
        <div class="clinical-notes">${reportText}</div>

        <div class="section-hdr">4. NHM PROTOCOL EVALUATION & RED FLAG SAFETY WARNINGS</div>
        ${
          flags.length > 0
            ? flags.map(f => `
              <div class="alert-box">
                <div class="alert-title">⚠ PROTOCOL FLAG [${escapeHtml(f.severity || 'ALERT')}]: ${escapeHtml(f.title || f.detail || '')}</div>
                <div style="font-size:9pt; margin-top:2px;"><strong>Required Frontline Action:</strong> ${escapeHtml(f.action || 'Refer immediately to Community Health Centre / PHC Medical Officer.')}</div>
              </div>
            `).join('')
            : '<div style="font-size:9pt; font-family:Arial,sans-serif; padding:4px 0; color:#166534;">✓ No acute physiological protocol contraindications detected under NHM maternal/NCD triage guidelines.</div>'
        }

        <div class="section-hdr">5. STATUTORY SOCIAL HEALTH ENTITLEMENTS (AYUSHMAN BHARAT & NHM CONVERGENCE)</div>
        ${
          schemes.length > 0
            ? schemes.map(s => `
              <div class="scheme-box">
                <div style="font-weight:bold; font-size:9.5pt; color:#065f46;">${escapeHtml(String(s.name || s.fullName || 'SCHEME'))}: ${escapeHtml(String(s.status || 'ELIGIBLE'))}</div>
                ${Array.isArray(s.reasons) && s.reasons.length > 0
                  ? `<div style="font-size:8.5pt; color:#1e293b; margin-top:2px;">${s.reasons.map(r => `• ${escapeHtml(String(r))}`).join('<br/>')}</div>`
                  : ''}
              </div>
            `).join('')
            : '<div style="font-size:9pt; font-family:Arial,sans-serif; padding:4px 0;">No state convergence schemes logged.</div>'
        }

        <div class="official-sign">
          <div class="sign-box">
            <div class="sign-line"></div>
            <div>Signature / Thumb Impression<br/><strong>Beneficiary / Guardian</strong></div>
          </div>
          <div class="sign-box">
            <div class="sign-line"></div>
            <div>Signature & Worker ID<br/><strong>${worker} (${workerId})</strong></div>
          </div>
          <div class="sign-box">
            <div class="sign-line"></div>
            <div>Countersigned & Verified<br/><strong>Medical Officer (PHC/CHC)</strong></div>
          </div>
        </div>

        <div class="statutory-foot">
          Official NHM Form 4B. Maintained pursuant to National Health Mission Field Manual and Primary Health Care Standards. All preliminary benefit matches subject to verification with SECC / State Ration Card Registry.
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function downloadCertificatePdf(
  courseTitle: string,
  workerName = getPreferences().workerName,
  score: number = 100,
  certId?: string,
) {
  const printWindow = window.open('', '_blank', 'width=950,height=720');
  const certificateNumber = certId || `NHM-ASHA-${Math.floor(100000 + Math.random() * 900000)}`;
  if (!printWindow) {
    downloadText(`${courseTitle.replace(/\s+/g, '_')}_Certificate.txt`, `CERTIFICATE OF COMPLETION\n${courseTitle}\nAwarded to: ${workerName}\nScore: ${score}%\nCert ID: ${certificateNumber}`);
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>GOVERNMENT OF INDIA - CERTIFICATE OF COMPLETION - ${escapeHtml(courseTitle)}</title>
        <style>
          @page { size: landscape; margin: 0; }
          body { font-family: 'Georgia', serif; padding: 40px; background: #fafaf9; color: #1c1917; text-align: center; }
          .border-outer { border: 10px solid #16755a; padding: 28px; border-radius: 12px; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .border-inner { border: 2px solid #d4af37; padding: 36px; border-radius: 8px; position: relative; }
          .gov-badge { display: inline-block; background: #f0fdf4; border: 1px solid #16755a; color: #166534; font-size: 11px; font-weight: bold; padding: 3px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; font-family: Arial, sans-serif; }
          .logo { font-size: 26px; font-weight: bold; color: #16755a; letter-spacing: 2px; }
          .sublogo { font-size: 12px; font-family: sans-serif; color: #78716c; text-transform: uppercase; margin-top: 4px; letter-spacing: 2.5px; }
          .title { font-size: 34px; font-weight: normal; color: #292524; margin: 24px 0 12px 0; font-family: 'Times New Roman', serif; }
          .presented { font-size: 14px; font-style: italic; color: #57534e; }
          .name { font-size: 30px; font-weight: bold; color: #16755a; margin: 12px 0; border-bottom: 2px solid #e7e5e4; display: inline-block; padding-bottom: 4px; }
          .course { font-size: 22px; font-weight: bold; color: #44403c; margin: 14px 0 8px 0; }
          .score-pill { display: inline-block; background: #fef3c7; color: #92400e; font-weight: bold; font-size: 13px; font-family: sans-serif; padding: 4px 14px; border-radius: 16px; margin-bottom: 14px; }
          .details { font-size: 12.5px; font-family: sans-serif; color: #78716c; max-width: 650px; margin: 0 auto 26px auto; line-height: 1.6; }
          .signature-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 32px; padding: 0 40px; font-family: sans-serif; font-size: 11.5px; }
          .sig-line { border-top: 1px solid #a8a29e; width: 190px; padding-top: 5px; color: #44403c; font-weight: bold; text-align: center; }
        </style>
      </head>
      <body>
        <div class="border-outer">
          <div class="border-inner">
            <div class="gov-badge">National Health Mission · Ministry of Health & Family Welfare</div>
            <div class="logo">NATIONAL HEALTH SYSTEMS RESOURCE CENTRE</div>
            <div class="sublogo">Government of India · Frontline Clinical Capability Certification</div>
            
            <div class="title">Certificate of Clinical Competence</div>
            <div class="presented">This is officially presented to</div>
            <div class="name">${escapeHtml(workerName)}</div>
            <div class="presented">for successfully completing comprehensive competency-based training on</div>
            <div class="course">${escapeHtml(courseTitle)}</div>
            <div class="score-pill">Final Assessment Score: ${score}% (Passed)</div>
            <div class="details">
              Demonstrating verified mastery in frontline healthcare delivery, maternal & newborn clinical protocols, decision-support algorithms, and statutory triage standards under the National Health Mission.
            </div>

            <div class="signature-row">
              <div style="text-align: left;">
                <strong>Date Issued:</strong> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}<br/>
                <strong>Certificate ID:</strong> ${escapeHtml(certificateNumber)}<br/>
                <strong>Accreditation:</strong> ASHA Co-Pilot RMNCH+A
              </div>
              <div class="sig-line">
                District Medical Officer (PHC/CHC)<br/>
                <span style="font-size:10px; font-weight:normal; color:#a8a29e;">Directorate of Health Services</span>
              </div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

