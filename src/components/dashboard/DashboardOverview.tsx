import DashboardHeader from './DashboardHeader';
import MetricCard from './MetricCard';
import ProjectsByStageChart from './ProjectsByStageChart';
import RecentProjectsList from './RecentProjectsList';
import ActiveIssuesCard from './ActiveIssuesCard';
import ProjectsByMDACard from './ProjectsByMDACard';
import DashboardFooter from './DashboardFooter';
import type { DashboardOverview as DashboardData, RecentProjectItem } from '../../types/dashboard';

interface DashboardOverviewProps {
  name: string;
  subtitle?: string;
  data: DashboardData;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onViewAllProjects?: () => void;
  onSelectProject?: (project: RecentProjectItem) => void;
  onPendingApprovalsClick?: () => void;
  isMdaOfficer?: boolean;
}

/**
 * Composes the full analytics overview from reusable sub-components.
 * Layout mirrors the reference design: a KPI strip, a 2-up chart/list row,
 * and a 2-up issues/MDA row, followed by a last-updated footer.
 */
function DashboardOverview({
  name,
  subtitle,
  data,
  onRefresh,
  isRefreshing,
  onViewAllProjects,
  onSelectProject,
  onPendingApprovalsClick,
  isMdaOfficer = false,
}: DashboardOverviewProps) {
  const { metrics } = data;

  return (
    <div className="space-y-6">
      <DashboardHeader name={name} subtitle={subtitle} notificationCount={data.issues.openCount} />

      {/* KPI strip */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
        isMdaOfficer
          ? 'lg:grid-cols-3'
          : data.pendingApprovalsCount !== undefined
            ? 'lg:grid-cols-5'
            : 'lg:grid-cols-4'
      }`}
      >
        {!isMdaOfficer && (
        <MetricCard value={metrics.mdaCount.toLocaleString()} label="MDAs" caption="Total Ministries" />
        )}
        <MetricCard value={metrics.projectCount.toLocaleString()} label="Projects" caption="Total Projects" />
        <MetricCard
          value={metrics.inProgressCount.toLocaleString()}
          label="In Progress"
          caption={`${metrics.inProgressPct}% of total`}
          accent
        />
        <MetricCard
          value={`${metrics.avgProgress}%`}
          label="Avg. Progress"
          caption={`${metrics.avgProgressDelta >= 0 ? '+' : ''}${metrics.avgProgressDelta}% this month`}
        />
        {!isMdaOfficer && data.pendingApprovalsCount !== undefined && (
        <MetricCard
          value={data.pendingApprovalsCount.toLocaleString()}
          label="Pending Approvals"
          caption="Action required"
          accent={data.pendingApprovalsCount > 0}
          onClick={onPendingApprovalsClick}
        />
        )}
      </div>

      {/* Charts + lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 min-w-0 self-start">
          <ProjectsByStageChart data={data.stageBreakdown} />
        </div>
        <div className="lg:col-span-3 min-w-0">
          <RecentProjectsList
            projects={data.recentProjects}
            onViewAll={onViewAllProjects}
            onSelect={onSelectProject}
          />
        </div>
        <div className={isMdaOfficer ? 'lg:col-span-5 min-w-0' : 'lg:col-span-2 min-w-0 self-start'}>
          <ActiveIssuesCard issues={data.issues} />
        </div>
        {!isMdaOfficer && (
        <div className="lg:col-span-3 min-w-0">
          <ProjectsByMDACard data={data.topMdas} />
        </div>
        )}
      </div>

      <DashboardFooter
        lastUpdated={data.lastUpdated}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}

export default DashboardOverview;
