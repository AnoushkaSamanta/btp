import { useState } from 'react';
import {
  X,
  FileText,
  ExternalLink,
  Download,
  CheckCircle2,
  ListOrdered,
  Clock,
  Building,
  UserCheck,
  AlertTriangle,
  Users,
  UploadCloud,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import type { GovScheme, SchemeEligibility, Patient } from '@/types';
import { DocumentChecklist } from './DocumentChecklist';

interface SchemeDetailProps {
  scheme: GovScheme;
  eligibleRecords: SchemeEligibility[];
  patientsList: Patient[];
  selectedState: string;
  initialTab?: 'overview' | 'documents' | 'patients';
  onClose: () => void;
}

export function SchemeDetail({
  scheme,
  eligibleRecords,
  patientsList,
  selectedState,
  initialTab = 'overview',
  onClose,
}: SchemeDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'patients'>(initialTab);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    eligibleRecords[0]?.patientId || patientsList[0]?.id || 'p1'
  );

  const selectedPatient =
    patientsList.find((p) => p.id === selectedPatientId) ||
    eligibleRecords.find((e) => e.patientId === selectedPatientId);

  const patientDisplayName = selectedPatient?.name || (selectedPatient as any)?.patientName || 'Beneficiary';

  const stateBenefit =
    scheme.stateBenefits?.[selectedState] || scheme.benefit || 'Standard government assistance';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative card-elevated max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="stat-badge bg-primary-50 text-primary-700 font-bold uppercase">
                {scheme.category}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Official Ministry Scheme
              </span>
            </div>
            <h3 className="text-2xl font-display font-extrabold text-slate-900 mt-1">
              {scheme.name} — {scheme.fullName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{scheme.description}</p>
          </div>
          <button
            type="button"
            aria-label="Close scheme details"
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State Benefit Banner */}
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              State Entitlement ({selectedState})
            </span>
            <h4 className="text-base font-extrabold text-amber-950 mt-0.5">{stateBenefit}</h4>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={scheme.pdfFallback || `/api/schemes/${scheme.id}/document`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
              title="View Official Government Guidelines PDF"
            >
              <FileText className="w-3.5 h-3.5" /> View Official PDF
            </a>
            {(scheme.portalUrl || scheme.portalFallback) && (
              <a
                href={scheme.portalUrl || scheme.portalFallback}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1"
                title="Open Official Ministry Portal"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Official Portal
              </a>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'How to Apply & Criteria', icon: ListOrdered },
            { id: 'documents', label: 'Document Upload & Checklist', icon: UploadCloud },
            { id: 'patients', label: `Eligible Beneficiaries (${eligibleRecords.length})`, icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW / HOW TO APPLY */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Eligibility Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Statutory Eligibility Criteria
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                  {(scheme.eligibility || scheme.eligibilityCriteria || []).map((crit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary-600" /> Mandatory Document Checklist
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                  {(scheme.documents || []).map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary-600 font-bold shrink-0 mt-0.5">•</span>
                      <span>
                        <strong>{doc.label}</strong> {doc.required && <span className="text-rose-600 text-xs">(Required)</span>}
                      </span>
                    </li>
                  ))}
                  {(!scheme.documents || scheme.documents.length === 0) &&
                    (scheme.documentsRequired || []).map((docStr, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary-600 font-bold shrink-0 mt-0.5">•</span>
                        <span>{docStr}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Application Process Steps */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-emerald-700" /> Step-by-Step Application Process
              </h4>
              <div className="space-y-2">
                {(scheme.process || scheme.applicationSteps || []).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-emerald-950">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Where to apply & Contact strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                  <Building className="w-3.5 h-3.5" /> Where to Apply
                </div>
                <p className="text-xs font-bold text-slate-800">{scheme.whereToApply || 'Nearest Anganwadi / PHC'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                  <Clock className="w-3.5 h-3.5" /> Processing Time
                </div>
                <p className="text-xs font-bold text-slate-800">{scheme.processingTime || '30 days'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                  <UserCheck className="w-3.5 h-3.5" /> Contact Person
                </div>
                <p className="text-xs font-bold text-slate-800">{scheme.contact || 'ASHA Worker / ANM'}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DOCUMENT UPLOAD & CHECKLIST */}
        {activeTab === 'documents' && (
          <div className="space-y-5 animate-fade-in">
            {/* Beneficiary Selector for Uploading */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <label htmlFor="patient-select" className="text-xs font-bold text-slate-700">
                Select Beneficiary to Manage Documents:
              </label>
              <select
                id="patient-select"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="input-field text-xs sm:text-sm py-1.5 max-w-xs"
              >
                {patientsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.village || 'Village'})
                  </option>
                ))}
              </select>
            </div>

            <DocumentChecklist
              patientId={selectedPatientId}
              patientName={patientDisplayName}
              schemeId={scheme.id}
              schemeName={scheme.name}
            />
          </div>
        )}

        {/* TAB 3: ELIGIBLE BENEFICIARIES & WHY ELIGIBLE */}
        {activeTab === 'patients' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                Beneficiaries Meeting Eligibility Criteria ({eligibleRecords.length})
              </h4>
              <span className="text-xs text-slate-500">Live matched via Clinical Structuring Engine</span>
            </div>

            {eligibleRecords.length > 0 ? (
              <div className="space-y-2.5">
                {eligibleRecords.map((e, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary-300 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-slate-900 text-sm">{e.patientName || 'Beneficiary'}</h5>
                        <span className="text-xs text-slate-500 font-medium">({e.village || 'Catchment'})</span>
                        <span className="stat-badge bg-emerald-50 text-emerald-800 uppercase font-bold text-[10px]">
                          {e.status}
                        </span>
                      </div>
                      <div className="text-xs text-emerald-700 font-medium">
                        {e.eligibilityReasons && e.eligibilityReasons.length > 0 ? (
                          <span>Matched: {e.eligibilityReasons.join(' · ')}</span>
                        ) : (
                          <span>Matched statutory criteria: Gestation and socio-economic category</span>
                        )}
                      </div>
                      {e.missingDocs && e.missingDocs.length > 0 && (
                        <p className="text-[11px] text-amber-700">
                          Pending Docs: {e.missingDocs.join(', ')}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatientId(e.patientId);
                        setActiveTab('documents');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white font-semibold text-xs transition-all border border-primary-200 flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <UploadCloud className="w-3.5 h-3.5" /> Upload Documents
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                No patients currently matched for this scheme.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
