/**
 * useVisits.ts – TanStack Query hooks for visits
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchVisits,
  fetchPatientVisits,
  createVisit,
  updateVisit,
  deleteVisit,
  completeVisitApi,
  rescheduleVisitApi,
  saveVisit,
  confirmVisit,
  processVisit,
} from '@/lib/api';
import { QK, INVALIDATE_ON } from '@/lib/queryKeys';

function useInvalidateVisit() {
  const qc = useQueryClient();
  return () =>
    Promise.all(INVALIDATE_ON.visit.map((key) => qc.invalidateQueries({ queryKey: key as unknown[] })));
}

// ── Queries ──────────────────────────────────────────────────────────────

export function useVisits() {
  return useQuery({
    queryKey: QK.visits,
    queryFn: () => fetchVisits() as Promise<any[]>,
  });
}

export function usePatientVisits(patientId: string) {
  return useQuery({
    queryKey: QK.patientVisits(patientId),
    queryFn: () => fetchPatientVisits(patientId) as Promise<any[]>,
    enabled: Boolean(patientId),
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────

export function useCreateVisit() {
  const invalidate = useInvalidateVisit();
  return useMutation({
    mutationFn: createVisit,
    onSuccess: invalidate,
  });
}

export function useUpdateVisit() {
  const invalidate = useInvalidateVisit();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => updateVisit(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteVisit() {
  const invalidate = useInvalidateVisit();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => deleteVisit(id, reason),
    onSuccess: invalidate,
  });
}

export function useCompleteVisit() {
  const invalidate = useInvalidateVisit();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof completeVisitApi>[1] }) =>
      completeVisitApi(id, body),
    onSuccess: invalidate,
  });
}

export function useRescheduleVisit() {
  const invalidate = useInvalidateVisit();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof rescheduleVisitApi>[1] }) =>
      rescheduleVisitApi(id, body),
    onSuccess: invalidate,
  });
}

export function useSaveVisit() {
  const invalidate = useInvalidateVisit();
  return useMutation({
    mutationFn: saveVisit,
    onSuccess: invalidate,
  });
}

export function useConfirmVisit() {
  const invalidate = useInvalidateVisit();
  return useMutation({
    mutationFn: ({ draftId, patientId }: { draftId: string; patientId?: string }) =>
      confirmVisit(draftId, patientId),
    onSuccess: invalidate,
  });
}

export function useProcessVisit() {
  const invalidate = useInvalidateVisit();
  return useMutation({
    mutationFn: ({
      transcript,
      language,
      patientId,
    }: {
      transcript: string;
      language: string;
      patientId?: string;
    }) => processVisit(transcript, language, patientId),
    onSuccess: invalidate,
  });
}
