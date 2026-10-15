/**
 * Dashboard.tsx  –  ASHA-First Redesign
 *
 * Designed for rural ASHA workers with basic digital literacy.
 * Principle: 30 seconds between visits. No technical jargon.
 *
 * Sections (scroll order):
 *   1. Greeting Bar + Start button
 *   2. Urgent Alerts (pre-eclampsia, missed vaccines, high BP)
 *   3. Pending Confirmations notice
 *   4. Today's Schedule (vertical timeline)
 *   5. Today at a Glance (3 numbers)
 *   6. Primary Actions (big buttons)
 *
 * Developer/researcher cards → AdvancedDashboard (hidden, via Settings → Advanced)
 */

import { useState, useEffect } from 'react';
import {
  Mic,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Eye,
  CalendarCheck,
  ChevronRight,
  Syringe,
  Heart,
  Activity,
  BellRing,
  ArrowRight,
} from 'lucide-react';
import {
  dashboardStats as seedStats,
  todayVisits as seedToday,
} from '@/data';
import {
  fetchRedFlagAlerts,
} from '@/lib/api';
import {
  usePatients,
  useVisits,
  useImmunizations,
  useConfirmationLoop,
} from '@/hooks';
import { getPreferences } from '@/lib/preferences';
import { t } from '@/lib/i18n';
import type { ViewId, Patient, ImmunizationRecord, Visit } from '@/types';

