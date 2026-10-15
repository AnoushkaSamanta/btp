import { useState, useEffect } from 'react';
import { Pill, Plus, CheckCircle2, History, X } from 'lucide-react';
import { fetchPatientMedications, addPatientMedicationApi } from '@/lib/api';

interface MedicationItem {
  name: string;
  dosage: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'past';
}

interface PatientPrescriptionsProps {
  patientId: string;
}

export function PatientPrescriptions({ patientId }: PatientPrescriptionsProps) {
  const [meds, setMeds] = useState<MedicationItem[]>([
    { name: 'IFA tablets', dosage: '1 tablet daily', startDate: '2026-09-20', status: 'active' },
    { name: 'Calcium 500mg', dosage: '1 tablet daily after meal', startDate: '2026-09-20', status: 'active' },
    { name: 'Folic acid 5mg', dosage: '1 tablet daily', startDate: '2026-09-20', status: 'active' },
    { name: 'Antenatal Multivitamins', dosage: '1 daily', startDate: '2026-08-15', endDate: '2026-10-01', status: 'past' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1 tablet daily');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPatientMedications(patientId)
      .then((data: MedicationItem[]) => {
        if (Array.isArray(data) && data.length > 0) setMeds(data);
      })
      .catch(() => undefined);
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const updated = await addPatientMedicationApi(patientId, {
        name: name.trim(),
        dosage: dosage.trim(),
        startDate,
      });
      if (Array.isArray(updated)) setMeds(updated);
      else {
        setMeds((prev) => [
          ...prev,
          { name: name.trim(), dosage: dosage.trim(), startDate, status: 'active' },
        ]);
      }
      setName('');
      setShowAdd(false);
    } catch {
      setMeds((prev) => [
        ...prev,
        { name: name.trim(), dosage: dosage.trim(), startDate, status: 'active' },
      ]);
      setShowAdd(false);
    } finally {
      setSubmitting(false);
    }
  };

  const activeMeds = meds.filter((m) => m.status === 'active');
  const pastMeds = meds.filter((m) => m.status === 'past');

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h4 className="font-display font-bold text-slate-800 text-sm">
            Prescriptions & Maternal Supplements
          </h4>
          <p className="text-xs text-slate-400">Government IFA, Calcium, and prescribed regimens</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary py-1 px-3 text-xs flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Medication
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="p-3.5 rounded-xl border border-primary-200 bg-primary-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">New Clinical Supplement</span>
            <button type="button" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">Medication Name</label>
              <input
                type="text"
                placeholder="e.g. Iron Sucrose IV"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">Dosage Frequency</label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1 rounded-lg bg-primary-600 text-white text-xs font-semibold shadow-sm"
            >
              {submitting ? 'Adding...' : 'Save Prescription'}
            </button>
          </div>
        </form>
      )}

      {/* Current Medications */}
      <div>
        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Pill className="w-3.5 h-3.5 text-primary-600" />
          Current Medications ({activeMeds.length})
        </h5>
        <div className="space-y-2">
          {activeMeds.map((med, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-success-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">{med.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{med.dosage}</p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                Since {med.startDate}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Past Medications */}
      {pastMeds.length > 0 && (
        <div className="pt-2">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-slate-400" />
            Past Medications
          </h5>
          <div className="space-y-2 opacity-80">
            {pastMeds.map((med, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <p>• {med.name} — <span className="text-slate-500">{med.dosage}</span></p>
                <span className="text-[10px] text-slate-400">Stopped {med.endDate || 'recently'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
