import { Award, CheckCircle2, AlertCircle, Phone, Calendar, HeartPulse, Scale, Droplet, User, MapPin } from 'lucide-react';
import type { Patient, SchemeEligibility, GovScheme } from '@/types';
import { RiskHistoryChart } from './RiskHistoryChart';

interface PatientOverviewProps {
  patient: Patient;
  eligibility: SchemeEligibility[];
  schemes: GovScheme[];
  onEditPatient: () => void;
}

export function PatientOverview({
  patient,
  eligibility,
  schemes,
  onEditPatient,
}: PatientOverviewProps) {
  // Pre-calculate scheme missing documents cleanly
  const schemeRows = eligibility.map((e) => {
    const scheme = schemes.find((s) => s.id === e.schemeId);
    const isEnrolled = e.status === 'enrolled';
    const isEligible = e.status === 'eligible';
    const isPending = e.status === 'pending-docs';

    // Derive missing documentation intelligently
    let missingList = e.missingDocs || [];
    if (isPending && missingList.length === 0) {
      if (e.schemeId === 'jsy') missingList = ['Bank passbook', 'Marriage certificate'];
      else if (e.schemeId === 'pmmvy') missingList = ['Mother-Child Protection (MCP) card', 'Aadhaar linked bank account'];
      else if (e.schemeId === 'pmjay') missingList = ['Ration card / SECC family ID'];
      else missingList = ['Identity proof'];
    }

    return {
      e,
      schemeName: scheme ? scheme.name : e.schemeId.toUpperCase(),
      isEnrolled,
      isEligible,
      isPending,
      missingList,
    };
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Vitals Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Trimester', value: patient.trimester },
          { label: 'Blood Group', value: patient.bloodGroup || 'B+' },
          { label: 'Weight', value: `${patient.weight} kg` },
          { label: 'Hemoglobin', value: `${patient.hemoglobin} g/dL` },
          { label: 'Blood Pressure', value: patient.bp || '120/80' },
          { label: 'Gravida / Para', value: `G${patient.gravida} P${patient.para}` },
          { label: 'Last Visit', value: (patient.lastVisit || '').slice(5) || '—' },
          { label: 'Next Due Visit', value: (patient.nextVisit || '').slice(5) || '—' },
        ].map((item) => (
          <div key={item.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
            <p className="font-semibold text-slate-800 text-sm">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Clinical Risk History Graph */}
      <RiskHistoryChart patientId={patient.id} currentBp={patient.bp} />

      {/* Risk Factors */}
      <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        <h4 className="font-display font-bold text-slate-800 dark:text-slate-200 text-sm mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            Identified Risk Factors
          </span>
          {(patient.riskFactors || []).length > 0 && (
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200/50">
              {(patient.riskFactors || []).length} Recorded
            </span>
          )}
        </h4>
        {(patient.riskFactors || []).length > 0 ? (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {(patient.riskFactors || []).map((rf, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 shadow-2xs hover:bg-rose-100/70 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                {rf}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No active risk complications recorded for this beneficiary.</p>
        )}
      </div>

      {/* Government Scheme Enrollment & Document Status */}
      <div>
        <h4 className="font-display font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-primary-600" />
          Government Health Schemes & Document Submission Status
        </h4>
        <div className="space-y-2">
          {schemeRows.map(({ e, schemeName, isEnrolled, isEligible, isPending, missingList }) => (
            <div
              key={e.schemeId}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                isEnrolled
                  ? 'bg-success-50/60 border-success-200'
                  : isPending
                  ? 'bg-accent-50/60 border-accent-200'
                  : isEligible
                  ? 'bg-primary-50/60 border-primary-200'
                  : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isEnrolled
                    ? 'bg-success-100 text-success-600'
                    : isPending
                    ? 'bg-accent-100 text-accent-600'
                    : 'bg-primary-100 text-primary-600'
                }`}
              >
                {isEnrolled ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isPending ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Award className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{schemeName}</p>
                  <span
                    className={`stat-badge ${
                      isEnrolled
                        ? 'bg-success-100 text-success-700'
                        : isPending
                        ? 'bg-accent-100 text-accent-700'
                        : 'bg-primary-100 text-primary-700'
                    }`}
                  >
                    {isEnrolled ? 'Enrolled' : isPending ? 'Pending Docs' : 'Eligible'}
                  </span>
                </div>

                {e.benefitReceived && (
                  <p className="text-xs text-success-700 font-medium mt-0.5">
                    Benefit: {e.benefitReceived}
                  </p>
                )}

                {/* Fixed "Missing:" section */}
                {missingList.length > 0 ? (
                  <p className="text-xs text-accent-800 font-medium mt-1">
                    <span className="font-bold">Missing:</span> {missingList.join(', ')}
                  </p>
                ) : isEnrolled ? (
                  <p className="text-xs text-success-700 font-medium mt-1 flex items-center gap-1">
                    ✓ All required documents submitted
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Details */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-400" />
          <span>Phone: <span className="font-semibold text-slate-700">{patient.phone || 'Not recorded'}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span>Village: <span className="font-semibold text-slate-700">{patient.village}</span></span>
        </div>
      </div>
    </div>
  );
}
