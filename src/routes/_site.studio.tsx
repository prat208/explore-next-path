import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/useAuth";
import { COLLECTIONS, COLLECTION_ORDER } from "@/lib/studio";

export const Route = createFileRoute("/_site/studio")({
  head: () => ({
    meta: [
      { title: "Explorer Studio — content operations | Explorers" },
      { name: "description", content: "Editorial workspace for the Explorers knowledge graph." },
      { property: "og:title", content: "Explorer Studio" },
      { property: "og:description", content: "Editorial workspace for the Explorers knowledge graph." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudioLayout,
});

function StudioLayout() {
  const { loading, user, isEditor } = useAuth();

  if (loading) return <p className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">Loading…</p>;

  if (!user || !isEditor)
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Explorer Studio is for editors</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {user
            ? "Your account does not have editor access yet. Ask an admin to grant the editor role."
            : "Sign in with an editor account to manage content."}
        </p>
        {!user && (
          <Link
            to="/auth"
            className="focus-ring mt-6 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
          >
            Sign in
          </Link>
        )}
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:flex">
      <aside className="mb-6 lg:mb-0 lg:w-56 lg:shrink-0">
        <p className="eyebrow text-primary">Explorer Studio</p>
        <nav className="mt-4 flex flex-wrap gap-1.5 lg:flex-col">
          <Link
            to="/studio"
            activeOptions={{ exact: true }}
            activeProps={{ className: "border-primary/60 bg-primary/10 text-foreground" }}
            className="focus-ring rounded-lg border border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Overview
          </Link>
          {COLLECTION_ORDER.map((key) => (
            <Link
              key={key}
              to="/studio/$collection"
              params={{ collection: key }}
              activeProps={{ className: "border-primary/60 bg-primary/10 text-foreground" }}
              className="focus-ring rounded-lg border border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {COLLECTIONS[key]?.label ?? key}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
