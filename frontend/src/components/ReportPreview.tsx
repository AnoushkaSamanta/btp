import React from 'react';
import { X, Download, FileText, CheckCircle2, AlertTriangle, Users, Building, FileSpreadsheet, Loader2 } from 'lucide-react';

interface ReportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'monthly-summary' | 'patient-registry' | 'immunization-log' | 'village-wise' | 'scheme-report' | 'export';
  reportTitle: string;
  data: any;
  previewMeta?: {
    filename?: string;
    totalPages?: number;
    fileSizeKb?: number;
    thumbnail?: string;
  } | null;
  loading: boolean;
  onConfirmDownload: (format: 'pdf' | 'xlsx') => void;
  downloading: boolean;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  isOpen,
  onClose,
  reportType,
  reportTitle,
  data,
  previewMeta,
  loading,
  onConfirmDownload,
  downloading,
}) => {
  if (!isOpen) return null;

  const s = data?.summary || {};
  const villages = data?.villages || [];
  const schemes = data?.schemes || [];
  const pts = data?.allPatients || [];
  const imms = data?.allImmunizations || [];
  const critCases = data?.criticalCases || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Government Dossier Preview
                </span>
                <span className="text-xs text-slate-400">· {data?.period?.from || 'All'} to {data?.period?.to || 'Oct 13, 2026'}</span>
              </div>
              <h3 className="text-lg font-display font-extrabold text-slate-900 mt-0.5">{reportTitle}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm font-semibold">Synthesizing clinical indicators & generating document layout...</p>
            </div>
          ) : (
            <>
              {/* Document Overview Strip with File Size & Page Count */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-slate-50 to-emerald-50/40 border border-emerald-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {previewMeta?.thumbnail && (
                    <img
                      src={previewMeta.thumbnail}
                      alt="First page preview"
                      className="w-14 h-20 object-cover rounded-lg shadow-md border border-slate-200 shrink-0"
                    />
                  )}
                  <div>
                    <p className="text-[11px] font-bold text-emerald-800 tracking-wider">MINISTRY OF HEALTH & FAMILY WELFARE · GOI</p>
                    <p className="text-xs text-slate-600 font-medium">ASHA Co-Pilot · Rekha Singh (Ramnagar Catchment)</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        📄 Total Pages: <strong className="text-emerald-700">{previewMeta?.totalPages || 2}</strong>
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        💾 Size: <strong className="text-emerald-700">{previewMeta?.fileSizeKb || 164} KB</strong>
                      </span>
                      {previewMeta?.filename && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {previewMeta.filename}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Format</span>
                  <p className="text-xs font-extrabold text-slate-800 uppercase">PDF / OpenXML XLSX</p>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                  <span className="text-xs text-slate-500 font-medium">Patients Covered</span>
                  <p className="text-2xl font-display font-extrabold text-slate-900 mt-0.5">{s.totalPatients || 0}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/60 text-center">
                  <span className="text-xs text-rose-700 font-medium">Critical / High Risk</span>
                  <p className="text-2xl font-display font-extrabold text-rose-700 mt-0.5">{(s.criticalPatients || 0) + (s.highRiskPatients || 0)}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-center">
                  <span className="text-xs text-emerald-700 font-medium">Immunizations</span>
                  <p className="text-2xl font-display font-extrabold text-emerald-700 mt-0.5">{s.completedImmunizations || 0}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 text-center">
                  <span className="text-xs text-emerald-800 font-medium">Scheme Enrolled</span>
                  <p className="text-2xl font-display font-extrabold text-emerald-800 mt-0.5">{s.schemeEnrollments || 0}</p>
                </div>
              </div>

              {/* REPORT SPECIFIC PREVIEW TABLE */}
              {reportType === 'monthly-summary' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Critical Clinical Escalations</h4>
                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Beneficiary</th>
                          <th className="p-2.5">Village</th>
                          <th className="p-2.5">Blood Pressure</th>
                          <th className="p-2.5">Risk Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {critCases.slice(0, 5).map((c: any) => (
                          <tr key={c.id}>
                            <td className="p-2.5 font-bold text-slate-800">{c.name}</td>
                            <td className="p-2.5 text-slate-600">{c.village}</td>
                            <td className="p-2.5 text-slate-600">{c.bp}</td>
                            <td className="p-2.5 font-bold text-rose-600 uppercase">{c.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportType === 'patient-registry' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Sample Registry Entries ({pts.length} total)</h4>
                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">ID</th>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Village</th>
                          <th className="p-2.5">Stage</th>
                          <th className="p-2.5">BP</th>
                          <th className="p-2.5">Hb</th>
                          <th className="p-2.5">Risk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pts.slice(0, 6).map((p: any) => (
                          <tr key={p.id}>
                            <td className="p-2.5 text-slate-400 font-mono">{p.id}</td>
                            <td className="p-2.5 font-bold text-slate-800">{p.name}</td>
                            <td className="p-2.5 text-slate-600">{p.village}</td>
                            <td className="p-2.5 text-slate-600">{p.trimester || '—'}</td>
                            <td className="p-2.5 text-slate-600">{p.bp}</td>
                            <td className="p-2.5 text-slate-600">{p.hemoglobin}</td>
                            <td className="p-2.5 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${
                                p.status === 'critical' ? 'bg-rose-100 text-rose-700' : p.status === 'high-risk' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {p.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportType === 'immunization-log' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Vaccine Register Preview ({imms.length} entries)</h4>
                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Child Name</th>
                          <th className="p-2.5">Vaccine</th>
                          <th className="p-2.5">Dose</th>
                          <th className="p-2.5">Due Date</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {imms.slice(0, 6).map((im: any) => (
                          <tr key={im.id}>
                            <td className="p-2.5 font-bold text-slate-800">{im.childName}</td>
                            <td className="p-2.5 text-slate-700">{im.vaccine}</td>
                            <td className="p-2.5 text-slate-500">#{im.doseNumber}</td>
                            <td className="p-2.5 text-slate-600">{im.dueDate}</td>
                            <td className="p-2.5 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${
                                im.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : im.status === 'overdue' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {im.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportType === 'village-wise' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Village Catchment Rates</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {villages.map((v: any) => (
                      <div key={v.name} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                        <p className="text-xs font-bold text-slate-800">{v.name}</p>
                        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                          <span>Beneficiaries</span>
                          <span className="font-bold text-slate-800">{v.patients}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Imm. Rate</span>
                          <span className="font-bold text-emerald-600">{v.immunizationRate}%</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Critical Flags</span>
                          <span className="font-bold text-rose-600">{v.critical}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reportType === 'scheme-report' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Statutory Welfare Disbursement Breakdown</h4>
                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Scheme</th>
                          <th className="p-2.5">Benefit</th>
                          <th className="p-2.5">Enrolled</th>
                          <th className="p-2.5">Pending</th>
                          <th className="p-2.5">Missing Docs</th>
                          <th className="p-2.5">Disbursed (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {schemes.map((sc: any) => (
                          <tr key={sc.id}>
                            <td className="p-2.5 font-bold text-slate-800">{sc.name}</td>
                            <td className="p-2.5 text-slate-600">₹{sc.benefitAmount.toLocaleString()}</td>
                            <td className="p-2.5 font-bold text-emerald-600">{sc.enrolled}</td>
                            <td className="p-2.5 text-slate-500">{sc.eligible}</td>
                            <td className="p-2.5 font-bold text-amber-600">{sc.missingDocs}</td>
                            <td className="p-2.5 font-bold text-slate-800">₹{sc.disbursedAmount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>High-resolution charts & full datasets will be embedded.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={downloading}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirmDownload('xlsx')}
              disabled={downloading || loading}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={() => onConfirmDownload('pdf')}
              disabled={downloading || loading}
              className="flex-1 sm:flex-none btn-primary text-xs py-2.5 px-4 flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
