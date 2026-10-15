/**
 * useReports.ts – TanStack Query hooks for reports
 */
import { useQuery } from '@tanstack/react-query';
import { fetchReportsSummary, fetchReportsData } from '@/lib/api';
import { QK } from '@/lib/queryKeys';

interface ReportParams {
  fromDate?: string;
  toDate?: string;
  month?: string;
}

export function useReportsSummary() {
  return useQuery({
    queryKey: QK.reportsSummary,
    queryFn: () => fetchReportsSummary() as Promise<any>,
    staleTime: 30_000,
  });
}

export function useReportsData(params?: ReportParams) {
  return useQuery({
    queryKey: QK.reportsData(params),
    queryFn: () => fetchReportsData(params) as Promise<any>,
    staleTime: 30_000,
  });
}
