import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import SectionCard from './SectionCard';
import { stageHex } from '../../config/stageColors';
import type { StageBreakdownItem } from '../../types/dashboard';

interface ProjectsByStageChartProps {
    data: StageBreakdownItem[];
}

/**
 * Donut chart breaking projects down by lifecycle stage, with a legend
 * showing count + percentage per stage.
 */
const ProjectsByStageChart = ({ data }: ProjectsByStageChartProps) => {
    const total = data.reduce((sum, d) => sum + d.count, 0);

    return (
        <SectionCard title="Projects by Stage">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                {/* Donut */}
                <div className="relative h-44 w-44 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="count"
                                nameKey="stage"
                                innerRadius={58}
                                outerRadius={84}
                                paddingAngle={2}
                                stroke="none"
                                startAngle={90}
                                endAngle={-270}
                            >
                                {data.map((entry) => (
                                    <Cell key={entry.stage} fill={stageHex(entry.stage)} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-ink">{total.toLocaleString()}</span>
                        <span className="text-xs text-ink-muted">Total</span>
                    </div>
                </div>

                {/* Legend */}
                <ul className="flex-1 space-y-3 self-stretch">
                    {data.map((item) => (
                        <li key={item.stage} className="flex items-center gap-3">
                            <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: stageHex(item.stage) }}
                                aria-hidden="true"
                            />
                            <span className="flex-1 text-sm text-ink">{item.stage}</span>
                            <span className="text-sm font-semibold text-ink">
                                {item.count.toLocaleString()}
                            </span>
                            <span className="w-10 text-right text-xs text-ink-muted">{item.pct}%</span>
                        </li>
                    ))}
                </ul>
            </div>
        </SectionCard>
    );
};

export default ProjectsByStageChart;
