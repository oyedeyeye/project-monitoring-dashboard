import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboardOverview } from '../hooks/useDashboardOverview';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';

/**
 * PPIMU ADMIN landing page — analytics overview of all Ondo State
 * projects across every MDA, including pending approvals count.
 */
function PPIMUDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    data, loading, error, refetch, isRefetching,
  } = useDashboardOverview();

  const firstName = profile?.fullName?.split(' ')[0] || 'Admin';

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load the dashboard:
        {' '}
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <DashboardOverview
      name={firstName}
      data={data}
      onRefresh={refetch}
      isRefreshing={isRefetching}
      onPendingApprovalsClick={() => navigate('/ppimu/approvals')}
      onViewAllProjects={() => navigate('/projects')}
    />
  );
}

export default PPIMUDashboard;
