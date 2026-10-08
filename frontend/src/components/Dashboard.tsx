import { useState, useEffect } from 'react';
import { Users, CalendarCheck, AlertTriangle, Syringe, TrendingUp, TrendingDown, Minus, Clock, MapPin, CheckCircle2, CalendarClock, ArrowRight, Sparkles, Landmark, Award, ChevronRight, GraduationCap, Shield } from 'lucide-react';
import { dashboardStats as seedStats, todayVisits as seedToday, getSchemeStats, immunizationRecords, trainingModules } from '@/data';
import { fetchDashboard, fetchImmunizations, fetchPatients, healthCheck } from '@/lib/api';
import type { ViewId, VisitStatus, Patient, ImmunizationRecord } from '@/types';

function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    let frame: number;
    const animate = (ts: number) => {
      if (startTime === null) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return count;
}

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

interface DashboardProps {
  onNavigate: (view: ViewId) => void;
}

const iconMap: Record<string, typeof Users> = {
  Users,
  CalendarCheck,
  AlertTriangle,
  Syringe,
};

const colorClasses: Record<string, { bg: string; text: string; ring: string; gradient: string; glow: string }> = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-600', ring: 'ring-primary-100/50', gradient: 'from-primary-400 to-primary-600', glow: 'shadow-glow-primary' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-600', ring: 'ring-sky-100/50', gradient: 'from-sky-400 to-sky-600', glow: 'shadow-glow-sky' },
  accent: { bg: 'bg-accent-50', text: 'text-accent-600', ring: 'ring-accent-100/50', gradient: 'from-accent-400 to-accent-500', glow: 'shadow-glow-accent' },
};

