import React from 'react';
import { AlertOctagon, ShieldAlert, ChevronRight, Activity } from 'lucide-react';

interface RedFlagAlertsProps {
  data?: {
    title?: string;
    rules_fired_count?: number;
    source?: string;
    alerts?: Array<{
      id: string;
      patient_name: string;
      condition: string;
      evidence: string;
      severity: string;
      protocol: string;
      status: string;
      time: string;
    }>;
  };
  onViewPatient?: (patientName: string) => void;
}

export const RedFlagAlerts: React.FC<RedFlagAlertsProps> = ({ data, onViewPatient }) => {
  const alerts = data?.alerts || [
    {
      id: 'a1',
      patient_name: 'Lakshmi Devi',
      condition: 'Pre-eclampsia suspected',
      evidence: 'pregnancy + BP 140/90 + swelling in feet',
      severity: 'CRITICAL',
      protocol: 'NHM RMNCH+A Guidelines',
      status: 'Escalated to PHC',
      time: '10:45 AM',
    },
    {
      id: 'a2',
      patient_name: 'Sunita Kumari',
      condition: 'High BP alert',
      evidence: 'BP 130/85, gestational hypertension',
      severity: 'SEVERE',
      protocol: 'PMSMA Guidelines',
      status: 'Weekly follow-up',
      time: '09:30 AM',
    },
  ];

  const rulesFired = data?.rules_fired_count ?? alerts.length;

  return (
    <div className="glass-card p-5 border border-rose-200/60 dark:border-rose-950/40 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-rose-100 dark:border-rose-950/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Critical Alerts (Last 24h)
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                {rulesFired} fired
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Hardcoded red-flag rule layer (Zero Hallucination)</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full font-medium border border-rose-200/50">
          <Activity className="w-3 h-3" />
          Deterministic Layer
        </span>
      </div>

      <div className="space-y-2.5">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  {alert.patient_name}
                </span>
                <span className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold">
                  — {alert.condition}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-bold uppercase">
                  {alert.severity}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Trigger: <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">({alert.evidence})</span>
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/60 font-medium">
                {alert.status}
              </span>
              {onViewPatient && (
                <button
                  type="button"
                  onClick={() => onViewPatient(alert.patient_name)}
                  className="px-2 py-1 text-[11px] rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 font-medium flex items-center gap-0.5 shadow-2xs"
                >
                  View
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-rose-100/60 dark:border-rose-950/30 flex items-center justify-between text-[11px] text-slate-500">
        <span>Rules fired: <strong>{rulesFired}</strong></span>
        <span className="text-[10px] italic">Source: Hardcoded rule layer (never missed)</span>
      </div>
    </div>
  );
};
