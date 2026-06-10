import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ProgressUpdate, Issue } from '../types/api';

export const useProjectDetails = (projectId: string | null) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['projectDetails', projectId],
        queryFn: async () => {
            if (!projectId) return { updates: [], issues: [] };

            const [updatesRes, issuesRes] = await Promise.all([
                api.get(`/progress-updates?projectId=${projectId}&limit=10`),
                api.get(`/issues?projectId=${projectId}`).catch(err => {
                    console.error('Error fetching project issues (endpoint might not exist yet):', err);
                    return { data: [] };
                })
            ]);

            return {
                updates: updatesRes.data.data || [],
                issues: issuesRes.data || []
            };
        },
        enabled: !!projectId,
    });

    const updates: ProgressUpdate[] = data?.updates || [];
    const issues: Issue[] = data?.issues || [];

    return {
        updates,
        issues,
        loading: isLoading,
        error: error ? ((error as any).response?.data?.message || (error as any).message) : null,
        refetch
    };
};

