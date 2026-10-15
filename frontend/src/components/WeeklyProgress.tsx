import React from 'react';
import { TrendingUp, CheckCircle, ShieldCheck, HeartHandshake, Mic } from 'lucide-react';

interface WeeklyProgressProps {
  data?: {
    title?: string;
    period?: string;
    visits_completed?: number;
    immunizations_given?: number;
    schemes_enrolled?: number;
    red_flags_triggered?: number;
    voice_notes_recorded?: number;
    growth_pct?: string;
  };
}

export const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ data }) => {
  const stats = [
    { label: 'Visits completed', value: data?.visits_completed ?? 12, icon: CheckCircle },
    { label: 'Immunizations given', value: data?.immunizations_given ?? 5, icon: ShieldCheck },
    { label: 'Schemes enrolled', value: data?.schemes_enrolled ?? 3, icon: HeartHandshake },
    { label: 'Red flags triggered', value: data?.red_flags_triggered ?? 2, icon: TrendingUp },
    { label: 'Voice notes recorded', value: data?.voice_notes_recorded ?? 17, icon: Mic },
  ];

  const growth = data?.growth_pct;
  const growthLabel = (data as any)?.growth_label || 'vs last week';
  const period = data?.period || 'Last 7 Days';

  return (
    <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              This Week ({period})
            </h3>
            <p className="text-[11px] text-slate-500">Service delivery & community coverage</p>
          </div>
        </div>

        {growth ? (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
            ↑ {growth} {growthLabel}
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            Active tracking
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] mb-0.5">
                <Icon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate">{s.label}</span>
              </div>
              <p className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                {s.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
