import React, { useState } from 'react';
import {
  Syringe,
  CheckCircle2,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Trash2,
  Edit2,
  User,
  Shield,
  FileText,
} from 'lucide-react';
import type { ImmunizationRecord } from '@/types';
import { UIP_DETAILS } from './UIPDetailModal';

interface ImmunizationRecordProps {
  record: ImmunizationRecord;
  statusInfo: {
    label: string;
    bg: string;
    text: string;
    dot: string;
    gradient: string;
    icon: any;
  };
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onOpenPatient: (patientName: string) => void;
  onMarkGiven: (record: ImmunizationRecord) => void;
  onEdit: (record: ImmunizationRecord) => void;
  onDelete: (recordId: string) => void;
  delayIndex?: number;
}

export function ImmunizationRecordCard({
  record,
  statusInfo,
  isSelected,
  onSelect,
  onOpenPatient,
  onMarkGiven,
  onEdit,
  onDelete,
  delayIndex = 0,
}: ImmunizationRecordProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const StatusIcon = statusInfo.icon;

  // Lookup vaccine info metadata if available
  const meta = UIP_DETAILS[record.vaccine];

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm'
          : isExpanded
          ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-sm'
          : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
      style={{ animationDelay: `${delayIndex * 25}ms` }}
    >
      {/* Primary Row Header */}
      <div className="flex items-center gap-3 p-3.5 sm:p-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          aria-label={`Select ${record.patientName} ${record.vaccine}`}
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded text-emerald-600 border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
        />

        {/* Status / Vaccine Icon */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${statusInfo.gradient} flex items-center justify-center shadow-xs shrink-0 cursor-pointer`}
        >
          <Syringe className="w-4 h-4 text-white" />
        </div>

        {/* Patient and Vaccine summary */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex flex-wrap items-baseline gap-x-2">
            {/* Clickable Patient Name linking to profile */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPatient(record.patientName);
              }}
              className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline cursor-pointer text-left transition-colors"
            >
              {record.patientName}
            </button>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              • {record.vaccine} #{record.doseNumber}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3 text-slate-400" />
              Due: {record.dueDate || 'Unscheduled'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {record.village || 'Village Sector'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300">
              {record.ageGroup || 'Target'}
            </span>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Real Green "Mark Given" Button */}
          {record.status !== 'completed' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMarkGiven(record);
              }}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark Given</span>
            </button>
          )}

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}
          >
            <StatusIcon className="w-3 h-3" />
            <span className="hidden md:inline">{statusInfo.label}</span>
          </span>

          {/* Expand / Collapse toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label="Expand record details"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* More options menu */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenPatient(record.patientName);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
                >
                  <User className="w-3.5 h-3.5" /> View Patient
                </button>
                {record.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onMarkGiven(record);
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-emerald-600 font-semibold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Given
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(record);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Record
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700/70 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(record.id);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Record
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Accordion Panel */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="font-semibold text-slate-500 dark:text-slate-400 block">Due Date:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{record.dueDate || '—'}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 dark:text-slate-400 block">Village Sector:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{record.village || '—'}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 dark:text-slate-400 block">Recommended Timing:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {meta?.timing || 'As per Universal Immunization Schedule'}
              </span>
            </div>
          </div>

          {meta?.protectsAgainst && (
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                Protection Conferred:
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                {meta.protectsAgainst.join(', ')}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <FileText className="w-3.5 h-3.5" />
              <span>Record ID: <code className="font-mono text-slate-700 dark:text-slate-300">{record.id}</code></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(record)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(record.id)}
                className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 font-medium"
              >
                Delete
              </button>
              {record.status !== 'completed' && (
                <button
                  type="button"
                  onClick={() => onMarkGiven(record)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  Mark Given
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
