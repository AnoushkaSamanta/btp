import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SampleVisitCardProps {
  text: string;
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export function SampleVisitCard({ text, onSelect, disabled = false }: SampleVisitCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(text)}
      className="group w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-primary-50/70 dark:hover:bg-primary-950/40 border border-slate-200/80 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm flex flex-col justify-between gap-2"
    >
      <p className="text-xs text-slate-700 dark:text-slate-300 font-normal leading-relaxed group-hover:text-primary-950 dark:group-hover:text-primary-100">
        "{text}"
      </p>
      <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px] font-semibold text-primary-600 dark:text-primary-400 group-hover:text-primary-700">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Click to fill
        </span>
        <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
          Use this <ArrowRight className="w-3 h-3 ml-0.5" />
        </span>
      </div>
    </button>
  );
}

export default SampleVisitCard;
