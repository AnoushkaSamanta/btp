import React from 'react';
import { Landmark, Check, AlertCircle } from 'lucide-react';

interface SchemeMatch {
  name: string;
  fullName?: string;
  status: string;
  reasons?: string[];
  blockers?: string[];
  benefitAmount?: string;
}

interface WelfareSchemesProps {
  matches?: SchemeMatch[];
  isPregnant?: boolean;
}

export function WelfareSchemes({ matches = [], isPregnant = false }: WelfareSchemesProps) {
  // If no backend matches, but pregnancy was detected, provide standard frontline schemes
  const activeMatches: SchemeMatch[] = matches.length > 0 ? matches : (isPregnant ? [
    {
      name: 'PMMVY',
      fullName: 'Pradhan Mantri Matru Vandana Yojana',
      status: 'eligible',
      reasons: ['Likely eligible (pregnant beneficiary registered)'],
      benefitAmount: '₹5,000',
    },
    {
      name: 'JSY',
      fullName: 'Janani Suraksha Yojana',
      status: 'eligible',
      reasons: ['Likely eligible for institutional delivery cash incentive'],
      benefitAmount: '₹1,400',
    },
    {
      name: 'JSSK',
      fullName: 'Janani Shishu Suraksha Karyakram',
      status: 'eligible',
      reasons: ['Cashless delivery & drug coverage in public facilities'],
      benefitAmount: 'Free Delivery',
    },
  ] : []);

  const eligibleOrEnrolled = activeMatches.filter(
    (m) => m.status === 'eligible' || m.status === 'enrolled'
  );

  return (
    <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-2 text-xs">
      <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-900/40 pb-1.5">
        <p className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
          <Landmark className="w-3.5 h-3.5 text-emerald-600" />
          Welfare Schemes
        </p>
        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
          {eligibleOrEnrolled.length} match{eligibleOrEnrolled.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {eligibleOrEnrolled.length > 0 ? (
        <div className="space-y-1.5">
          {eligibleOrEnrolled.map((sc) => (
            <div
              key={sc.name}
              className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-emerald-100 dark:border-emerald-900/40 flex items-start justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-100">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{sc.name}</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    — {sc.reasons?.[0] || 'Likely eligible'}
                  </span>
                </div>
                {sc.fullName && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 pl-4.5">
                    {sc.fullName}
                  </p>
                )}
              </div>
              {sc.benefitAmount && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 dark:bg-emerald-950 px-1.5 py-0.5 rounded shrink-0">
                  {sc.benefitAmount}
                </span>
              )}
            </div>
          ))}
          <p className="text-[10px] text-slate-500 pt-1 text-right italic">
            Verify with official scheme office / Gram Panchayat
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="p-2 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-emerald-100 text-slate-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Check BPL / SECC credentials for PM-JAY and state entitlements</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelfareSchemes;
