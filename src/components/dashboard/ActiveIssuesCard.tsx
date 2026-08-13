import {
  BarChart, Bar, ResponsiveContainer, Cell,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import SectionCard from './SectionCard';
import type { IssuesSummary } from '../../types/dashboard';

interface ActiveIssuesCardProps {
  issues: IssuesSummary;
}

function ActiveIssuesCard({ issues }: ActiveIssuesCardProps) {
  return (
    <SectionCard title="Active Issues">
      <div className="flex items-end justify-between gap-4">
        {/* Count */}
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-brand" aria-hidden="true" />
            <span className="text-4xl font-bold text-brand">{issues.openCount}</span>
          </div>
          <p className="mt-1 text-sm text-ink-muted">Open Issues</p>
        </div>

        {/* Mini trend chart */}
        <div className="h-24 w-1/2 max-w-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={issues.trend} barCategoryGap="25%">
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {issues.trend.map((entry, index) => (
                  <Cell
                    key={entry.label}
                    fill={
                                            index === issues.trend.length - 1
                                              ? 'var(--color-issue)'
                                              : '#fdba74'
                                        }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SectionCard>
  );
}

export default ActiveIssuesCard;
