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

    return {
        createIssue: createIssueMutation.mutateAsync,
        isCreating: createIssueMutation.isPending,
        error: createIssueMutation.error
    };
};
