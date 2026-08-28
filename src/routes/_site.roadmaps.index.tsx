import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { FileStack } from "lucide-react";
import { roadmapsQuery } from "@/lib/content";
import { CardShell, MiniTree, PageHeader, Pill } from "@/components/site/bits";
import { ReferralGate } from "@/components/referral/ReferralGate";
import { LockedCard } from "@/components/referral/LockedCard";
import { isLocked, useAccess } from "@/lib/referral";
import { publishedSectionsQuery } from "@/lib/sections";
import { detectKind } from "@/lib/upload";

export const Route = createFileRoute("/_site/roadmaps/")({
  head: () => ({
    meta: [
      { title: "Roadmaps — Structural paths through AI & tech | Explorers" },
      {
        name: "description",
        content:
          "Interactive, node-based roadmaps for AI engineering, web development, data and more. Every step links to resources, a project and a check.",
      },
      { property: "og:title", content: "Roadmaps — Structural paths through AI & tech" },
      {
        property: "og:description",
        content: "Not an image you screenshot — a live map with progress, resources and projects.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(roadmapsQuery()),
  component: RoadmapsIndex,
});

type Entry =
  | { kind: "upload"; id: string; slug: string; title: string; description: string | null; tags: string[]; files: number }
  | { kind: "roadmap"; id: string; slug: string; title: string; description: string | null; difficulty: string; hours: number | null };

function RoadmapsIndex() {
  const authored = useSuspenseQuery(roadmapsQuery()).data;
  const uploaded = useQuery(publishedSectionsQuery("roadmap")).data ?? [];
  const { unlocked } = useAccess();

  // Uploaded roadmaps come first — they are the real thing; authored ones are the demo set.
  const entries: Entry[] = [
    ...uploaded
      .filter((s) => s.files.length > 0)
      .map((s) => ({
        kind: "upload" as const,
        id: s.id,
        slug: s.slug,
        title: s.title,
        description: s.subtitle ?? s.description,
        tags: Array.from(new Set(s.files.map((f) => detectKind(f.title, f.mime ?? "")))).slice(0, 3),
        files: s.files.length,
      })),
    ...authored.map((r) => ({
      kind: "roadmap" as const,
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      difficulty: r.difficulty,
      hours: r.estimated_hours ?? null,
    })),
  ];

  const lockedCount = entries.filter((_, i) => isLocked(unlocked, i)).length;

  return (
    <>
      <PageHeader
        eyebrow="Roadmaps"
        title="See the whole terrain before you take a step"
        description="Each roadmap is a structure of connected nodes — foundations, core skills, specialisations — and each node is a hub with what to read, what to use and what to build."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry, index) => (
            <LockedCard key={entry.id} locked={isLocked(unlocked, index)}>
              {entry.kind === "upload" ? (
                <CardShell to="/section/$slug" params={{ slug: entry.slug }}>
                  <div className="flex flex-wrap items-center gap-2">
                    {entry.tags.map((tag) => (
                      <Pill key={tag}>{tag}</Pill>
                    ))}
                    <Pill tone="primary">
                      {entry.files} file{entry.files === 1 ? "" : "s"}
                    </Pill>
                  </div>
                  <h2 className="mt-3 font-display text-xl font-semibold text-foreground">{entry.title}</h2>
                  {entry.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{entry.description}</p>
                  )}
                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
                    <FileStack className="h-4 w-4 text-primary" aria-hidden /> Opens inside Explorers
                  </div>
                </CardShell>
              ) : (
                <CardShell to="/roadmaps/$slug" params={{ slug: entry.slug }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone="primary">{entry.difficulty}</Pill>
                    {entry.hours && <Pill>~{entry.hours}h</Pill>}
                  </div>
                  <h2 className="mt-3 font-display text-xl font-semibold text-foreground">{entry.title}</h2>
                  {entry.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{entry.description}</p>
                  )}
                  <div className="mt-5 rounded-xl border border-border bg-surface px-4 py-3">
                    <MiniTree />
                    <p className="eyebrow mt-2 text-muted-foreground">Interactive tree diagram</p>
                  </div>
                </CardShell>
              )}
            </LockedCard>
          ))}
        </div>
        <ReferralGate label="roadmaps" hidden={lockedCount} />
      </div>
    </>
  );
}
