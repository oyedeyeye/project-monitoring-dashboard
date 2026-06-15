import { useAuth } from '../context/AuthContext';
import { useDashboardOverview } from '../hooks/useDashboardOverview';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';

/**
 * WEBMASTER ADMIN landing page — analytics overview of all Ondo State
 * projects across every MDA. Data is pre-aggregated by the backend
 * (see docs/DASHBOARD_ENDPOINTS.md); this page only renders it.
 */
const AdminDashboard = () => {
    const { profile } = useAuth();
    const { data, loading, error, isPlaceholder, refetch, isRefetching } = useDashboardOverview();

    const firstName = profile?.fullName?.split(' ')[0] || 'Admin';

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error && !data) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Failed to load the dashboard: {error}
            </div>
        );
    }

    return (
        <DashboardOverview
            name={firstName}
            data={data}
            isPlaceholder={isPlaceholder}
            onRefresh={refetch}
            isRefreshing={isRefetching}
        />
    );
};

export default AdminDashboard;
