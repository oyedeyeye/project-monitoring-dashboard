import SectionCard from './SectionCard';
import { stageBadge } from '../../config/stageColors';
import type { RecentProjectItem } from '../../types/dashboard';

interface RecentProjectsListProps {
  projects: RecentProjectItem[];
  onViewAll?: () => void;
  onSelect?: (project: RecentProjectItem) => void;
}

function RecentProjectsList({ projects, onViewAll, onSelect }: RecentProjectsListProps) {
  return (
    <SectionCard
      title="Recent Projects"
      action={(
        <button
          onClick={onViewAll}
          className="text-sm font-medium text-brand hover:underline"
        >
          View all
        </button>
              )}
    >
      <ul className="divide-y divide-hairline">
        {projects.map((project) => (
          <li key={project.id}>
            <button
              onClick={() => onSelect?.(project)}
              className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-canvas/60"
            >
              <span className="min-w-0 flex-1 truncate text-sm text-ink">
                {project.title}
              </span>
              <span className="w-10 shrink-0 text-right text-sm font-semibold text-ink">
                {project.progress}
                %
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${stageBadge(
                  project.stage,
                )}`}
              >
                {project.stage}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

export default RecentProjectsList;
