/**
 * useDashboard.ts – TanStack Query hooks for dashboard summary data
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchDashboard,
  fetchDashboardSummary,
  fetchRedFlagAlerts,
  fetchConfirmationLoop,
  fetchCriticalCases,
} from '@/lib/api';
import { QK } from '@/lib/queryKeys';

export function useDashboard() {
  return useQuery({
    queryKey: QK.dashboard,
    queryFn: () => fetchDashboard() as Promise<any>,
    // Short stale time so home screen always feels fresh
    staleTime: 30_000,
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: QK.dashboardSummary,
    queryFn: () => fetchDashboardSummary() as Promise<any>,
    staleTime: 30_000,
  });
}

export function useRedFlagAlerts() {
  return useQuery({
    queryKey: QK.dashboardRedFlags,
    queryFn: () => fetchRedFlagAlerts() as Promise<any[]>,
    staleTime: 60_000,
  });
}

export function useConfirmationLoop() {
  return useQuery({
    queryKey: QK.dashboardConfirmations,
    queryFn: () => fetchConfirmationLoop() as Promise<any>,
  });
}

export function useCriticalCases() {
  return useQuery({
    queryKey: QK.dashboardCritical,
    queryFn: () => fetchCriticalCases() as Promise<any[]>,
    staleTime: 60_000,
  });
}

/** Force-refresh all dashboard queries (e.g. after voice confirm) */
export function useInvalidateDashboard() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: QK.dashboard }),
      qc.invalidateQueries({ queryKey: QK.dashboardSummary }),
      qc.invalidateQueries({ queryKey: QK.dashboardRedFlags }),
      qc.invalidateQueries({ queryKey: QK.dashboardConfirmations }),
      qc.invalidateQueries({ queryKey: QK.dashboardCritical }),
    ]);
}
