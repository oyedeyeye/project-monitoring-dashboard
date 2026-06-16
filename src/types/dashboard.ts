/**
 * Types for the analytics overview dashboard.
 * All values are expected to be PRE-COMPUTED by the backend; the frontend
 * only renders processed data (counts, percentages, rollups).
 */

export type ProjectStage = 'Execution' | 'Procurement' | 'Planning' | 'Completed';

export interface DashboardMetrics {
    /** Total number of MDAs (ministries, departments, agencies). */
    mdaCount: number;
    /** Total number of projects across all MDAs. */
    projectCount: number;
    /** Number of projects currently in progress. */
    inProgressCount: number;
    /** In-progress projects as a percentage of total (0-100), backend-computed. */
    inProgressPct: number;
    /** Average physical progress across all projects (0-100), backend-computed. */
    avgProgress: number;
    /** Change in average progress vs. the previous period (percentage points). */
    avgProgressDelta: number;
}

export interface StageBreakdownItem {
    stage: ProjectStage;
    count: number;
    /** Share of total projects (0-100), backend-computed. */
    pct: number;
}

export interface RecentProjectItem {
    id: string;
    title: string;
    /** Human-readable location, e.g. "Idoani, Ose LGA". */
    location: string;
    /** Physical progress 0-100. */
    progress: number;
    stage: ProjectStage;
}

export interface IssuesSummary {
    /** Total currently open issues. */
    openCount: number;
    /** Recent activity series powering the mini bar chart (e.g. last 7 days). */
    trend: { label: string; value: number }[];
}

export interface MdaProjectCount {
    mdaName: string;
    /** Number of projects owned by this MDA. */
    count: number;
}

export interface DashboardOverview {
    metrics: DashboardMetrics;
    stageBreakdown: StageBreakdownItem[];
    recentProjects: RecentProjectItem[];
    issues: IssuesSummary;
    topMdas: MdaProjectCount[];
    pendingApprovalsCount?: number;
    /** ISO timestamp of when the aggregates were last computed. */
    lastUpdated: string;
}
