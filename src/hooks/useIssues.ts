import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Issue } from '../types/api';

export const useIssues = () => {
    const queryClient = useQueryClient();

    const createIssueMutation = useMutation({
        mutationFn: async (issueData: Omit<Issue, 'id'>) => {
            const { data } = await api.post('/issues', issueData);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['projectDetails', variables.projectId] });
        }
    });

    const updateIssueMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: Partial<Issue> }) => {
            const { data } = await api.patch(`/issues/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projectDetails'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });

    const deleteIssueMutation = useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/issues/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projectDetails'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });

    return {
        createIssue: createIssueMutation.mutateAsync,
        isCreating: createIssueMutation.isPending,
        updateIssue: updateIssueMutation.mutateAsync,
        isUpdating: updateIssueMutation.isPending,
        deleteIssue: deleteIssueMutation.mutateAsync,
        isDeleting: deleteIssueMutation.isPending,
        error: createIssueMutation.error || updateIssueMutation.error || deleteIssueMutation.error
    };
};
