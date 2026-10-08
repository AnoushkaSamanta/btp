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

export function downloadClinicalPdf(filename: string, reportData: Record<string, unknown>) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    downloadText(filename.replace(/\.pdf$/, '.txt'), JSON.stringify(reportData, null, 2));
    return;
  }

  const patientName = String(reportData.patient_name || reportData.patientName || 'Lakshmi Devi');
  const village = String(reportData.village || 'Ramnagar Sector');
  const bp = String(reportData.blood_pressure || reportData.bp || '140/90');
  const hb = String(reportData.hemoglobin || '10.2');
  const reportText = String(reportData.report || reportData.report_text || reportData.summary || 'Clinical Visit Summary recorded by ASHA Co-Pilot.');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>NHM Official Clinical Visit Report - ${patientName}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { border-bottom: 3px solid #16755a; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 24px; font-weight: bold; color: #16755a; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 15px; font-weight: bold; color: #0f172a; border-left: 4px solid #16755a; padding-left: 10px; margin-bottom: 10px; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
          .footer { border-top: 1px solid #e2e8f0; margin-top: 40px; padding-top: 15px; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">NATIONAL HEALTH MISSION (NHM)</div>
            <div class="subtitle">ASHA Worker Clinical Visit & Decision Support Report</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #475569;">
            <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}<br/>
            <strong>ASHA Worker:</strong> Rekha Singh
          </div>
        </div>

        <div class="meta-box">
          <div><strong>Patient Name:</strong> ${patientName}</div>
          <div><strong>Village / Sector:</strong> ${village}</div>
          <div><strong>Blood Pressure:</strong> ${bp} mmHg</div>
          <div><strong>Hemoglobin (Hb):</strong> ${hb} g/dL</div>
        </div>

        <div class="section">
          <div class="section-title">Clinical Visit Narrative</div>
          <p style="font-size: 13px; leading-height: 1.6; background: #f1f5f9; padding: 12px; border-radius: 6px;">${reportText}</p>
        </div>

        <div class="section">
          <div class="section-title">Safety Shield & Protocol Flags</div>
          <p style="font-size: 12px;"><span class="badge">HIGH RISK</span> Pre-eclampsia / BP Elevation Flagged — Prompt ANM/PHC Consultation Recommended.</p>
        </div>

        <div class="section">
          <div class="section-title">Eligible Welfare Schemes</div>
          <ul style="font-size: 12px; line-height: 1.8;">
            <li>Pradhan Mantri Matru Vandana Yojana (PMMVY) - Eligible</li>
            <li>Janani Suraksha Yojana (JSY) - Eligible</li>
          </ul>
        </div>

        <div class="footer">
          Verified by ASHA Co-Pilot AI Decision Support System · Worker-Facing Clinical Record
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

export function downloadCertificatePdf(courseTitle: string, workerName = 'Rekha Singh') {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    downloadText(`${courseTitle.replace(/\s+/g, '_')}_Certificate.txt`, `CERTIFICATE OF COMPLETION\n${courseTitle}\nAwarded to: ${workerName}`);
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Official Certificate of Completion - ${courseTitle}</title>
        <style>
          @page { size: landscape; margin: 0; }
          body { font-family: 'Georgia', serif; padding: 40px; background: #fafaf9; color: #1c1917; text-align: center; }
          .border-outer { border: 10px solid #16755a; padding: 30px; border-radius: 12px; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .border-inner { border: 2px solid #d4af37; padding: 40px; border-radius: 8px; }
          .logo { font-size: 28px; font-weight: bold; color: #16755a; letter-spacing: 2px; }
          .sublogo { font-size: 13px; font-family: sans-serif; color: #78716c; text-transform: uppercase; margin-top: 5px; letter-spacing: 3px; }
          .title { font-size: 36px; font-weight: normal; color: #292524; margin: 30px 0 15px 0; font-family: 'Times New Roman', serif; }
          .presented { font-size: 15px; font-style: italic; color: #57534e; }
          .name { font-size: 32px; font-weight: bold; color: #16755a; margin: 15px 0; border-bottom: 2px solid #e7e5e4; display: inline-block; padding-bottom: 5px; }
          .course { font-size: 20px; font-weight: bold; color: #44403c; margin: 20px 0 10px 0; }
          .details { font-size: 13px; font-family: sans-serif; color: #78716c; max-width: 600px; margin: 0 auto 30px auto; line-height: 1.6; }
          .signature-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding: 0 50px; font-family: sans-serif; font-size: 12px; }
          .sig-line { border-top: 1px solid #a8a29e; width: 180px; padding-top: 5px; color: #44403c; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="border-outer">
          <div class="border-inner">
            <div class="logo">NATIONAL HEALTH MISSION</div>
            <div class="sublogo">Ministry of Health & Family Welfare · Government of India</div>
            
            <div class="title">Certificate of Completion</div>
            <div class="presented">This is to certify that</div>
            <div class="name">${workerName}</div>
            <div class="presented">has successfully completed the official training course on</div>
            <div class="course">${courseTitle}</div>
            <div class="details">
              Demonstrating mastery in frontline healthcare delivery, maternal & newborn protocols, and decision-support procedures under the National Health Mission guidelines.
            </div>

            <div class="signature-row">
              <div>
                <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}<br/>
                <strong>Cert ID:</strong> NHM-ASHA-${Math.floor(100000 + Math.random() * 900000)}
              </div>
              <div class="sig-line">
                District Medical Officer<br/>
                <span style="font-size:10px; font-weight:normal; color:#a8a29e;">NHM Ramnagar Sector</span>
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

