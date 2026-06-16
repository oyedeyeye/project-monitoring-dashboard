import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MetricCardProps {
    /** Big value, pre-formatted (e.g. "1,248", "87%"). */
    value: string;
    /** Primary label, e.g. "Projects". */
    label: string;
    /** Secondary caption below, e.g. "Total Projects" or "60% of total". */
    caption?: string;
    /** Accent the value in the brand color (used for "In Progress"). */
    accent?: boolean;
    /** Optional click handler for interactivity. */
    onClick?: () => void;
}

/**
 * Single KPI tile. Reusable across all dashboards.
 */
const MetricCard = ({ value, label, caption, accent = false, onClick }: MetricCardProps) => {
    return (
        <div 
            onClick={onClick}
            className={cn(
                "rounded-2xl border border-hairline bg-surface p-5 shadow-sm",
                onClick ? "cursor-pointer hover:border-brand/40 hover:shadow-md transition-all active:scale-[0.98]" : ""
            )}
        >
            <p className={cn('text-3xl font-bold tracking-tight', accent ? 'text-brand' : 'text-ink')}>
                {value}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">{label}</p>
            {caption && <p className="mt-0.5 text-xs text-ink-muted">{caption}</p>}
        </div>
    );
};

export default MetricCard;
