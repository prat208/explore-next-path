import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Files } from "lucide-react";
import { categoryLabel, sectionsQuery } from "@/lib/sections";
import { EmptyState, PageHeader, Pill } from "@/components/site/bits";
import { detectKind, prettySize } from "@/lib/upload";

export const Route = createFileRoute("/_site/files/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(sectionsQuery),
  head: () => ({
    meta: [
      { title: "Study files & interactive packs | Explorers" },
      {
        name: "description",
        content:
          "Every roadmap, manual and deep dive on Explorers comes with its own pack of videos, PDFs, notebooks and interactive diagrams.",
      },
      { property: "og:title", content: "Study files & interactive packs" },
      {
        property: "og:description",
        content: "Named packs of videos, PDFs, notebooks and interactive diagrams for each roadmap and manual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FilesIndex,
});

function FilesIndex() {
  const { data: sections } = useSuspenseQuery(sectionsQuery);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader
        eyebrow="Files"
        title="Packs you can open, watch and play with"
        description="Each pack is tied to one thing you are learning — a roadmap, a manual, a deep dive — and holds the exact videos, PDFs, notebooks and interactive diagrams for it."
      />

      {sections.length === 0 ? (
        <EmptyState title="No packs published yet" hint="Editors are still assembling the first file packs." />
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const kinds = Array.from(
              new Set(section.files.map((file) => detectKind(file.title, file.mime ?? ""))),
            ).slice(0, 4);
            const total = section.files.reduce((sum, file) => sum + (file.size ?? 0), 0);
            return (
              <Link
                key={section.id}
                to="/files/$slug"
                params={{ slug: section.slug }}
                className="focus-ring group flex flex-col rounded-3xl border border-border bg-card p-5 card-soft transition-colors hover:border-primary/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <Pill>{categoryLabel(section.category)}</Pill>
                  <Files className="h-4 w-4 text-primary" aria-hidden />
                </div>
                <h2 className="mt-3 font-display text-xl font-bold leading-tight text-foreground">{section.title}</h2>
                {section.subtitle && (
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{section.subtitle}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {kinds.map((kind) => (
                    <span
                      key={kind}
                      className="rounded-md bg-muted px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      {kind}
                    </span>
                  ))}
                </div>
                <p className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {section.files.length} file{section.files.length === 1 ? "" : "s"}
                  {prettySize(total) && ` · ${prettySize(total)}`}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