interface DashboardProps {
  onNavigate: (view: ViewId) => void;
  onSelectPatient?: (patientId: string) => void;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function greetingWord(hour: number, lang: string): string {
  const key = hour < 12 ? 'goodMorning' : hour < 17 ? 'goodAfternoon' : 'goodEvening';
  return t(key, lang);
}

function dayLabel(): string {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ─────────────────────────────────────────────
// Sub-components (all inline for easy maintenance)
// ─────────────────────────────────────────────

interface UrgentAlertCardProps {
  name: string;
  village: string;
  reason: string;
  severity: 'critical' | 'high';
  onCall: () => void;
  onView: () => void;
}

function UrgentAlertCard({ name, village, reason, severity, onCall, onView }: UrgentAlertCardProps) {
  const isCritical = severity === 'critical';
  return (
    <div
      className={`rounded-2xl border-2 p-4 flex flex-col gap-3 ${
        isCritical
          ? 'bg-red-50 border-red-300 dark:bg-red-950/40 dark:border-red-700'
          : 'bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isCritical ? 'bg-red-100 dark:bg-red-900/60' : 'bg-amber-100 dark:bg-amber-900/40'
          }`}
        >
          <AlertTriangle className={`w-5 h-5 ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">{name}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {village}
          </p>
          <p
            className={`text-sm font-semibold mt-1 ${
              isCritical ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'
            }`}
          >
            {reason}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCall}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[48px]"
        >
          <Phone className="w-4 h-4" />
          Call PHC
        </button>
        <button
          type="button"
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[48px]"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Schedule timeline item
// ─────────────────────────────────────────────

interface ScheduleItemProps {
  time: string;
  name: string;
  village: string;
  type: string;
  status: 'completed' | 'scheduled' | 'missed' | 'pending';
  isNext: boolean;
  onClick: () => void;
}

function ScheduleItem({ time, name, village, type, status, isNext, onClick }: ScheduleItemProps) {
  const isCompleted = status === 'completed';
  const isMissed = status === 'missed';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl border-2 transition-all min-h-[72px] ${
        isNext
          ? 'bg-primary-50 border-primary-400 dark:bg-primary-950/40 dark:border-primary-500 shadow-md shadow-primary-100 dark:shadow-none'
          : isCompleted
          ? 'bg-white dark:bg-slate-900 border-green-200 dark:border-green-800/60 opacity-70'
          : isMissed
          ? 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-800/60'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700'
      }`}
    >
      {/* Time column */}
      <div className="flex flex-col items-center pt-0.5 w-14 shrink-0">
        <span className="text-base font-bold text-slate-700 dark:text-slate-200">{time}</span>
        <div
          className={`w-3 h-3 rounded-full mt-1.5 ${
            isCompleted
              ? 'bg-green-500'
              : isMissed
              ? 'bg-red-500'
              : isNext
              ? 'bg-primary-500 animate-pulse ring-4 ring-primary-200 dark:ring-primary-900'
              : 'bg-slate-300 dark:bg-slate-600'
          }`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[17px] font-bold text-slate-900 dark:text-slate-100 leading-tight">{name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {village}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{type}</p>
      </div>

      {/* Status badge */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        {isCompleted && (
          <span className="flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Done
          </span>
        )}
        {isMissed && (
          <span className="text-xs font-semibold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2.5 py-1 rounded-full">
            Missed
          </span>
        )}
        {isNext && (
          <span className="flex items-center gap-1 text-xs font-bold text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/60 px-2.5 py-1 rounded-full animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Next
          </span>
        )}
        {!isCompleted && !isMissed && !isNext && (
          <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            Upcoming
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-slate-400 mt-1" />
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────

export function Dashboard({ onNavigate, onSelectPatient }: DashboardProps) {
  const [urgentAlerts, setUrgentAlerts] = useState<
    { name: string; village: string; reason: string; severity: 'critical' | 'high'; patientId?: string }[]
  >([]);
  const [prefs, setPrefs] = useState(() => getPreferences());

  // ── TanStack Query data ────────────────────────────────────────────────
  const { data: patientsData } = usePatients();
  const { data: visitsData } = useVisits();
  const { data: immunizationsData } = useImmunizations();
  const { data: confirmationData } = useConfirmationLoop();

  const todayVisits: Visit[] = (visitsData ?? seedToday) as Visit[];
  const dueImmunizations = ((immunizationsData ?? []) as ImmunizationRecord[]).filter(
    (r) => r.status === 'due' || r.status === 'overdue'
  ).length;
  const pendingConfirmations = Number(
    (confirmationData as any)?.pendingCount ??
    (confirmationData as any)?.pending ??
    (Array.isArray(confirmationData) ? confirmationData.length : 0)
  ) || 0;

  useEffect(() => {
    const handle = () => setPrefs(getPreferences());
    window.addEventListener('asha-preferences-changed', handle);
    return () => window.removeEventListener('asha-preferences-changed', handle);
  }, []);

  // Derive urgent alerts from patient data via TanStack Query result
  useEffect(() => {
    if (!patientsData) return;
    const critical = (patientsData as Patient[])
      .filter((p) => p.status === 'critical' || p.status === 'high-risk')
      .slice(0, 3)
      .map((p) => ({
        name: p.name,
        village: p.village,
        reason: p.riskFactors?.[0] ?? (p.bp && p.bp !== '120/80' ? `BP ${p.bp}` : 'High-risk pregnancy'),
        severity: (p.status === 'critical' ? 'critical' : 'high') as 'critical' | 'high',
        patientId: p.id,
      }));
    setUrgentAlerts(critical);
  }, [patientsData]);

  // Also try fetching red-flag alerts from backend for richer reasons
  useEffect(() => {
    fetchRedFlagAlerts()
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.slice(0, 3).map((r: any) => ({
            name: r.patientName ?? r.name ?? 'Patient',
            village: r.village ?? '',
            reason: r.reason ?? r.flag ?? 'Urgent follow-up',
            severity: (r.severity === 'critical' ? 'critical' : 'high') as 'critical' | 'high',
            patientId: r.patientId,
          }));
          setUrgentAlerts(mapped);
        }
      })
      .catch(() => undefined);
  }, []);

  const completedCount = todayVisits.filter((v) => v.status === 'completed').length;
  const remainingCount = todayVisits.filter(
    (v) => v.status === 'scheduled' || v.status === 'pending'
  ).length;

  // The "next" visit is the first non-completed, non-missed one
  const nextVisitIndex = todayVisits.findIndex(
    (v) => v.status === 'scheduled' || v.status === 'pending'
  );

  const hour = new Date().getHours();
  const greeting = greetingWord(hour, prefs.language);
  const firstName = prefs.workerName.split(' ')[0] || 'ASHA';

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-28 animate-fade-in">

      {/* ── 1. GREETING BAR ── */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-800 dark:to-primary-900 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-primary-500/20">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-white leading-tight">
            {greeting}, {firstName} 👋
          </h2>
          <p className="text-primary-100 text-sm mt-1 font-medium">
            {dayLabel()} · {remainingCount} {remainingCount === 1 ? 'visit' : 'visits'} remaining
          </p>
        </div>
        <button
          type="button"
          id="dashboard-start-voice"
          onClick={() => onNavigate('voice')}
          className="flex items-center gap-2 bg-white text-primary-700 font-bold px-4 py-3 rounded-xl shadow-md hover:bg-primary-50 transition-all text-sm min-h-[48px] shrink-0"
        >
          <Mic className="w-5 h-5" />
          Start
        </button>
      </div>

      {/* ── 2. URGENT ALERTS ── */}
      {urgentAlerts.length > 0 && (
        <section aria-label="Urgent alerts">
          <div className="flex items-center gap-2 mb-3">
            <BellRing className="w-5 h-5 text-red-500 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Urgent Alerts
            </h3>
            <span className="ml-auto px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-sm font-bold">
              {urgentAlerts.length}
            </span>
          </div>
          <div className="space-y-3">
            {urgentAlerts.map((alert, i) => (
              <UrgentAlertCard
                key={i}
                name={alert.name}
                village={alert.village}
                reason={alert.reason}
                severity={alert.severity}
                onCall={() => window.open('tel:108', '_self')}
                onView={() => {
                  if (alert.patientId && onSelectPatient) {
                    onSelectPatient(alert.patientId);
                  } else {
                    onNavigate('patients');
                  }
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── 3. PENDING CONFIRMATIONS ── */}
      {pendingConfirmations > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-amber-900 dark:text-amber-200">
              {pendingConfirmations} {pendingConfirmations === 1 ? 'visit needs' : 'visits need'} voice confirmation
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400">Review before submitting to PHC</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('voice')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors min-h-[48px] shrink-0"
          >
            Review
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 4. TODAY'S SCHEDULE ── */}
      <section aria-label="Today's schedule">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Today's Visits</h3>
          <button
            type="button"
            onClick={() => onNavigate('schedule')}
            className="text-sm font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline"
          >
            See all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
              style={{ width: todayVisits.length ? `${(completedCount / todayVisits.length) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">
            {completedCount}/{todayVisits.length}
          </span>
        </div>

        <div className="space-y-2">
          {todayVisits.length === 0 && (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500">
              <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-base font-medium">No visits scheduled today</p>
            </div>
          )}
          {todayVisits.map((visit, i) => (
            <ScheduleItem
              key={visit.id}
              time={visit.time}
              name={visit.patientName}
              village={visit.village}
              type={visit.type}
              status={visit.status}
              isNext={i === nextVisitIndex}
              onClick={() => {
                if (visit.patientId && onSelectPatient) {
                  onSelectPatient(visit.patientId);
                } else {
                  onNavigate('schedule');
                }
              }}
            />
          ))}
        </div>
      </section>

      {/* ── 5. TODAY AT A GLANCE ── */}
      <section aria-label="Today at a glance">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">Today at a Glance</h3>
        <div className="grid grid-cols-3 gap-3">
          <GlanceCard
            icon={<CalendarCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />}
            value={`${completedCount}/${todayVisits.length}`}
            label="Visits"
            bg="bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800"
          />
          <GlanceCard
            icon={<AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />}
            value={String(urgentAlerts.length)}
            label="Alerts"
            bg="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
          />
          <GlanceCard
            icon={<Syringe className="w-6 h-6 text-violet-600 dark:text-violet-400" />}
            value={String(dueImmunizations)}
            label="Vaccines Due"
            bg="bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800"
          />
        </div>
      </section>

      {/* ── 6. PRIMARY ACTIONS ── */}
      <section aria-label="Primary actions">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            id="dashboard-document-visit"
            onClick={() => onNavigate('voice')}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold text-lg rounded-2xl shadow-lg shadow-primary-500/25 transition-all min-h-[64px] px-6"
          >
            <Mic className="w-6 h-6" />
            🎤 Document Visit
          </button>
          <button
            type="button"
            id="dashboard-all-patients"
            onClick={() => onNavigate('patients')}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-lg rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all min-h-[64px] px-6"
          >
            <Users className="w-6 h-6" />
            📋 All Patients
          </button>
        </div>
      </section>

    </div>
  );
}

// ─────────────────────────────────────────────
// Glance card
// ─────────────────────────────────────────────
function GlanceCard({
  icon,
  value,
  label,
  bg,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  bg: string;
}) {
  return (
    <div className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-2 ${bg}`}>
      {icon}
      <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums leading-none">
        {value}
      </p>
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 text-center">{label}</p>
    </div>
  );
}
