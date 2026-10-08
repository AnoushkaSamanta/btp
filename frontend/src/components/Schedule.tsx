import { useEffect, useState } from 'react';
import { MapPin, Clock, ChevronLeft, ChevronRight, CheckCircle2, Circle, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { todayVisits as seedToday, upcomingVisits as seedUpcoming } from '@/data';
import { fetchDashboard, fetchVisits, updateVisitStatus } from '@/lib/api';
import type { Visit } from '@/types';
import type { VisitStatus } from '@/types';

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

const statusConfig: Record<VisitStatus, { bg: string; text: string; border: string; label: string; icon: typeof CheckCircle2; gradient: string; dot: string }> = {
  completed: { bg: 'bg-success-50', text: 'text-success-700', border: 'border-success-300', label: 'Completed', icon: CheckCircle2, gradient: 'from-success-400 to-success-600', dot: 'bg-success-500' },
  scheduled: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-300', label: 'Scheduled', icon: Clock, gradient: 'from-sky-400 to-sky-600', dot: 'bg-sky-500' },
  missed: { bg: 'bg-error-50', text: 'text-error-700', border: 'border-error-300', label: 'Missed', icon: AlertCircle, gradient: 'from-error-400 to-error-600', dot: 'bg-error-500' },
  pending: { bg: 'bg-accent-50', text: 'text-accent-700', border: 'border-accent-300', label: 'Pending', icon: Circle, gradient: 'from-accent-400 to-accent-500', dot: 'bg-accent-400' },
};

export function Schedule({ focusVisitId = '' }: { focusVisitId?: string }) {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today');
  const [allVisits, setAllVisits] = useState<Visit[]>([...seedToday, ...seedUpcoming]);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [actionError, setActionError] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const monthLabel = selectedMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  useEffect(() => {
    Promise.all([fetchVisits(), fetchDashboard()])
      .then(([rows]: [Visit[], { today?: string }]) => setAllVisits(rows))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const visit = allVisits.find((item) => item.id === focusVisitId);
    if (!visit) return;
    const visitDate = new Date(`${visit.date}T00:00:00`);
    setSelectedMonth(new Date(visitDate.getFullYear(), visitDate.getMonth(), 1));
    setActiveTab(visit.date === today ? 'today' : 'upcoming');
  }, [focusVisitId, allVisits, today]);

  useEffect(() => {
    if (!focusVisitId) return;
    const frame = requestAnimationFrame(() => document.querySelector(`[data-visit-id="${CSS.escape(focusVisitId)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    return () => cancelAnimationFrame(frame);
  }, [focusVisitId, allVisits, activeTab, selectedMonth]);

  const todayVisits = allVisits.filter((visit) => visit.date === today);
  const monthVisits = allVisits.filter((visit) => {
    const date = new Date(`${visit.date}T00:00:00`);
    const sameMonth = date.getFullYear() === selectedMonth.getFullYear() && date.getMonth() === selectedMonth.getMonth();
    const isCurrentMonth = selectedMonth.getFullYear() === new Date().getFullYear() && selectedMonth.getMonth() === new Date().getMonth();
    return sameMonth && (!isCurrentMonth || visit.date > today);
  });
  const visits = (activeTab === 'today' ? todayVisits : monthVisits).slice().sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const grouped: Record<string, typeof visits> = {};
  visits.forEach((v) => {
    if (!grouped[v.date]) grouped[v.date] = [];
    grouped[v.date].push(v);
  });

  const completed = todayVisits.filter((v) => v.status === 'completed').length;
  const scheduled = todayVisits.filter((v) => v.status === 'scheduled').length;
  const pending = todayVisits.filter((v) => v.status === 'pending').length;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto relative">
      <FloatingOrb className="w-72 h-72 bg-primary-200/25 -top-16 -right-10" delay={0} />
      <FloatingOrb className="w-64 h-64 bg-sky-200/20 top-40 -left-16" delay={2} />

      <div className="relative flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100">
              <Sparkles className="w-3.5 h-3.5" />
              {monthLabel}
            </span>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-slate-900">Schedule</h2>
          <p className="text-slate-500 mt-1">Manage your patient visits and appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Previous month" onClick={() => setSelectedMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
          <span className="text-sm font-bold text-slate-700 px-3">{monthLabel}</span>
          <button type="button" aria-label="Next month" onClick={() => setSelectedMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { count: completed, label: 'Completed Today', icon: CheckCircle2, gradient: 'from-success-400 to-success-600', bg: 'bg-success-50' },
          { count: scheduled, label: 'Scheduled Today', icon: Clock, gradient: 'from-sky-400 to-sky-600', bg: 'bg-sky-50' },
          { count: pending, label: 'Pending', icon: AlertCircle, gradient: 'from-accent-400 to-accent-500', bg: 'bg-accent-50' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 animate-slide-up group" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-display font-extrabold text-slate-900">{stat.count}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'today'
              ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-600/20'
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'upcoming'
              ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-600/20'
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {selectedMonth.getFullYear() === new Date().getFullYear() && selectedMonth.getMonth() === new Date().getMonth() ? 'Upcoming' : monthLabel}
        </button>
      </div>

      {actionError && <p role="alert" className="mb-4 text-sm text-error-700">{actionError}</p>}
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, dayVisits], di) => {
          const d = new Date(`${date}T12:00:00`);
          const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
          return (
            <div key={date} className="animate-slide-up relative" style={{ animationDelay: `${di * 80}ms` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-lg font-display font-extrabold text-slate-700">{d.getDate()}</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800">{dayName}</h3>
                  <p className="text-xs text-slate-500">{dayVisits.length} visits scheduled</p>
                </div>
              </div>

              <div className="space-y-3 ml-2 pl-14 border-l-2 border-slate-100">
                {dayVisits.map((visit, vi) => {
                  const status = statusConfig[visit.status];
                  const StatusIcon = status.icon;
                  return (
                    <div key={visit.id} data-visit-id={visit.id} className={`glass-card p-4 border-l-4 ${status.border} card-hover animate-slide-up`} style={{ animationDelay: `${vi * 40}ms` }}>
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center justify-center w-14 shrink-0">
                          <span className="text-sm font-bold text-slate-700">{visit.time}</span>
                          <span className="text-xs text-slate-400 mt-1">{visit.trimester}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-display font-bold text-slate-900">{visit.patientName}</h4>
                            <span className={`stat-badge ${status.bg} ${status.text}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{visit.type}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{visit.village}</span>
                            </div>
                          </div>
                          {visit.notes && (
                            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                              <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <p className="text-xs text-slate-600 leading-relaxed">{visit.notes}</p>
                            </div>
                          )}
                          {visit.status !== 'completed' && (
                            <button
                              type="button"
                              className="mt-3 text-xs font-semibold text-primary-600 hover:text-primary-800"
                              onClick={async () => {
                                try {
                                  const updated = (await updateVisitStatus(visit.id, 'completed')) as Visit;
                                  setAllVisits((list) => list.map((v) => (v.id === visit.id ? { ...v, ...updated, status: 'completed' as const } : v)));
                                  setActionError('');
                                } catch (error) {
                                  setActionError(error instanceof Error ? error.message : 'Could not update this visit.');
                                }
                              }}
                            >
                              Mark completed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {visits.length === 0 && <div className="glass-card p-10 text-center text-sm text-slate-500">No visits are scheduled for this selection.</div>}
    </div>
  );
}
