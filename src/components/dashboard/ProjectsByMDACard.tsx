import SectionCard from './SectionCard';
import type { MdaProjectCount } from '../../types/dashboard';

interface ProjectsByMDACardProps {
  /** Pre-sorted (descending) list of MDAs by project count. */
  data: MdaProjectCount[];
  title?: string;
}

/**
 * Horizontal bar chart of the top MDAs by project count.
 * Bars are scaled relative to the largest value.
 */
function ProjectsByMDACard({ data, title = 'Projects by MDA (Top 5)' }: ProjectsByMDACardProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <SectionCard title={title}>
      <ul className="space-y-4">
        {data.map((item) => (
          <li key={item.mdaName} className="grid grid-cols-[9rem_1fr_auto] items-center gap-3">
            <span className="truncate text-sm text-ink" title={item.mdaName}>
              {item.mdaName}
            </span>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-full bg-stage-execution"
                style={{ width: `${(item.count / max) * 100}%`, backgroundColor: 'var(--color-stage-execution)' }}
              />
            </div>
            <span className="w-10 text-right text-sm font-semibold text-ink">
              {item.count}
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

export default ProjectsByMDACard;
