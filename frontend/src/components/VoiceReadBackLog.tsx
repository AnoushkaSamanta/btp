import React from 'react';
import { Volume2, CheckCircle2, Radio } from 'lucide-react';

interface VoiceReadBackLogProps {
  data?: {
    title?: string;
    language?: string;
    engine?: string;
    status?: string;
    entries?: Array<{
      time: string;
      patient: string;
      summary: string;
      confirmed: boolean;
    }>;
  };
}

export const VoiceReadBackLog: React.FC<VoiceReadBackLogProps> = ({ data }) => {
  const entries = data?.entries || [
    { time: '10:45', patient: 'Lakshmi Devi', summary: 'Lakshmi Devi visit summary (Pre-eclampsia flag, PMMVY, JSSK)', confirmed: true },
    { time: '09:30', patient: 'Sunita Kumari', summary: 'Sunita Kumari ANC check (BP 130/85, Gestational HTN review)', confirmed: true },
    { time: '08:15', patient: 'Morning Schedule', summary: 'Morning itinerary read-back (4 home visits, 2 immunizations)', confirmed: true },
  ];

  const engine = data?.engine || 'Bhashini / Indic TTS';
  const language = data?.language || 'Hindi (hi-IN)';

  return (
    <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Voice Read-Back (Last 5)
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200/50">
                <Radio className="w-2.5 h-2.5 animate-pulse text-teal-600" />
                Active
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Worker audio confirmation loop before persist</p>
          </div>
        </div>

        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          {language}
        </span>
      </div>

      <div className="space-y-2">
        {entries.slice(0, 4).map((entry, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 shrink-0">
                  {entry.time}
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {entry.patient}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5 italic">
                "{entry.summary}"
              </p>
            </div>

            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded font-medium shrink-0 self-center">
              <CheckCircle2 className="w-3 h-3" />
              Confirmed
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span>Engine: <strong className="text-slate-700 dark:text-slate-300">{engine}</strong></span>
        <span>Confirmation required: <strong className="text-emerald-600">Yes (Voice/Tap)</strong></span>
      </div>
    </div>
  );
};
