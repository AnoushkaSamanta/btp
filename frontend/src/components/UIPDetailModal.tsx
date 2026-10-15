import React from 'react';
import { X, Syringe, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

export interface UIPVaccineInfo {
  name: string;
  timing: string;
  target: 'Newborn' | 'Infant' | 'Pregnant' | 'Children';
  dose: string;
  route: string;
  site: string;
  protectsAgainst: string[];
  sideEffects: string[];
  contraindications: string[];
  guidelinesUrl?: string;
}

export const UIP_DETAILS: Record<string, UIPVaccineInfo> = {
  BCG: {
    name: 'BCG (Bacillus Calmette-Guérin)',
    timing: 'At birth (or as early as possible till 1 year)',
    target: 'Newborn',
    dose: '0.05 mL (until 1 month), 0.1 mL (after 1 month)',
    route: 'Intradermal',
    site: 'Left upper arm',
    protectsAgainst: ['Tuberculosis (TB)', 'TB Meningitis', 'Miliary Disseminated TB'],
    sideEffects: ['Small papule/swelling in 2-3 weeks', 'Small scar formation (normal sign of uptake)', 'Mild transient fever'],
    contraindications: ['Severe immunocompromised status', 'Active generalized dermatological infection', 'Symptomatic HIV infection'],
  },
  'OPV-0': {
    name: 'OPV-0 (Oral Polio Vaccine - Birth Dose)',
    timing: 'At birth (within the first 15 days)',
    target: 'Newborn',
    dose: '2 drops',
    route: 'Oral',
    site: 'Mouth',
    protectsAgainst: ['Poliomyelitis (Infantile Paralysis)', 'Type 1 & Type 3 Poliovirus'],
    sideEffects: ['Extremely rare mild loose stools', 'Generally very well tolerated'],
    contraindications: ['Severe vomiting or persistent diarrhea at time of dose (repeat once settled)'],
  },
  'Hep-B': {
    name: 'Hepatitis B (Birth Dose)',
    timing: 'At birth (within 24 hours of delivery)',
    target: 'Newborn',
    dose: '0.5 mL',
    route: 'Intramuscular (IM)',
    site: 'Anterolateral aspect of mid-thigh (Left thigh)',
    protectsAgainst: ['Perinatal Hepatitis B viral transmission', 'Chronic Liver Cirrhosis', 'Hepatocellular Carcinoma'],
    sideEffects: ['Local soreness/redness at injection site', 'Low-grade fever (24-48 hrs)'],
    contraindications: ['Known severe hypersensitivity to yeast components'],
  },
  'Pentavalent-1': {
    name: 'Pentavalent-1 (DPT + Hep B + Hib)',
    timing: '6 weeks of age',
    target: 'Infant',
    dose: '0.5 mL',
    route: 'Intramuscular (IM)',
    site: 'Anterolateral aspect of mid-thigh',
    protectsAgainst: ['Diphtheria', 'Pertussis (Whooping Cough)', 'Tetanus', 'Hepatitis B', 'Haemophilus influenzae type B (Pneumonia/Meningitis)'],
    sideEffects: ['Mild to moderate fever', 'Pain and swelling at injection site', 'Fussiness and crying'],
    contraindications: ['Encephalopathy within 7 days of previous pertussis dose', 'Severe acute febrile illness'],
  },
  'OPV-1': {
    name: 'OPV-1 (Oral Polio Vaccine)',
    timing: '6 weeks of age',
    target: 'Infant',
    dose: '2 drops',
    route: 'Oral',
    site: 'Mouth',
    protectsAgainst: ['Poliomyelitis strains'],
    sideEffects: ['Generally no adverse symptoms'],
    contraindications: ['Immunodeficiency disorders'],
  },
  'Pentavalent-2': {
    name: 'Pentavalent-2',
    timing: '10 weeks of age',
    target: 'Infant',
    dose: '0.5 mL',
    route: 'Intramuscular (IM)',
    site: 'Anterolateral mid-thigh',
    protectsAgainst: ['Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib'],
    sideEffects: ['Fever, irritability, localized tenderness'],
    contraindications: ['Immediate severe anaphylaxis to prior Pentavalent dose'],
  },
  'Pentavalent-3': {
    name: 'Pentavalent-3',
    timing: '14 weeks of age',
    target: 'Infant',
    dose: '0.5 mL',
    route: 'Intramuscular (IM)',
    site: 'Anterolateral mid-thigh',
    protectsAgainst: ['Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib'],
    sideEffects: ['Fever, local redness, irritability'],
    contraindications: ['Severe hypersensitivity or neurological symptoms after dose 1 or 2'],
  },
  'MR-1': {
    name: 'MR-1 (Measles & Rubella)',
    timing: '9 completed months to 12 months',
    target: 'Infant',
    dose: '0.5 mL',
    route: 'Subcutaneous',
    site: 'Right upper arm',
    protectsAgainst: ['Measles (Khasra)', 'Rubella (German Measles)', 'Congenital Rubella Syndrome'],
    sideEffects: ['Transient rash 5-10 days after dose', 'Mild fever', 'Transient joint discomfort'],
    contraindications: ['Severe immunocompromised states', 'Pregnancy (for women of reproductive age)'],
  },
  'Td-1': {
    name: 'Td-1 (Tetanus & adult Diphtheria)',
    timing: 'Early in pregnancy (16-20 weeks or at first registration)',
    target: 'Pregnant',
    dose: '0.5 mL',
    route: 'Intramuscular (IM)',
    site: 'Upper arm (Deltoid muscle)',
    protectsAgainst: ['Maternal Tetanus', 'Neonatal Tetanus', 'Adult Diphtheria'],
    sideEffects: ['Local muscle stiffness at injection site', 'Mild transient fever'],
    contraindications: ['Documented severe neurological reaction to earlier tetanus toxoid'],
  },
  'Td-2': {
    name: 'Td-2',
    timing: '4 weeks after Td-1',
    target: 'Pregnant',
    dose: '0.5 mL',
    route: 'Intramuscular (IM)',
    site: 'Upper arm (Deltoid muscle)',
    protectsAgainst: ['Maternal & Neonatal Tetanus booster protection'],
    sideEffects: ['Local swelling, soreness for 24-48 hours'],
    contraindications: ['Previous anaphylactic reaction to Td vaccine'],
  },
};

interface UIPDetailModalProps {
  vaccineKey: string;
  onClose: () => void;
}

export function UIPDetailModal({ vaccineKey, onClose }: UIPDetailModalProps) {
  // Find vaccine info directly or fallback to matching prefix
  const info =
    UIP_DETAILS[vaccineKey] ||
    Object.values(UIP_DETAILS).find((v) =>
      v.name.toLowerCase().includes(vaccineKey.toLowerCase())
    ) || {
      name: vaccineKey,
      timing: 'Universal Immunization Programme Schedule',
      target: 'Infant',
      dose: '0.5 mL',
      route: 'As per NHM/MoHFW guidelines',
      site: 'Standard anatomical site',
      protectsAgainst: ['Target infectious pathogens covered under national schedule'],
      sideEffects: ['Mild fever or localized tenderness may occur'],
      contraindications: ['Severe acute febrile illness or known anaphylaxis'],
    };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center shrink-0">
              <Syringe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {info.name}
              </h3>
              <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
                {info.timing} • {info.target}
              </p>
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

        {/* Administration Specs Grid */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <div>
            <span className="font-semibold text-slate-500 dark:text-slate-400 block">Dose:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{info.dose}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500 dark:text-slate-400 block">Route:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{info.route}</span>
          </div>
          <div className="col-span-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
            <span className="font-semibold text-slate-500 dark:text-slate-400 block">Administration Site:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{info.site}</span>
          </div>
        </div>

        {/* Protects Against */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            Protects against:
          </div>
          <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
            {info.protectsAgainst.map((p, idx) => (
              <li key={idx}>{p}</li>
            ))}
          </ul>
        </div>

        {/* Side effects */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
            <Info className="w-4 h-4" />
            Expected Side Effects (Normal):
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-5">
            {info.sideEffects.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Contraindications */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            Contraindications:
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-5">
            {info.contraindications.map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
