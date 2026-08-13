import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardFooterProps {
  /** ISO timestamp of the last aggregate computation. */
  lastUpdated: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

function DashboardFooter({ lastUpdated, onRefresh, isRefreshing = false }: DashboardFooterProps) {
  let label = 'recently';
  try {
    label = format(new Date(lastUpdated), "'Today,' h:mm a");
  } catch {
    /* fall back to default label */
  }

  return (
    <footer className="flex items-center gap-2 pt-2 text-xs text-ink-muted">
      <span>
        Last updated:
        {label}
      </span>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="rounded p-1 transition-colors hover:text-ink disabled:opacity-50"
        aria-label="Refresh dashboard"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </footer>
  );
}

export default DashboardFooter;
