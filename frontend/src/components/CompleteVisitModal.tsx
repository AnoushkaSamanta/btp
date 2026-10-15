import { useState } from 'react';
import { X, CheckCircle2, Calendar, FileText } from 'lucide-react';
import { completeVisitApi } from '@/lib/api';
import type { Visit } from '@/types';

interface CompleteVisitModalProps {
  isOpen: boolean;
  visit: Visit | null;
  onClose: () => void;
  onSuccess: (completedVisit: Visit, nextVisit?: Visit) => void;
}

const NEXT_VISIT_TYPES = [
  'High-Risk Follow-up',
  'ANC Check-up',
  'PNC Visit',
  'Immunization',
  'General Check-up',
];

export function CompleteVisitModal({ isOpen, visit, onClose, onSuccess }: CompleteVisitModalProps) {
  const [notes, setNotes] = useState(
    'BP 140/90. Advised rest and low-salt diet. Referred to PHC for glucose test. IFA tablets given. Next visit in 2 weeks.'
  );
  const [scheduleNext, setScheduleNext] = useState(true);
  const [nextDate, setNextDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [nextType, setNextType] = useState('High-Risk Follow-up');
  const [nextTime, setNextTime] = useState('10:00 AM');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !visit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await completeVisitApi(visit.id, {
        notes: notes.trim(),
        schedule_next: scheduleNext,
        next_date: scheduleNext ? nextDate : undefined,
        next_type: scheduleNext ? nextType : undefined,
        next_time: scheduleNext ? nextTime : undefined,
      });
      onSuccess(res.visit as Visit, res.nextVisit as Visit | undefined);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to complete visit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="card-elevated max-w-lg w-full p-6 relative rounded-2xl shadow-2xl bg-white border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-success-50 text-success-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-slate-900">Complete Visit</h3>
              <p className="text-xs text-slate-500">Record observations and plan follow-up</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-error-50 text-error-700 text-xs font-semibold border border-error-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <p>
              <span className="font-semibold text-slate-800">Patient:</span> {visit.patientName} ({visit.village})
            </p>
            <p>
              <span className="font-semibold text-slate-800">Visit:</span> {visit.type} ({visit.trimester || 'ANC'}) · {visit.date} {visit.time}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Visit Clinical Notes & Outcomes <span className="text-error-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              required
              className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 leading-relaxed resize-none"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer mb-3 select-none">
              <input
                type="checkbox"
                checked={scheduleNext}
                onChange={(e) => setScheduleNext(e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
              />
              <span className="text-sm font-semibold text-slate-800">Schedule next follow-up visit</span>
            </label>

            {scheduleNext && (
              <div className="p-3.5 bg-primary-50/50 rounded-xl border border-primary-100 space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Next Visit Date
                    </label>
                    <input
                      type="date"
                      value={nextDate}
                      onChange={(e) => setNextDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-primary-500"
                      required={scheduleNext}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Time Slot
                    </label>
                    <input
                      type="text"
                      value={nextTime}
                      onChange={(e) => setNextTime(e.target.value)}
                      placeholder="10:00 AM"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Follow-up Type
                  </label>
                  <select
                    value={nextType}
                    onChange={(e) => setNextType(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-primary-500"
                  >
                    {NEXT_VISIT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-success-600 text-white hover:bg-success-700 transition-colors shadow-md shadow-success-600/20 disabled:opacity-50"
            >
              {submitting ? 'Completing...' : 'Complete Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
