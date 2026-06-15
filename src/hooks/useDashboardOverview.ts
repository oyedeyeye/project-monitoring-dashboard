import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { DashboardOverview } from '../types/dashboard';
import { PLACEHOLDER_DASHBOARD } from '../lib/placeholderDashboard';

interface UseDashboardOverviewResult {
    data: DashboardOverview;
    loading: boolean;
    error: string | null;
    /** True when the backend endpoint failed and placeholder data is shown. */
    isPlaceholder: boolean;
    refetch: () => void;
    /** True while a background refetch is in flight. */
    isRefetching: boolean;
}

/**
 * Fetches the pre-aggregated dashboard overview from the backend.
 *
 * The backend is responsible for ALL computation (counts, percentages,
 * rollups, status calculations). The frontend only renders the result.
 *
 * Until `GET /admin/dashboard` exists, this gracefully falls back to clearly
 * marked PLACEHOLDER_DASHBOARD data so the UI remains functional.
 */
export const useDashboardOverview = (): UseDashboardOverviewResult => {
    const { profile } = useAuth();

    const query = useQuery({
        queryKey: ['dashboardOverview', profile?.role, profile?.mdaId],
        queryFn: async (): Promise<{ data: DashboardOverview; isPlaceholder: boolean }> => {
            try {
                const res = await api.get<DashboardOverview>('/admin/dashboard');
                return { data: res.data, isPlaceholder: false };
            } catch (err) {
                console.log('[v0] /admin/dashboard unavailable, using placeholder data:', (err as any)?.message);
                return { data: PLACEHOLDER_DASHBOARD, isPlaceholder: true };
            }
        },
        staleTime: 60_000,
    });

    return {
        data: query.data?.data ?? PLACEHOLDER_DASHBOARD,
        isPlaceholder: query.data?.isPlaceholder ?? true,
        loading: query.isLoading,
        isRefetching: query.isRefetching,
        error: query.error ? ((query.error as any).message ?? 'Failed to load dashboard') : null,
        refetch: query.refetch,
    };
};
