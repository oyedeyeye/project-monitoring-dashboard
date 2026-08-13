import { Bell } from 'lucide-react';

interface DashboardHeaderProps {
  /** Display name shown after "Welcome back,". */
  name: string;
  subtitle?: string;
  /** Number of unread notifications (shows a dot when > 0). */
  notificationCount?: number;
  onNotificationsClick?: () => void;
}

/**
 * Top-of-page greeting + notifications + avatar. Reused across dashboards.
 */
function DashboardHeader({
  name,
  subtitle = "Here's what's happening across Ondo State projects",
  notificationCount = 0,
  onNotificationsClick,
}: DashboardHeaderProps) {
  const initial = name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-ink sm:text-2xl">
          Welcome back,
          {' '}
          {name}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onNotificationsClick}
          className="relative rounded-full border border-hairline bg-surface p-2.5 text-ink-muted transition-colors hover:text-ink"
          aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand ring-2 ring-surface" />
          )}
        </button>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground"
          aria-hidden="true"
        >
          {initial}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
