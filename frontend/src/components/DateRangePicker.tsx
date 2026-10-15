import React, { useState } from 'react';
import { Calendar, Filter, RotateCcw } from 'lucide-react';

interface DateRangePickerProps {
  fromDate: string;
  toDate: string;
  onApply: (from: string, to: string) => void;
  onReset: () => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  fromDate,
  toDate,
  onApply,
  onReset,
}) => {
  const [localFrom, setLocalFrom] = useState(fromDate);
  const [localTo, setLocalTo] = useState(toDate);

  React.useEffect(() => {
    setLocalFrom(fromDate);
    setLocalTo(toDate);
  }, [fromDate, toDate]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(localFrom, localTo);
  };

  const handleQuickPreset = (preset: 'all' | 'thisMonth' | 'last3Months' | 'thisYear') => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    if (preset === 'all') {
      setLocalFrom('');
      setLocalTo('');
      onReset();
      return;
    }

    if (preset === 'thisMonth') {
      const from = `${year}-${month}-01`;
      const to = now.toISOString().slice(0, 10);
      setLocalFrom(from);
      setLocalTo(to);
      onApply(from, to);
      return;
    }

    if (preset === 'last3Months') {
      const past = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      const from = past.toISOString().slice(0, 10);
      const to = now.toISOString().slice(0, 10);
      setLocalFrom(from);
      setLocalTo(to);
      onApply(from, to);
      return;
    }

    if (preset === 'thisYear') {
      const from = `${year}-01-01`;
      const to = now.toISOString().slice(0, 10);
      setLocalFrom(from);
      setLocalTo(to);
      onApply(from, to);
      return;
    }
  };

  return (
    <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 shrink-0">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-800">Date Range Filter</span>
          <p className="text-[11px] text-slate-500">Applies across all clinical & scheme exports</p>
        </div>
      </div>

      {/* Preset pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        <button
          type="button"
          onClick={() => handleQuickPreset('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            !localFrom && !localTo ? 'bg-primary-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Time
        </button>
        <button
          type="button"
          onClick={() => handleQuickPreset('thisMonth')}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all whitespace-nowrap"
        >
          This Month
        </button>
        <button
          type="button"
          onClick={() => handleQuickPreset('last3Months')}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all whitespace-nowrap"
        >
          Last 3 Months
        </button>
        <button
          type="button"
          onClick={() => handleQuickPreset('thisYear')}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all whitespace-nowrap"
        >
          2026 Year
        </button>
      </div>

      {/* Date Pickers */}
      <form onSubmit={handleApply} className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700">
          <span className="text-[11px] text-slate-400 font-bold">From:</span>
          <input
            type="date"
            value={localFrom}
            onChange={(e) => setLocalFrom(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-800 font-semibold focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700">
          <span className="text-[11px] text-slate-400 font-bold">To:</span>
          <input
            type="date"
            value={localTo}
            onChange={(e) => setLocalTo(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-800 font-semibold focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 shadow-xs"
        >
          <Filter className="w-3 h-3" /> Apply
        </button>

        {(localFrom || localTo) && (
          <button
            type="button"
            onClick={() => handleQuickPreset('all')}
            title="Reset to all records"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </form>
    </div>
  );
};
