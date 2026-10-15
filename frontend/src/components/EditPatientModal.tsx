import { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Calendar, HeartPulse, Scale, Droplet, ShieldAlert } from 'lucide-react';
import { updatePatientApi } from '@/lib/api';
import type { Patient, PatientStatus, Trimester } from '@/types';

interface EditPatientModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onSuccess: (updated: Patient) => void;
}

const COMMON_RISKS = [
  'Gestational diabetes',
  'Previous C-section',
  'Anemia',
  'Hypertension',
  'Severe edema',
  'Advanced maternal age',
  'Young maternal age',
  'Thyroid disorder',
  'Twin pregnancy',
];

export function EditPatientModal({ isOpen, patient, onClose, onSuccess }: EditPatientModalProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState(24);
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [trimester, setTrimester] = useState<Trimester>('3rd');
  const [gravida, setGravida] = useState(2);
  const [para, setPara] = useState(1);
  const [weight, setWeight] = useState(68.5);
  const [hemoglobin, setHemoglobin] = useState(8.2);
  const [bp, setBp] = useState('140/90');
  const [status, setStatus] = useState<PatientStatus>('critical');
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patient) {
      setName(patient.name || '');
      setAge(patient.age || 20);
      setVillage(patient.village || '');
      setPhone(patient.phone || '');
      setBloodGroup(patient.bloodGroup || 'B+');
      setTrimester(patient.trimester || '3rd');
      setGravida(patient.gravida ?? 1);
      setPara(patient.para ?? 0);
      setWeight(patient.weight ?? 60.0);
      setHemoglobin(patient.hemoglobin ?? 10.0);
      setBp(patient.bp || '120/80');
      setStatus(patient.status || 'stable');
      setRiskFactors(patient.riskFactors || []);
      setError('');
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const toggleRisk = (risk: string) => {
    setRiskFactors((prev) =>
      prev.includes(risk) ? prev.filter((r) => r !== risk) : [...prev, risk]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const updated = await updatePatientApi(patient.id, {
        name,
        age,
        village,
        phone,
        bloodGroup,
        trimester,
        gravida,
        para,
        weight,
        hemoglobin,
        bp,
        status,
        riskFactors,
      });
      onSuccess(updated as Patient);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update patient');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="card-elevated max-w-xl w-full p-6 relative rounded-2xl shadow-2xl bg-white border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-900">Edit Patient Details</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Updating primary record for <span className="font-semibold text-slate-700">{patient.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-error-50 text-error-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Village</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-primary-500"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trimester</label>
              <select
                value={trimester}
                onChange={(e) => setTrimester(e.target.value as Trimester)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-primary-500"
              >
                <option value="1st">1st Trimester</option>
                <option value="2nd">2nd Trimester</option>
                <option value="3rd">3rd Trimester</option>
                <option value="Postnatal">Postnatal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Risk Category</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PatientStatus)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-primary-500"
              >
                <option value="critical">Critical</option>
                <option value="high-risk">High Risk</option>
                <option value="stable">Stable</option>
                <option value="routine">Routine</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hemoglobin (g/dL)</label>
              <input
                type="number"
                step="0.1"
                value={hemoglobin}
                onChange={(e) => setHemoglobin(parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Pressure</label>
              <input
                type="text"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                placeholder="140/90"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gravida</label>
              <input
                type="number"
                value={gravida}
                onChange={(e) => setGravida(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Para</label>
              <input
                type="number"
                value={para}
                onChange={(e) => setPara(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Risk Factors & Complications
            </label>
            <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              {COMMON_RISKS.map((rf) => {
                const selected = riskFactors.includes(rf);
                return (
                  <button
                    key={rf}
                    type="button"
                    onClick={() => toggleRisk(rf)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selected
                        ? 'bg-error-500 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {rf}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-600/20 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
