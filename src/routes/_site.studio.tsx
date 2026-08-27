import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { PageHeader, Pill } from "@/components/site/bits";

const COUNTED = [
  { table: "articles", label: "Articles" },
  { table: "learning_paths", label: "Learning paths" },
  { table: "roadmaps", label: "Roadmaps" },
  { table: "projects", label: "Projects" },
  { table: "resources", label: "Resources" },
  { table: "tools", label: "Tools" },
  { table: "careers", label: "Career hubs" },
  { table: "opportunities", label: "Opportunities" },
] as const;

export const Route = createFileRoute("/_site/studio")({
  head: () => ({
    meta: [
      { title: "Explorer Studio — content operations | Explorers" },
      { name: "description", content: "Editorial dashboard for the Explorers knowledge graph." },
      { property: "og:title", content: "Explorer Studio" },
      { property: "og:description", content: "Editorial dashboard for the Explorers knowledge graph." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudioPage,
});

function StudioPage() {
  const { loading, user, isEditor, profile } = useAuth();

  const { data: counts } = useQuery({
    queryKey: ["studio-counts"],
    enabled: isEditor,
    queryFn: async () => {
      const entries = await Promise.all(
        COUNTED.map(async (item) => {
          const [all, published] = await Promise.all([
            supabase.from(item.table as never).select("id", { count: "exact", head: true }),
            supabase
              .from(item.table as never)
              .select("id", { count: "exact", head: true })
              .eq("status", "published"),
          ]);
          return { ...item, total: all.count ?? 0, published: published.count ?? 0 };
        }),
      );
      return entries;
    },
  });

  const { data: searches } = useQuery({
    queryKey: ["studio-searches"],
    enabled: isEditor,
    queryFn: async () => {
      const { data } = await supabase
        .from("search_queries")
        .select("query, results_count, created_at")
        .order("created_at", { ascending: false })
        .limit(12);
      return (data ?? []) as { query: string; results_count: number | null; created_at: string }[];
    },
  });

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
    <>
      <PageHeader
        eyebrow="Explorer Studio"
        title={`Content operations${profile?.display_name ? `, ${profile.display_name}` : ""}`}
        description="Live state of the knowledge graph: what is published, what is still in draft, and what readers are searching for."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(counts ?? []).map((item) => (
            <div key={item.table} className="rounded-xl border border-border bg-card p-5">
              <p className="eyebrow text-secondary">{item.label}</p>
              <p className="mt-2 font-display text-3xl font-bold text-foreground">{item.published}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.total - item.published} in draft · {item.total} total
              </p>
            </div>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold text-foreground">Recent searches</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Queries with zero results are content gaps worth filling.
          </p>
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {(searches ?? []).map((row, i) => (
              <li key={`${row.query}-${i}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span className="font-mono text-sm text-foreground">{row.query}</span>
                <span className="flex items-center gap-3">
                  {row.results_count === 0 ? (
                    <Pill tone="primary">Gap</Pill>
                  ) : (
                    <Pill tone="success">{row.results_count} results</Pill>
                  )}
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString()}
                  </span>
                </span>
              </li>
            ))}
            {(searches ?? []).length === 0 && (
              <li className="px-4 py-6 text-sm text-muted-foreground">No searches recorded yet.</li>
            )}
          </ul>
        </section>
      </div>
    </>
  );
}
