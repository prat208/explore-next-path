import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { pathsQuery } from "@/lib/content";
import { CardShell, PageHeader, Pill } from "@/components/site/bits";

export const Route = createFileRoute("/_site/learn/")({
  head: () => ({
    meta: [
      { title: "Learn — Interactive manuals for AI & tech skills | Explorers" },
      {
        name: "description",
        content:
          "Structured learning paths with runnable code, checkpoints, quizzes and a project at the end. Built to be finished, not bookmarked.",
      },
      { property: "og:title", content: "Learn — Interactive manuals for AI & tech skills" },
      {
        property: "og:description",
        content: "Read, run, check yourself, build. Learning paths designed like a field manual.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(pathsQuery()),
  component: LearnIndex,
});

function LearnIndex() {
  const paths = useSuspenseQuery(pathsQuery()).data;

  return (
    <>
      <PageHeader
        eyebrow="Learn"
        title="Manuals you can actually finish"
        description="Each path is broken into modules and short lessons with explanations, runnable examples, common mistakes and a checkpoint at the end of every step."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((path) => (
            <CardShell key={path.id} to="/learn/$pathSlug" params={{ pathSlug: path.slug }}>
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="primary">{path.difficulty}</Pill>
                {path.estimated_hours && <Pill>~{path.estimated_hours}h</Pill>}
              </div>
              <h2 className="mt-3 font-display text-lg font-semibold text-foreground">{path.title}</h2>
              {path.description && (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{path.description}</p>
              )}
              {path.audience && <p className="eyebrow mt-4 text-muted-foreground">For {path.audience}</p>}
            </CardShell>
          ))}
        </div>
      </div>
    </>
  );
}
