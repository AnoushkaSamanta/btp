import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, FileText, CheckCircle2 } from 'lucide-react';
import { usePatients, useCreateVisit } from '@/hooks';
import type { Patient, Visit } from '@/types';

interface AddVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newVisit: Visit) => void;
  initialPatientId?: string;
  initialDate?: string;
  initialType?: string;
}

const VISIT_TYPES = [
  'ANC Check-up',
  'PNC Visit',
  'Immunization',
  'High-Risk Follow-up',
  'General Check-up',
];

export function AddVisitModal({
  isOpen,
  onClose,
  onSuccess,
  initialPatientId,
  initialDate,
  initialType,
}: AddVisitModalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || '');
  const [searchPatient, setSearchPatient] = useState('');
  const [date, setDate] = useState(() => initialDate || new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('10:30 AM');
  const [visitType, setVisitType] = useState(initialType || 'ANC Check-up');
  const [notes, setNotes] = useState('');
  const [village, setVillage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ── TanStack Query ─────────────────────────────────────────────────────
  const { data: patientsRaw } = usePatients();
  const createVisitMut = useCreateVisit();
  const patients: Patient[] = (patientsRaw ?? []) as Patient[];

  useEffect(() => {
    if (initialPatientId) setSelectedPatientId(initialPatientId);
    if (initialDate) setDate(initialDate);
    if (initialType) setVisitType(initialType);
  }, [initialPatientId, initialDate, initialType]);

  useEffect(() => {
    if (isOpen && patients.length > 0) {
      const targetId = initialPatientId || selectedPatientId || patients[0].id;
      if (targetId) {
        setSelectedPatientId(targetId);
        const p = patients.find((item: Patient) => item.id === targetId);
        if (p) setVillage(p.village || 'Ramnagar');
      }
    }
  }, [isOpen, patients, initialPatientId]);

  const handlePatientChange = (patientId: string) => {
    setSelectedPatientId(patientId);
    const p = patients.find((item) => item.id === patientId);
    if (p) {
      setVillage(p.village || '');
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchPatient.toLowerCase()) ||
    p.village.toLowerCase().includes(searchPatient.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError('Please select a patient');
      return;
    }
    if (!date) {
      setError('Please choose a valid date');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const created = await createVisitMut.mutateAsync({
        patient_id: selectedPatientId,
        date,
        time,
        type: visitType,
        notes: notes.trim(),
        village,
      });
      onSuccess(created as Visit);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create visit');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="card-elevated max-w-lg w-full p-6 relative rounded-2xl shadow-2xl bg-white border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-900">Add New Visit</h3>
            <p className="text-xs text-slate-500 mt-0.5">Schedule a clinical or routine home visit</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-error-50 text-error-700 text-xs font-semibold border border-error-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Patient <span className="text-error-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Search patient name..."
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-primary-500"
              />
            </div>
            <select
              value={selectedPatientId}
              onChange={(e) => handlePatientChange(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              required
            >
              <option value="">-- Choose Patient --</option>
              {filteredPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.village}) - {p.trimester || 'ANC'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Village (Auto-filled)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Village"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Visit Type <span className="text-error-500">*</span>
              </label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-primary-500"
              >
                {VISIT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Time Slot <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-primary-500"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Visit Notes & Special Focus
            </label>
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 3rd trimester blood pressure monitoring, IFA distribution, family counseling"
                rows={3}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20 disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Schedule Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
