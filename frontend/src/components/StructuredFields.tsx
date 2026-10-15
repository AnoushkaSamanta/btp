import React from 'react';
import { Activity } from 'lucide-react';

interface StructuredFieldsProps {
  record: Record<string, unknown>;
}

function formatSymptomLabel(sym: string): string {
  if (!sym) return '';
  const lower = sym.toLowerCase().trim();
  if (lower === 'high_bp' || lower === 'high bp') return 'High BP';
  if (lower === 'high bp (invalid)') return 'High BP (invalid)';
  if (lower === 'high_sugar' || lower === 'high sugar') return 'High Sugar';
  if (lower === 'diabetic range' || lower === 'diabetic_range') return 'Diabetic Range';
  return sym
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function StructuredFields({ record }: StructuredFieldsProps) {
  const patientName = record.patient_name || record.name;
  const location = record.location || record.village;
  const bp = record.blood_pressure || record.bp;
  const bpStatus = String(record.bp_status || '');
  const sugar = record.blood_sugar;
  const sugarStatus = String(record.sugar_status || '');
  const symptoms = (record.symptoms as string[]) || [];

  return (
    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
      <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200/60 dark:border-slate-800 pb-1.5">
        <Activity className="w-3.5 h-3.5 text-primary-600" />
        Structured Clinical Fields
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
        <p>
          <span className="text-slate-400 font-medium">Name: </span>
          {patientName ? (
            <span className="font-bold text-slate-800 dark:text-slate-100">{String(patientName)}</span>
          ) : (
            <span className="text-slate-400 italic">Not provided</span>
          )}
        </p>

        <p>
          <span className="text-slate-400 font-medium">Location: </span>
          {location ? (
            <span className="font-medium text-slate-700 dark:text-slate-300">{String(location)}</span>
          ) : (
            <span className="text-slate-400 italic">Not provided</span>
          )}
        </p>

        <p>
          <span className="text-slate-400 font-medium">Age: </span>
          {record.age !== undefined && record.age !== null ? (
            <span className="font-bold text-slate-800 dark:text-slate-100">{String(record.age)} years</span>
          ) : (
            <span className="text-slate-400 italic">Not provided</span>
          )}
        </p>

        <p>
          <span className="text-slate-400 font-medium">Pregnancy: </span>
          {record.pregnancy_status ? (
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              Pregnant {record.gestational_age_months ? `(${record.gestational_age_months} months)` : ''}
            </span>
          ) : record.pregnancy_status === false ? (
            <span className="font-medium text-slate-700 dark:text-slate-300">Not pregnant</span>
          ) : (
            <span className="text-slate-400 italic">Not recorded</span>
          )}
        </p>

        <p>
          <span className="text-slate-400 font-medium">BP: </span>
          {bp ? (
            <>
              <span className="font-bold text-slate-800 dark:text-slate-100">{String(bp)}</span>{' '}
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  bpStatus === 'invalid_reading'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : bpStatus === 'high'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : bpStatus === 'low'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {bpStatus || 'normal'}
              </span>
            </>
          ) : (
            <span className="text-slate-400 italic">Not provided</span>
          )}
        </p>

        <p>
          <span className="text-slate-400 font-medium">Sugar: </span>
          {sugar ? (
            <>
              <span className="font-bold text-slate-800 dark:text-slate-100">{String(sugar)} mg/dL</span>{' '}
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  sugarStatus === 'critical'
                    ? 'bg-rose-100 text-rose-700'
                    : sugarStatus === 'high' || sugarStatus === 'diabetic'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {sugarStatus || 'normal'}
              </span>
            </>
          ) : (
            <span className="text-slate-400 italic">Not provided</span>
          )}
        </p>

        <p>
          <span className="text-slate-400 font-medium">Language: </span>
          {record.language_detected ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
              {String(record.language_detected)}
            </span>
          ) : (
            <span className="text-slate-400 italic">Auto-detect</span>
          )}
        </p>

        <div className="sm:col-span-2">
          <span className="text-slate-400 font-medium">Symptoms: </span>
          {symptoms.length > 0 ? (
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {symptoms.map(formatSymptomLabel).join(', ')}
            </span>
          ) : (
            <span className="text-slate-400 italic">Not provided</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default StructuredFields;
