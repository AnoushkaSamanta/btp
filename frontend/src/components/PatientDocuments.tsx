import { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ChevronRight
} from 'lucide-react';
import { fetchPatientAllSchemesChecklist } from '@/lib/api';
import { DocumentChecklist } from './DocumentChecklist';

interface PatientDocumentsProps {
  patientId: string;
  patientName: string;
}

export function PatientDocuments({ patientId, patientName }: PatientDocumentsProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSchemeId, setActiveSchemeId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchPatientAllSchemesChecklist(patientId);
      setData(res);
      if (res.schemes && res.schemes.length > 0 && !activeSchemeId) {
        setActiveSchemeId(res.schemes[0].schemeId);
      }
    } catch (err) {
      console.error('Failed to load patient scheme checklist', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      loadData();
    }
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="py-8 text-center space-y-2">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading statutory documents status...</p>
      </div>
    );
  }

  if (!data || !data.schemes) {
    return null;
  }

  const activeScheme = data.schemes.find((s: any) => s.schemeId === activeSchemeId) || data.schemes[0];

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-primary-600" /> Statutory Welfare Scheme Documents
          </h4>
          <p className="text-xs text-slate-500">
            {data.missingTotal > 0
              ? `${data.missingTotal} documents required before Direct Benefit Transfer (DBT) approval`
              : 'All statutory documents uploaded and in order'}
          </p>
        </div>
      </div>

      {/* Schemes Progress Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {data.schemes.slice(0, 4).map((s: any) => {
          const isSelected = s.schemeId === activeSchemeId;
          return (
            <button
              key={s.schemeId}
              type="button"
              onClick={() => setActiveSchemeId(s.schemeId)}
              className={`p-2.5 rounded-2xl text-left border transition-all ${
                isSelected
                  ? 'bg-primary-50 border-primary-400 ring-2 ring-primary-100'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900">{s.schemeName}</span>
                {s.isComplete ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {s.uploadedCount}/{s.totalRequired} uploaded
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Scheme Document Checklist */}
      {activeScheme && (
        <div className="mt-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
          <DocumentChecklist
            patientId={patientId}
            patientName={patientName}
            schemeId={activeScheme.schemeId}
            schemeName={activeScheme.schemeName}
          />
        </div>
      )}
    </div>
  );
}
