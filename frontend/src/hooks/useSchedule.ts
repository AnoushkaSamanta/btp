/**
 * useSchedule.ts – TanStack Query hooks for visit scheduling
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchVisits,
  createVisit,
  completeVisitApi,
  rescheduleVisitApi,
  deleteVisit,
  scheduleVisit,
} from '@/lib/api';
import { QK, INVALIDATE_ON } from '@/lib/queryKeys';

function useInvalidateSchedule() {
  const qc = useQueryClient();
  return () =>
    Promise.all(INVALIDATE_ON.schedule.map((key) => qc.invalidateQueries({ queryKey: key as unknown[] })));
}

/** Today's + upcoming scheduled visits */
export function useSchedule() {
  return useQuery({
    queryKey: QK.schedule,
    queryFn: () => fetchVisits() as Promise<any[]>,
  });
}

export function useAddScheduledVisit() {
  const invalidate = useInvalidateSchedule();
  return useMutation({
    mutationFn: scheduleVisit,
    onSuccess: invalidate,
  });
}

export function useCompleteScheduledVisit() {
  const invalidate = useInvalidateSchedule();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof completeVisitApi>[1] }) =>
      completeVisitApi(id, body),
    onSuccess: invalidate,
  });
}

export function useRescheduleScheduledVisit() {
  const invalidate = useInvalidateSchedule();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof rescheduleVisitApi>[1] }) =>
      rescheduleVisitApi(id, body),
    onSuccess: invalidate,
  });
}

export function useCancelScheduledVisit() {
  const invalidate = useInvalidateSchedule();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => deleteVisit(id, reason),
    onSuccess: invalidate,
  });
}
