/**
 * useTraining.ts – TanStack Query hooks for training modules
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTrainingModules,
  fetchTrainingModule,
  fetchTrainingLessons,
  completeTrainingLesson,
  submitModuleQuiz,
  fetchCertificate,
} from '@/lib/api';
import { QK } from '@/lib/queryKeys';

export function useTrainingModules() {
  return useQuery({
    queryKey: QK.trainingModules,
    queryFn: () => fetchTrainingModules() as Promise<any[]>,
    staleTime: 5 * 60_000,
  });
}

export function useTrainingModule(id: string) {
  return useQuery({
    queryKey: QK.trainingModule(id),
    queryFn: () => fetchTrainingModule(id),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
  });
}

export function useTrainingLessons(id: string) {
  return useQuery({
    queryKey: ['training', 'modules', id, 'lessons'] as const,
    queryFn: () => fetchTrainingLessons(id) as Promise<any[]>,
    enabled: Boolean(id),
  });
}

export function useCompleteLesson(moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: number) => completeTrainingLesson(moduleId, lessonId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.trainingModule(moduleId) });
      qc.invalidateQueries({ queryKey: QK.trainingModules });
    },
  });
}

export function useSubmitQuiz(moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { answers: Record<string, number>; score: number; total: number }) =>
      submitModuleQuiz(moduleId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.trainingModule(moduleId) });
      qc.invalidateQueries({ queryKey: QK.trainingModules });
    },
  });
}

export function useCertificate(moduleId: string) {
  return useQuery({
    queryKey: ['training', 'modules', moduleId, 'certificate'] as const,
    queryFn: () => fetchCertificate(moduleId),
    enabled: Boolean(moduleId),
  });
}
