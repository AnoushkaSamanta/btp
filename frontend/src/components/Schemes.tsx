import { useState } from 'react';
import {
  Baby,
  HeartHandshake,
  Wallet,
  ShieldCheck,
  Pill,
  Apple,
  CheckCircle2,
  Clock,
  XCircle,
  FileWarning,
  ChevronRight,
  Search,
  Award,
  TrendingUp,
  Users,
  LayoutGrid,
  Table2,
  Sparkles,
  MapPin,
  Filter,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import { govSchemes as seedSchemes, schemeEligibility as seedElig, getSchemeStats, patients as seedPatients } from '@/data';
import { useSchemes, usePatients } from '@/hooks';
import type { GovScheme, Patient, SchemeEligibility } from '@/types';
import { SchemeCard } from './SchemeCard';
import { SchemeDetail } from './SchemeDetail';

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

type ViewMode = 'schemes' | 'matrix';

const STATES = ['Telangana', 'Karnataka', 'Central', 'Maharashtra', 'Bihar', 'Uttar Pradesh'];

export function Schemes() {
  const [viewMode, setViewMode] = useState<ViewMode>('schemes');
  const [selectedScheme, setSelectedScheme] = useState<GovScheme | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'overview' | 'documents' | 'patients'>('overview');
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState<string>('Telangana');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'benefit'>('name');

  // ── TanStack Query ─────────────────────────────────────────────────────
  const { data: schemesRaw } = useSchemes();
  const { data: patientsRaw } = usePatients();

  const schemesData = schemesRaw as { schemes?: GovScheme[]; eligibility?: SchemeEligibility[]; stats?: typeof stats } | undefined;
  const govSchemes: GovScheme[] = schemesData?.schemes?.length ? schemesData.schemes as GovScheme[] : seedSchemes;
  const schemeEligibility: SchemeEligibility[] = schemesData?.eligibility ?? seedElig;
  const stats = schemesData?.stats ?? getSchemeStats();
  const patients: Patient[] = (patientsRaw && patientsRaw.length > 0 ? patientsRaw : seedPatients) as Patient[];

  const handleOpenDetail = (scheme: GovScheme, tab: 'overview' | 'documents' | 'patients' = 'overview') => {
    setSelectedScheme(scheme);
    setModalInitialTab(tab);
  };

  const categories = ['all', 'maternal', 'financial', 'nutrition', 'insurance'];

  // Filtering & Sorting
  const filteredSchemes = govSchemes
    .filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || s.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'benefit') {
        const aVal = typeof a.benefitAmount === 'number' ? a.benefitAmount : 0;
        const bVal = typeof b.benefitAmount === 'number' ? b.benefitAmount : 0;
        return bVal - aVal;
      }
      return a.name.localeCompare(b.name);
    });

  const enrolledPatients = patients.filter((p) =>
    schemeEligibility.some((e) => e.patientId === p.id && e.status === 'enrolled')
  ).length;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 relative">
      <FloatingOrb className="w-72 h-72 bg-primary-200/25 -top-16 -right-10" delay={0} />
      <FloatingOrb className="w-64 h-64 bg-success-200/20 top-40 -left-16" delay={2} />

      {/* Header with State Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Government Health Schemes Portal
            </span>
            <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              Official Guidelines & Document Uploads
            </span>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-slate-900">
            Government Social Protection & Maternity Schemes
          </h2>
          <p className="text-slate-500 mt-1">
            Official statutory reference guidelines, Direct Benefit Transfer (DBT) checklists, and document verification.
          </p>
        </div>

        {/* State Selector Dropdown */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
          <MapPin className="w-4 h-4 text-primary-600 ml-2" />
          <span className="text-xs font-bold text-slate-600">State Norms:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="input-field text-xs font-bold py-1.5 px-3 border-none bg-slate-50 rounded-xl focus:ring-0"
          >
            {STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { value: stats.enrolled, label: 'Total Enrolled Beneficiaries', icon: CheckCircle2, gradient: 'from-success-400 to-success-600' },
          { value: stats.eligible, label: 'Statutorily Eligible (Unclaimed)', icon: Award, gradient: 'from-primary-400 to-primary-600' },
          { value: stats.pending, label: 'Pending Supporting Documents', icon: FileWarning, gradient: 'from-accent-400 to-accent-500' },
          { value: enrolledPatients, label: 'Active Beneficiaries', icon: Users, gradient: 'from-sky-400 to-sky-600' },
        ].map((stat, i) => (
          <div key={i} className="glass-card card-hover p-5 animate-slide-up group" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-display font-extrabold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters, Categories & View Toggle Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search, Sort & Matrix Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Sort By */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 pl-2">Sort:</span>
            <button
              onClick={() => setSortBy('name')}
              className={`px-2.5 py-1 rounded-lg font-semibold ${
                sortBy === 'name' ? 'bg-slate-100 text-slate-800' : 'text-slate-500'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('benefit')}
              className={`px-2.5 py-1 rounded-lg font-semibold ${
                sortBy === 'benefit' ? 'bg-slate-100 text-slate-800' : 'text-slate-500'
              }`}
            >
              Benefit ₹
            </button>
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={viewMode === 'schemes' ? 'Search schemes...' : 'Search patients...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 text-xs py-2 w-full"
            />
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('schemes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'schemes' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Schemes
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'matrix' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" /> Eligibility Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Main View Content */}
      {viewMode === 'schemes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchemes.map((scheme) => {
            const matches = schemeEligibility.filter(
              (e) => e.schemeId.toLowerCase() === scheme.id.toLowerCase()
            );
            const enrolled = matches.filter((e) => e.status === 'enrolled').length;
            const eligible = matches.filter((e) => e.status === 'eligible').length;

            return (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                eligibleCount={eligible}
                enrolledCount={enrolled}
                eligibilityRecords={matches}
                selectedState={selectedState}
                onOpenDetail={handleOpenDetail}
              />
            );
          })}
        </div>
      ) : (
        <MatrixView
          search={search}
          schemes={govSchemes}
          eligibility={schemeEligibility}
          patients={patients}
          onManageScheme={(scheme, patId) => {
            setSelectedScheme(scheme);
            setModalInitialTab('documents');
          }}
        />
      )}

      {/* Scheme Detail & Document Upload Modal */}
      {selectedScheme && (
        <SchemeDetail
          scheme={selectedScheme}
          eligibleRecords={schemeEligibility.filter(
            (e) => e.schemeId.toLowerCase() === selectedScheme.id.toLowerCase()
          )}
          patientsList={patients}
          selectedState={selectedState}
          initialTab={modalInitialTab}
          onClose={() => setSelectedScheme(null)}
        />
      )}
    </div>
  );
}

function MatrixView({
  search,
  schemes,
  eligibility,
  patients,
  onManageScheme,
}: {
  search: string;
  schemes: GovScheme[];
  eligibility: SchemeEligibility[];
  patients: Patient[];
  onManageScheme: (s: GovScheme, patientId: string) => void;
}) {
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.village || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card-elevated overflow-hidden shadow-soft rounded-3xl border border-slate-200">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10">
                Beneficiary Name
              </th>
              {schemes.map((scheme) => (
                <th key={scheme.id} className="px-4 py-4 text-center min-w-[130px]">
                  <p className="text-xs font-extrabold text-slate-800">{scheme.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{scheme.category}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient, i) => {
              const rows = eligibility.filter((e) => e.patientId === patient.id);
              return (
                <tr
                  key={patient.id}
                  className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors animate-fade-in"
                  style={{ animationDelay: `${i * 20}ms` }}
                >
                  <td className="px-5 py-3 sticky left-0 bg-white z-10 border-r border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-100 to-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{patient.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {patient.village} · {patient.trimester}
                        </p>
                      </div>
                    </div>
                  </td>
                  {schemes.map((scheme) => {
                    const entry = rows.find(
                      (e) => e.schemeId.toLowerCase() === scheme.id.toLowerCase()
                    );
                    if (!entry) {
                      return (
                        <td key={scheme.id} className="px-4 py-3 text-center">
                          <span className="text-slate-300 text-xs">—</span>
                        </td>
                      );
                    }
                    const isEnrolled = entry.status === 'enrolled';
                    const isEligible = entry.status === 'eligible';

                    return (
                      <td key={scheme.id} className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => onManageScheme(scheme, patient.id)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                            isEnrolled
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : isEligible
                              ? 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {isEnrolled ? 'Enrolled' : isEligible ? 'Eligible' : 'Pending Docs'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
