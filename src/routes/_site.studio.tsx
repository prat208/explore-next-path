import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/_site/studio")({
  head: () => ({
    meta: [
      { title: "Uploads — Explorer Studio | Explorers" },
      { name: "description", content: "Upload files and see exactly how learners will experience them." },
      { property: "og:title", content: "Uploads — Explorer Studio" },
      { property: "og:description", content: "Upload files and see exactly how learners will experience them." },
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Outlet />
    </div>
  );
}
