import { useEffect, useState, useMemo } from 'react';
import {
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  FileText,
  Sparkles,
  Plus,
  Search,
  Calendar as CalendarIcon,
  List,
  Filter,
  ArrowUpDown,
  Bell,
  X,
} from 'lucide-react';
import { todayVisits as seedToday, upcomingVisits as seedUpcoming } from '@/data';
import {
  useSchedule,
  useCompleteScheduledVisit,
  useRescheduleScheduledVisit,
  useCancelScheduledVisit,
  useAddScheduledVisit,
} from '@/hooks';
import { updateVisit } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { QK } from '@/lib/queryKeys';
import type { Visit, VisitStatus } from '@/types';
import { VillageFilter } from './VillageFilter';
import { VisitCard } from './VisitCard';
import { AddVisitModal } from './AddVisitModal';
import { EditVisitModal } from './EditVisitModal';
import { CompleteVisitModal } from './CompleteVisitModal';
import { CancelVisitModal } from './CancelVisitModal';
import { CalendarView } from './CalendarView';

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

type TabType = 'today' | 'upcoming' | 'completed' | 'all';
type ViewMode = 'list' | 'calendar';
type SortOption = 'time' | 'patient' | 'village' | 'risk';

export function Schedule({
  focusVisitId = '',
  onSelectPatient,
}: {
  focusVisitId?: string;
  onSelectPatient?: (patientId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedMonth, setSelectedMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [search, setSearch] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('time');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [completingVisit, setCompletingVisit] = useState<Visit | null>(null);
  const [cancellingVisit, setCancellingVisit] = useState<Visit | null>(null);
  const [detailModalVisit, setDetailModalVisit] = useState<Visit | null>(null);

  // Toast / feedback message
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(
    null
  );

  const today = new Date().toISOString().slice(0, 10);
  const monthLabel = selectedMonth.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ── TanStack Query ─────────────────────────────────────────────────────
  const { data: visitsRaw } = useSchedule();
  const completeVisitMut = useCompleteScheduledVisit();
  const rescheduleVisitMut = useRescheduleScheduledVisit();
  const cancelVisitMut = useCancelScheduledVisit();
  const addVisitMut = useAddScheduledVisit();

  const allVisits: Visit[] = ((visitsRaw && visitsRaw.length > 0 ? visitsRaw : [...seedToday, ...seedUpcoming]) as Visit[]);

  useEffect(() => {
    if (!focusVisitId) return;
    const visit = allVisits.find((item) => item.id === focusVisitId);
    if (!visit) return;
    const visitDate = new Date(`${visit.date}T00:00:00`);
    setSelectedMonth(new Date(visitDate.getFullYear(), visitDate.getMonth(), 1));
    if (visit.date === today) {
      setActiveTab('today');
    } else if (visit.status === 'completed') {
      setActiveTab('completed');
    } else {
      setActiveTab('upcoming');
    }
  }, [focusVisitId, allVisits, today]);

  useEffect(() => {
    if (!focusVisitId) return;
    const frame = requestAnimationFrame(() =>
      document
        .querySelector(`[data-visit-id="${CSS.escape(focusVisitId)}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    );
    return () => cancelAnimationFrame(frame);
  }, [focusVisitId, allVisits, activeTab, selectedMonth, viewMode]);

  // Unique villages from all visits
  const villages = useMemo(() => {
    const set = new Set<string>();
    allVisits.forEach((v) => {
      if (v.village) set.add(v.village);
    });
    return Array.from(set).sort();
  }, [allVisits]);

  // Filtering
  const filteredVisits = useMemo(() => {
    return allVisits.filter((v) => {
      // Village filter
      if (selectedVillage !== 'All' && v.village.toLowerCase() !== selectedVillage.toLowerCase()) {
        return false;
      }
      // Search by patient name or type
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = v.patientName.toLowerCase().includes(q);
        const matchType = v.type.toLowerCase().includes(q);
        const matchNotes = (v.notes || '').toLowerCase().includes(q);
        if (!matchName && !matchType && !matchNotes) return false;
      }
      // Date range filter
      if (startDate && v.date < startDate) return false;
      if (endDate && v.date > endDate) return false;

      // Tab filter
      if (activeTab === 'today') {
        return v.date === today;
      }
      if (activeTab === 'upcoming') {
        return v.date >= today && v.status !== 'completed';
      }
      if (activeTab === 'completed') {
        return v.status === 'completed';
      }
      // activeTab === 'all'
      return true;
    });
  }, [allVisits, selectedVillage, search, startDate, endDate, activeTab, today]);

  // Sorting
  const sortedVisits = useMemo(() => {
    return [...filteredVisits].sort((a, b) => {
      if (sortBy === 'time') {
        return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
      }
      if (sortBy === 'patient') {
        return a.patientName.localeCompare(b.patientName);
      }
      if (sortBy === 'village') {
        return a.village.localeCompare(b.village);
      }
      if (sortBy === 'risk') {
        // High-risk or trimester
        const aRisk = (a.type.includes('High-Risk') ? 2 : 0) + (a.trimester?.includes('3') ? 1 : 0);
        const bRisk = (b.type.includes('High-Risk') ? 2 : 0) + (b.trimester?.includes('3') ? 1 : 0);
        return bRisk - aRisk;
      }
      return 0;
    });
  }, [filteredVisits, sortBy]);

  // Grouped by date for list view
  const groupedVisits = useMemo(() => {
    const groups: Record<string, Visit[]> = {};
    sortedVisits.forEach((v) => {
      if (!groups[v.date]) groups[v.date] = [];
      groups[v.date].push(v);
    });
    return groups;
  }, [sortedVisits]);

  // Handlers
  const handleAddSuccess = (newVisit: Visit) => {
    setAllVisits((prev) => [newVisit, ...prev]);
    showToast(`Visit scheduled for ${newVisit.patientName} on ${newVisit.date}`);
  };

  const handleEditSuccess = (updated: Visit) => {
    setAllVisits((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    showToast(`Visit updated for ${updated.patientName}`);
  };

  const handleCompleteSuccess = (completedVisit: Visit, nextVisit?: Visit) => {
    setAllVisits((prev) => {
      const list = prev.map((v) => (v.id === completedVisit.id ? completedVisit : v));
      if (nextVisit) return [nextVisit, ...list];
      return list;
    });
    showToast(
      nextVisit
        ? `Visit completed. Follow-up scheduled for ${nextVisit.date}.`
        : 'Visit marked as complete'
    );
  };

  const handleCancelSuccess = (cancelledId: string) => {
    setAllVisits((prev) => prev.filter((v) => v.id !== cancelledId));
    showToast('Visit cancelled successfully', 'info');
  };

  const handleDuplicateForNextMonth = async (visit: Visit) => {
    try {
      const d = new Date(`${visit.date}T10:00:00`);
      d.setMonth(d.getMonth() + 1);
      const nextMonthDate = d.toISOString().slice(0, 10);
      const created = await createVisit({
        patient_id: visit.patientId,
        date: nextMonthDate,
        time: visit.time,
        type: visit.type,
        village: visit.village,
        notes: `Next month recurring follow-up (duplicated from ${visit.date})`,
      });
      setAllVisits((prev) => [created as Visit, ...prev]);
      showToast(`Visit duplicated for ${visit.patientName} on ${nextMonthDate}`);
    } catch {
      showToast('Could not duplicate visit', 'error');
    }
  };

  const handlePatientClick = (patientId: string) => {
    if (onSelectPatient) {
      onSelectPatient(patientId);
    }
  };

  // Stats
  const todayVisits = allVisits.filter((v) => v.date === today);
  const completedToday = todayVisits.filter((v) => v.status === 'completed').length;
  const scheduledToday = todayVisits.filter((v) => v.status === 'scheduled').length;
  const pendingCount = allVisits.filter((v) => v.status === 'pending').length;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto relative">
      <FloatingOrb className="w-72 h-72 bg-primary-200/25 -top-16 -right-10" delay={0} />
      <FloatingOrb className="w-64 h-64 bg-sky-200/20 top-40 -left-16" delay={2} />

      {/* Floating Toast */}
      {toastMsg && (
        <div
          role="status"
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-xl animate-slide-up flex items-center gap-2 border text-sm font-semibold ${
            toastMsg.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700'
              : toastMsg.type === 'error'
              ? 'bg-error-900 text-white border-error-700'
              : 'bg-slate-800 text-slate-100 border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-success-400" />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100">
              <Sparkles className="w-3.5 h-3.5" />
              {monthLabel} · Live Dispatch
            </span>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-slate-900">Schedule</h2>
          <p className="text-slate-500 mt-1">
            Manage your patient visits, clinical checkups, and field appointments
          </p>
        </div>

        {/* Action button & Month Selector */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() =>
                setSelectedMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
              className="w-8 h-8 rounded-lg hover:bg-slate-50 flex items-center justify-center transition-colors text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-2">{monthLabel}</span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                setSelectedMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
              className="w-8 h-8 rounded-lg hover:bg-slate-50 flex items-center justify-center transition-colors text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-1.5 shadow-md shadow-primary-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Visit</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            count: completedToday,
            label: 'Completed Today',
            icon: CheckCircle2,
            bg: 'bg-success-50 text-success-700',
          },
          {
            count: scheduledToday,
            label: 'Scheduled Today',
            icon: Clock,
            bg: 'bg-sky-50 text-sky-700',
          },
          {
            count: pendingCount,
            label: 'Pending / Action Needed',
            icon: AlertCircle,
            bg: 'bg-accent-50 text-accent-700',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-card p-4 animate-slide-up group"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-display font-extrabold text-slate-900">{stat.count}</p>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls & Filter Bar */}
      <div className="glass-card p-4 rounded-2xl mb-6 space-y-3">
        {/* Top bar: Tabs + View Mode */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs: Today | Upcoming | Completed | All */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'completed', label: 'Completed' },
                { id: 'all', label: 'All' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List vs Calendar View Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Calendar View
              </button>
            </div>
          </div>
        </div>

        {/* Second row: Search, Village Filter, Date Range Picker, Sort */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient name, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 bg-white"
            />
          </div>

          {/* Village Filter */}
          <VillageFilter
            selectedVillage={selectedVillage}
            villages={villages}
            onChange={setSelectedVillage}
          />

          {/* Date range picker */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="focus:outline-none text-xs text-slate-700"
            />
            <span className="text-slate-400 text-[11px]">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="focus:outline-none text-xs text-slate-700"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 ml-1"
                title="Clear date range"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="relative inline-flex items-center">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort visits by"
              className="pl-8 pr-7 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-slate-300 focus:outline-none focus:border-primary-500 transition-all cursor-pointer shadow-sm"
            >
              <option value="time">Sort: Time / Date</option>
              <option value="patient">Sort: Patient Name</option>
              <option value="village">Sort: Village</option>
              <option value="risk">Sort: High Risk Level</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: List or Calendar View */}
      {viewMode === 'calendar' ? (
        <CalendarView
          visits={sortedVisits}
          onSelectVisit={(visit) => setDetailModalVisit(visit)}
          onSelectPatient={handlePatientClick}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedVisits).map(([dateStr, dayVisits], di) => {
            const d = new Date(`${dateStr}T12:00:00`);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            return (
              <div
                key={dateStr}
                className="animate-slide-up relative"
                style={{ animationDelay: `${di * 80}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {d.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-lg font-display font-extrabold text-slate-700">
                      {d.getDate()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-800">{dayName}</h3>
                    <p className="text-xs text-slate-500">{dayVisits.length} visits scheduled</p>
                  </div>
                </div>

                <div className="space-y-3 ml-2 pl-14 border-l-2 border-slate-100">
                  {dayVisits.map((visit, vi) => (
                    <VisitCard
                      key={visit.id}
                      visit={visit}
                      index={vi}
                      onEdit={(v) => setEditingVisit(v)}
                      onComplete={(v) => setCompletingVisit(v)}
                      onCancel={(v) => setCancellingVisit(v)}
                      onReschedule={(v) => setEditingVisit(v)}
                      onDuplicate={handleDuplicateForNextMonth}
                      onSelectPatient={handlePatientClick}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {sortedVisits.length === 0 && (
            <div className="glass-card p-12 text-center rounded-2xl">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-700">No visits match your criteria</p>
              <p className="text-xs text-slate-400 mt-1">
                Try switching tabs or resetting the village/date filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedVillage('All');
                  setStartDate('');
                  setEndDate('');
                  setActiveTab('all');
                }}
                className="btn-ghost mt-4 text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddVisitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      <EditVisitModal
        isOpen={!!editingVisit}
        visit={editingVisit}
        onClose={() => setEditingVisit(null)}
        onSuccess={handleEditSuccess}
      />

      <CompleteVisitModal
        isOpen={!!completingVisit}
        visit={completingVisit}
        onClose={() => setCompletingVisit(null)}
        onSuccess={handleCompleteSuccess}
      />

      <CancelVisitModal
        isOpen={!!cancellingVisit}
        visit={cancellingVisit}
        onClose={() => setCancellingVisit(null)}
        onSuccess={handleCancelSuccess}
      />

      {/* Calendar Click Details Modal */}
      {detailModalVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="card-elevated max-w-md w-full p-6 relative rounded-2xl shadow-2xl bg-white border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-display font-bold text-slate-900">Visit Details</h3>
              <button
                type="button"
                onClick={() => setDetailModalVisit(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Patient</span>
                <button
                  type="button"
                  onClick={() => {
                    const pId = detailModalVisit.patientId;
                    setDetailModalVisit(null);
                    handlePatientClick(pId);
                  }}
                  className="font-bold text-primary-700 hover:underline text-base"
                >
                  {detailModalVisit.patientName}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Date & Time</span>
                  <span className="font-semibold text-slate-700">
                    {detailModalVisit.date} · {detailModalVisit.time}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Village</span>
                  <span className="font-semibold text-slate-700">{detailModalVisit.village}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Type</span>
                <span className="font-semibold text-slate-700">{detailModalVisit.type}</span>
              </div>
              {detailModalVisit.notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                  {detailModalVisit.notes}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => {
                  const target = detailModalVisit;
                  setDetailModalVisit(null);
                  setEditingVisit(target);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Edit
              </button>
              {detailModalVisit.status !== 'completed' && (
                <button
                  type="button"
                  onClick={() => {
                    const target = detailModalVisit;
                    setDetailModalVisit(null);
                    setCompletingVisit(target);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-success-600 hover:bg-success-700 text-white"
                >
                  Complete
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const target = detailModalVisit;
                  setDetailModalVisit(null);
                  setCancellingVisit(target);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-error-50 hover:bg-error-100 text-error-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
