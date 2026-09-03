/**
 * Shown while a route's data is still loading (after a short delay), so a click
 * gives immediate feedback instead of feeling stuck.
 */
export function RouteProgress() {
  return (
    <>
      <div
        role="status"
        aria-label="Loading page"
        className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary/15"
      >
        <div className="h-full w-1/3 animate-route-progress rounded-full bg-primary" />
      </div>

      <div className="mx-auto max-w-6xl animate-pulse px-4 py-10 sm:px-6">
        <div className="h-4 w-28 rounded bg-muted" />
        <div className="mt-4 h-9 w-2/3 rounded bg-muted" />
        <div className="mt-3 h-4 w-1/2 rounded bg-muted" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl border border-border bg-muted/60" />
          ))}
        </div>
      </div>
    </>
  );
}
