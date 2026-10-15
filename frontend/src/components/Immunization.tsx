import React, { useEffect, useState, useMemo } from 'react';
import {
  Syringe,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Search,
  Baby,
  Sparkles,
  Plus,
  FileDown,
  Printer,
  Undo2,
  CheckSquare,
  Square,
  CalendarClock,
  Trash2,
  Check,
} from 'lucide-react';
import { immunizationRecords as seedImm, patients as seedPatients, govSchemes as seedSchemes } from '@/data';
import {
  downloadImmunizationPdf,
} from '@/lib/api';
import {
  useImmunizations,
  useMarkImmunizationGiven,
  useUpdateImmunization,
  useDeleteImmunization,
  useCreateImmunization,
} from '@/hooks';
import { queryClient } from '@/lib/queryClient';
import { QK } from '@/lib/queryKeys';
import type { ImmunizationRecord, Patient } from '@/types';
import { MarkGivenModal } from './MarkGivenModal';
import { AddImmunizationModal } from './AddImmunizationModal';
import { UIPDetailModal } from './UIPDetailModal';
import { UIPScheduleItem } from './UIPScheduleItem';
import { ImmunizationRecordCard } from './ImmunizationRecord';
import { PatientDetail } from './PatientDetail';

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

const statusConfig: Record<
  ImmunizationRecord['status'],
  { label: string; bg: string; text: string; icon: typeof CheckCircle2; dot: string; gradient: string }
> = {
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: CheckCircle2,
    dot: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-teal-600',
  },
  due: {
    label: 'Due Now',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400',
    icon: Clock,
    dot: 'bg-amber-500',
    gradient: 'from-amber-400 to-amber-600',
  },
  overdue: {
    label: 'Overdue',
    bg: 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-400',
    icon: AlertCircle,
    dot: 'bg-rose-500',
    gradient: 'from-rose-500 to-red-600',
  },
  upcoming: {
    label: 'Upcoming',
    bg: 'bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800',
    text: 'text-sky-700 dark:text-sky-400',
    icon: Calendar,
    dot: 'bg-sky-500',
    gradient: 'from-sky-400 to-sky-600',
  },
};

const vaccineSchedule: Array<{ vaccine: string; timing: string; target: 'Pregnant' | 'Newborn' | 'Infant' | 'Children' }> = [
  { vaccine: 'BCG', timing: 'At birth (within 1 yr)', target: 'Newborn' },
  { vaccine: 'OPV-0', timing: 'At birth (within 15 days)', target: 'Newborn' },
  { vaccine: 'Hep-B', timing: 'Within 24 hrs', target: 'Newborn' },
  { vaccine: 'Pentavalent-1', timing: '6 weeks', target: 'Infant' },
  { vaccine: 'OPV-1', timing: '6 weeks', target: 'Infant' },
  { vaccine: 'Pentavalent-2', timing: '10 weeks', target: 'Infant' },
  { vaccine: 'Pentavalent-3', timing: '14 weeks', target: 'Infant' },
  { vaccine: 'MR-1', timing: '9-12 months', target: 'Infant' },
  { vaccine: 'Td-1', timing: '16-20 weeks pregnancy', target: 'Pregnant' },
  { vaccine: 'Td-2', timing: '4 weeks after Td-1', target: 'Pregnant' },
];

