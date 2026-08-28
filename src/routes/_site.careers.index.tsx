import { UploadedSections } from "@/components/site/UploadedSections";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { careersQuery } from "@/lib/content";
import { CardShell, PageHeader, Pill } from "@/components/site/bits";

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
  loader: ({ context }) => context.queryClient.ensureQueryData(careersQuery()),
  component: CareersIndex,
});

function CareersIndex() {
  const careers = useSuspenseQuery(careersQuery()).data;

  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Understand the role before you chase it"
        description="Each hub covers the day-to-day reality, technical and soft skills, tools, portfolio expectations, interview prep and where the role leads."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {careers.map((career) => (
            <CardShell key={career.id} to="/careers/$slug" params={{ slug: career.slug }}>
              <h2 className="font-display text-lg font-semibold text-foreground">{career.title}</h2>
              {career.role_summary && (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{career.role_summary}</p>
              )}
              {career.technical_skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {career.technical_skills.slice(0, 3).map((skill) => (
                    <Pill key={skill}>{skill}</Pill>
                  ))}
                </div>
              )}
            </CardShell>
          ))}
        </div>
        <UploadedSections category="career" title="Uploaded career packs" description="Guides, portfolios and interactive files for these roles." />
      </div>
    </>
  );
}
