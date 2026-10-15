import { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Calendar,
  Download,
  AlertCircle,
  Award,
  CheckCircle2,
  Edit2,
  FileText,
  Pill,
  Clock,
  Layers,
} from 'lucide-react';
import type { Patient, PatientStatus, SchemeEligibility, GovScheme, Visit } from '@/types';
import { downloadClinicalPdf } from '@/lib/download';
import { PhotoUpload } from './PhotoUpload';
import { PatientOverview } from './PatientOverview';
import { PatientVisits } from './PatientVisits';
import { PatientDocumentsTab } from './PatientDocumentsTab';
import { PatientPrescriptions } from './PatientPrescriptions';
import { PatientNotes } from './PatientNotes';
import { EditPatientModal } from './EditPatientModal';
import { AddVisitModal } from './AddVisitModal';

interface PatientDetailProps {
  patient: Patient;
  eligibility: SchemeEligibility[];
  schemes: GovScheme[];
  onClose: () => void;
  onToast: (msg: string) => void;
  onPatientUpdated: (updated: Patient) => void;
}

type TabKey = 'overview' | 'visits' | 'documents' | 'prescriptions' | 'notes';

const statusConfig: Record<PatientStatus, { label: string; bg: string; text: string; dot: string; gradient: string }> = {
  critical: { label: 'Critical', bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500', gradient: 'from-error-500 to-error-700' },
  'high-risk': { label: 'High Risk', bg: 'bg-accent-50', text: 'text-accent-700', dot: 'bg-accent-500', gradient: 'from-accent-500 to-accent-600' },
  stable: { label: 'Stable', bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500', gradient: 'from-success-500 to-success-600' },
  routine: { label: 'Routine', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', gradient: 'from-slate-500 to-slate-600' },
};

export function PatientDetail({
  patient,
  eligibility,
  schemes,
  onClose,
  onToast,
  onPatientUpdated,
}: PatientDetailProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const status = statusConfig[patient.status] || statusConfig.routine;

  const handleDownloadNHMRecord = () => {
    const today = new Date().toISOString().slice(0, 10);
    const safeName = `${patient.name.replace(/\s+/g, '_')}_NHM_Record_${today}.pdf`;

    downloadClinicalPdf(safeName, {
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
      report: `Official Antenatal / Primary Healthcare Record for ${patient.name}. Gestational window: ${patient.trimester} trimester. Recorded BP: ${patient.bp}. Current clinical status: ${patient.status.toUpperCase()}.`,
    });
    onToast(`Downloaded official NHM record for ${patient.name}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="card-elevated max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl bg-white border border-slate-200">
        {/* Modal Header */}
        <div className={`p-6 bg-gradient-to-r ${status.gradient} text-white relative shrink-0`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <PhotoUpload
                patientId={patient.id}
                name={patient.name}
                photoUrl={patient.photoUrl}
                onPhotoUpdated={(url) => {
                  const updated = { ...patient, photoUrl: url };
                  onPatientUpdated(updated);
                  onToast('Patient photo updated successfully');
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-display font-extrabold">{patient.name}</h3>
                  <span className="stat-badge bg-white/20 text-white backdrop-blur-sm border border-white/20 text-xs">
                    {status.label}
                  </span>
                </div>
                <p className="text-white/80 text-xs mt-1">
                  Age {patient.age} · {patient.village} · ID: {patient.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-sm flex items-center gap-1 transition-all"
                title="Edit Patient Details"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Patient</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-white/20 transition-colors text-white"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 mt-5 bg-black/15 p-1 rounded-xl backdrop-blur-sm w-fit overflow-x-auto max-w-full">
            {(
              [
                { id: 'overview', label: 'Overview' },
                { id: 'visits', label: 'Visits' },
                { id: 'documents', label: 'Documents' },
                { id: 'prescriptions', label: 'Prescriptions' },
                { id: 'notes', label: 'Notes' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body: Active Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
          {activeTab === 'overview' && (
            <PatientOverview
              patient={patient}
              eligibility={eligibility}
              schemes={schemes}
              onEditPatient={() => setShowEditModal(true)}
            />
          )}

          {activeTab === 'visits' && (
            <PatientVisits patientId={patient.id} patientName={patient.name} />
          )}

          {activeTab === 'documents' && (
            <PatientDocumentsTab patientId={patient.id} patientName={patient.name} />
          )}

          {activeTab === 'prescriptions' && (
            <PatientPrescriptions patientId={patient.id} />
          )}

          {activeTab === 'notes' && (
            <PatientNotes patientId={patient.id} />
          )}
        </div>

        {/* Modal Footer Bottom Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadNHMRecord}
            className="btn-ghost border border-slate-300 flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2"
          >
            <Download className="w-4 h-4 text-primary-600" />
            Download NHM Record
          </button>

          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-xs py-2 shadow-md shadow-primary-600/20"
          >
            <Calendar className="w-4 h-4" />
            Schedule Visit
          </button>

          {patient.phone ? (
            <a
              href={`tel:${patient.phone.replace(/\s+/g, '')}`}
              onClick={() => onToast(`Dialing ${patient.phone}...`)}
              className="btn-ghost border border-slate-300 dark:border-slate-700 text-xs px-3.5 py-2 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              title={`Call ${patient.name} (${patient.phone})`}
            >
              <Phone className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
              Call
            </a>
          ) : (
            <button
              type="button"
              onClick={() => onToast('No phone number recorded for patient.')}
              className="btn-ghost border border-slate-200 dark:border-slate-800 text-xs px-3.5 py-2 flex items-center gap-1.5 text-slate-400 cursor-not-allowed"
              title="No phone number"
            >
              <Phone className="w-3.5 h-3.5 text-slate-300" />
              Call
            </button>
          )}
        </div>
      </div>

      {/* Edit Patient Modal */}
      <EditPatientModal
        isOpen={showEditModal}
        patient={patient}
        onClose={() => setShowEditModal(false)}
        onSuccess={(updated) => {
          onPatientUpdated(updated);
          onToast('Patient record updated');
        }}
      />

      {/* Schedule Visit Modal with pre-filled patient info */}
      <AddVisitModal
        isOpen={showScheduleModal}
        initialPatientId={patient.id}
        initialDate={patient.nextVisit || '2026-10-29'}
        initialType={patient.status === 'critical' || patient.status === 'high-risk' ? 'High-Risk Follow-up' : 'ANC Check-up'}
        onClose={() => setShowScheduleModal(false)}
        onSuccess={(v: Visit) => {
          onToast(`Visit scheduled for ${v.patientName} on ${v.date}`);
        }}
      />
    </div>
  );
}
