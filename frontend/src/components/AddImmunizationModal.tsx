import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { patients as seedPatients } from '@/data';

interface AddImmunizationModalProps {
  onClose: () => void;
  onAdd: (newRecord: {
    patient_id: string;
    patient_name: string;
    vaccine: string;
    dose_number: number;
    due_date: string;
    status: 'upcoming' | 'due' | 'overdue' | 'completed';
    age_group: string;
    village: string;
    notes?: string;
  }) => void;
}

const VACCINE_OPTIONS = [
  { name: 'BCG', defaultTarget: 'Newborn' },
  { name: 'OPV-0', defaultTarget: 'Newborn' },
  { name: 'Hep-B', defaultTarget: 'Newborn' },
  { name: 'Pentavalent-1', defaultTarget: 'Infant' },
  { name: 'OPV-1', defaultTarget: 'Infant' },
  { name: 'Pentavalent-2', defaultTarget: 'Infant' },
  { name: 'Pentavalent-3', defaultTarget: 'Infant' },
  { name: 'MR-1', defaultTarget: 'Infant' },
  { name: 'Td-1', defaultTarget: 'Pregnant' },
  { name: 'Td-2', defaultTarget: 'Pregnant' },
  { name: 'Td-Booster', defaultTarget: 'Pregnant' },
  { name: 'Rotavirus-1', defaultTarget: 'Infant' },
  { name: 'PCV-1', defaultTarget: 'Infant' },
];

export function AddImmunizationModal({ onClose, onAdd }: AddImmunizationModalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(seedPatients[0]?.id || '');
  const [selectedVaccine, setSelectedVaccine] = useState(VACCINE_OPTIONS[0].name);
  const [doseNumber, setDoseNumber] = useState(1);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [status, setStatus] = useState<'upcoming' | 'due' | 'overdue' | 'completed'>('upcoming');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPatient = seedPatients.find((p) => p.id === selectedPatientId) || seedPatients[0];
  const vaccineMeta = VACCINE_OPTIONS.find((v) => v.name === selectedVaccine);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onAdd({
      patient_id: selectedPatient?.id || 'pat_demo',
      patient_name: selectedPatient?.name || 'Beneficiary',
      vaccine: selectedVaccine,
      dose_number: doseNumber,
      due_date: dueDate,
      status,
      age_group: vaccineMeta?.defaultTarget || 'Infant',
      village: selectedPatient?.village || 'Ramnagar',
      notes,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Add Immunization Record
              </h3>
              <p className="text-xs text-slate-500">Register due or upcoming vaccine dose</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Patient Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Beneficiary / Patient <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {seedPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age}y • {p.village})
                </option>
              ))}
            </select>
          </div>

          {/* Vaccine & Dose */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vaccine Name <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedVaccine}
                onChange={(e) => setSelectedVaccine(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {VACCINE_OPTIONS.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.defaultTarget})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dose #
              </label>
              <select
                value={doseNumber}
                onChange={(e) => setDoseNumber(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={1}>Dose 1</option>
                <option value={2}>Dose 2</option>
                <option value={3}>Dose 3</option>
                <option value={4}>Booster</option>
              </select>
            </div>
          </div>

          {/* Due Date & Status */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Scheduled Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="upcoming">Upcoming</option>
                <option value="due">Due Now</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Clinical Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Schedule alongside next ANC visit; mother informed."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {isSubmitting ? 'Adding...' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