const statusConfig: Record<VisitStatus, { dot: string; label: string; bg: string; text: string }> = {
  completed: { dot: 'bg-success-500', label: 'Completed', bg: 'bg-success-50', text: 'text-success-700' },
  scheduled: { dot: 'bg-sky-500', label: 'Scheduled', bg: 'bg-sky-50', text: 'text-sky-700' },
  missed: { dot: 'bg-error-500', label: 'Missed', bg: 'bg-error-50', text: 'text-error-700' },
  pending: { dot: 'bg-accent-400', label: 'Pending', bg: 'bg-accent-50', text: 'text-accent-700' },
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const [dashboardStats, setDashboardStats] = useState(seedStats);
  const [todayVisits, setTodayVisits] = useState(seedToday);
  const [greetingDate, setGreetingDate] = useState('Today');
  const [schemeStats, setSchemeStats] = useState(getSchemeStats());
  const [priorityPatients, setPriorityPatients] = useState<Patient[]>([]);
  const [dueImmunizations, setDueImmunizations] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetchDashboard()
      .then((data: {
        stats?: typeof seedStats;
        todayVisits?: typeof seedToday;
        greetingDate?: string;
        schemeStats?: typeof schemeStats;
      }) => {
        if (data.stats?.length) setDashboardStats(data.stats);
        if (data.todayVisits) setTodayVisits(data.todayVisits);
        if (data.greetingDate) setGreetingDate(data.greetingDate);
        if (data.schemeStats) setSchemeStats(data.schemeStats);
      })
      .catch(() => undefined);
    fetchPatients().then((rows) => setPriorityPatients((rows as Patient[]).filter((patient) => ['critical', 'high-risk'].includes(patient.status)))).catch(() => undefined);
    fetchImmunizations().then((rows) => setDueImmunizations((rows as ImmunizationRecord[]).filter((row) => row.status === 'due' || row.status === 'overdue').length)).catch(() => undefined);
    const check = () => healthCheck().then(setConnected).catch(() => setConnected(false));
    void check();
    const timer = window.setInterval(check, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const completedCount = todayVisits.filter((v) => v.status === 'completed').length;
  const remainingVisits = todayVisits.filter((v) => v.status === 'scheduled' || v.status === 'pending');
  const progress = todayVisits.length ? (completedCount / todayVisits.length) * 100 : 0;

  const animStats = [
    useCountUp(parseInt(String(dashboardStats[0]?.value ?? 0), 10) || 0),
    useCountUp(parseInt(String(dashboardStats[1]?.value ?? 0), 10) || 0),
    useCountUp(parseInt(String(dashboardStats[2]?.value ?? 0), 10) || 0),
    useCountUp(parseInt(String(dashboardStats[3]?.value ?? 0), 10) || 0),
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto relative">
      <FloatingOrb className="w-72 h-72 bg-primary-200/25 -top-16 -right-10" delay={0} />
      <FloatingOrb className="w-64 h-64 bg-sky-200/20 top-60 -left-16" delay={2} />

      {/* Hero greeting card */}
      <div className="relative overflow-hidden rounded-3xl hero-gradient p-6 sm:p-8 shadow-xl shadow-primary-600/20">
        <div className="absolute inset-0 gradient-mesh opacity-40" />
        <FloatingOrb className="w-48 h-48 bg-white/10 -top-10 right-10" delay={1} />
        <FloatingOrb className="w-36 h-36 bg-sky-400/15 bottom-0 left-1/3" delay={3} />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                AI CoPilot Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-400/20 backdrop-blur-sm text-success-200 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-success-300 animate-pulse" />
                {connected ? 'API Connected' : 'API Offline'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">Good morning, Rekha</h2>
            <p className="text-primary-100 mt-1.5 text-sm sm:text-base">{greetingDate} — You have {remainingVisits.length} visits remaining today</p>
          </div>
          <button onClick={() => onNavigate('voice')} className="group inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-semibold text-sm transition-all border border-white/20 hover:border-white/30 active:scale-95">
            <Mic className="w-4 h-4" />
            Ask CoPilot
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, i) => {
          const Icon = iconMap[stat.icon];
          const colors = colorClasses[stat.color];
          const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus;
          return (
            <div
              key={stat.id}
              className="glass-card card-hover p-5 animate-slide-up group relative overflow-hidden"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className={`relative w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center ring-4 ${colors.ring}`}>
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.gradient} opacity-0 hover:opacity-100 transition-opacity`} />
                  <Icon className={`w-5 h-5 ${colors.text} relative`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${stat.trend === 'up' ? 'bg-success-50 text-success-600' : stat.trend === 'down' ? 'bg-accent-50 text-accent-600' : 'bg-slate-100 text-slate-400'}`}>
                  <TrendIcon className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl font-display font-extrabold text-slate-900 mt-4 tracking-tight tabular-nums">{animStats[i]}</p>
              <p className="text-sm text-slate-500 mt-1 font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Scheme eligibility banner */}
      {(() => {
        const s = schemeStats;
        const totalActive = s.enrolled + s.eligible;
        const enrollPct = totalActive > 0 ? Math.round((s.enrolled / totalActive) * 100) : 0;
        return (
          <button onClick={() => onNavigate('schemes')} className="group w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-50 via-primary-50/50 to-sky-50/50 border border-primary-100 p-4 flex items-center gap-4 hover:shadow-md transition-all text-left">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display font-bold text-slate-800 text-sm">Scheme Eligibility</h3>
                <span className="stat-badge bg-success-100 text-success-700">
                  <CheckCircle2 className="w-3 h-3" />
                  {s.enrolled} enrolled
                </span>
                <span className="stat-badge bg-primary-100 text-primary-700">
                  <Award className="w-3 h-3" />
                  {s.eligible} eligible
                </span>
                {s.pending > 0 && (
                  <span className="stat-badge bg-accent-100 text-accent-700">
                    {s.pending} pending docs
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-200/60 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-700" style={{ width: `${enrollPct}%` }} />
                </div>
                <span className="text-xs font-bold text-primary-600 shrink-0">{enrollPct}% enrolled</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="lg:col-span-2 glass-card p-6 group">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-lg">Today's Schedule</h3>
              <p className="text-sm text-slate-500 mt-0.5">{completedCount} of {todayVisits.length} visits completed</p>
            </div>
            <button onClick={() => onNavigate('schedule')} className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 group">
              View all
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 rounded-full transition-all duration-700 shadow-sm" style={{ width: `${progress}%` }} />
          </div>

          <div className="space-y-2">
            {todayVisits.slice(0, 5).map((visit, i) => {
              const status = statusConfig[visit.status];
              return (
                <button
                  type="button"
                  key={visit.id}
                  onClick={() => onNavigate('schedule')}
                  className="w-full text-left flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group animate-slide-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex flex-col items-center justify-center w-14 shrink-0">
                    <span className="text-sm font-bold text-slate-700">{visit.time}</span>
                    <span className={`w-2 h-2 rounded-full mt-1.5 ${status.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{visit.patientName}</p>
                    <p className="text-xs text-slate-500 truncate">{visit.type}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{visit.village}</span>
                  </div>
                  <span className={`stat-badge ${status.bg} ${status.text} shrink-0`}>
                    {status.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Priority Alerts */}
          <div className="glass-card p-6 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center shadow-md shadow-accent-500/20">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display font-bold text-slate-900">Priority Alerts</h3>
            </div>
            <div className="space-y-3">
              {priorityPatients.slice(0, 3).map((patient) => <button type="button" key={patient.id} onClick={() => onNavigate('patients')} className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-r from-accent-50 to-accent-50/30 border border-accent-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1"><span className={`w-2 h-2 rounded-full ${patient.status === 'critical' ? 'bg-error-500 animate-pulse' : 'bg-accent-500'}`} /><p className="text-sm font-bold text-slate-800">{patient.name} · {patient.status === 'critical' ? 'Critical' : 'High Risk'}</p></div>
                <p className="text-xs text-slate-600 leading-relaxed">{[patient.bp && `BP ${patient.bp}`, ...(patient.riskFactors || [])].filter(Boolean).join(' · ') || 'Open record to review details.'}</p>
              </button>)}
              {priorityPatients.length === 0 && <p className="text-sm text-slate-500">No priority patient records are available.</p>}
              <button type="button" onClick={() => onNavigate('immunization')} className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-sky-50/30 border border-sky-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-sky-500" /><p className="text-sm font-bold text-sky-800">{dueImmunizations} Immunizations Due</p></div>
                <p className="text-xs text-sky-600 leading-relaxed">Due and overdue records in the immunization tracker.</p>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md shadow-primary-500/20">
                <CalendarClock className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display font-bold text-slate-900">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              <button onClick={() => onNavigate('voice')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors text-left group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">Ask CoPilot</p>
                  <p className="text-xs text-slate-400">Voice or text guidance</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
              </button>
              <button onClick={() => onNavigate('patients')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sky-50 transition-colors text-left group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-100 to-sky-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4 text-sky-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">View Patients</p>
                  <p className="text-xs text-slate-400">Live household registry</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all" />
              </button>
              <button onClick={() => onNavigate('schedule')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent-50 transition-colors text-left group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-100 to-accent-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-4 h-4 text-accent-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">Upcoming Visits</p>
                  <p className="text-xs text-slate-400">{remainingVisits.length} remaining today</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-accent-500 group-hover:translate-x-0.5 transition-all" />
              </button>
              <button onClick={() => onNavigate('schemes')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-success-50 transition-colors text-left group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-success-100 to-success-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Landmark className="w-4 h-4 text-success-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">Gov Schemes</p>
                  <p className="text-xs text-slate-400">Check patient eligibility</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-success-500 group-hover:translate-x-0.5 transition-all" />
              </button>
              <button onClick={() => onNavigate('immunization')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sky-50 transition-colors text-left group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-100 to-sky-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-4 h-4 text-sky-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">Immunization</p>
                  <p className="text-xs text-slate-400">{immunizationRecords.filter((r) => r.status === 'overdue' || r.status === 'due').length} due now</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all" />
              </button>
              <button onClick={() => onNavigate('training')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors text-left group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">Training Center</p>
                  <p className="text-xs text-slate-400">{trainingModules.filter((m) => m.progress > 0 && m.progress < 100).length} in progress</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Mic({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 0 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}
