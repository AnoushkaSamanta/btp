/**
 * usePatients.ts – TanStack Query hooks for patients
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPatients,
  fetchPatient,
  createPatient,
  updatePatientApi,
  fetchPatientNotes,
  addPatientNoteApi,
  fetchPatientMedications,
  addPatientMedicationApi,
  fetchPatientTrends,
  uploadPatientPhotoApi,
} from '@/lib/api';
import { QK, INVALIDATE_ON } from '@/lib/queryKeys';

function useInvalidatePatient(id?: string) {
  const qc = useQueryClient();
  return () => {
    const base = INVALIDATE_ON.patient.map((key) => qc.invalidateQueries({ queryKey: key as unknown[] }));
    if (id) {
      base.push(qc.invalidateQueries({ queryKey: QK.patient(id) }));
      base.push(qc.invalidateQueries({ queryKey: QK.patientVisits(id) }));
    }
    return Promise.all(base);
  };
}

// ── Queries ───────────────────────────────────────────────────────────────

export function usePatients() {
  return useQuery({
    queryKey: QK.patients,
    queryFn: () => fetchPatients() as Promise<any[]>,
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: QK.patient(id),
    queryFn: () => fetchPatient(id),
    enabled: Boolean(id),
  });
}

export function usePatientNotes(patientId: string) {
  return useQuery({
    queryKey: QK.patientNotes(patientId),
    queryFn: () => fetchPatientNotes(patientId) as Promise<any[]>,
    enabled: Boolean(patientId),
  });
}

export function usePatientMedications(patientId: string) {
  return useQuery({
    queryKey: QK.patientMeds(patientId),
    queryFn: () => fetchPatientMedications(patientId) as Promise<any[]>,
    enabled: Boolean(patientId),
  });
}

export function usePatientTrends(patientId: string) {
  return useQuery({
    queryKey: QK.patientTrends(patientId),
    queryFn: () => fetchPatientTrends(patientId),
    enabled: Boolean(patientId),
  });
}

// ── Mutations ────────────────────────────────────────────────────────────

export function useCreatePatient() {
  const invalidate = useInvalidatePatient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createPatient(body),
    onSuccess: invalidate,
  });
}

export function useUpdatePatient(id: string) {
  const invalidate = useInvalidatePatient(id);
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => updatePatientApi(id, body),
    onSuccess: invalidate,
  });
}

export function useAddPatientNote(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => addPatientNoteApi(patientId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.patientNotes(patientId) });
      qc.invalidateQueries({ queryKey: QK.patient(patientId) });
    },
  });
}

export function useAddPatientMedication(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => addPatientMedicationApi(patientId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.patientMeds(patientId) });
      qc.invalidateQueries({ queryKey: QK.patient(patientId) });
    },
  });
}

export function useUploadPatientPhoto(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photoUrl: string) => uploadPatientPhotoApi(patientId, photoUrl),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.patient(patientId) }),
  });
}
