import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { careersQuery } from "@/lib/content";
import { CardShell, Pill } from "@/components/site/bits";
import { LockedCard } from "@/components/referral/LockedCard";
import { ReferralGate } from "@/components/referral/ReferralGate";
import { UploadedSectionCard } from "@/components/site/UploadedSectionCard";
import { isLocked, useAccess } from "@/lib/referral";
import { publishedSectionsQuery } from "@/lib/sections";

export const Route = createFileRoute("/_site/careers/")({
  head: () => ({
    meta: [
      { title: "Careers in AI & technology — role hubs | Explorers" },
      {
        name: "description",
        content:
          "What each role actually does day to day, the skills and tools it needs, what a portfolio should show and how the progression works.",
      },
      { property: "og:title", content: "Careers in AI & technology — role hubs" },
      { property: "og:description", content: "Honest role breakdowns, not job-board copy." },
    ],
  }),
  beforeLoad: () => {
    // Careers now live inside the merged Roadmaps & Careers hub.
    throw redirect({ to: "/roadmaps" });
  },
});

export function CareersSection() {
  const careers = useQuery(careersQuery()).data ?? [];
  const uploads = (useQuery(publishedSectionsQuery("career")).data ?? []).filter(
    (section) => section.files.length > 0,
  );
  const { unlocked } = useAccess();
  const entries = [
    ...uploads.map((section) => ({ kind: "upload" as const, section })),
    ...careers.map((career) => ({ kind: "career" as const, career })),
  ];

  return (
    <>
      <div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry, index) => (
            <LockedCard key={entry.kind === "upload" ? entry.section.id : entry.career.id} locked={isLocked(unlocked, index)}>
            {entry.kind === "upload" ? (
              <UploadedSectionCard section={entry.section} />
            ) : (
            <CardShell to="/careers/$slug" params={{ slug: entry.career.slug }}>
              <h2 className="font-display text-lg font-semibold text-foreground">{entry.career.title}</h2>
              {entry.career.role_summary && (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{entry.career.role_summary}</p>
              )}
              {entry.career.technical_skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.career.technical_skills.slice(0, 3).map((skill) => (
                    <Pill key={skill}>{skill}</Pill>
                  ))}
                </div>
              )}
            </CardShell>
            )}
            </LockedCard>
          ))}
        </div>
        <ReferralGate label="careers" hidden={unlocked ? 0 : Math.max(0, entries.length - 1)} />
      </div>
    </>
  );
}
