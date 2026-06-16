import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboardOverview } from '../hooks/useDashboardOverview';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';

/**
 * MDA Officer landing page — analytics overview of projects
 * within their specific MDA.
 */
const MDADashboard = () => {
    const navigate = useNavigate();
    const { profile, mdaName } = useAuth();
    const { data, loading, error, refetch, isRefetching } = useDashboardOverview();

    const firstName = profile?.fullName?.split(' ')[0] || 'Officer';
    const subtitle = mdaName ? `Monitoring and analytics for ${mdaName}` : undefined;

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

    if (!data) {
        return null;
    }

    return (
        <DashboardOverview
            name={firstName}
            subtitle={subtitle}
            data={data}
            isMdaOfficer={true}
            onRefresh={refetch}
            isRefreshing={isRefetching}
            onViewAllProjects={() => navigate('/mda/projects')}
        />
    );
};

export default MDADashboard;
