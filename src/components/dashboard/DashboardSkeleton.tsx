function Shimmer({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-hairline ${className}`} />;
}

function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-hairline bg-surface p-5 shadow-sm sm:p-6 ${className}`}>
      <Shimmer className="mb-4 h-5 w-40" />
      <Shimmer className="h-40 w-full" />
    </div>
  );
}

/**
 * Full-page loading skeleton mirroring the dashboard layout.
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading dashboard…</span>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Shimmer className="h-7 w-56" />
          <Shimmer className="h-4 w-72" />
        </div>
        <Shimmer className="h-10 w-10 rounded-full" />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-hairline bg-surface p-5 shadow-sm">
            <Shimmer className="mb-2 h-8 w-20" />
            <Shimmer className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Two-column rows */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

export default DashboardSkeleton;
