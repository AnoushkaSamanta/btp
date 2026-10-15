import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, FileBarChart, Users, CalendarCheck, Activity, Baby, Download, MapPin, Syringe, Award, CheckCircle2, FileSpreadsheet, Loader2 } from 'lucide-react';
import { fetchReportPreviewMeta, downloadReportFile } from '@/lib/api';
import { useReportsData } from '@/hooks';
import { getPreferences } from '@/lib/preferences';
import { DateRangePicker } from './DateRangePicker';
import { ReportPreview } from './ReportPreview';

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
  const [successToast, setSuccessToast] = useState('');

  // Date filter state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Preview Modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<'monthly-summary' | 'patient-registry' | 'immunization-log' | 'village-wise' | 'scheme-report' | 'export'>('monthly-summary');
  const [previewTitle, setPreviewTitle] = useState('Monthly Summary Report');
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [previewMeta, setPreviewMeta] = useState<{
    filename?: string;
    totalPages?: number;
    fileSizeKb?: number;
    thumbnail?: string;
  } | null>(null);

  // ── TanStack Query: auto-refetch when visits/patients/immunizations change ──
  const { data: reportsRaw } = useReportsData(
    fromDate || toDate ? { fromDate: fromDate || undefined, toDate: toDate || undefined } : undefined
  );

  // Sync query data → local state in an effect (NEVER call setState in render body)
  useEffect(() => {
    const data: any = reportsRaw;
    if (!data) return;

    if (data.summary) {
      setSummary({
        totalVisits: data.summary.totalVisits ?? 0,
        completedVisits: data.summary.completedVisits ?? 0,
        patientCount: data.summary.totalPatients ?? 0,
        immunizations: data.summary.totalImmunizations ?? 0,
        referrals: data.summary.criticalPatients ?? 0,
        schemeStats: {
          total: (data.schemes || []).reduce((acc: number, sc: any) => acc + (sc.enrolled + sc.eligible), 0),
          enrolled: data.summary.schemeEnrollments ?? 0,
          eligible: (data.schemes || []).reduce((acc: number, sc: any) => acc + sc.eligible, 0),
          pending: (data.schemes || []).reduce((acc: number, sc: any) => acc + sc.pending, 0),
          notEligible: Math.max(0, (data.summary.totalPatients ?? 0) - (data.summary.schemeEnrollments ?? 0)),
        },
        villageStats: (data.villages || []).map((v: any) => ({
          name: v.name,
          patients: v.patients,
          critical: v.critical,
          highRisk: v.highRisk,
          immunizations: v.immunizations,
          immunizationRate: v.immunizationRate,
          overdue: v.overdueImm || 0,
        })),
        immunizationByStatus: {
          completed: data.summary.completedImmunizations ?? 0,
          due: data.summary.dueImmunizations ?? 0,
          overdue: data.summary.overdueImmunizations ?? 0,
          upcoming: Math.max(
            0,
            (data.summary.totalImmunizations ?? 0) -
            (data.summary.completedImmunizations ?? 0) -
            (data.summary.overdueImmunizations ?? 0)
          ),
        },
      });
    }

    if (Array.isArray(data.monthlySeries) && data.monthlySeries.length > 0) {
      setMonthlyData(
        data.monthlySeries.map((m: any) => ({
          month: m.month,
          visits: m.visits,
          immunizations: m.immunizations,
          referrals: m.criticalFlags,
        }))
      );
    }
  }, [reportsRaw]);

  const openPreview = async (
    type: 'monthly-summary' | 'patient-registry' | 'immunization-log' | 'village-wise' | 'scheme-report' | 'export',
    title: string
  ) => {
    setExportError('');
    setPreviewType(type);
    setPreviewTitle(title);
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewMeta(null);

    try {
      const [dataset, meta] = await Promise.all([
        fetchReportsData({ fromDate, toDate }),
        fetchReportPreviewMeta(type, { fromDate, toDate }).catch(() => null),
      ]);
      setPreviewData(dataset);
      setPreviewMeta(meta);
    } catch (err: any) {
      setExportError(err.message || 'Failed to load report preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirmDownload = async (format: 'pdf' | 'xlsx') => {
    setDownloading(true);
    setExportError('');
    try {
      const savedFilename = await downloadReportFile(previewType, format, { fromDate, toDate });
      setSuccessToast(`✓ ${previewTitle.replace(' (PDF)', '')} downloaded as ${savedFilename}`);
      setTimeout(() => setSuccessToast(''), 5500);
      setPreviewOpen(false);
    } catch (err: any) {
      setExportError(err.message || 'Download failed. Please check network connection and retry.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDirectDownload = async (
    type: 'monthly-summary' | 'patient-registry' | 'immunization-log' | 'village-wise' | 'scheme-report' | 'export',
    format: 'pdf' | 'xlsx'
  ) => {
    setDownloading(true);
    setExportError('');
    try {
      const savedFilename = await downloadReportFile(type, format, { fromDate, toDate });
      setSuccessToast(`✓ Report downloaded as ${savedFilename}`);
      setTimeout(() => setSuccessToast(''), 5500);
    } catch (err: any) {
      setExportError(err.message || 'Download failed. Please retry.');
    } finally {
      setDownloading(false);
    }
  };

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

  const villageStats = summary.villageStats || [];
  const schemeEnrollmentRate = schemeStats?.total > 0 ? Math.round((schemeStats.enrolled / schemeStats.total) * 100) : 0;
  const ringCircumference = 2 * Math.PI * 52;

  const animCount1 = useCountUp(summary.totalVisits || 0);
  const animCount2 = useCountUp(summary.patientCount || 0);
  const animCount3 = useCountUp(summary.immunizations || 0);
  const animCount4 = useCountUp(summary.referrals || 0);

  const statCards = [
    { label: 'Total visits', value: animCount1, icon: CalendarCheck, gradient: 'from-emerald-500 to-emerald-700', glow: 'shadow-emerald-500/20' },
    { label: 'Registered Patients', value: animCount2, icon: Users, gradient: 'from-sky-500 to-sky-700', glow: 'shadow-sky-500/20' },
    { label: 'Immunizations Tracked', value: animCount3, icon: Baby, gradient: 'from-teal-500 to-teal-700', glow: 'shadow-teal-500/20' },
    { label: 'Referrals & High Risk', value: animCount4, icon: Activity, gradient: 'from-rose-500 to-rose-700', glow: 'shadow-rose-500/20' },
  ];


  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 relative">
      <FloatingOrb className="w-80 h-80 bg-primary-200/25 -top-20 -right-20" delay={0} />
      <FloatingOrb className="w-72 h-72 bg-sky-200/20 top-60 -left-16" delay={2} />

      {/* Toast Alert */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}
      {exportError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <span>{exportError}</span>
        </div>
      )}

      {/* Header with Title and Global Download CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100">Clinical & Welfare Reports</h2>
          <p className="text-sm text-slate-500 mt-1">Government-grade dossiers, household registries, and UIP records.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void openPreview('export', 'Clinical Sector Dossier (PDF)')}
            className="btn-primary text-xs py-2.5 px-3.5 shadow-sm flex items-center gap-1.5"
            title="Download the current filtered view as official PDF"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button
            type="button"
            onClick={() => void handleDirectDownload('export', 'xlsx')}
            disabled={downloading}
            className="btn-ghost text-xs py-2 px-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 flex items-center gap-1.5 font-bold"
            title="Download full multi-sheet Excel spreadsheet (.xlsx)"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            Download Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker
        fromDate={fromDate}
        toDate={toDate}
        onApply={(f, t) => {
          setFromDate(f);
          setToDate(t);
        }}
        onReset={() => {
          setFromDate('');
          setToDate('');
        }}
      />

      {/* Applied Filter Banner */}
      <div className="flex items-center justify-between text-xs px-4 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200/80 text-slate-700 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {fromDate || toDate ? (
              <>Showing data for: <strong className="text-emerald-700">{fromDate || 'Beginning'} &rarr; {toDate || 'Present'}</strong></>
            ) : (
              <>Showing data for: <strong className="text-emerald-700">Oct 1 - Oct 13, 2026</strong> (All Records)</>
            )}
          </span>
        </div>
        {(fromDate || toDate) && (
          <button
            type="button"
            onClick={() => {
              setFromDate('');
              setToDate('');
            }}
            className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md text-white`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-display font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">{stat.value}</p>
            </div>
          </div>
        ))}
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
            {monthlyData.map((d, i) => {
              const isZero = d.visits === 0 && d.immunizations === 0 && d.referrals === 0;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group/bar relative">
                  <div className="w-full flex items-end justify-center gap-1 h-40 relative">
                    {isZero ? (
                      <div className="w-full flex flex-col items-center justify-end h-full pb-1">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-xs">0</span>
                        <div className="w-8 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1.5" />
                      </div>
                    ) : (
                      <>
                        <div
                          className="w-1/3 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm transition-all duration-700 group-hover/bar:from-emerald-700 group-hover/bar:to-emerald-500 animate-bar-grow min-h-[4px]"
                          style={{ height: d.visits > 0 ? `${Math.max(8, (d.visits / maxVisits) * 100)}%` : '4px', animationDelay: `${i * 100}ms` }}
                          title={`Visits: ${d.visits}`}
                        />
                        <div
                          className="w-1/3 rounded-t-lg bg-gradient-to-t from-sky-500 to-sky-400 shadow-sm transition-all duration-700 group-hover/bar:from-sky-600 group-hover/bar:to-sky-500 animate-bar-grow min-h-[4px]"
                          style={{ height: d.immunizations > 0 ? `${Math.max(8, (d.immunizations / maxImm) * 100)}%` : '4px', animationDelay: `${i * 100 + 50}ms` }}
                          title={`Immunizations: ${d.immunizations}`}
                        />
                        <div
                          className="w-1/3 rounded-t-lg bg-gradient-to-t from-rose-500 to-rose-400 shadow-sm transition-all duration-700 group-hover/bar:from-rose-600 group-hover/bar:to-rose-500 animate-bar-grow min-h-[4px]"
                          style={{ height: d.referrals > 0 ? `${Math.max(8, (d.referrals / maxReferrals) * 100)}%` : '4px', animationDelay: `${i * 100 + 100}ms` }}
                          title={`Critical Flags: ${d.referrals}`}
                        />
                      </>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-500">{d.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-5 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600" />
              <span className="text-slate-500 font-medium">Visits</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-lg bg-gradient-to-r from-sky-400 to-sky-600" />
              <span className="text-slate-500 font-medium">Immunizations</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-lg bg-gradient-to-r from-rose-400 to-rose-500" />
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
                    <td className="text-center px-3 py-3.5 text-sm text-slate-600 dark:text-slate-300">{v.immunizations}</td>
                    <td className="text-center px-3 py-3.5">
                      {v.immunizations === 0 || v.immunizationRate === null || v.immunizationRate === undefined ? (
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">No data</span>
                      ) : (
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000 animate-bar-grow ${v.immunizationRate >= 75 ? 'bg-gradient-to-r from-success-400 to-success-600' : v.immunizationRate >= 50 ? 'bg-gradient-to-r from-accent-400 to-accent-500' : 'bg-gradient-to-r from-error-400 to-error-600'}`} style={{ width: `${v.immunizationRate}%`, transformOrigin: 'left' }} />
                          </div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{v.immunizationRate}%</span>
                        </div>
                      )}
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
          <button
            type="button"
            onClick={() => void openPreview('monthly-summary', 'Monthly Summary Report (PDF)')}
            className="btn-primary group/btn text-xs py-2.5 px-3.5 shadow-sm"
          >
            <Download className="w-4 h-4 group-hover/btn:animate-bounce" />
            Monthly Summary
          </button>
          <button
            type="button"
            onClick={() => void openPreview('patient-registry', 'Patient Master Registry (PDF)')}
            className="btn-ghost border border-slate-200 hover:border-primary-300 hover:text-primary-600 group/btn text-xs py-2.5 px-3.5"
          >
            <FileBarChart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            Patient Registry
          </button>
          <button
            type="button"
            onClick={() => void openPreview('immunization-log', 'Immunization Program Log (PDF)')}
            className="btn-ghost border border-slate-200 hover:border-sky-300 hover:text-sky-600 group/btn text-xs py-2.5 px-3.5"
          >
            <Syringe className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            Immunization Log
          </button>
          <button
            type="button"
            onClick={() => void openPreview('village-wise', 'Village-Wise Catchment Report (PDF)')}
            className="btn-ghost border border-slate-200 hover:border-accent-300 hover:text-accent-600 group/btn text-xs py-2.5 px-3.5"
          >
            <MapPin className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            Village-wise Report
          </button>
          <button
            type="button"
            onClick={() => void openPreview('scheme-report', 'Government Health Schemes Report (PDF)')}
            className="btn-ghost border border-slate-200 hover:border-success-300 hover:text-success-600 group/btn text-xs py-2.5 px-3.5"
          >
            <Award className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            Scheme Report
          </button>
        </div>
        {exportError && <p role="alert" className="text-sm text-error-700 mt-3 font-semibold">{exportError}</p>}
      </div>

      {/* Report Preview & Download Modal */}
      <ReportPreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        reportType={previewType}
        reportTitle={previewTitle}
        data={previewData}
        previewMeta={previewMeta}
        loading={previewLoading}
        onConfirmDownload={handleConfirmDownload}
        downloading={downloading}
      />
    </div>
  );
}
