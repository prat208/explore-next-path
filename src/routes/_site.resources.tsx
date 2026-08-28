import { UploadedSections } from "@/components/site/UploadedSections";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ExternalLink, Star } from "lucide-react";
import { resourcesQuery, toolsQuery } from "@/lib/content";
import { EmptyState, PageHeader, Pill } from "@/components/site/bits";
import { SaveButton } from "@/components/site/SaveButton";
import { cn } from "@/lib/utils";
import { ReferralGate } from "@/components/referral/ReferralGate";
import { gateList, useAccess } from "@/lib/referral";

export const Route = createFileRoute("/_site/resources")({
  head: () => ({
    meta: [
      { title: "Resources & tools — reviewed, not scraped | Explorers" },
      {
        name: "description",
        content:
          "A curated directory of courses, docs, datasets and AI tools with level, cost, reviewer notes and honest verdicts on when to use each one.",
      },
      { property: "og:title", content: "Resources & tools — reviewed, not scraped" },
      { property: "og:description", content: "Every entry says who it is for and why it earned a place." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(resourcesQuery()),
      context.queryClient.ensureQueryData(toolsQuery()),
    ]);
  },
  component: ResourcesPage,
});

function ResourcesPage() {
  const resources = useSuspenseQuery(resourcesQuery()).data;
  const tools = useSuspenseQuery(toolsQuery()).data;
  const [tab, setTab] = useState<"resources" | "tools">("resources");
  const [category, setCategory] = useState("all");
  const [freeOnly, setFreeOnly] = useState(false);
  const { unlocked } = useAccess();

  const categories = useMemo(() => {
    const source = tab === "resources" ? resources.map((r) => r.category) : tools.map((t) => t.category);
    return ["all", ...Array.from(new Set(source))];
  }, [tab, resources, tools]);

  const matchingResources = resources.filter(
    (r) => (category === "all" || r.category === category) && (!freeOnly || r.has_free_tier || r.cost === "free"),
  );
  const matchingTools = tools.filter((t) => category === "all" || t.category === category);
  const filteredResources = gateList(matchingResources, unlocked);
  const filteredTools = gateList(matchingTools, unlocked);
  const hiddenCount =
    tab === "resources"
      ? matchingResources.length - filteredResources.length
      : matchingTools.length - filteredTools.length;

  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="A shelf, not a landfill"
        description="Filter by category, level and cost. Each entry carries reviewer notes so you know what it is good for before you spend an evening on it."
      >
        <div className="flex flex-wrap items-center gap-2">
          {(["resources", "tools"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setTab(option);
                setCategory("all");
              }}
              className={cn(
                "focus-ring eyebrow rounded-full border px-3.5 py-1.5 capitalize transition-colors",
                tab === option
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {categories.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              className={cn(
                "focus-ring eyebrow rounded-full border px-3 py-1.5 capitalize transition-colors",
                category === option
                  ? "border-secondary bg-secondary/15 text-secondary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {option.replace(/_/g, " ")}
            </button>
          ))}
          {tab === "resources" && (
            <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-[var(--primary)]"
              />
              Free access only
            </label>
          )}
        </div>

        {tab === "resources" ? (
          filteredResources.length === 0 ? (
            <EmptyState title="No resources match those filters" hint="Try widening the category or cost filter." />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((resource) => (
                <li key={resource.id} className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone="primary">{resource.level}</Pill>
                    <Pill>{resource.resource_type.replace(/_/g, " ")}</Pill>
                    {resource.has_free_tier && <Pill tone="success">Free tier</Pill>}
                  </div>
                  <h2 className="mt-3 font-display text-base font-semibold text-foreground">{resource.title}</h2>
                  {resource.organization && (
                    <p className="mt-1 text-xs text-muted-foreground">{resource.organization}</p>
                  )}
                  {resource.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{resource.description}</p>
                  )}
                  {resource.reviewer_notes && (
                    <p className="mt-3 rounded-lg border border-border bg-surface/60 p-3 text-sm text-foreground/90">
                      <span className="eyebrow text-secondary">Reviewer note</span> {resource.reviewer_notes}
                    </p>
                  )}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                    {resource.rating != null && (
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-primary">
                        <Star className="h-3.5 w-3.5 fill-current" aria-hidden /> {resource.rating.toFixed(1)}
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <SaveButton itemType="resource" itemId={resource.id} />
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="focus-ring inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                      >
                        Open <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : filteredTools.length === 0 ? (
          <EmptyState title="No tools in this category yet" />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <li key={tool.id} className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="secondary">{tool.category.replace(/_/g, " ")}</Pill>
                  <Pill>{tool.pricing}</Pill>
                </div>
                <h2 className="mt-3 font-display text-base font-semibold text-foreground">{tool.name}</h2>
                {tool.tagline && <p className="mt-1 text-sm text-primary">{tool.tagline}</p>}
                {tool.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{tool.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <SaveButton itemType="tool" itemId={tool.id} />
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    Visit <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
        <ReferralGate label={tab === "resources" ? "resources" : "tools"} hidden={hiddenCount} />
        <UploadedSections category="resource" title="Uploaded resources" description="Documents, notebooks and interactive files you can open here." />
      </div>
    </>
  );
}
