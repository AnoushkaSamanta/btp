/**
 * useTasks.ts – TanStack Query hooks for follow-up tasks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFollowUpTasks } from '@/lib/api';
import { QK, INVALIDATE_ON } from '@/lib/queryKeys';

const BASE_URL = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API = BASE_URL ? `${BASE_URL}/api` : '/api';

async function completeTaskApi(taskId: string): Promise<any> {
  const res = await fetch(`${API}/tasks/${taskId}/complete`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to complete task');
  return res.json();
}

function useInvalidateTask() {
  const qc = useQueryClient();
  return () =>
    Promise.all(INVALIDATE_ON.task.map((key) => qc.invalidateQueries({ queryKey: key as unknown[] })));
}

export function useTasks() {
  return useQuery({
    queryKey: QK.tasks,
    queryFn: () => fetchFollowUpTasks() as Promise<any[]>,
  });
}

export function useCompleteTask() {
  const invalidate = useInvalidateTask();
  return useMutation({
    mutationFn: (taskId: string) => completeTaskApi(taskId),
    onSuccess: invalidate,
  });
}
