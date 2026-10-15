/**
 * useSchemes.ts – TanStack Query hooks for government schemes
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSchemes,
  fetchPatientSchemeDocuments,
  uploadPatientDocument,
  deletePatientDocument,
  updateDocumentStatus,
  fetchPatientAllSchemesChecklist,
  fetchMissingDocumentAlerts,
} from '@/lib/api';
import { QK, INVALIDATE_ON } from '@/lib/queryKeys';

function useInvalidateScheme() {
  const qc = useQueryClient();
  return () =>
    Promise.all(INVALIDATE_ON.scheme.map((key) => qc.invalidateQueries({ queryKey: key as unknown[] })));
}

export function useSchemes() {
  return useQuery({
    queryKey: QK.schemes,
    queryFn: () => fetchSchemes() as Promise<any[]>,
  });
}

export function usePatientSchemeDocuments(patientId: string, schemeId: string) {
  return useQuery({
    queryKey: QK.patientSchemeDocs(patientId, schemeId),
    queryFn: () => fetchPatientSchemeDocuments(patientId, schemeId),
    enabled: Boolean(patientId) && Boolean(schemeId),
  });
}

export function usePatientSchemesChecklist(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'schemes-checklist'] as const,
    queryFn: () => fetchPatientAllSchemesChecklist(patientId),
    enabled: Boolean(patientId),
  });
}

export function useMissingDocumentAlerts() {
  return useQuery({
    queryKey: ['documents', 'alerts'] as const,
    queryFn: () => fetchMissingDocumentAlerts() as Promise<any[]>,
  });
}

export function useUploadPatientDocument() {
  const invalidate = useInvalidateScheme();
  return useMutation({
    mutationFn: (formData: FormData) => uploadPatientDocument(formData),
    onSuccess: invalidate,
  });
}

export function useDeletePatientDocument() {
  const invalidate = useInvalidateScheme();
  return useMutation({
    mutationFn: (documentId: string) => deletePatientDocument(documentId),
    onSuccess: invalidate,
  });
}

export function useUpdateDocumentStatus() {
  const invalidate = useInvalidateScheme();
  return useMutation({
    mutationFn: ({
      documentId,
      status,
      notes,
    }: {
      documentId: string;
      status: string;
      notes?: string;
    }) => updateDocumentStatus(documentId, status, notes),
    onSuccess: invalidate,
  });
}
