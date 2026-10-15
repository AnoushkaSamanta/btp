import { useState } from 'react';
import {
  FileText,
  ExternalLink,
  Download,
  CheckCircle2,
  ListOrdered,
  Clock,
  Building,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Users
} from 'lucide-react';
import type { GovScheme, SchemeEligibility } from '@/types';

interface SchemeCardProps {
  scheme: GovScheme;
  eligibleCount: number;
  enrolledCount: number;
  eligibilityRecords: SchemeEligibility[];
  selectedState: string;
  onOpenDetail: (scheme: GovScheme, tab?: 'overview' | 'documents' | 'patients') => void;
}

export function SchemeCard({
  scheme,
  eligibleCount,
  enrolledCount,
  eligibilityRecords,
  selectedState,
  onOpenDetail,
}: SchemeCardProps) {
  const stateBenefit = scheme.stateBenefits?.[selectedState] || scheme.benefit || 'Standard government assistance';

  return (
    <div className="glass-card card-hover p-5 text-left flex flex-col justify-between group animate-slide-up border border-slate-200/80 bg-white shadow-sm hover:shadow-md">
      <div>
        {/* Category & Badge */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">
            {scheme.category}
          </span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Gov of India
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display font-extrabold text-slate-900 text-lg group-hover:text-primary-700 transition-colors">
          {scheme.name}
        </h3>
        <p className="text-xs font-semibold text-slate-500 mb-2">{scheme.fullName}</p>
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {scheme.description}
        </p>

        {/* State Benefit Highlights */}
        <div className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 mb-4">
          <span className="font-bold text-amber-950">{selectedState} Entitlement:</span>{' '}
          <span>{stateBenefit}</span>
        </div>

        {/* Beneficiary Stats */}
        <div className="flex items-center gap-2 mb-4 text-xs">
          <button
            type="button"
            onClick={() => onOpenDetail(scheme, 'patients')}
            className="flex-1 p-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 border border-emerald-200 text-center transition-all"
          >
            {eligibleCount} Eligible
          </button>
          <div className="flex-1 p-2 rounded-xl bg-slate-50 text-slate-600 font-bold border border-slate-200 text-center">
            {enrolledCount} Enrolled
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-2">
          <a
            href={scheme.pdfFallback || `/api/schemes/${scheme.id}/document`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open official government publication PDF"
            className="flex-1 py-2 px-3 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 border border-primary-200 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" /> View Official PDF
          </a>

          <a
            href={scheme.portalUrl || scheme.portalFallback || 'https://nhm.gov.in/'}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open official portal: ${scheme.portalUrl || 'Gov Portal'}`}
            className="py-2 px-2.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-all border border-slate-200 flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Official Portal
          </a>
        </div>

        <button
          type="button"
          onClick={() => onOpenDetail(scheme, 'overview')}
          className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-800 hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5"
        >
          View How to Apply & Docs <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
