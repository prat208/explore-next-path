import { UploadedSections } from "@/components/site/UploadedSections";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ARTICLE_CATEGORIES, articlesQuery } from "@/lib/content";
import { EmptyState, PageHeader, Pill } from "@/components/site/bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/articles/")({
  head: () => ({
    meta: [
      { title: "Articles — News, explainers and deep dives | Explorers" },
      {
        name: "description",
        content:
          "AI and technology journalism built for learners: what happened, what it means, and exactly what to do next.",
      },
      { property: "og:title", content: "Articles — News, explainers and deep dives" },
      {
        property: "og:description",
        content: "Every Explorers article ends with a next step: learn it, use it or build it.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(articlesQuery()),
  component: ArticlesIndex,
});

function ArticlesIndex() {
  const articles = useSuspenseQuery(articlesQuery()).data;
  const [category, setCategory] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);

  const filtered = articles.filter(
    (a) => (!category || a.category === category) && (!level || a.level === level),
  );

  return (
    <>
      <PageHeader
        eyebrow="Articles"
        title="Understand what's happening — and what to do about it"
        description="Six formats, one promise: no hype, no filler, and always a next step at the end."
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={!category} onClick={() => setCategory(null)}>
            All formats
          </FilterChip>
          {ARTICLE_CATEGORIES.map((c) => (
            <FilterChip
              key={c.value}
              active={category === c.value}
              onClick={() => setCategory(c.value)}
              title={c.question}
            >
              {c.label}
            </FilterChip>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterChip active={!level} onClick={() => setLevel(null)}>
            Any level
          </FilterChip>
          {["beginner", "intermediate", "advanced"].map((l) => (
            <FilterChip key={l} active={level === l} onClick={() => setLevel(l)}>
              {l}
            </FilterChip>
          ))}
        </div>

        <p className="eyebrow mt-6 text-muted-foreground">
          {filtered.length} article{filtered.length === 1 ? "" : "s"}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <Link
              key={article.id}
              to="/articles/$slug"
              params={{ slug: article.slug }}
              className="hover-lift focus-ring flex flex-col rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="primary">{article.category}</Pill>
                <Pill>{article.level}</Pill>
              </div>
              <h2 className="mt-3 font-display text-lg font-semibold leading-snug text-foreground">
                {article.title}
              </h2>
              {article.excerpt && (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
              )}
              <p className="eyebrow mt-auto pt-4 text-muted-foreground">
                {article.reading_minutes} min read
                {article.published_at
                  ? ` · ${new Date(article.published_at).toLocaleDateString()}`
                  : ""}
              </p>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-6">
            <EmptyState title="Nothing matches those filters" hint="Try clearing the format or level." />
          </div>
        )}
        <UploadedSections category="article" title="Uploaded articles" description="Documents, slides and interactive explainers you can read here." />
      </div>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={cn(
        "eyebrow focus-ring rounded-full border px-3 py-1.5 transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
