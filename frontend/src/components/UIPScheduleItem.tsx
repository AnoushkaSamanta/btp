import React from 'react';
import { Baby, Heart, ChevronRight } from 'lucide-react';

interface UIPScheduleItemProps {
  vaccine: string;
  timing: string;
  target: 'Pregnant' | 'Newborn' | 'Infant' | 'Children';
  onClick: () => void;
}

export function UIPScheduleItem({ vaccine, timing, target, onClick }: UIPScheduleItemProps) {
  const isPregnant = target === 'Pregnant';

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left cursor-pointer group"
    >
      <span
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-transform group-hover:scale-105 ${
          isPregnant
            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
            : 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400'
        }`}
      >
        {isPregnant ? <Heart className="w-4 h-4" /> : <Baby className="w-4 h-4" />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {vaccine}
        </p>
        <p className="text-xs text-slate-400 truncate">{timing}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[11px] text-slate-400 hidden sm:inline">{target}</span>
        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
      </div>
    </button>
  );
}
