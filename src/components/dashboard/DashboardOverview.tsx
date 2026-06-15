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
    /** Shown when the backend aggregate endpoint isn't available yet. */
    isPlaceholder?: boolean;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    onViewAllProjects?: () => void;
    onSelectProject?: (project: RecentProjectItem) => void;
}

/**
 * Composes the full analytics overview from reusable sub-components.
 * Layout mirrors the reference design: a KPI strip, a 2-up chart/list row,
 * and a 2-up issues/MDA row, followed by a last-updated footer.
 */
const DashboardOverview = ({
    name,
    subtitle,
    data,
    isPlaceholder = false,
    onRefresh,
    isRefreshing,
    onViewAllProjects,
    onSelectProject,
}: DashboardOverviewProps) => {
    const { metrics } = data;

    return (
        <div className="space-y-6">
            <DashboardHeader name={name} subtitle={subtitle} notificationCount={data.issues.openCount} />

            {isPlaceholder && (
                <div
                    role="status"
                    className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800"
                >
                    Showing placeholder data — the live dashboard endpoint
                    (<code className="font-mono text-xs">GET /admin/dashboard</code>) isn&apos;t connected yet.
                </div>
            )}

            {/* KPI strip */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard value={metrics.mdaCount.toLocaleString()} label="MDAs" caption="Total Ministries" />
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
            </div>

            {/* Charts + lists */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="lg:col-span-2">
                    <ProjectsByStageChart data={data.stageBreakdown} />
                </div>
                <div className="lg:col-span-3">
                    <RecentProjectsList
                        projects={data.recentProjects}
                        onViewAll={onViewAllProjects}
                        onSelect={onSelectProject}
                    />
                </div>
                <div className="lg:col-span-2">
                    <ActiveIssuesCard issues={data.issues} />
                </div>
                <div className="lg:col-span-3">
                    <ProjectsByMDACard data={data.topMdas} />
                </div>
            </div>

            <DashboardFooter
                lastUpdated={data.lastUpdated}
                onRefresh={onRefresh}
                isRefreshing={isRefreshing}
            />
        </div>
    );
};

export default DashboardOverview;
