/**
 * queryKeys.ts  –  Centralized TanStack Query key registry
 *
 * All query keys live here so that invalidation is always consistent.
 * Import this wherever you call useQuery / invalidateQueries.
 */

export const QK = {
  // ── Entities ──────────────────────────────────────────
  patients: ['patients'] as const,
  patient: (id: string) => ['patients', id] as const,
  patientVisits: (id: string) => ['patients', id, 'visits'] as const,
  patientDocs: (id: string) => ['patients', id, 'documents'] as const,
  patientNotes: (id: string) => ['patients', id, 'notes'] as const,
  patientMeds: (id: string) => ['patients', id, 'medications'] as const,
  patientTrends: (id: string) => ['patients', id, 'trends'] as const,
  patientSchemeDocs: (pid: string, sid: string) => ['patients', pid, 'schemes', sid] as const,

  visits: ['visits'] as const,
  visit: (id: string) => ['visits', id] as const,

  immunizations: ['immunizations'] as const,
  immunization: (id: string) => ['immunizations', id] as const,

  schemes: ['schemes'] as const,
  scheme: (id: string) => ['schemes', id] as const,

  schedule: ['schedule'] as const,

  tasks: ['tasks'] as const,

  // ── Dashboard ─────────────────────────────────────────
  dashboard: ['dashboard'] as const,
  dashboardSummary: ['dashboard', 'summary'] as const,
  dashboardCritical: ['dashboard', 'critical-cases'] as const,
  dashboardRedFlags: ['dashboard', 'red-flags'] as const,
  dashboardConfirmations: ['dashboard', 'confirmations'] as const,

  // ── Reports ───────────────────────────────────────────
  reports: ['reports'] as const,
  reportsSummary: ['reports', 'summary'] as const,
  reportsData: (params?: object) => ['reports', 'data', params] as const,

  // ── Training ──────────────────────────────────────────
  trainingModules: ['training', 'modules'] as const,
  trainingModule: (id: string) => ['training', 'modules', id] as const,

  // ── Notifications ────────────────────────────────────
  notifications: ['notifications'] as const,
} as const;

/**
 * Groups for bulk invalidation.
 * When a visit is saved, call invalidateGroup('visit').
 */
export const INVALIDATE_ON = {
  visit: [
    QK.visits,
    QK.dashboard,
    QK.dashboardSummary,
    QK.dashboardConfirmations,
    QK.dashboardRedFlags,
    QK.patients,
    QK.reports,
    QK.reportsSummary,
    QK.schedule,
    QK.tasks,
  ],
  patient: [
    QK.patients,
    QK.dashboard,
    QK.dashboardSummary,
    QK.reports,
    QK.reportsSummary,
    QK.schedule,
    QK.schemes,
  ],
  schedule: [
    QK.schedule,
    QK.dashboard,
    QK.dashboardSummary,
    QK.reports,
    QK.reportsSummary,
    QK.visits,
    QK.tasks,
  ],
  immunization: [
    QK.immunizations,
    QK.dashboard,
    QK.dashboardSummary,
    QK.patients,
    QK.reports,
    QK.reportsSummary,
    QK.schedule,
  ],
  scheme: [
    QK.schemes,
    QK.patients,
    QK.dashboard,
    QK.dashboardSummary,
    QK.reports,
    QK.reportsSummary,
  ],
  task: [
    QK.tasks,
    QK.dashboard,
    QK.dashboardSummary,
    QK.reports,
  ],
  voiceNote: [
    QK.visits,
    QK.dashboard,
    QK.dashboardSummary,
    QK.dashboardConfirmations,
    QK.patients,
    QK.reports,
    QK.reportsSummary,
    QK.schedule,
    QK.tasks,
  ],
} as const;
