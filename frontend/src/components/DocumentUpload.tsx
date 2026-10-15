import { useState, useRef } from 'react';
import {
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  Eye,
  FileText,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import type { PatientUploadedDocument } from '@/types';
import { uploadPatientDocument, deletePatientDocument, updateDocumentStatus } from '@/lib/api';

interface DocumentUploadProps {
  patientId: string;
  patientName: string;
  schemeId: string;
  document: PatientUploadedDocument;
  onRefresh: () => void;
}

export function DocumentUploadItem({
  patientId,
  schemeId,
  document,
  onRefresh,
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File exceeds statutory 5 MB limit. Please select a smaller file.');
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);
    setUploadProgress(25);

    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('scheme_id', schemeId);
    formData.append('document_type', document.type);
    formData.append('document_label', document.label);
    formData.append('file', file);

    try {
      setUploadProgress(65);
      await uploadPatientDocument(formData);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onRefresh();
      }, 400);
    } catch (err: any) {
      setIsUploading(false);
      setUploadProgress(0);
      setErrorMsg(err.message || 'Upload failed. Please retry.');
    }
  };

  const handleDelete = async () => {
    if (!document.id) return;
    if (!window.confirm(`Delete ${document.label}?`)) return;
    try {
      await deletePatientDocument(document.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    }
  };

  const handleVerify = async () => {
    if (!document.id) return;
    try {
      await updateDocumentStatus(document.id, 'verified');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to verify');
    }
  };

  const getStatusBadge = () => {
    switch (document.status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
          </span>
        );
      case 'uploaded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-3 h-3 text-sky-600" /> Uploaded
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-500" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow transition-all space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-bold text-slate-900">{document.label}</h5>
            {document.required && (
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                REQUIRED
              </span>
            )}
            {getStatusBadge()}
          </div>
          <p className="text-xs text-slate-500">{document.description}</p>
          {document.fileName && (
            <p className="text-[11px] font-mono text-slate-400">
              File: {document.fileName} {document.fileSize ? `(${Math.round(document.fileSize / 1024)} KB)` : ''}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1 sm:pt-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            className="hidden"
          />

          {document.status === 'pending' || document.status === 'rejected' ? (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white font-semibold text-xs transition-all flex items-center gap-1.5 border border-primary-200"
            >
              <Upload className="w-3.5 h-3.5" />
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          ) : (
            <>
              {document.id && (
                <a
                  href={`/api/documents/${document.id}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-all flex items-center gap-1 border border-slate-200"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </a>
              )}

              {document.status === 'uploaded' && (
                <button
                  type="button"
                  onClick={handleVerify}
                  title="Mark verified as ASHA worker"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-semibold text-xs transition-all flex items-center gap-1 border border-emerald-200"
                >
                  <FileCheck className="w-3.5 h-3.5" /> Verify
                </button>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Re-upload or replace document"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleDelete}
                title="Delete document"
                className="p-1.5 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary-600 h-1.5 transition-all duration-300 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {errorMsg && (
        <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
        </p>
      )}
    </div>
  );
}
