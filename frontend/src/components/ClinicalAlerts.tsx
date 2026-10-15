import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ClinicalAlertsProps {
  flags?: Array<{ title: string; severity: string; action: string; detail?: string }>;
  cannotAssess?: boolean;
}

export function ClinicalAlerts({ flags = [], cannotAssess = false }: ClinicalAlertsProps) {
  if (cannotAssess) {
    return (
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
        <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          Clinical Alerts
        </p>
        <p className="text-slate-500 italic">Cannot assess — no clinical data</p>
      </div>
    );
  }

  const hasFlags = flags.length > 0;

  return (
    <div
      className={`p-3 rounded-xl border text-xs ${
        hasFlags
          ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
          : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <p
          className={`font-semibold flex items-center gap-1.5 ${
            hasFlags ? 'text-amber-900 dark:text-amber-300' : 'text-emerald-900 dark:text-emerald-300'
          }`}
        >
          {hasFlags ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          )}
          Clinical Alerts ({flags.length})
        </p>
      </div>

      {hasFlags ? (
        <div className="space-y-1.5">
          {flags.map((flag, idx) => {
            const isCrit = flag.severity === 'critical';
            return (
              <div
                key={idx}
                className="text-[11px] text-amber-950 dark:text-amber-200 bg-white/70 dark:bg-slate-900/70 p-2 rounded-lg border border-amber-100 dark:border-amber-900/40"
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <span
                    className={`px-1 rounded text-[9px] uppercase ${
                      isCrit ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {flag.severity}
                  </span>
                  <span>{flag.title}</span>
                </div>
                {flag.action && (
                  <p className="text-[10px] text-amber-800 dark:text-amber-300 mt-0.5">
                    <strong>Action:</strong> {flag.action}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
          No emergency flags triggered on recorded vitals.
        </p>
      )}
    </div>
  );
}

export default ClinicalAlerts;
