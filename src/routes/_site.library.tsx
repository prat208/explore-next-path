import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { hrefFor } from "@/lib/content";
import { useAuth } from "@/lib/useAuth";
import { EmptyState, PageHeader, Pill } from "@/components/site/bits";

type SavedRow = { id: string; item_type: string; item_id: string; created_at: string };

const TABLE_FOR: Record<string, { table: string; title: string }> = {
  article: { table: "articles", title: "title" },
  resource: { table: "resources", title: "title" },
  tool: { table: "tools", title: "name" },
  project: { table: "projects", title: "title" },
  roadmap: { table: "roadmaps", title: "title" },
  roadmap_node: { table: "roadmap_nodes", title: "title" },
  learning_path: { table: "learning_paths", title: "title" },
  lesson: { table: "lessons", title: "title" },
  career: { table: "careers", title: "title" },
  opportunity: { table: "opportunities", title: "title" },
};

export const Route = createFileRoute("/_site/library")({
  head: () => ({
    meta: [
      { title: "Your library — saved articles, roadmaps and tools | Explorers" },
      {
        name: "description",
        content: "Everything you saved on Explorers in one place: articles, roadmap steps, lessons, tools and opportunities.",
      },
      { property: "og:title", content: "Your Explorers library" },
      { property: "og:description", content: "Your saved articles, roadmaps, lessons and tools." },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { user, loading } = useAuth();

  const { data: items } = useQuery({
    queryKey: ["library", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data: saves } = await supabase
        .from("user_saves")
        .select("id, item_type, item_id, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      const rows = (saves ?? []) as SavedRow[];
      const resolved = await Promise.all(
        rows.map(async (row) => {
          const map = TABLE_FOR[row.item_type];
          if (!map) return null;
          const { data } = await supabase
            .from(map.table as never)
            .select("slug, " + map.title)
            .eq("id", row.item_id)
            .maybeSingle();
          const record = data as Record<string, string> | null;
          if (!record) return null;
          return {
            id: row.id,
            type: row.item_type,
            title: record[map.title] ?? "Untitled",
            href: hrefFor(row.item_type, record["slug"] ?? ""),
          };
        }),
      );
      return resolved.filter((r): r is NonNullable<typeof r> => Boolean(r));
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="Everything you saved"
        description="Your personal shelf across articles, roadmap steps, lessons, projects, tools and opportunities."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !user ? (
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="font-display text-base font-semibold text-foreground">Sign in to build your library</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Saving articles, roadmaps and lessons keeps your progress in one place.
            </p>
            <Link
              to="/auth"
              className="focus-ring mt-4 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
            >
              Sign in
            </Link>
          </div>
        ) : !items || items.length === 0 ? (
          <EmptyState title="Nothing saved yet" hint="Use the save button on any article, roadmap or tool." />
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {items.map((item) => (
              <li key={item.id}>
                <Link to={item.href} className="focus-ring flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-surface/60">
                  <span className="font-display text-[0.975rem] font-semibold text-foreground">{item.title}</span>
                  <Pill>{item.type.replace(/_/g, " ")}</Pill>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
