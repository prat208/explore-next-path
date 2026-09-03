/** Thin top bar shown while a route is still loading, so clicks feel instant. */
export function RouteProgress() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary/15"
    >
      <div className="h-full w-1/3 animate-route-progress rounded-full bg-primary" />
    </div>
  );
}
