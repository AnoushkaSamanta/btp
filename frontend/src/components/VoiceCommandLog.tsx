import React from 'react';
import { Mic, CheckCircle2, AlertOctagon } from 'lucide-react';

interface VoiceCommandLogProps {
  data?: {
    title?: string;
    entries?: Array<{
      time: string;
      transcript: string;
      status: string;
      outcome_type: 'success' | 'alert' | string;
    }>;
  };
  onNavigateToVoice?: () => void;
}

export const VoiceCommandLog: React.FC<VoiceCommandLogProps> = ({
  data,
  onNavigateToVoice,
}) => {
  const entries = data?.entries || [
    { time: '10:45', transcript: 'Lakshmi Devi 24 years, 8 months pregnant, BP 140/90, swelling in feet...', status: 'Structured successfully', outcome_type: 'success' },
    { time: '09:30', transcript: 'Sunita BP 130/85, 2nd trimester check, complains of dizziness...', status: 'Red flag: gestational HTN', outcome_type: 'alert' },
  ];

  return (
    <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Recent Voice Inputs
            </h3>
            <p className="text-[11px] text-slate-500">Indic Speech transcription & agent routing</p>
          </div>
        </div>

        {onNavigateToVoice && (
          <button
            type="button"
            onClick={onNavigateToVoice}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            Open Voice Agent
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {entries.slice(0, 3).map((item, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
              <span>{item.time}</span>
              <span
                className={`inline-flex items-center gap-1 font-sans font-semibold ${
                  item.outcome_type === 'alert'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {item.outcome_type === 'alert' ? (
                  <AlertOctagon className="w-3 h-3" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                {item.status}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 italic font-mono line-clamp-2">
              "{item.transcript}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
