import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { searchQueryOptions } from "@/lib/content";
import { EmptyState, PageHeader, Pill } from "@/components/site/bits";

export const Route = createFileRoute("/_site/search")({
  validateSearch: (search: Record<string, unknown>) => ({ q: (search["q"] as string) ?? "" }),
  head: () => ({
    meta: [
      { title: "Search across articles, roadmaps, tools and opportunities | Explorers" },
      {
        name: "description",
        content:
          "One search across everything on Explorers: articles, learning paths, roadmaps, projects, resources, tools, careers and opportunities.",
      },
      { property: "og:title", content: "Search Explorers" },
      { property: "og:description", content: "Find the article, roadmap, tool or opportunity you need." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [term, setTerm] = useState(q);
  const { data: groups, isFetching } = useQuery({ ...searchQueryOptions(q), enabled: q.trim().length > 1 });

  return (
    <>
      <PageHeader eyebrow="Search" title="Find your next step">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ search: { q: term } });
          }}
          className="flex max-w-xl items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="RAG, prompt engineering, scholarships…"
            aria-label="Search Explorers"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="focus-ring rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
          >
            Search
          </button>
        </form>
      </PageHeader>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {q.trim().length < 2 ? (
          <EmptyState title="Type at least two characters" hint="Search covers every section of Explorers." />
        ) : isFetching && !groups ? (
          <p className="text-sm text-muted-foreground">Searching…</p>
        ) : !groups || groups.length === 0 ? (
          <EmptyState title={`No results for “${q}”`} hint="Try a broader term, like “agents” or “python”." />
        ) : (
          <div className="space-y-10">
            {groups.map((group) => (
              <section key={group.type}>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  {group.label}
                  <span className="ml-2 font-mono text-xs text-muted-foreground">{group.items.length}</span>
                </h2>
                <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                  {group.items.map((item) => (
                    <li key={`${group.type}-${item.id}`}>
                      <Link
                        to={item.href}
                        className="focus-ring block px-4 py-3.5 hover:bg-surface/60"
                      >
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-[0.975rem] font-semibold text-foreground">
                            {item.title}
                          </span>
                          {item.meta && <Pill>{item.meta}</Pill>}
                        </span>
                        {item.subtitle && (
                          <span className="mt-1 block line-clamp-2 text-sm text-muted-foreground">{item.subtitle}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
