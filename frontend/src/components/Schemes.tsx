import { useEffect, useState } from 'react';
import { Baby, HeartHandshake, Wallet, ShieldCheck, Pill, Apple, CheckCircle2, Clock, XCircle, FileWarning, ChevronRight, Search, Award, TrendingUp, Users, LayoutGrid, Table2, Sparkles } from 'lucide-react';
import { govSchemes as seedSchemes, schemeEligibility as seedElig, getSchemeStats, patients as seedPatients } from '@/data';
import { fetchPatients, fetchSchemes } from '@/lib/api';
import type { GovScheme, Patient, SchemeEligibility } from '@/types';

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

const iconMap: Record<string, typeof Baby> = {
  Baby,
  HeartHandshake,
  Wallet,
  ShieldCheck,
  Pill,
  Apple,
};

const colorMap: Record<string, { bg: string; text: string; gradient: string; ring: string; border: string }> = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-600', gradient: 'from-primary-400 to-primary-600', ring: 'ring-primary-100/50', border: 'border-primary-200' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-600', gradient: 'from-sky-400 to-sky-600', ring: 'ring-sky-100/50', border: 'border-sky-200' },
  accent: { bg: 'bg-accent-50', text: 'text-accent-600', gradient: 'from-accent-400 to-accent-500', ring: 'ring-accent-100/50', border: 'border-accent-200' },
  success: { bg: 'bg-success-50', text: 'text-success-600', gradient: 'from-success-400 to-success-600', ring: 'ring-success-100/50', border: 'border-success-200' },
};

const statusConfig: Record<SchemeEligibility['status'], { label: string; bg: string; text: string; icon: typeof CheckCircle2; dot: string }> = {
  enrolled: { label: 'Enrolled', bg: 'bg-success-50', text: 'text-success-700', icon: CheckCircle2, dot: 'bg-success-500' },
  eligible: { label: 'Eligible', bg: 'bg-primary-50', text: 'text-primary-700', icon: Award, dot: 'bg-primary-500' },
  'pending-docs': { label: 'Pending Docs', bg: 'bg-accent-50', text: 'text-accent-700', icon: FileWarning, dot: 'bg-accent-400' },
  'not-eligible': { label: 'Not Eligible', bg: 'bg-slate-100', text: 'text-slate-500', icon: XCircle, dot: 'bg-slate-300' },
};

type ViewMode = 'schemes' | 'matrix';

export function Schemes() {
  const [viewMode, setViewMode] = useState<ViewMode>('schemes');
  const [selectedScheme, setSelectedScheme] = useState<GovScheme | null>(null);
  const [search, setSearch] = useState('');
  const [govSchemes, setGovSchemes] = useState<GovScheme[]>(seedSchemes);
  const [schemeEligibility, setSchemeEligibility] = useState<SchemeEligibility[]>(seedElig);
  const [patients, setPatients] = useState<Patient[]>(seedPatients);
  const [stats, setStats] = useState(getSchemeStats());

  useEffect(() => {
    Promise.all([fetchSchemes(), fetchPatients()])
      .then(([schemeData, patientRows]) => {
        const data = schemeData as { schemes?: GovScheme[]; eligibility?: SchemeEligibility[]; stats?: typeof stats };
        if (data.schemes?.length) setGovSchemes(data.schemes as GovScheme[]);
        if (data.eligibility) setSchemeEligibility(data.eligibility);
        if (data.stats) setStats(data.stats);
        if (Array.isArray(patientRows) && patientRows.length) setPatients(patientRows as Patient[]);
      })
      .catch(() => undefined);
  }, []);

  const filtered = govSchemes.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const enrolledPatients = patients.filter((p) =>
    schemeEligibility.some((e) => e.patientId === p.id && e.status === 'enrolled')
  ).length;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 relative">
      <FloatingOrb className="w-72 h-72 bg-primary-200/25 -top-16 -right-10" delay={0} />
      <FloatingOrb className="w-64 h-64 bg-success-200/20 top-40 -left-16" delay={2} />

      {/* Header */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100">
            <Sparkles className="w-3.5 h-3.5" />
            {govSchemes.length} Schemes
          </span>
        </div>
        <h2 className="text-3xl font-display font-extrabold text-slate-900">Government Schemes</h2>
        <p className="text-slate-500 mt-1">Track eligibility and enrollment for maternal health welfare schemes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { value: stats.enrolled, label: 'Total Enrollments', icon: CheckCircle2, gradient: 'from-success-400 to-success-600', trend: TrendingUp, trendColor: 'text-success-500' },
          { value: stats.eligible, label: 'Eligible - Not Enrolled', icon: Award, gradient: 'from-primary-400 to-primary-600', trend: TrendingUp, trendColor: 'text-primary-500' },
          { value: stats.pending, label: 'Pending Documents', icon: FileWarning, gradient: 'from-accent-400 to-accent-500', trend: Clock, trendColor: 'text-accent-500' },
          { value: enrolledPatients, label: 'Patients Benefiting', icon: Users, gradient: 'from-sky-400 to-sky-600', trend: null, trendColor: '' },
        ].map((stat, i) => (
          <div key={i} className="glass-card card-hover p-5 animate-slide-up group" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              {stat.trend && <stat.trend className={`w-4 h-4 ${stat.trendColor} ml-auto`} />}
            </div>
            <p className="text-3xl font-display font-extrabold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* View toggle + search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setViewMode('schemes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'schemes' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Schemes
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'matrix' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Table2 className="w-4 h-4" />
            Eligibility Matrix
          </button>
        </div>
        <div className="relative flex-1 max-w-md sm:ml-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={viewMode === 'schemes' ? 'Search schemes...' : 'Search patients...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      {/* Content */}
      {viewMode === 'schemes' ? (
        <SchemesView filtered={filtered} eligibility={schemeEligibility} onSelect={setSelectedScheme} />
      ) : (
        <MatrixView search={search} schemes={govSchemes} eligibility={schemeEligibility} patients={patients} />
      )}

      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          eligibility={schemeEligibility}
          patients={patients}
          onClose={() => setSelectedScheme(null)}
        />
      )}
    </div>
  );
}

