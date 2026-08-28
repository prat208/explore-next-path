import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ARTICLE_CATEGORIES, articlesQuery } from "@/lib/content";
import { EmptyState, PageHeader, Pill } from "@/components/site/bits";
import { cn } from "@/lib/utils";
import { LockedCard } from "@/components/referral/LockedCard";
import { ReferralGate } from "@/components/referral/ReferralGate";
import { UploadedSectionCard } from "@/components/site/UploadedSectionCard";
import { isLocked, useAccess } from "@/lib/referral";
import { publishedSectionsQuery } from "@/lib/sections";

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
  const uploads = (useQuery(publishedSectionsQuery("article")).data ?? []).filter(
    (section) => section.files.length > 0,
  );
  const { unlocked } = useAccess();
  const [category, setCategory] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);

  const filtered = articles.filter(
    (a) => (!category || a.category === category) && (!level || a.level === level),
  );
  const entries = !category && !level
    ? [...uploads.map((section) => ({ kind: "upload" as const, section })), ...filtered.map((article) => ({ kind: "article" as const, article }))]
    : filtered.map((article) => ({ kind: "article" as const, article }));

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
          {entries.length} article{entries.length === 1 ? "" : "s"}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry, index) => (
            <LockedCard key={entry.kind === "upload" ? entry.section.id : entry.article.id} locked={isLocked(unlocked, index)}>
            {entry.kind === "upload" ? (
              <UploadedSectionCard section={entry.section} />
            ) : (
            <Link
              to="/articles/$slug"
              params={{ slug: entry.article.slug }}
              className="hover-lift focus-ring flex flex-col rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="primary">{entry.article.category}</Pill>
                <Pill>{entry.article.level}</Pill>
              </div>
              <h2 className="mt-3 font-display text-lg font-semibold leading-snug text-foreground">
                {entry.article.title}
              </h2>
              {entry.article.excerpt && (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{entry.article.excerpt}</p>
              )}
              <p className="eyebrow mt-auto pt-4 text-muted-foreground">
                {entry.article.reading_minutes} min read
                {entry.article.published_at
                  ? ` · ${new Date(entry.article.published_at).toLocaleDateString()}`
                  : ""}
              </p>
            </Link>
            )}
            </LockedCard>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="mt-6">
            <EmptyState title="Nothing matches those filters" hint="Try clearing the format or level." />
          </div>
        )}
        <ReferralGate label="articles" hidden={unlocked ? 0 : Math.max(0, entries.length - 1)} />
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
