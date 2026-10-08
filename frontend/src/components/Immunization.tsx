import { useEffect, useState } from 'react';
import { Syringe, CheckCircle2, Clock, AlertCircle, Calendar, MapPin, Search, Baby, Heart, Sparkles } from 'lucide-react';
import { immunizationRecords as seedImm } from '@/data';
import { fetchImmunizations, updateImmunizationStatus } from '@/lib/api';
import type { ImmunizationRecord } from '@/types';

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

const statusConfig: Record<ImmunizationRecord['status'], { label: string; bg: string; text: string; icon: typeof CheckCircle2; dot: string; gradient: string }> = {
  completed: { label: 'Completed', bg: 'bg-success-50', text: 'text-success-700', icon: CheckCircle2, dot: 'bg-success-500', gradient: 'from-success-400 to-success-600' },
  due: { label: 'Due Now', bg: 'bg-accent-50', text: 'text-accent-700', icon: Clock, dot: 'bg-accent-500', gradient: 'from-accent-400 to-accent-500' },
  overdue: { label: 'Overdue', bg: 'bg-error-50', text: 'text-error-700', icon: AlertCircle, dot: 'bg-error-500', gradient: 'from-error-400 to-error-600' },
  upcoming: { label: 'Upcoming', bg: 'bg-sky-50', text: 'text-sky-700', icon: Calendar, dot: 'bg-sky-500', gradient: 'from-sky-400 to-sky-600' },
};

const vaccineSchedule = [
  { vaccine: 'BCG', timing: 'At birth', target: 'Newborn' },
  { vaccine: 'OPV-0', timing: 'At birth', target: 'Newborn' },
  { vaccine: 'Hep-B', timing: 'Within 24 hrs', target: 'Newborn' },
  { vaccine: 'Pentavalent-1', timing: '6 weeks', target: 'Infant' },
  { vaccine: 'OPV-1', timing: '6 weeks', target: 'Infant' },
  { vaccine: 'Pentavalent-2', timing: '10 weeks', target: 'Infant' },
  { vaccine: 'Pentavalent-3', timing: '14 weeks', target: 'Infant' },
  { vaccine: 'MR-1', timing: '9 months', target: 'Infant' },
  { vaccine: 'Td-1', timing: '16-20 weeks pregnancy', target: 'Pregnant' },
  { vaccine: 'Td-2', timing: '4 weeks after Td-1', target: 'Pregnant' },
];

export function Immunization() {
  const [filter, setFilter] = useState<'all' | ImmunizationRecord['status']>('all');
  const [search, setSearch] = useState('');
  const [immunizationRecords, setImmunizationRecords] = useState<ImmunizationRecord[]>(seedImm);
  const [actionError, setActionError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    fetchImmunizations()
      .then((rows) => {
        if (Array.isArray(rows) && rows.length) setImmunizationRecords(rows as ImmunizationRecord[]);
      })
      .catch(() => undefined);
  }, []);

  const filtered = immunizationRecords.filter((r) => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = r.patientName.toLowerCase().includes(search.toLowerCase()) || r.vaccine.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    completed: immunizationRecords.filter((r) => r.status === 'completed').length,
    due: immunizationRecords.filter((r) => r.status === 'due').length,
    overdue: immunizationRecords.filter((r) => r.status === 'overdue').length,
    upcoming: immunizationRecords.filter((r) => r.status === 'upcoming').length,
  };

  const filterTabs: { id: 'all' | ImmunizationRecord['status']; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: immunizationRecords.length },
    { id: 'overdue', label: 'Overdue', count: stats.overdue },
    { id: 'due', label: 'Due Now', count: stats.due },
    { id: 'upcoming', label: 'Upcoming', count: stats.upcoming },
    { id: 'completed', label: 'Completed', count: stats.completed },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 relative">
      <FloatingOrb className="w-72 h-72 bg-sky-200/25 -top-16 -right-10" delay={0} />
      <FloatingOrb className="w-64 h-64 bg-primary-200/20 top-40 -left-16" delay={2} />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-100">
            <Sparkles className="w-3.5 h-3.5" />
            {immunizationRecords.length} Records
          </span>
        </div>
        <h2 className="text-3xl font-display font-extrabold text-slate-900">Immunization Tracker</h2>
        <p className="text-slate-500 mt-1">Track vaccines for pregnant women and newborns</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { value: stats.completed, label: 'Completed', icon: CheckCircle2, gradient: 'from-success-400 to-success-600' },
          { value: stats.due, label: 'Due Now', icon: Clock, gradient: 'from-accent-400 to-accent-500' },
          { value: stats.overdue, label: 'Overdue', icon: AlertCircle, gradient: 'from-error-400 to-error-600' },
          { value: stats.upcoming, label: 'Upcoming', icon: Calendar, gradient: 'from-sky-400 to-sky-600' },
        ].map((stat, i) => (
          <div key={i} className="glass-card card-hover p-5 animate-slide-up group" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-display font-extrabold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {actionError && <p role="alert" className="text-sm text-error-700">{actionError}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by patient or vaccine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filter === tab.id
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-600/20'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-md text-xs ${filter === tab.id ? 'bg-primary-700' : 'bg-slate-100'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 group">
          <h3 className="font-display font-bold text-slate-900 text-lg mb-4">Immunization Records</h3>
          <div className="space-y-2">
            {filtered.map((record, i) => {
              const status = statusConfig[record.status];
              const StatusIcon = status.icon;
              return (
                <div key={record.id} className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50 transition-colors animate-slide-up border border-slate-100" style={{ animationDelay: `${i * 30}ms` }}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${status.gradient} flex items-center justify-center shadow-sm shrink-0`}>
                    <Syringe className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800 text-sm">{record.patientName}</p>
                      <span className="text-xs text-slate-400">- {record.vaccine} #{record.doseNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {(record.dueDate || '').slice(5)}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {record.village}
                      </span>
                      <span className="text-xs text-slate-400">{record.ageGroup}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {record.status !== 'completed' && (
                      <button
                        type="button"
                        disabled={updatingId === record.id}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-800"
                        onClick={async () => {
                          setUpdatingId(record.id);
                          try {
                            const updated = (await updateImmunizationStatus(record.id, 'completed')) as ImmunizationRecord;
                            setImmunizationRecords((prev) => prev.map((r) => (r.id === record.id ? { ...r, ...updated, status: 'completed' } : r)));
                            setActionError('');
                          } catch (error) {
                            setActionError(error instanceof Error ? error.message : 'Could not update the immunization record.');
                          } finally {
                            setUpdatingId('');
                          }
                        }}
                      >
                        {updatingId === record.id ? 'Saving…' : 'Mark given'}
                      </button>
                    )}
                    <span className={`stat-badge ${status.bg} ${status.text}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-6 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-display font-bold text-slate-900">UIP Schedule</h3>
          </div>
          <div className="space-y-2">
            {vaccineSchedule.map((v, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${v.target === 'Pregnant' ? 'bg-primary-100 text-primary-700' : 'bg-sky-100 text-sky-700'}`}>
                  {v.target === 'Pregnant' ? <Heart className="w-4 h-4" /> : <Baby className="w-4 h-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700">{v.vaccine}</p>
                  <p className="text-xs text-slate-400">{v.timing}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{v.target}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
