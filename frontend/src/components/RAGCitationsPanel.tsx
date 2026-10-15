import React from 'react';
import { BookOpen, Database, ExternalLink, FileText } from 'lucide-react';

interface RAGCitationsPanelProps {
  data?: {
    documents_indexed?: number;
    chunks_embedded?: number;
    vector_store?: string;
    recent_citations?: Array<{
      title: string;
      category: string;
      authority: string;
    }>;
  };
  onBrowseProtocols?: () => void;
}

export const RAGCitationsPanel: React.FC<RAGCitationsPanelProps> = ({
  data,
  onBrowseProtocols,
}) => {
  const citations = data?.recent_citations || [
    { title: 'NHM RMNCH+A Guidelines (Section 4.2)', category: 'Maternal Health', authority: 'MoHFW' },
    { title: 'NHM Maternal Health — PMSMA Operational Protocol', category: 'ANC Care', authority: 'NHM' },
    { title: 'ICMR Guidelines for Management of Pre-eclampsia', category: 'Clinical Danger Signs', authority: 'ICMR' },
  ];

  const docsCount = data?.documents_indexed ?? 14;
  const chunksCount = data?.chunks_embedded ?? 3847;

  return (
    <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              RAG Knowledge Base
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/50">
                ChromaDB
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Official NHM & ICMR Clinical Protocols</p>
          </div>
        </div>

        {onBrowseProtocols && (
          <button
            type="button"
            onClick={onBrowseProtocols}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            Browse
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[10px] mb-0.5">
            <FileText className="w-3 h-3 text-indigo-500" />
            Documents Indexed
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{docsCount} Official PDFs</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[10px] mb-0.5">
            <Database className="w-3 h-3 text-indigo-500" />
            Chunks Embedded
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{chunksCount.toLocaleString()} Chunks</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Recent Citations</p>
        {citations.map((c, i) => (
          <div
            key={i}
            className="p-2 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-between text-xs"
          >
            <div className="truncate pr-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate block">
                • {c.title}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {c.category} · {c.authority}
              </span>
            </div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono shrink-0">Cited</span>
          </div>
        ))}
      </div>
    </div>
  );
};
