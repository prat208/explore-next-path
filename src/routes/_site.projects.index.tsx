import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { challengesQuery, projectsQuery } from "@/lib/content";
import { CardShell, EmptyState, PageHeader, Pill, SectionHeading } from "@/components/site/bits";
import { cn } from "@/lib/utils";

const LEVELS = ["all", "beginner", "intermediate", "advanced"] as const;

export const Route = createFileRoute("/_site/projects/")({
  head: () => ({
    meta: [
      { title: "Projects & build challenges | Explorers" },
      {
        name: "description",
        content:
          "Buildable projects with a real problem, an architecture sketch, a tech stack and portfolio advice — plus recurring community build challenges.",
      },
      { property: "og:title", content: "Projects & build challenges" },
      { property: "og:description", content: "Stop watching tutorials. Build something you can show." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(projectsQuery()),
      context.queryClient.ensureQueryData(challengesQuery()),
    ]);
  },
  component: ProjectsIndex,
});

function ProjectsIndex() {
  const projects = useSuspenseQuery(projectsQuery()).data;
  const challenges = useSuspenseQuery(challengesQuery()).data;
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("all");

  const filtered = level === "all" ? projects : projects.filter((p) => p.difficulty === level);

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Build things that prove you can build things"
        description="Every project states the problem it solves, the stack, the architecture and how to present it in a portfolio or interview."
      >
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLevel(option)}
              className={cn(
                "focus-ring eyebrow rounded-full border px-3 py-1.5 capitalize transition-colors",
                level === option
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
          <EmptyState title="No projects at this level yet" hint="Try another difficulty." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <CardShell key={project.id} to="/projects/$slug" params={{ slug: project.slug }}>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="primary">{project.difficulty}</Pill>
                  {project.estimated_hours && <Pill>~{project.estimated_hours}h</Pill>}
                </div>
                <h2 className="mt-3 font-display text-lg font-semibold text-foreground">{project.title}</h2>
                {project.problem && (
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{project.problem}</p>
                )}
                {project.tech_stack.length > 0 && (
                  <p className="mt-4 font-mono text-xs text-secondary">{project.tech_stack.slice(0, 4).join(" · ")}</p>
                )}
              </CardShell>
            ))}
          </div>
        )}

        {challenges.length > 0 && (
          <section className="mt-16">
            <SectionHeading
              eyebrow="Build challenges"
              title="Ship something on a deadline"
              description="Recurring challenges with a clear statement, requirements and judging criteria."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {challenges.map((challenge) => (
                <article key={challenge.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {challenge.number != null && <Pill tone="secondary">Challenge #{challenge.number}</Pill>}
                    {challenge.deadline && <Pill>Due {new Date(challenge.deadline).toLocaleDateString()}</Pill>}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{challenge.title}</h3>
                  {challenge.statement && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{challenge.statement}</p>
                  )}
                  {challenge.requirements.length > 0 && (
                    <ul className="mt-4 space-y-1.5 text-sm text-foreground/90">
                      {challenge.requirements.map((req: string) => (
                        <li key={req} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
