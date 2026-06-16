import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { DashboardOverview } from '../types/dashboard';

interface UseDashboardOverviewResult {
    data: DashboardOverview | undefined;
    loading: boolean;
    error: string | null;
    refetch: () => void;
    /** True while a background refetch is in flight. */
    isRefetching: boolean;
}

/**
 * Fetches the pre-aggregated dashboard overview from the backend.
 *
 * The backend is responsible for ALL computation (counts, percentages,
 * rollups, status calculations). The frontend only renders the result.
 */
export const useDashboardOverview = (): UseDashboardOverviewResult => {
    const { profile } = useAuth();

    const query = useQuery({
        queryKey: ['dashboardOverview', profile?.role, profile?.mdaId],
        queryFn: async (): Promise<DashboardOverview> => {
            const res = await api.get<DashboardOverview>('/admin/dashboard');
            return res.data;
        },
        staleTime: 60_000,
    });

    return {
        data: query.data,
        loading: query.isLoading,
        isRefetching: query.isRefetching,
        error: query.error ? ((query.error as any).message ?? 'Failed to load dashboard') : null,
        refetch: query.refetch,
    };
};
