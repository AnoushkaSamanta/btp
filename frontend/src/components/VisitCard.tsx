import { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
  FileText,
  MoreVertical,
  Edit2,
  Check,
  Calendar,
  XCircle,
  User,
  Copy,
  Bell,
} from 'lucide-react';
import type { Visit, VisitStatus } from '@/types';

interface VisitCardProps {
  visit: Visit;
  index: number;
  onEdit: (visit: Visit) => void;
  onComplete: (visit: Visit) => void;
  onCancel: (visit: Visit) => void;
  onReschedule: (visit: Visit) => void;
  onDuplicate: (visit: Visit) => void;
  onSelectPatient: (patientId: string) => void;
}

const statusConfig: Record<
  VisitStatus,
  { bg: string; text: string; border: string; label: string; icon: typeof CheckCircle2 }
> = {
  completed: {
    bg: 'bg-success-50 text-success-700',
    text: 'text-success-700',
    border: 'border-l-success-500',
    label: 'Completed',
    icon: CheckCircle2,
  },
  scheduled: {
    bg: 'bg-sky-50 text-sky-700',
    text: 'text-sky-700',
    border: 'border-l-sky-500',
    label: 'Scheduled',
    icon: Clock,
  },
  missed: {
    bg: 'bg-error-50 text-error-700',
    text: 'text-error-700',
    border: 'border-l-error-500',
    label: 'Missed',
    icon: AlertCircle,
  },
  pending: {
    bg: 'bg-accent-50 text-accent-700',
    text: 'text-accent-700',
    border: 'border-l-accent-500',
    label: 'Pending',
    icon: Circle,
  },
};

export function VisitCard({
  visit,
  index,
  onEdit,
  onComplete,
  onCancel,
  onReschedule,
  onDuplicate,
  onSelectPatient,
}: VisitCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Check if visit is within 24 hours
  const isWithin24Hours = () => {
    try {
      const visitDate = new Date(`${visit.date}T10:00:00`);
      const now = new Date();
      const diffHours = (visitDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours >= -12 && diffHours <= 36;
    } catch {
      return false;
    }
  };

  const hasReminder = visit.status !== 'completed' && isWithin24Hours();
  const status = statusConfig[visit.status] || statusConfig.scheduled;
  const StatusIcon = status.icon;

  return (
    <div
      data-visit-id={visit.id}
      className={`glass-card p-4 border-l-4 ${status.border} card-hover animate-slide-up group relative transition-all`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Time slot column */}
        <div className="flex flex-col items-center justify-center w-16 shrink-0 pt-0.5">
          <span className="text-sm font-bold text-slate-800">{visit.time}</span>
          <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
            {visit.trimester || 'ANC'}
          </span>
          {hasReminder && (
            <span
              className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-accent-700 bg-accent-50 px-1.5 py-0.5 rounded-full border border-accent-200"
              title="Reminder: Visit scheduled within 24 hours"
            >
              <Bell className="w-3 h-3 text-accent-600 animate-pulse" />
              Due
            </span>
          )}
        </div>

        {/* Details column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Clickable Patient Name linking to profile */}
              <button
                type="button"
                onClick={() => onSelectPatient(visit.patientId)}
                className="font-display font-bold text-slate-900 text-base hover:text-primary-600 hover:underline transition-colors text-left cursor-pointer flex items-center gap-1"
                title={`Open patient profile for ${visit.patientName}`}
              >
                {visit.patientName}
              </button>
              <span className={`stat-badge ${status.bg} text-xs font-semibold py-0.5 px-2`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>

            {/* Quick Actions & Menu */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Quick action buttons (hover or mobile) */}
              {visit.status !== 'completed' && (
                <button
                  type="button"
                  onClick={() => onComplete(visit)}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-success-50 text-success-700 hover:bg-success-600 hover:text-white transition-colors"
                  title="Mark as complete"
                >
                  <Check className="w-3 h-3" />
                  Complete
                </button>
              )}

              {/* 3-dots Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-label="Visit options"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-9 z-30 w-52 card-elevated rounded-xl shadow-xl border border-slate-200 bg-white py-1.5 animate-slide-up text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onSelectPatient(visit.patientId);
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      View Patient Profile
                    </button>
                    {visit.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onComplete(visit);
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold text-success-700 hover:bg-success-50 flex items-center gap-2"
                      >
                        <Check className="w-3.5 h-3.5 text-success-600" />
                        Mark as Complete
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(visit);
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      Edit Visit Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onReschedule(visit);
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50 flex items-center gap-2"
                    >
                      <Calendar className="w-3.5 h-3.5 text-sky-600" />
                      Reschedule
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDuplicate(visit);
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      Duplicate for Next Month
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onCancel(visit);
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold text-error-600 hover:bg-error-50 flex items-center gap-2"
                    >
                      <XCircle className="w-3.5 h-3.5 text-error-500" />
                      Cancel Visit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm font-medium text-slate-600">{visit.type}</p>

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{visit.village}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{visit.date}</span>
            </div>
          </div>

          {/* Notes field */}
          {visit.notes && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-600 leading-relaxed">{visit.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
