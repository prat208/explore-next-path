import { UploadedSections } from "@/components/site/UploadedSections";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { opportunitiesQuery } from "@/lib/content";
import { EmptyState, PageHeader, Pill } from "@/components/site/bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — scholarships, internships, programs | Explorers" },
      {
        name: "description",
        content:
          "Verified global opportunities for students and builders: scholarships, internships, fellowships, hackathons and research programs with deadlines and eligibility.",
      },
      { property: "og:title", content: "Opportunities — scholarships, internships, programs" },
      { property: "og:description", content: "Real deadlines, real eligibility, links to the official source." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(opportunitiesQuery()),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const opportunities = useSuspenseQuery(opportunitiesQuery()).data;
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(opportunities.map((o) => o.category)))],
    [opportunities],
  );
  const filtered = category === "all" ? opportunities : opportunities.filter((o) => o.category === category);

  return (
    <>
      <PageHeader
        eyebrow="Opportunities"
        title="Doors that are actually open"
        description="Each listing shows who is eligible, what it costs, where it happens and when it closes — with a link to the official source."
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              className={cn(
                "focus-ring eyebrow rounded-full border px-3 py-1.5 capitalize transition-colors",
                category === option
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
        {filtered.length === 0 ? (
          <EmptyState title="Nothing open in this category" hint="Check back soon — listings are reviewed regularly." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {filtered.map((item) => (
              <li key={item.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="primary">{item.category}</Pill>
                  <Pill>{item.cost}</Pill>
                  <Pill>{item.work_mode}</Pill>
                  {item.verified_at && <Pill tone="success">Verified</Pill>}
                </div>
                <h2 className="mt-3 font-display text-lg font-semibold text-foreground">{item.title}</h2>
                {item.organization && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.organization}
                    {item.location ? ` · ${item.location}` : ""}
                    {item.country ? `, ${item.country}` : ""}
                  </p>
                )}
                {item.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                )}
                {item.eligibility && (
                  <p className="mt-3 text-sm text-foreground/90">
                    <span className="eyebrow text-secondary">Eligibility</span> {item.eligibility}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="font-mono text-xs text-muted-foreground">
                    {item.deadline ? `Closes ${new Date(item.deadline).toLocaleDateString()}` : "Rolling deadline"}
                  </span>
                  {item.official_url && (
                    <a
                      href={item.official_url}
                      target="_blank"
                      rel="noreferrer"
                      className="focus-ring inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      Official page <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <UploadedSections category="opportunity" title="Uploaded opportunity packs" description="Forms, briefs and guides you can read right here." />
      </div>
    </>
  );
}
