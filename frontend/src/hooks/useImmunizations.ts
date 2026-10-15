/**
 * useImmunizations.ts – TanStack Query hooks for immunizations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchImmunizations,
  createImmunization,
  markImmunizationGiven,
  updateImmunizationRecord,
  deleteImmunizationRecord,
} from '@/lib/api';
import { QK, INVALIDATE_ON } from '@/lib/queryKeys';

function useInvalidateImmunization() {
  const qc = useQueryClient();
  return () =>
    Promise.all(INVALIDATE_ON.immunization.map((key) => qc.invalidateQueries({ queryKey: key as unknown[] })));
}

export function useImmunizations() {
  return useQuery({
    queryKey: QK.immunizations,
    queryFn: () => fetchImmunizations() as Promise<any[]>,
  });
}

export function useCreateImmunization() {
  const invalidate = useInvalidateImmunization();
  return useMutation({
    mutationFn: createImmunization,
    onSuccess: invalidate,
  });
}

export function useMarkImmunizationGiven() {
  const invalidate = useInvalidateImmunization();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof markImmunizationGiven>[1] }) =>
      markImmunizationGiven(id, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateImmunization() {
  const invalidate = useInvalidateImmunization();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, any> }) =>
      updateImmunizationRecord(id, updates),
    onSuccess: invalidate,
  });
}

export function useDeleteImmunization() {
  const invalidate = useInvalidateImmunization();
  return useMutation({
    mutationFn: (id: string) => deleteImmunizationRecord(id),
    onSuccess: invalidate,
  });
}
