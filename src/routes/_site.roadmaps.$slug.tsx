import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowRight, Check, Circle } from "lucide-react";
import { roadmapQuery, type RoadmapNode } from "@/lib/content";
import { RoadmapCanvas } from "@/components/roadmap/RoadmapCanvas";
import { NodeVideo } from "@/components/roadmap/NodeVideo";
import { ContinueExploring } from "@/components/site/ContinueExploring";
import { SaveButton } from "@/components/site/SaveButton";
import { Pill } from "@/components/site/bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/roadmaps/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(roadmapQuery(params.slug));
    if (!data) throw notFound();
    return { title: data.roadmap.title, description: data.roadmap.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Roadmap unavailable | Explorers" }, { name: "robots", content: "noindex" }] };
    const description =
      loaderData.description ?? "A structural, node-based roadmap with resources and projects at every step.";
    return {
      meta: [
        { title: `${loaderData.title} roadmap | Explorers` },
        { name: "description", content: description },
        { property: "og:title", content: `${loaderData.title} roadmap` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: RoadmapPage,
});

function RoadmapPage() {
  const { slug } = Route.useParams();
  const data = useSuspenseQuery(roadmapQuery(slug)).data;
  const [done, setDone] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<RoadmapNode | null>(null);

  if (!data) return null;
  const { roadmap, nodes, edges } = data;

  const groups = useMemo(() => {
    const map = new Map<string, RoadmapNode[]>();
    for (const node of nodes) {
      const key = node.group_label ?? "Core";
      map.set(key, [...(map.get(key) ?? []), node]);
    }
    return [...map.entries()];
  }, [nodes]);

  const nextFrom = (nodeId: string) =>
    edges
      .filter((e) => e.source_node_id === nodeId)
      .map((e) => nodes.find((n) => n.id === e.target_node_id))
      .filter((n): n is RoadmapNode => Boolean(n));

  const percent = nodes.length ? Math.round((done.size / nodes.length) * 100) : 0;
  const active = selected ?? nodes[0] ?? null;

  return (
    <>
      <header className="topo border-b border-border bg-surface/30">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="eyebrow text-primary">Roadmap</p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-[2.5rem]">
            {roadmap.title}
          </h1>
          {roadmap.description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {roadmap.description}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Pill tone="primary">{roadmap.difficulty}</Pill>
            {roadmap.estimated_hours && <Pill>~{roadmap.estimated_hours} hours</Pill>}
            <Pill>{nodes.length} steps</Pill>
            <SaveButton itemType="roadmap" itemId={roadmap.id} label="Save roadmap" />
          </div>
          <div className="mt-6 max-w-md">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Your progress</span>
              <span className="font-mono text-primary">{percent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <RoadmapCanvas
            nodes={nodes}
            edges={edges}
            selectedId={active?.id ?? null}
            doneIds={done}
            onSelect={setSelected}
            onToggleDone={(node) =>
              setDone((prev) => {
                const next = new Set(prev);
                if (next.has(node.id)) next.delete(node.id);
                else next.add(node.id);
                return next;
              })
            }
            height={620}
          />
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {groups.map(([group, groupNodes]) => (
              <span key={group} className="font-mono uppercase tracking-wider">
                {group} · {groupNodes.length}
              </span>
            ))}
          </div>
        </div>


        <aside className="lg:sticky lg:top-24 lg:self-start">
          {active && (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="eyebrow text-secondary">Step detail</p>
              <h2 className="mt-2 font-display text-xl font-semibold text-foreground">{active.title}</h2>
              {active.description && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{active.description}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Pill tone="primary">{active.difficulty}</Pill>
                {active.estimated_hours && <Pill>~{active.estimated_hours}h</Pill>}
              </div>
              {active.skills.length > 0 && (
                <div className="mt-5">
                  <p className="eyebrow text-muted-foreground">Skills you gain</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-foreground/90">
                    {active.skills.map((skill) => (
                      <li key={skill} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {nextFrom(active.id).length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="eyebrow text-muted-foreground">Unlocks next</p>
                  <ul className="mt-2 space-y-1.5">
                    {nextFrom(active.id).map((node) => (
                      <li key={node.id}>
                        <button
                          type="button"
                          onClick={() => setSelected(node)}
                          className="focus-ring inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-deep"
                        >
                          {node.title}
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <NodeVideo url={active.video_url} title={active.video_title} />
              <div className="mt-5">
                <SaveButton itemType="roadmap_node" itemId={active.id} label="Save this step" />
              </div>
            </div>
          )}
        </aside>
      </div>

      <ContinueExploring fromType="roadmap" fromId={roadmap.id} />
    </>
  );
}
