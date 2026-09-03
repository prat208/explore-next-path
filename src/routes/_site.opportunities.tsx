import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { opportunitiesQuery } from "@/lib/content";
import { EmptyState, PageHeader, Pill } from "@/components/site/bits";
import { cn } from "@/lib/utils";
import { ReferralGate } from "@/components/referral/ReferralGate";
import { isLocked, useAccess } from "@/lib/referral";
import { LockedCard } from "@/components/referral/LockedCard";
import { UploadedSectionCard } from "@/components/site/UploadedSectionCard";
import { publishedSectionsQuery } from "@/lib/sections";
import { UpdatesSection } from "./_site.updates";

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
  const uploads = (useQuery(publishedSectionsQuery("opportunity")).data ?? []).filter(
    (section) => section.files.length > 0,
  );
  const { unlocked } = useAccess();
  const [category, setCategory] = useState("all");
  const [tab, setTab] = useState<"opportunities" | "updates">("opportunities");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(opportunities.map((o) => o.category)))],
    [opportunities],
  );
  const matching = category === "all" ? opportunities : opportunities.filter((o) => o.category === category);
  const entries = category === "all"
    ? [...uploads.map((section) => ({ kind: "upload" as const, section })), ...matching.map((item) => ({ kind: "item" as const, item }))]
    : matching.map((item) => ({ kind: "item" as const, item }));

  return (
    <>
      <PageHeader
        eyebrow="Opportunities & Updates"
        title="Doors that are actually open, refreshed daily"
        description="Verified programs with eligibility and deadlines, plus a daily crawl of AI news, hackathons and free-tier tools ranked around your interests."
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {(["opportunities", "updates"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTab(option)}
              className={cn(
                "focus-ring rounded-full border px-3.5 py-1.5 text-sm font-semibold capitalize transition-colors",
                tab === option
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <div className={cn("flex flex-wrap gap-2", tab === "updates" && "hidden")}>
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
        {tab === "updates" ? (
          <UpdatesSection />
        ) : entries.length === 0 ? (
          <EmptyState title="Nothing open in this category" hint="Check back soon — listings are reviewed regularly." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {entries.map((entry, index) => (
              <li key={entry.kind === "upload" ? entry.section.id : entry.item.id} className="h-full">
                <LockedCard locked={isLocked(unlocked, index)}>
                {entry.kind === "upload" ? (
                  <UploadedSectionCard section={entry.section} />
                ) : (() => {
                  const item = entry.item;
                  return (
                <div className="h-full rounded-xl border border-border bg-card p-5">
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
                </div>
                  );
                })()}
                </LockedCard>
              </li>
            ))}
          </ul>
        )}
        {tab === "opportunities" && (
          <ReferralGate label="opportunities" hidden={unlocked ? 0 : Math.max(0, entries.length - 1)} />
        )}
      </div>
    </>
  );
}
