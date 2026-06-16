import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Issue } from '../types/api';

export const useIssues = () => {
    const queryClient = useQueryClient();

    const { data: issues = [], isLoading: loading, error: queryError, refetch } = useQuery<Issue[]>({
        queryKey: ['issues'],
        queryFn: async () => {
            const { data } = await api.get('/issues');
            return data;
        }
    });

    const createIssueMutation = useMutation({
        mutationFn: async (issueData: Omit<Issue, 'id'>) => {
            const { data } = await api.post('/issues', issueData);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['issues'] });
            queryClient.invalidateQueries({ queryKey: ['projectDetails', variables.projectId] });
        }
    });

    const updateIssueMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: Partial<Issue> }) => {
            const { data } = await api.patch(`/issues/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issues'] });
            queryClient.invalidateQueries({ queryKey: ['projectDetails'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });

    const resolveIssueMutation = useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.patch(`/issues/${id}/resolve`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issues'] });
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
            queryClient.invalidateQueries({ queryKey: ['issues'] });
            queryClient.invalidateQueries({ queryKey: ['projectDetails'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });

    return {
        issues,
        loading,
        queryError,
        refetch,
        createIssue: createIssueMutation.mutateAsync,
        isCreating: createIssueMutation.isPending,
        updateIssue: updateIssueMutation.mutateAsync,
        isUpdating: updateIssueMutation.isPending,
        resolveIssue: resolveIssueMutation.mutateAsync,
        isResolving: resolveIssueMutation.isPending,
        deleteIssue: deleteIssueMutation.mutateAsync,
        isDeleting: deleteIssueMutation.isPending,
        error: createIssueMutation.error || updateIssueMutation.error || deleteIssueMutation.error || resolveIssueMutation.error
    };
};
