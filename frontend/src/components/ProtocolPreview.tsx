import { X, Download, ExternalLink, FileText, AlertCircle, Bookmark } from 'lucide-react';
import type { ResourceItem } from '@/types';

interface ProtocolPreviewProps {
  protocol: ResourceItem | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export function ProtocolPreview({
  protocol,
  onClose,
  isFavorite,
  onToggleFavorite,
}: ProtocolPreviewProps) {
  if (!protocol) return null;

  const pdfUrl = protocol.pdfUrl || `/api/protocols/${protocol.id}/pdf`;
  const officialUrl = protocol.officialUrl || protocol.officialPortal || 'https://nhm.gov.in/';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
    >
      <div className="card-elevated max-w-4xl w-full h-[88vh] flex flex-col rounded-2xl shadow-2xl bg-white border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">
              {protocol.category}
            </span>
            <div>
              <h3 id="preview-title" className="text-base font-bold text-slate-900 line-clamp-1">
                {protocol.title}
              </h3>
              {protocol.officialSource && (
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  Source: {protocol.officialSource}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleFavorite(protocol.id)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isFavorite
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <a
              href={pdfUrl}
              download
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors"
              title="Download local PDF copy"
            >
              <Download className="w-4 h-4" />
            </a>
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors"
              title="Open official government website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded PDF iframe */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            title={`Preview of ${protocol.title}`}
            className="w-full h-full border-none"
          />
        </div>

        {/* Bottom Bar with official actions */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500">
            Standard National Health Mission (NHM) clinical reference document.
          </p>
          <div className="flex items-center gap-2">
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Visit Official Portal
            </a>
            <a
              href={pdfUrl}
              download
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download Local PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
