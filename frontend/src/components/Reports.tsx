import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, FileBarChart, Users, CalendarCheck, Activity, Baby, Download, MapPin, Syringe, Award, CheckCircle2, Sparkles } from 'lucide-react';
import { fetchImmunizations, fetchPatients, fetchReportsSummary, fetchSchemes, fetchVisits } from '@/lib/api';
import { downloadClinicalPdf, downloadCsv } from '@/lib/download';


function useCountUp(target: number, duration = 1200) {
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

export function Reports() {
  const [summary, setSummary] = useState({
    totalVisits: 0,
    completedVisits: 0,
    patientCount: 0,
    immunizations: 0,
    referrals: 0,
    schemeStats: { total: 0, enrolled: 0, eligible: 0, pending: 0, notEligible: 0 },
    villageStats: [] as Array<{
      name: string;
      patients: number;
      critical: number;
      highRisk: number;
      immunizations: number;
      immunizationRate: number;
      overdue: number;
    }>,
    immunizationByStatus: { completed: 0, due: 0, overdue: 0, upcoming: 0 },
  });
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; visits: number; immunizations: number; referrals: number }>>([]);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    fetchReportsSummary().then((data) => setSummary((prev) => ({ ...prev, ...data }))).catch(() => undefined);
    Promise.all([fetchVisits(), fetchImmunizations()]).then(([visits, immunizations]) => {
      const now = new Date();
      const months = Array.from({ length: 6 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - 5 + index, 1));
      setMonthlyData(months.map((month) => {
        const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
        const inMonth = (value: string) => value?.slice(0, 7) === key;
        const monthVisits = (visits as Array<{ date: string; protocolFlags?: Array<{ severity?: string }> }>).filter((visit) => inMonth(visit.date));
        return {
          month: month.toLocaleDateString('en-IN', { month: 'short' }),
          visits: monthVisits.length,
          immunizations: (immunizations as Array<{ dueDate: string }>).filter((item) => inMonth(item.dueDate)).length,
          referrals: monthVisits.filter((visit) => visit.protocolFlags?.some((flag) => flag.severity === 'critical')).length,
        };
      }));
    }).catch(() => undefined);
  }, []);

  const maxVisits = Math.max(1, ...monthlyData.map((d) => d.visits));
  const maxImm = Math.max(1, ...monthlyData.map((d) => d.immunizations));
  const maxReferrals = Math.max(1, ...monthlyData.map((d) => d.referrals));
  const schemeStats = summary.schemeStats;
  const outcomes = [
    { label: 'Visits completed', value: summary.completedVisits, total: summary.totalVisits, color: 'from-success-400 to-success-600', icon: CheckCircle2 },
    { label: 'Immunizations completed', value: summary.immunizationByStatus.completed, total: summary.immunizations, color: 'from-sky-400 to-sky-600', icon: Baby },
    { label: 'Scheme enrollments', value: schemeStats.enrolled, total: schemeStats.total, color: 'from-primary-400 to-primary-600', icon: Activity },
    { label: 'Critical visit flags', value: summary.referrals, total: summary.totalVisits, color: 'from-accent-400 to-accent-500', icon: CalendarCheck },
  ];

  const villageStats = summary.villageStats;

  const schemeEnrollmentRate = schemeStats.total > 0 ? Math.round((schemeStats.enrolled / schemeStats.total) * 100) : 0;
  const ringCircumference = 2 * Math.PI * 52;

  const animCount1 = useCountUp(summary.totalVisits || 0);
  const animCount2 = useCountUp(summary.patientCount || 0);
  const animCount3 = useCountUp(summary.immunizations || 0);
  const animCount4 = useCountUp(summary.referrals || 0);

  const statCards = [
    { label: 'Total visits', value: animCount1, change: 'registry', trend: 'up', icon: CalendarCheck, gradient: 'from-primary-400 to-primary-600', glow: 'shadow-primary-500/20' },
    { label: 'Patients', value: animCount2, change: 'active', trend: 'up', icon: Users, gradient: 'from-sky-400 to-sky-600', glow: 'shadow-sky-500/20' },
    { label: 'Immunizations', value: animCount3, change: '+25%', trend: 'up', icon: Baby, gradient: 'from-accent-400 to-accent-500', glow: 'shadow-accent-500/20' },
    { label: 'Referrals to PHC', value: animCount4, change: '-8%', trend: 'down', icon: Activity, gradient: 'from-slate-400 to-slate-500', glow: 'shadow-slate-500/20' },
  ];

  const exportReport = async (kind: 'monthly' | 'patients' | 'immunizations' | 'villages' | 'schemes' | 'pdf') => {
    setExportError('');
    try {
      if (kind === 'pdf') {
        downloadClinicalPdf('ASHA_Clinical_Report.pdf', {
          patient_name: 'Lakshmi Devi',
          village: 'Ramnagar Sector',
          blood_pressure: '140/90',
          hemoglobin: 8.2,
          report: 'Monthly Sector Clinical Visit Summary recorded by ASHA Co-Pilot.',
        });
        return;
      }
      if (kind === 'monthly') downloadCsv('asha-monthly-summary.csv', monthlyData as unknown as Array<Record<string, unknown>>);
      if (kind === 'patients') downloadCsv('asha-patient-registry.csv', await fetchPatients() as Array<Record<string, unknown>>);
      if (kind === 'immunizations') downloadCsv('asha-immunization-log.csv', await fetchImmunizations() as Array<Record<string, unknown>>);
      if (kind === 'villages') downloadCsv('asha-village-report.csv', summary.villageStats as unknown as Array<Record<string, unknown>>);
      if (kind === 'schemes') {
        const result = await fetchSchemes() as { eligibility?: Array<Record<string, unknown>> };
        downloadCsv('asha-scheme-report.csv', result.eligibility || []);
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Could not export report.');
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 relative">
      {/* Floating background orbs */}
      <FloatingOrb className="w-72 h-72 bg-primary-200/30 -top-20 -right-10" delay={0} />
      <FloatingOrb className="w-64 h-64 bg-sky-200/25 top-40 -left-16" delay={2} />
      <FloatingOrb className="w-56 h-56 bg-accent-200/20 bottom-20 right-20" delay={4} />

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl hero-gradient p-7 shadow-xl shadow-primary-600/20">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <FloatingOrb className="w-40 h-40 bg-white/10 -top-10 right-10" delay={1} />
        <FloatingOrb className="w-32 h-32 bg-white/5 bottom-0 left-20" delay={3} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Analytics Dashboard
              </span>
            </div>
            <h2 className="text-3xl font-display font-extrabold text-white">Reports & Analytics</h2>
            <p className="text-primary-100 mt-1.5 text-sm">Performance metrics for the last 6 months - Real-time insights</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => void exportReport('pdf')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary-800 font-semibold text-sm shadow-md hover:bg-slate-50 hover:scale-105 transition-all active:scale-95 cursor-pointer">
              <Download className="w-4 h-4 text-primary-600" />
              Export PDF Report
            </button>
            <button type="button" onClick={() => void exportReport('monthly')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm text-white font-semibold text-sm border border-white/20 hover:bg-white/25 hover:scale-105 transition-all active:scale-95 cursor-pointer">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {statCards.map((stat, i) => {
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <div
              key={stat.label}
              className="glass-card card-hover p-5 animate-slide-up group relative overflow-hidden"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity animate-glow-pulse`} />
              <div className="flex items-start justify-between mb-3 relative">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.glow} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${stat.trend === 'up' ? 'bg-success-50 text-success-600' : 'bg-accent-50 text-accent-600'}`}>
                  <TrendIcon className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl font-display font-extrabold text-slate-900 tabular-nums">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Monthly activity + Care outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        <div className="lg:col-span-2 glass-card p-6 group">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-lg">Monthly Activity</h3>
              <p className="text-sm text-slate-500">Visits, immunizations, and new registrations</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
              <BarChart3 className="w-5 h-5 text-primary-600" />
            </div>
          </div>

          {/* Multi-bar chart */}
          <div className="flex items-end justify-between gap-3 h-48 mb-2">
            {monthlyData.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group/bar">
                <div className="w-full flex items-end justify-center gap-1 h-40">
                  <div
                    className="w-1/3 rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-400 shadow-sm transition-all duration-700 group-hover/bar:from-primary-600 group-hover/bar:to-primary-500 animate-bar-grow"
                    style={{ height: `${(d.visits / maxVisits) * 100}%`, animationDelay: `${i * 100}ms` }}
                  />
                  <div
                    className="w-1/3 rounded-t-lg bg-gradient-to-t from-sky-500 to-sky-400 shadow-sm transition-all duration-700 group-hover/bar:from-sky-600 group-hover/bar:to-sky-500 animate-bar-grow"
                    style={{ height: `${(d.immunizations / maxImm) * 100}%`, animationDelay: `${i * 100 + 50}ms` }}
                  />
                  <div
                    className="w-1/3 rounded-t-lg bg-gradient-to-t from-accent-500 to-accent-400 shadow-sm transition-all duration-700 group-hover/bar:from-accent-600 group-hover/bar:to-accent-500 animate-bar-grow"
                    style={{ height: `${(d.referrals / maxReferrals) * 100}%`, animationDelay: `${i * 100 + 100}ms` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-500">{d.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-5 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-lg bg-gradient-to-r from-primary-400 to-primary-600" />
              <span className="text-slate-500 font-medium">Visits</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-lg bg-gradient-to-r from-sky-400 to-sky-600" />
              <span className="text-slate-500 font-medium">Immunizations</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-lg bg-gradient-to-r from-accent-400 to-accent-500" />
              <span className="text-slate-500 font-medium">Critical Flags</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 group">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
              <FileBarChart className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-display font-bold text-slate-900">Care Outcomes</h3>
          </div>
          <div className="space-y-5">
            {outcomes.map((o, i) => {
              const pct = o.total > 0 ? Math.round((o.value / o.total) * 100) : 0;
              return (
                <div key={o.label} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <o.icon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">{o.label}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{o.value}/{o.total}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${o.color} rounded-full transition-all duration-1000 shadow-sm animate-bar-grow`}
                      style={{ width: `${pct}%`, transformOrigin: 'left' }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{pct}% completion</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Village breakdown + scheme ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        <div className="lg:col-span-2 glass-card p-6 group">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-lg">Village-wise Breakdown</h3>
              <p className="text-sm text-slate-500">Patient distribution and care metrics by village</p>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Village</th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Patients</th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Critical</th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">High Risk</th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Immunizations</th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Imm. Rate</th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Overdue</th>
                </tr>
              </thead>
              <tbody>
                {villageStats.map((v, i) => (
                  <tr key={v.name} className="border-b border-slate-50 hover:bg-primary-50/30 transition-all animate-slide-up group/row" style={{ animationDelay: `${i * 60}ms` }}>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-100 to-primary-100 flex items-center justify-center group-hover/row:scale-110 transition-transform">
                          <MapPin className="w-4 h-4 text-primary-600" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{v.name}</span>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3.5 text-sm font-bold text-slate-700">{v.patients}</td>
                    <td className="text-center px-3 py-3.5">
                      {v.critical > 0 ? (
                        <span className="stat-badge bg-error-50 text-error-700">{v.critical}</span>
                      ) : (
                        <span className="text-sm text-slate-300">-</span>
                      )}
                    </td>
                    <td className="text-center px-3 py-3.5">
                      {v.highRisk > 0 ? (
                        <span className="stat-badge bg-accent-50 text-accent-700">{v.highRisk}</span>
                      ) : (
                        <span className="text-sm text-slate-300">-</span>
                      )}
                    </td>
                    <td className="text-center px-3 py-3.5 text-sm text-slate-600">{v.immunizations}</td>
                    <td className="text-center px-3 py-3.5">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 animate-bar-grow ${v.immunizationRate >= 75 ? 'bg-gradient-to-r from-success-400 to-success-600' : v.immunizationRate >= 50 ? 'bg-gradient-to-r from-accent-400 to-accent-500' : 'bg-gradient-to-r from-error-400 to-error-600'}`} style={{ width: `${v.immunizationRate}%`, transformOrigin: 'left' }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{v.immunizationRate}%</span>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3.5">
                      {v.overdue > 0 ? (
                        <span className="stat-badge bg-error-50 text-error-700">{v.overdue}</span>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-success-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scheme enrollment ring chart */}
        <div className="glass-card p-6 group relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-success-200/20 rounded-full blur-2xl animate-glow-pulse" />
          <div className="flex items-center gap-3 mb-5 relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center shadow-md shadow-success-500/20 group-hover:scale-110 transition-transform duration-300">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-display font-bold text-slate-900">Scheme Enrollment</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-4 relative">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="url(#schemeGradient)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${ringCircumference}`}
                  strokeDashoffset={`${ringCircumference - (ringCircumference * schemeEnrollmentRate) / 100}`}
                  className="animate-ring-fill"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(34, 145, 111, 0.3))' }}
                />
                <defs>
                  <linearGradient id="schemeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#42ad8a" />
                    <stop offset="100%" stopColor="#16755a" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-display font-extrabold text-slate-900">{schemeEnrollmentRate}%</span>
                <span className="text-xs text-slate-400 font-medium">Enrolled</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full mt-6">
              <div className="text-center p-3 rounded-xl bg-success-50">
                <p className="text-2xl font-display font-extrabold text-success-700">{schemeStats.enrolled}</p>
                <p className="text-xs text-slate-500 mt-0.5">Enrolled</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-primary-50">
                <p className="text-2xl font-display font-extrabold text-primary-700">{schemeStats.eligible}</p>
                <p className="text-xs text-slate-500 mt-0.5">Eligible</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-accent-50">
                <p className="text-2xl font-display font-extrabold text-accent-700">{schemeStats.pending}</p>
                <p className="text-xs text-slate-500 mt-0.5">Pending</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-100">
                <p className="text-2xl font-display font-extrabold text-slate-500">{schemeStats.notEligible}</p>
                <p className="text-xs text-slate-500 mt-0.5">Not Eligible</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Immunization summary */}
      <div className="glass-card p-6 group relative overflow-hidden">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-200/20 rounded-full blur-3xl animate-float-slow" />
        <div className="flex items-center gap-3 mb-5 relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-110 transition-transform duration-300">
            <Syringe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900 text-lg">Immunization Summary</h3>
            <p className="text-sm text-slate-500">Coverage across all villages</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {[
            { label: 'Completed', value: summary.immunizationByStatus.completed, gradient: 'from-success-400 to-success-600', icon: CheckCircle2, glow: 'shadow-success-500/20' },
            { label: 'Due Now', value: summary.immunizationByStatus.due, gradient: 'from-accent-400 to-accent-500', icon: Activity, glow: 'shadow-accent-500/20' },
            { label: 'Overdue', value: summary.immunizationByStatus.overdue, gradient: 'from-error-400 to-error-600', icon: TrendingDown, glow: 'shadow-error-500/20' },
            { label: 'Upcoming', value: summary.immunizationByStatus.upcoming, gradient: 'from-sky-400 to-sky-600', icon: TrendingUp, glow: 'shadow-sky-500/20' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/60 border border-slate-100 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md ${item.glow} mb-3 hover:scale-110 transition-transform`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-display font-extrabold text-slate-900 tabular-nums">{item.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Generate report */}
      <div className="glass-card p-6 group relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-primary-200/20 rounded-full blur-2xl animate-glow-pulse" />
        <div className="flex items-center gap-3 mb-4 relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900 text-lg">Generate Report</h3>
            <p className="text-sm text-slate-500">Download reports for your records</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 relative">
          <button type="button" onClick={() => void exportReport('monthly')} className="btn-primary group/btn">
            <Download className="w-4 h-4 group-hover/btn:animate-bounce" />
            Monthly Summary
          </button>
          <button type="button" onClick={() => void exportReport('patients')} className="btn-ghost border border-slate-200 hover:border-primary-300 hover:text-primary-600 group/btn">
            <FileBarChart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            Patient Registry
          </button>
          <button type="button" onClick={() => void exportReport('immunizations')} className="btn-ghost border border-slate-200 hover:border-sky-300 hover:text-sky-600 group/btn">
            <Syringe className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            Immunization Log
          </button>
          <button type="button" onClick={() => void exportReport('villages')} className="btn-ghost border border-slate-200 hover:border-accent-300 hover:text-accent-600 group/btn">
            <MapPin className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            Village-wise Report
          </button>
          <button type="button" onClick={() => void exportReport('schemes')} className="btn-ghost border border-slate-200 hover:border-success-300 hover:text-success-600 group/btn">
            <Award className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            Scheme Report
          </button>
        </div>
        {exportError && <p role="alert" className="text-sm text-error-700 mt-3">{exportError}</p>}
      </div>
    </div>
  );
}
