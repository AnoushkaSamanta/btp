import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { deleteVisit } from '@/lib/api';
import type { Visit } from '@/types';

interface CancelVisitModalProps {
  isOpen: boolean;
  visit: Visit | null;
  onClose: () => void;
  onSuccess: (cancelledVisitId: string) => void;
}

const REASONS = [
  'Patient unavailable',
  'Rescheduled',
  'Emergency',
  'Other',
];

export function CancelVisitModal({ isOpen, visit, onClose, onSuccess }: CancelVisitModalProps) {
  const [selectedReason, setSelectedReason] = useState('Patient unavailable');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !visit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const reasonDetail = notes ? `${selectedReason} - ${notes.trim()}` : selectedReason;
      await deleteVisit(visit.id, reasonDetail);
      onSuccess(visit.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to cancel visit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="card-elevated max-w-md w-full p-6 relative rounded-2xl shadow-2xl bg-white border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-error-50 text-error-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-slate-900">Cancel Visit</h3>
              <p className="text-xs text-slate-500">Remove or cancel scheduled appointment</p>
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
          <p className="text-sm text-slate-600">
            Are you sure you want to cancel the <span className="font-semibold text-slate-900">{visit.type}</span> visit for{' '}
            <span className="font-semibold text-slate-900">{visit.patientName}</span> on {visit.date}?
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Reason for cancellation:
            </label>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700 transition-colors"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-error-600 focus:ring-error-500 border-slate-300"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Additional Notes (Optional):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Patient travelled to maternal village, will reschedule on return"
              rows={2}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-error-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Keep Visit
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-error-600 text-white hover:bg-error-700 transition-colors shadow-md shadow-error-600/20 disabled:opacity-50"
            >
              {submitting ? 'Cancelling...' : 'Cancel Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