function SchemesView({
  filtered,
  eligibility,
  onSelect,
}: {
  filtered: GovScheme[];
  eligibility: SchemeEligibility[];
  onSelect: (s: GovScheme) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((scheme, i) => {
        const Icon = iconMap[scheme.icon] || Baby;
        const colors = colorMap[scheme.color];
        const enrolledCount = eligibility.filter((e) => e.schemeId === scheme.id && e.status === 'enrolled').length;
        const eligibleCount = eligibility.filter((e) => e.schemeId === scheme.id && e.status === 'eligible').length;
        const pendingCount = eligibility.filter((e) => e.schemeId === scheme.id && e.status === 'pending-docs').length;

        return (
          <div
            key={scheme.id}
            onClick={() => onSelect(scheme)}
            className="glass-card card-hover p-5 cursor-pointer animate-slide-up group"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`relative w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center ring-4 ${colors.ring} group-hover:scale-110 transition-transform`}>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <Icon className={`w-6 h-6 ${colors.text} relative`} />
              </div>
              <span className="stat-badge bg-slate-100 text-slate-600 capitalize">
                {scheme.category}
              </span>
            </div>

            <h3 className="font-display font-bold text-slate-900 mb-1 group-hover:text-primary-700 transition-colors">
              {scheme.fullName}
            </h3>
            <p className="text-xs text-slate-400 font-semibold mb-3">{scheme.name}</p>
            <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
              {scheme.description}
            </p>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-0.5">Benefit</p>
                <p className={`text-sm font-bold ${colors.text}`}>{scheme.benefitAmount}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-success-500" />
                <span className="text-slate-500 font-medium">{enrolledCount} enrolled</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span className="text-slate-500 font-medium">{eligibleCount} eligible</span>
              </div>
              {pendingCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-accent-400" />
                  <span className="text-slate-500 font-medium">{pendingCount} pending</span>
                </div>
              )}
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all ml-auto" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatrixView({
  search,
  schemes,
  eligibility,
  patients,
}: {
  search: string;
  schemes: GovScheme[];
  eligibility: SchemeEligibility[];
  patients: Patient[];
}) {
  const filteredPatients = patients.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.village.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card-elevated overflow-hidden shadow-soft">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
              <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap sticky left-0 bg-slate-50 z-10">
                Patient
              </th>
              {schemes.map((scheme) => {
                const colors = colorMap[scheme.color];
                return (
                  <th key={scheme.id} className="px-3 py-4 text-center min-w-[120px]">
                    <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center mx-auto mb-1.5 ring-2 ${colors.ring}`}>
                      {(() => {
                        const Icon = iconMap[scheme.icon] || Baby;
                        return <Icon className={`w-4 h-4 ${colors.text}`} />;
                      })()}
                    </div>
                    <p className="text-xs font-bold text-slate-600">{scheme.name}</p>
                    <p className="text-[10px] text-slate-400">{scheme.benefitAmount}</p>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient, i) => {
              const rows = eligibility.filter((e) => e.patientId === patient.id);
              return (
                <tr key={patient.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="px-5 py-3 sticky left-0 bg-white z-10 border-r border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-100 to-primary-100 flex items-center justify-center text-sm font-display font-bold text-primary-700 shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{patient.name}</p>
                        <p className="text-xs text-slate-400 truncate">{patient.village} - {patient.trimester}</p>
                      </div>
                    </div>
                  </td>
                  {schemes.map((scheme) => {
                    const entry = rows.find((e) => e.schemeId === scheme.id);
                    if (!entry) {
                      return (
                        <td key={scheme.id} className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 text-slate-300">
                            <XCircle className="w-4 h-4" />
                          </span>
                        </td>
                      );
                    }
                    const status = statusConfig[entry.status];
                    const StatusIcon = status.icon;
                    return (
                      <td key={scheme.id} className="px-3 py-3 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${status.bg} ${status.text} group relative cursor-pointer`}>
                            <StatusIcon className="w-4 h-4" />
                            {entry.missingDocs && (
                              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-accent-500 border-2 border-white flex items-center justify-center">
                                <span className="w-1 h-1 rounded-full bg-white" />
                              </span>
                            )}
                          </span>
                          {entry.benefitReceived && (
                            <span className="text-[10px] font-bold text-success-600 whitespace-nowrap">{entry.benefitReceived}</span>
                          )}
                          {entry.missingDocs && (
                            <span className="text-[10px] font-bold text-accent-600 whitespace-nowrap">{entry.missingDocs.length} docs</span>
                          )}
                          {!entry.benefitReceived && !entry.missingDocs && (
                            <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{status.label}</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        {Object.entries(statusConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <div key={key} className="flex items-center gap-2">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg ${config.bg} ${config.text}`}>
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs text-slate-500 font-medium">{config.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SchemeDetailModal({
  scheme,
  onClose,
  eligibility,
  patients,
}: {
  scheme: GovScheme;
  onClose: () => void;
  eligibility: SchemeEligibility[];
  patients: Patient[];
}) {
  const Icon = iconMap[scheme.icon] || Baby;
  const colors = colorMap[scheme.color];

  const patientEligibilities = eligibility.filter((e) => e.schemeId === scheme.id);
  const eligiblePatients = patientEligibilities.map((e) => {
    const patient = patients.find((p) => p.id === e.patientId);
    return { patient, eligibility: e };
  }).filter((e) => e.patient);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin animate-slide-up shadow-soft">
        {/* Header with gradient */}
        <div className={`relative overflow-hidden p-6 bg-gradient-to-br ${colors.gradient}`}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-display font-extrabold text-white">{scheme.fullName}</h3>
                <p className="text-white/80 text-sm mt-0.5">{scheme.name}</p>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold mt-2">
                  Benefit: {scheme.benefitAmount}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <XCircle className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed">{scheme.description}</p>

          {/* Official Document Links */}
          <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            {scheme.officialDocUrl && (
              <a
                href={scheme.officialDocUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-xs py-2 px-3.5 shadow-sm"
              >
                📄 Official Guidelines (PDF)
              </a>
            )}
            {scheme.officialWebsite && (
              <a
                href={scheme.officialWebsite}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost border border-slate-200 text-xs py-2 px-3.5 hover:bg-slate-100"
              >
                🌐 Official Govt Portal
              </a>
            )}
          </div>

          {/* Benefits */}
          <div>
            <h4 className="font-display font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-primary-600" />
              Benefits
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scheme.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-success-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Application Process Steps */}
          {scheme.applicationSteps && scheme.applicationSteps.length > 0 && (
            <div>
              <h4 className="font-display font-bold text-slate-800 mb-3 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-sky-600" />
                Application Process
              </h4>
              <div className="space-y-2">
                {scheme.applicationSteps.map((step, i) => (
                  <div key={i} className="p-3 rounded-xl bg-sky-50/50 border border-sky-100 text-xs text-slate-700 font-medium">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Eligibility */}
          <div>
            <h4 className="font-display font-bold text-slate-800 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary-600" />
              Eligibility Criteria
            </h4>
            <div className="space-y-2">
              {scheme.eligibilityCriteria.map((criteria, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-primary-50/50 border border-primary-100">
                  <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-600">{criteria}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div>
            <h4 className="font-display font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-accent-500" />
              Documents Required
            </h4>
            <div className="flex flex-wrap gap-2">
              {scheme.documentsRequired.map((doc, i) => (
                <span key={i} className="stat-badge bg-slate-100 text-slate-600">
                  {doc}
                </span>
              ))}
            </div>
          </div>

          {/* Patient enrollment */}
          <div>
            <h4 className="font-display font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              Patient Enrollment Status
            </h4>
            <div className="space-y-2">
              {eligiblePatients.map(({ patient, eligibility }) => {
                const status = statusConfig[eligibility.status];
                const StatusIcon = status.icon;
                return (
                  <div key={eligibility.patientId} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-100 to-primary-100 flex items-center justify-center text-sm font-display font-bold text-primary-700">
                      {patient!.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{patient!.name}</p>
                      {eligibility.enrolledDate && (
                        <p className="text-xs text-slate-400">Enrolled: {eligibility.enrolledDate}</p>
                      )}
                      {eligibility.missingDocs && (
                        <p className="text-xs text-accent-600 mt-0.5">Missing: {eligibility.missingDocs.join(', ')}</p>
                      )}
                    </div>
                    {eligibility.benefitReceived && (
                      <span className="text-xs font-bold text-success-600 hidden sm:block">
                        {eligibility.benefitReceived}
                      </span>
                    )}
                    <span className={`stat-badge ${status.bg} ${status.text} shrink-0`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
