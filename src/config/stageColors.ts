import type { ProjectStage } from '../types/dashboard';

/**
 * Single source of truth for project-stage colors, shared by the donut chart,
 * legend, and the badges in lists. `hex` is for canvas/SVG (Recharts);
 * `badge` is the Tailwind class pair for inline status pills.
 */
export const STAGE_STYLES: Record<ProjectStage, { hex: string; badge: string }> = {
  Execution: { hex: '#3b82f6', badge: 'bg-blue-50 text-blue-700' },
  Procurement: { hex: '#f59e0b', badge: 'bg-amber-50 text-amber-700' },
  Planning: { hex: '#22c55e', badge: 'bg-green-50 text-green-700' },
  Completed: { hex: '#a855f7', badge: 'bg-purple-50 text-purple-700' },
};

export const stageHex = (stage: ProjectStage) => STAGE_STYLES[stage]?.hex ?? '#94a3b8';
export const stageBadge = (stage: ProjectStage) => STAGE_STYLES[stage]?.badge ?? 'bg-gray-100 text-gray-700';
