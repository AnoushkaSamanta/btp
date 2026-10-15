import { useEffect, useState } from 'react';
import { Search, Filter, Phone, MapPin, Calendar, Droplet, Activity, AlertCircle, ChevronRight, X, Award, CheckCircle2, Sparkles, Download } from 'lucide-react';
import { patients as seedPatients, govSchemes as seedSchemes, schemeEligibility as seedElig } from '@/data';
import { scheduleVisit } from '@/lib/api';
import { usePatients, useSchemes, useCreatePatient } from '@/hooks';
import { queryClient } from '@/lib/queryClient';
import { QK } from '@/lib/queryKeys';
import { downloadClinicalPdf } from '@/lib/download';
import type { Patient, PatientStatus, SchemeEligibility, GovScheme } from '@/types';
import { PatientDocuments } from './PatientDocuments';
import { PatientDetail } from './PatientDetail';

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

const statusConfig: Record<PatientStatus, { label: string; bg: string; text: string; dot: string; gradient: string }> = {
  critical: { label: 'Critical', bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500', gradient: 'from-error-400 to-error-600' },
  'high-risk': { label: 'High Risk', bg: 'bg-accent-50', text: 'text-accent-700', dot: 'bg-accent-500', gradient: 'from-accent-400 to-accent-500' },
  stable: { label: 'Stable', bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500', gradient: 'from-success-400 to-success-600' },
  routine: { label: 'Routine', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', gradient: 'from-slate-400 to-slate-500' },
};

export function Patients({
  initialSearch = '',
  initialPatientId = '',
}: {
  initialSearch?: string;
  initialPatientId?: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [filter, setFilter] = useState<'all' | PatientStatus>('all');
  const [selected, setSelected] = useState<Patient | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ── TanStack Query ─────────────────────────────────────────────────────
  const { data: patientsRaw, isLoading: loading } = usePatients();
  const { data: schemesRaw } = useSchemes();
  const createPatientMutation = useCreatePatient();

  const patients: Patient[] = (patientsRaw && patientsRaw.length > 0 ? patientsRaw : seedPatients) as Patient[];
  const schemesData = schemesRaw as { schemes?: GovScheme[]; eligibility?: SchemeEligibility[] } | undefined;
  const eligibility: SchemeEligibility[] = schemesData?.eligibility ?? seedElig;
  const schemes: GovScheme[] = schemesData?.schemes?.length ? schemesData.schemes as GovScheme[] : seedSchemes;

  useEffect(() => setSearch(initialSearch), [initialSearch]);

  // Auto-select patient by ID once data is ready
  useEffect(() => {
    if (initialPatientId && patients.length > 0) {
      const match = patients.find((p) => p.id === initialPatientId);
      if (match) setSelected(match);
    }
  }, [initialPatientId, patients]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filtered = patients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.village.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const filterTabs: { id: 'all' | PatientStatus; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: patients.length },
    { id: 'critical', label: 'Critical', count: patients.filter((p) => p.status === 'critical').length },
    { id: 'high-risk', label: 'High Risk', count: patients.filter((p) => p.status === 'high-risk').length },
    { id: 'stable', label: 'Stable', count: patients.filter((p) => p.status === 'stable').length },
    { id: 'routine', label: 'Routine', count: patients.filter((p) => p.status === 'routine').length },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto relative">
      <FloatingOrb className="w-72 h-72 bg-primary-200/25 -top-16 -right-10" delay={0} />
      <FloatingOrb className="w-64 h-64 bg-sky-200/20 top-40 -left-16" delay={2} />

      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg animate-slide-up flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success-400" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100">
              <Sparkles className="w-3.5 h-3.5" />
              {filtered.length} Active Records
            </span>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-slate-900">Patients</h2>
          <p className="text-slate-500 mt-1">Managing {filtered.length} patients across 3 villages</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <span>Add Patient</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        <button
          onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')}
          className={`btn-ghost border border-slate-200 ${filter === 'critical' ? 'bg-primary-50 text-primary-700 border-primary-200' : ''}`}
        >
          <Filter className="w-4 h-4" />
          <span>{filter === 'critical' ? 'Filtered (Critical)' : 'Filter'}</span>
        </button>
      </div>

      <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-thin pb-1">
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((patient, i) => {
          const status = statusConfig[patient.status];
          const elig = eligibility.filter((e) => e.patientId === patient.id);
          const enrolledCount = elig.filter((e) => e.status === 'enrolled').length;
          return (
            <button
              type="button"
              key={patient.id}
              onClick={() => setSelected(patient)}
              className="glass-card card-hover p-5 w-full text-left cursor-pointer animate-slide-up group relative overflow-hidden"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br ${status.gradient} flex items-center justify-center text-lg font-display font-bold text-white shadow-md border border-white/40`}>
                    {patient.photoUrl ? (
                      <img src={patient.photoUrl} alt={patient.name} className="w-full h-full object-cover" />
                    ) : (
                      patient.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-900">{patient.name}</h3>
                    <p className="text-xs text-slate-500">{patient.age} years - {patient.trimester} Trimester</p>
                  </div>
                </div>
                <span className={`stat-badge ${status.bg} ${status.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patient.village}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Droplet className="w-3.5 h-3.5 text-slate-400" />
                  <span>Blood: {patient.bloodGroup}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  <span>BP: {patient.bp}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Next: {(patient.nextVisit || '').slice(5) || '—'}</span>
                </div>
              </div>

              {(patient.riskFactors || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100">
                  {(patient.riskFactors || []).map((rf) => (
                    <span key={rf} className="stat-badge bg-accent-50 text-accent-700">
                      <AlertCircle className="w-3 h-3" />
                      {rf}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{patient.phone}</span>
                  </div>
                </div>
                {enrolledCount > 0 && (
                  <span className="stat-badge bg-success-50 text-success-700">
                    <Award className="w-3 h-3" />
                    {enrolledCount} schemes
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400">No patients found matching your criteria.</p>
        </div>
      )}

      {selected && (
        <PatientDetail
          patient={selected}
          eligibility={eligibility.filter((e) => e.patientId === selected.id)}
          schemes={schemes}
          onClose={() => setSelected(null)}
          onToast={showToast}
          onPatientUpdated={(updated) => {
            setSelected(updated);
            // Optimistically update cache entry so PatientDetail reflects new data instantly
            queryClient.setQueryData<any[]>(QK.patients, (old) =>
              old ? old.map((p) => (p.id === updated.id ? updated : p)) : old
            );
          }}
        />
      )}
      {showAddModal && (
        <AddPatientModal
          onClose={() => setShowAddModal(false)}
          onAdd={async (payload) => {
            try {
              const created = (await createPatientMutation.mutateAsync(payload)) as Patient;
              showToast(`Patient ${created.name} added successfully!`);
              setShowAddModal(false);
              return true;
            } catch {
              showToast('Could not save to server — check that the API is running.');
            }
          }}
        />
      )}
    </div>
  );
}

function AddPatientModal({ onClose, onAdd }: { onClose: () => void; onAdd: (payload: Record<string, unknown>) => Promise<boolean | undefined> }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [village, setVillage] = useState('Ramnagar');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    const saved = await onAdd({ name: name.trim(), age: Number(age), village, phone, trimester: '1st' });
    setSaving(false);
    if (saved) onClose();
    else setError('Could not save. Check the server connection and try again.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card-elevated max-w-md w-full p-6 animate-slide-up shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-display font-extrabold text-slate-900">Add New Patient</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Suman Devi" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
            <input type="number" min="1" max="120" required value={age} onChange={(e) => setAge(e.target.value)} placeholder="24" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Village</label>
              <select value={village} onChange={(e) => setVillage(e.target.value)} className="input-field">
                <option value="Ramnagar">Ramnagar</option>
                <option value="Basantpur">Basantpur</option>
                <option value="Khusrupur">Khusrupur</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save Record'}</button>
            <button type="button" onClick={onClose} className="btn-ghost border border-slate-200 flex-1">Cancel</button>
          </div>
          {error && <p role="alert" className="text-sm text-error-700">{error}</p>}
        </form>
      </div>
    </div>
  );
}

function PatientDetailModal({
  patient,
  onClose,
  onToast,
  eligibility,
  schemes,
}: {
  patient: Patient;
  onClose: () => void;
  onToast: (msg: string) => void;
  eligibility: SchemeEligibility[];
  schemes: GovScheme[];
}) {
  const status = statusConfig[patient.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin animate-slide-up shadow-soft">
        {/* Gradient header */}
        <div className={`relative overflow-hidden p-6 bg-gradient-to-br ${status.gradient}`}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-display font-bold text-white border border-white/30">
                {patient.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-display font-extrabold text-white">{patient.name}</h3>
                <p className="text-white/80 text-sm">{patient.age} years - {patient.village}</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold mt-2">
                  <span className={`w-1.5 h-1.5 rounded-full bg-white`} />
                  {status.label}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Trimester', value: patient.trimester },
              { label: 'Blood Group', value: patient.bloodGroup },
              { label: 'Weight', value: `${patient.weight} kg` },
              { label: 'Hemoglobin', value: `${patient.hemoglobin} g/dL` },
              { label: 'BP', value: patient.bp },
              { label: 'Gravida/Para', value: `G${patient.gravida}P${patient.para}` },
              { label: 'Last Visit', value: (patient.lastVisit || '').slice(5) || '—' },
              { label: 'Next Visit', value: (patient.nextVisit || '').slice(5) || '—' },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                <p className="font-semibold text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-800 mb-2">Risk Factors</h4>
            {(patient.riskFactors || []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(patient.riskFactors || []).map((rf) => (
                  <span key={rf} className="stat-badge bg-accent-50 text-accent-700">
                    <AlertCircle className="w-3 h-3" />
                    {rf}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No risk factors identified.</p>
            )}
          </div>

          {/* Scheme eligibility */}
          <div>
            <h4 className="font-display font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-primary-600" />
              Scheme Enrollment
            </h4>
            <div className="space-y-2">
              {eligibility.map((e) => {
                const scheme = schemes.find((s) => s.id === e.schemeId);
                if (!scheme) return null;
                const isEnrolled = e.status === 'enrolled';
                const isEligible = e.status === 'eligible';
                const isPending = e.status === 'pending-docs';
                return (
                  <div key={e.schemeId} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    isEnrolled ? 'bg-success-50 border-success-100' : isEligible ? 'bg-primary-50 border-primary-100' : isPending ? 'bg-accent-50 border-accent-100' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isEnrolled ? 'bg-success-100' : isEligible ? 'bg-primary-100' : isPending ? 'bg-accent-100' : 'bg-slate-200'
                    }`}>
                      {isEnrolled ? <CheckCircle2 className="w-4 h-4 text-success-600" /> : isEligible ? <Award className="w-4 h-4 text-primary-600" /> : <AlertCircle className="w-4 h-4 text-accent-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700">{scheme.name}</p>
                      {e.benefitReceived && <p className="text-xs text-success-600">{e.benefitReceived}</p>}
                      {e.missingDocs && <p className="text-xs text-accent-600">Missing: {e.missingDocs.join(', ')}</p>}
                    </div>
                    <span className={`stat-badge ${
                      isEnrolled ? 'bg-success-100 text-success-700' : isEligible ? 'bg-primary-100 text-primary-700' : isPending ? 'bg-accent-100 text-accent-700' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isEnrolled ? 'Enrolled' : isEligible ? 'Eligible' : isPending ? 'Pending' : 'N/A'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <PatientDocuments patientId={patient.id} patientName={patient.name} />

          <div>
            <h4 className="font-display font-bold text-slate-800 mb-2">Contact</h4>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{patient.phone}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-3">
            <button
              onClick={() => {
                downloadClinicalPdf(`NHM-Record-${patient.name.replace(/\s+/g, '_')}.pdf`, {
                  patient_name: patient.name,
                  patient_id: patient.id,
                  village: patient.village,
                  age: patient.age,
                  blood_pressure: patient.bp,
                  bp_status: patient.status === 'critical' ? 'High / Critical' : 'Normal',
                  hemoglobin: patient.hemoglobin,
                  trimester: patient.trimester,
                  symptoms: patient.riskFactors || [],
                  flags: (patient.riskFactors || []).map((rf) => ({
                    title: rf,
                    severity: patient.status === 'critical' ? 'critical' : 'high',
                    action: 'Referral to Primary Health Centre Medical Officer for follow-up.',
                  })),
                  schemes: eligibility.map((e) => ({
                    name: schemes.find((s) => s.id === e.schemeId)?.name || e.schemeId,
                    status: e.status,
                    reasons: e.benefitReceived ? [e.benefitReceived] : [],
                  })),
                  report: `Antenatal / Primary Healthcare Profile for ${patient.name}. Gestational window: ${patient.trimester} trimester. Recorded BP: ${patient.bp}. Current clinical status: ${patient.status.toUpperCase()}.`,
                });
                onToast(`Downloaded official NHM Form 4B for ${patient.name}`);
              }}
              className="btn-ghost border border-slate-300 dark:border-slate-600 flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              <Download className="w-4 h-4 text-primary-600" />
              Download NHM Record
            </button>
            <button
              onClick={async () => {
                const d = new Date();
                d.setDate(d.getDate() + 7);
                const iso = d.toISOString().slice(0, 10);
                try {
                  await scheduleVisit({ patient_id: patient.id, date: iso, time: '10:00', type: 'Scheduled home visit' });
                  onToast(`Visit scheduled for ${patient.name} on ${iso}`);
                } catch {
                  onToast('Could not schedule — start the API server.');
                }
                onClose();
              }}
              className="btn-primary flex-1 text-xs"
            >
              Schedule Visit
            </button>
            <button
              onClick={() => {
                if (patient.phone) {
                  window.location.href = `tel:${patient.phone}`;
                  onToast(`Dialing ${patient.phone}...`);
                } else {
                  onToast('No phone number recorded for patient.');
                }
              }}
              className="btn-ghost border border-slate-200 text-xs px-3"
            >
              Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
