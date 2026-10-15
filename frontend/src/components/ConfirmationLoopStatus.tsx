import React from 'react';
import { ShieldCheck, CheckCircle2, Clock, Mic } from 'lucide-react';

interface ConfirmationLoopStatusProps {
  data?: {
    pending_count?: number;
    guarantee?: string;
    items?: Array<{
      id: string;
      patient_name: string;
      summary: string;
      created_at?: string;
    }>;
  };
  onReviewConfirmations?: () => void;
}

export const ConfirmationLoopStatus: React.FC<ConfirmationLoopStatusProps> = ({
  data,
  onReviewConfirmations,
}) => {
  const pendingCount = data?.pending_count ?? 2;
  const items = data?.items || [
    { id: '1', patient_name: 'Lakshmi Devi', summary: 'Lakshmi Devi visit — wait for ASHA voice confirmation' },
    { id: '2', patient_name: 'Sunita Kumari', summary: 'Sunita Kumari visit — wait for ASHA voice confirmation' },
  ];

  return (
    <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Confirmation Loop
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50">
                {pendingCount} Pending
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Worker-facing safety guarantee before saving</p>
          </div>
        </div>

        {onReviewConfirmations && (
          <button
            type="button"
            onClick={onReviewConfirmations}
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Review in Visit Notes
          </button>
        )}
      </div>

      <div className="space-y-2 mb-3">
        {items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="p-2.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                • {item.summary}
              </span>
            </div>
            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono bg-amber-100/60 dark:bg-amber-900/60 px-1.5 py-0.5 rounded shrink-0">
              Needs Voice OK
            </span>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          All saves require voice confirmation
        </span>
        <span className="text-[10px] text-slate-400">Zero unsupervised saves</span>
      </div>
    </div>
  );
};
