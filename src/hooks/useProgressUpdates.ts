import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface SubmitPayload {
  projectId: string;
  reportDate: string;
  physicalProgressPct: number;
  stage: string;
  milestoneStatus: string;
  status: 'DRAFT' | 'SUBMITTED';
  keyUpdate: string;
  evidenceLink: string | null;
}

export const useProgressUpdates = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (payload: SubmitPayload) => {
      const { data } = await api.post('/progress-updates', payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectDetails', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: SubmitPayload }) => {
      const { data } = await api.put(`/progress-updates/${id}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectDetails', variables.payload.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    createUpdate: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateUpdate: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
