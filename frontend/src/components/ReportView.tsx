import React from 'react';
import { FileText, AlertTriangle, ShieldCheck, ListChecks, Download } from 'lucide-react';

interface ReportViewProps {
  transcript?: string;
  report?: string;
  redFlags?: Array<string | { flag?: string; title?: string; action?: string; severity?: string }>;
  protocolCitations?: Array<string | { source?: string; text?: string }>;
  eligibleSchemes?: Array<string | { scheme_name?: string; benefit?: string }>;
  tasks?: Array<string | { title?: string }>;
  onDownload?: () => void;
}

export function ReportView({
  transcript = '',
  report = '',
  redFlags = [],
  protocolCitations = [],
  eligibleSchemes = [],
  tasks = [],
  onDownload,
}: ReportViewProps) {
  return (
    <div className="flex flex-col gap-6 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Clinical Visit & Decision Support Report
          </h2>
        </div>
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        )}
      </div>

      {transcript && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Raw Audio Transcript
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 italic">{transcript}</p>
        </div>
      )}

      {redFlags.length > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900">
          <div className="flex items-center gap-2 mb-2 text-rose-700 dark:text-rose-400 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4" />
            Safety Shield Flags (Immediate Attention)
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-rose-800 dark:text-rose-300">
            {redFlags.map((flag, idx) => {
              const text = typeof flag === 'string' ? flag : `${flag.title || flag.flag}: ${flag.action}`;
              return <li key={idx}>{text}</li>;
            })}
          </ul>
        </div>
      )}

      {protocolCitations.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900">
          <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            Official Protocol & Guideline Citations
          </div>
          <ul className="space-y-2 text-xs text-amber-900 dark:text-amber-200">
            {protocolCitations.map((cit, idx) => {
              const text = typeof cit === 'string' ? cit : `${cit.source}: ${cit.text}`;
              return (
                <li key={idx} className="p-2 bg-white/60 dark:bg-slate-800/60 rounded border border-amber-200 dark:border-amber-800">
                  {text}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {eligibleSchemes.length > 0 && (
        <div className="p-4 bg-sky-50 dark:bg-sky-950/30 rounded-lg border border-sky-200 dark:border-sky-900">
          <h3 className="text-sm font-semibold text-sky-800 dark:text-sky-300 mb-2">
            Eligible Government Welfare Schemes
          </h3>
          <div className="flex flex-wrap gap-2">
            {eligibleSchemes.map((sch, idx) => {
              const name = typeof sch === 'string' ? sch : sch.scheme_name;
              return (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 rounded-full"
                >
                  {name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-900">
          <div className="flex items-center gap-2 mb-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
            <ListChecks className="w-4 h-4" />
            Follow-Up Tasks & Action Plan
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-emerald-900 dark:text-emerald-200">
            {tasks.map((task, idx) => (
              <li key={idx}>{typeof task === 'string' ? task : task.title}</li>
            ))}
          </ul>
        </div>
      )}

      {report && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Structured Clinical Narrative
          </h3>
          <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
            {report}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ReportView;
