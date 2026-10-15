import { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FolderOpen
} from 'lucide-react';
import type { PatientSchemeChecklist } from '@/types';
import { fetchPatientSchemeDocuments } from '@/lib/api';
import { DocumentUploadItem } from './DocumentUpload';

interface DocumentChecklistProps {
  patientId: string;
  patientName: string;
  schemeId: string;
  schemeName: string;
}

export function DocumentChecklist({
  patientId,
  patientName,
  schemeId,
  schemeName,
}: DocumentChecklistProps) {
  const [checklist, setChecklist] = useState<PatientSchemeChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDocs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPatientSchemeDocuments(patientId, schemeId);
      setChecklist(data);
    } catch (err) {
      console.error('Failed to load documents checklist', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (patientId && schemeId) {
      loadDocs();
    }
  }, [patientId, schemeId]);

  if (isLoading) {
    return (
      <div className="py-12 text-center space-y-2">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading statutory document checklist...</p>
      </div>
    );
  }

  if (!checklist) {
    return <p className="text-xs text-slate-400">No document checklist found for this scheme.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">{schemeName} — Statutory Documents</h4>
            <span className="text-xs font-semibold text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full">
              {checklist.progress}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Beneficiary: <strong className="text-slate-800">{patientName}</strong>
          </p>
        </div>

        <div className="w-full sm:w-48 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Readiness</span>
            <span>{checklist.progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                checklist.complete ? 'bg-emerald-500' : 'bg-primary-600'
              }`}
              style={{ width: `${checklist.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {checklist.complete ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All mandatory documents uploaded! This beneficiary file is ready for DBT / scheme submission.</span>
        </div>
      ) : (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Complete all mandatory documents with red labels before applying.</span>
        </div>
      )}

      {/* Document Items List */}
      <div className="space-y-2.5">
        {checklist.documents.map((doc) => (
          <DocumentUploadItem
            key={doc.type}
            patientId={patientId}
            patientName={patientName}
            schemeId={schemeId}
            document={doc}
            onRefresh={loadDocs}
          />
        ))}
      </div>
    </div>
  );
}