export function Immunization() {
  const [filter, setFilter] = useState<'all' | ImmunizationRecord['status']>('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Modals state
  const [markGivenTarget, setMarkGivenTarget] = useState<ImmunizationRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailVaccineKey, setDetailVaccineKey] = useState<string | null>(null);
  const [activePatientProfile, setActivePatientProfile] = useState<Patient | null>(null);

  // Toast & Undo
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [undoAction, setUndoAction] = useState<{ recordId: string; previousStatus: ImmunizationRecord['status']; timeoutId: NodeJS.Timeout } | null>(null);

  // ── TanStack Query ─────────────────────────────────────────────────────
  const { data: immunizationsRaw } = useImmunizations();
  const markGivenMut = useMarkImmunizationGiven();
  const updateImmMut = useUpdateImmunization();
  const deleteImmMut = useDeleteImmunization();
  const createImmMut = useCreateImmunization();

  const immunizationRecords: ImmunizationRecord[] = (
    immunizationsRaw && immunizationsRaw.length > 0 ? immunizationsRaw : seedImm
  ) as ImmunizationRecord[];

  // Filter & Search records
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return immunizationRecords.filter((r) => {
      const matchesFilter = filter === 'all' || r.status === filter;
      const matchesSearch =
        !q ||
        r.patientName.toLowerCase().includes(q) ||
        r.vaccine.toLowerCase().includes(q) ||
        (r.village || '').toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [immunizationRecords, filter, search]);

  const stats = useMemo(
    () => ({
      completed: immunizationRecords.filter((r) => r.status === 'completed').length,
      due: immunizationRecords.filter((r) => r.status === 'due').length,
      overdue: immunizationRecords.filter((r) => r.status === 'overdue').length,
      upcoming: immunizationRecords.filter((r) => r.status === 'upcoming').length,
    }),
    [immunizationRecords]
  );

  const filterTabs: Array<{ id: 'all' | ImmunizationRecord['status']; label: string; count: number }> = [
    { id: 'all', label: 'All', count: immunizationRecords.length },
    { id: 'due', label: 'Due Now', count: stats.due },
    { id: 'upcoming', label: 'Upcoming', count: stats.upcoming },
    { id: 'overdue', label: 'Overdue', count: stats.overdue },
    { id: 'completed', label: 'Completed', count: stats.completed },
  ];

  // Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4500);
  };

  // Open Patient Profile
  const handleOpenPatient = (patientName: string) => {
    const found =
      seedPatients.find((p) => p.name.toLowerCase() === patientName.toLowerCase()) ||
      seedPatients.find((p) => p.name.toLowerCase().includes(patientName.toLowerCase())) ||
      seedPatients[0];
    setActivePatientProfile(found);
  };

  // Mark Given with Undo
  const handleConfirmMarkGiven = async (
    recordId: string,
    details: { givenDate: string; batchNo: string; givenBy: string; notes?: string }
  ) => {
    const target = immunizationRecords.find((r) => r.id === recordId);
    if (!target) return;
    const prevStatus = target.status;

    // Optimistic update
    setImmunizationRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, status: 'completed' as const } : r))
    );
    setMarkGivenTarget(null);

    // Call API
    try {
      await markImmunizationGiven(recordId, {
        given_date: details.givenDate,
        batch_no: details.batchNo,
        given_by: details.givenBy,
        notes: details.notes,
      });
    } catch {
      // Backend fallback already has optimistic update
    }

    // Set 5-second undo timer
    if (undoAction?.timeoutId) clearTimeout(undoAction.timeoutId);
    const timeout = setTimeout(() => {
      setUndoAction(null);
    }, 5500);

    setUndoAction({
      recordId,
      previousStatus: prevStatus,
      timeoutId: timeout,
    });

    triggerToast(`✓ ${target.vaccine} #${target.doseNumber} marked given`);
  };

  // Undo Handler
  const handleUndo = async () => {
    if (!undoAction) return;
    const { recordId, previousStatus, timeoutId } = undoAction;
    clearTimeout(timeoutId);
    setUndoAction(null);

    // Revert status
    setImmunizationRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, status: previousStatus } : r))
    );
    try {
      await updateImmunizationStatus(recordId, previousStatus);
    } catch {
      // Fallback
    }
    triggerToast('Vaccine status restored');
  };

  // Add Record
  const handleAddRecord = async (newRec: any) => {
    try {
      const res = await createImmunization(newRec);
      const created: ImmunizationRecord = res?.id
        ? (res as ImmunizationRecord)
        : {
            id: `imm_${Date.now()}`,
            patientName: newRec.patient_name,
            patientId: newRec.patient_id,
            vaccine: newRec.vaccine,
            doseNumber: newRec.dose_number,
            dueDate: newRec.due_date,
            status: newRec.status,
            ageGroup: newRec.age_group,
            village: newRec.village,
          };
      setImmunizationRecords((prev) => [created, ...prev]);
      setShowAddModal(false);
      triggerToast(`Added ${created.vaccine} dose for ${created.patientName}`);
    } catch {
      const fallback: ImmunizationRecord = {
        id: `imm_${Date.now()}`,
        patientName: newRec.patient_name,
        patientId: newRec.patient_id,
        vaccine: newRec.vaccine,
        doseNumber: newRec.dose_number,
        dueDate: newRec.due_date,
        status: newRec.status,
        ageGroup: newRec.age_group,
        village: newRec.village,
      };
      setImmunizationRecords((prev) => [fallback, ...prev]);
      setShowAddModal(false);
      triggerToast(`Added record for ${fallback.patientName}`);
    }
  };

  // Delete Record
  const handleDeleteRecord = async (id: string) => {
    setImmunizationRecords((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    try {
      await deleteImmunizationRecord(id);
    } catch {
      // Handled
    }
    triggerToast('Immunization record removed');
  };

  // Edit Record prompt
  const handleEditRecord = async (record: ImmunizationRecord) => {
    const newDueDate = prompt('Enter new due date (YYYY-MM-DD):', record.dueDate);
    if (!newDueDate || newDueDate === record.dueDate) return;
    setImmunizationRecords((prev) =>
      prev.map((r) => (r.id === record.id ? { ...r, dueDate: newDueDate } : r))
    );
    try {
      await updateImmunizationRecord(record.id, { dueDate: newDueDate });
    } catch {
      // Handled
    }
    triggerToast(`Due date updated to ${newDueDate}`);
  };

  // Batch Selection
  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selectedIds.includes(r.id));
  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filtered.some((r) => r.id === id)));
    } else {
      const idsToAdd = filtered.map((r) => r.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
    }
  };

  const handleBatchMarkGiven = async () => {
    setImmunizationRecords((prev) =>
      prev.map((r) => (selectedIds.includes(r.id) ? { ...r, status: 'completed' as const } : r))
    );
    for (const id of selectedIds) {
      try {
        await updateImmunizationStatus(id, 'completed');
      } catch {
        // Fallback
      }
    }
    triggerToast(`Marked ${selectedIds.length} records as Completed`);
    setSelectedIds([]);
  };

  const handleBatchChangeDate = async () => {
    const newDate = prompt('Enter new due date for selected items (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
    if (!newDate) return;
    setImmunizationRecords((prev) =>
      prev.map((r) => (selectedIds.includes(r.id) ? { ...r, dueDate: newDate } : r))
    );
    for (const id of selectedIds) {
      try {
        await updateImmunizationRecord(id, { dueDate: newDate });
      } catch {
        // Fallback
      }
    }
    triggerToast(`Updated date for ${selectedIds.length} records`);
    setSelectedIds([]);
  };

  const handleBatchDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected records?`)) return;
    setImmunizationRecords((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
    for (const id of selectedIds) {
      try {
        await deleteImmunizationRecord(id);
      } catch {
        // Fallback
      }
    }
    triggerToast(`Deleted ${selectedIds.length} records`);
    setSelectedIds([]);
  };

  // Export PDF
  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      const blob = await downloadImmunizationPdf();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `immunization-tracker_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerToast('Downloaded official Immunization PDF');
    } catch {
      triggerToast('Export failed, please ensure backend is reachable');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 relative pb-12">
      <FloatingOrb className="w-72 h-72 bg-sky-200/25 -top-16 -right-10" delay={0} />
      <FloatingOrb className="w-64 h-64 bg-emerald-200/20 top-40 -left-16" delay={2} />

      {/* Toast Notification with Undo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <span>{toastMessage}</span>
          {undoAction && (
            <button
              type="button"
              onClick={handleUndo}
              className="px-2.5 py-1 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Undo2 className="w-3 h-3" />
              Undo
            </button>
          )}
        </div>
      )}

      {/* Top Header & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
              <Sparkles className="w-3.5 h-3.5" />
              {immunizationRecords.length} UIP Beneficiary Records
            </span>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-slate-100">
            Immunization Tracker
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Universal Immunization Programme (UIP) delivery, overdue tracking, and maternal Td schedules.
          </p>
        </div>

        {/* Action Buttons: Add Record, Export PDF, Print */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <FileDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isExporting ? 'Generating...' : 'Export PDF'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md hover:shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Record</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            value: stats.due,
            label: 'Due Now',
            icon: Clock,
            gradient: 'from-amber-400 to-amber-600',
            bgTint: 'border-amber-100 dark:border-amber-900/50',
          },
          {
            value: stats.upcoming,
            label: 'Upcoming',
            icon: Calendar,
            gradient: 'from-sky-400 to-sky-600',
            bgTint: 'border-sky-100 dark:border-sky-900/50',
          },
          {
            value: stats.overdue,
            label: 'Overdue',
            icon: AlertCircle,
            gradient: 'from-rose-500 to-red-600',
            bgTint: 'border-rose-100 dark:border-rose-900/50',
          },
          {
            value: stats.completed,
            label: 'Completed',
            icon: CheckCircle2,
            gradient: 'from-emerald-500 to-teal-600',
            bgTint: 'border-emerald-100 dark:border-emerald-900/50',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`p-4 rounded-2xl bg-white dark:bg-slate-800/80 border ${stat.bgTint} shadow-xs flex items-center gap-3.5`}
          >
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md text-white shrink-0`}
            >
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient, vaccine (e.g. BCG, Td), or village..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills with Counts */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
          <div className="flex items-center gap-2">
            {filterTabs.map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                      active ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {search && (
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 italic">
              {filtered.length} record{filtered.length === 1 ? '' : 's'} matching "{search}"
            </span>
          )}
        </div>
      </div>

      {/* Batch Action Bar (Appears when rows selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-900 text-white shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>
              {selectedIds.length} of {filtered.length} selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleBatchMarkGiven}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Mark Given
            </button>
            <button
              type="button"
              onClick={handleBatchChangeDate}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              Change Date
            </button>
            <button
              type="button"
              onClick={handleBatchDelete}
              className="px-3 py-1.5 text-xs font-semibold bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout: Records List & Clickable UIP Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Records List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
              >
                {allFilteredSelected ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Select all ({filtered.length})</span>
              </button>
            </div>
            <span className="text-xs text-slate-400">
              Showing {filtered.length} items
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Syringe className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No immunization records found
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No records match current filter or search criteria. Click "+ Add Record" to register a new dose.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilter('all');
                  setSearch('');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((record, idx) => (
                <ImmunizationRecordCard
                  key={record.id}
                  record={record}
                  statusInfo={statusConfig[record.status] || statusConfig.upcoming}
                  isSelected={selectedIds.includes(record.id)}
                  onSelect={(sel) =>
                    setSelectedIds((prev) =>
                      sel ? [...prev, record.id] : prev.filter((i) => i !== record.id)
                    )
                  }
                  onOpenPatient={handleOpenPatient}
                  onMarkGiven={(rec) => setMarkGivenTarget(rec)}
                  onEdit={handleEditRecord}
                  onDelete={handleDeleteRecord}
                  delayIndex={idx}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Col: UIP Schedule Interactive Reference */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center shrink-0">
                <Baby className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                  Universal UIP Schedule
                </h3>
                <p className="text-[11px] text-slate-500">Click any vaccine to view dosage guidelines</p>
              </div>
            </div>

            <div className="space-y-1">
              {vaccineSchedule.map((v) => (
                <UIPScheduleItem
                  key={v.vaccine}
                  vaccine={v.vaccine}
                  timing={v.timing}
                  target={v.target}
                  onClick={() => setDetailVaccineKey(v.vaccine)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {markGivenTarget && (
        <MarkGivenModal
          record={markGivenTarget}
          onClose={() => setMarkGivenTarget(null)}
          onConfirm={handleConfirmMarkGiven}
        />
      )}

      {showAddModal && (
        <AddImmunizationModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddRecord}
        />
      )}

      {detailVaccineKey && (
        <UIPDetailModal
          vaccineKey={detailVaccineKey}
          onClose={() => setDetailVaccineKey(null)}
        />
      )}

      {activePatientProfile && (
        <PatientDetail
          patient={activePatientProfile}
          eligibility={[]}
          schemes={seedSchemes}
          onClose={() => setActivePatientProfile(null)}
          onToast={triggerToast}
          onPatientUpdated={(up) => setActivePatientProfile(up)}
        />
      )}
    </div>
  );
}
export default Immunization;
