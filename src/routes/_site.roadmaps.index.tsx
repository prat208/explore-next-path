import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { roadmapsQuery } from "@/lib/content";
import { CardShell, PageHeader, Pill } from "@/components/site/bits";

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

function RoadmapsIndex() {
  const roadmaps = useSuspenseQuery(roadmapsQuery()).data;

  return (
    <>
      <PageHeader
        eyebrow="Roadmaps"
        title="See the whole terrain before you take a step"
        description="Each roadmap is a structure of connected nodes — foundations, core skills, specialisations — and each node is a hub with what to read, what to use and what to build."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roadmaps.map((roadmap) => (
            <CardShell key={roadmap.id} to="/roadmaps/$slug" params={{ slug: roadmap.slug }}>
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="primary">{roadmap.difficulty}</Pill>
                {roadmap.estimated_hours && <Pill>~{roadmap.estimated_hours}h</Pill>}
              </div>
              <h2 className="mt-3 font-display text-lg font-semibold text-foreground">{roadmap.title}</h2>
              {roadmap.description && (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{roadmap.description}</p>
              )}
            </CardShell>
          ))}
        </div>
      </div>
    </>
  );
}
