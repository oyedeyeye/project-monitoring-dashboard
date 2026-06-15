import type { DashboardOverview } from '../types/dashboard';

/**
 * ============================================================================
 * PLACEHOLDER DATA — NOT REAL.
 * ----------------------------------------------------------------------------
 * Used as a fallback so the dashboard renders before the backend aggregation
 * endpoint (`GET /admin/dashboard`) is available. The shape mirrors exactly
 * what the backend should return. Remove once the endpoint is live.
 * See docs/DASHBOARD_ENDPOINTS.md for the full contract.
 * ============================================================================
 */
export const PLACEHOLDER_DASHBOARD: DashboardOverview = {
    metrics: {
        mdaCount: 26,
        projectCount: 1248,
        inProgressCount: 753,
        inProgressPct: 60,
        avgProgress: 87,
        avgProgressDelta: 5,
    },
    stageBreakdown: [
        { stage: 'Execution', count: 642, pct: 52 },
        { stage: 'Procurement', count: 256, pct: 21 },
        { stage: 'Planning', count: 198, pct: 16 },
        { stage: 'Completed', count: 152, pct: 11 },
    ],
    recentProjects: [
        { id: 'p1', title: 'Bridge Works Completion at Idoani, Ose LGA', location: 'Idoani, Ose LGA', progress: 90, stage: 'Execution' },
        { id: 'p2', title: 'Rehabilitation of Iju Road, Akure', location: 'Akure', progress: 65, stage: 'Execution' },
        { id: 'p3', title: 'Construction of 6 Classroom Block, Akoko North', location: 'Akoko North', progress: 40, stage: 'Procurement' },
        { id: 'p4', title: 'Solar Street Light Installation, Okitipupa', location: 'Okitipupa', progress: 75, stage: 'Execution' },
        { id: 'p5', title: 'Water Supply Scheme, Ifon', location: 'Ifon', progress: 30, stage: 'Planning' },
    ],
    issues: {
        openCount: 18,
        trend: [
            { label: 'Mon', value: 4 },
            { label: 'Tue', value: 7 },
            { label: 'Wed', value: 3 },
            { label: 'Thu', value: 9 },
            { label: 'Fri', value: 5 },
            { label: 'Sat', value: 8 },
            { label: 'Sun', value: 6 },
        ],
    },
    topMdas: [
        { mdaName: 'Min. of Works & Infra.', count: 320 },
        { mdaName: 'Min. of Education', count: 210 },
        { mdaName: 'Min. of Health', count: 180 },
        { mdaName: 'Min. of Agriculture', count: 150 },
        { mdaName: 'Min. of Energy', count: 120 },
    ],
    lastUpdated: new Date().toISOString(),
};
