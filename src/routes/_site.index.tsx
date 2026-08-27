import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Compass, Search, Sparkles } from "lucide-react";
import {
  articlesQuery,
  opportunitiesQuery,
  projectsQuery,
  resourcesQuery,
  roadmapsQuery,
  pathsQuery,
} from "@/lib/content";
import { CardShell, Pill, SectionHeading } from "@/components/site/bits";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "Explorers — Discover AI & technology, then go build" },
      {
        name: "description",
        content:
          "Explorers is a discovery platform for AI and technology: verified resources, interactive roadmaps, learning manuals, buildable projects and real opportunities.",
      },
      { property: "og:title", content: "Explorers — Discover AI & technology, then go build" },
      {
        property: "og:description",
        content:
          "Understand what's changing in AI, learn the skills, build the proof and find where it can take you.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(articlesQuery({ limit: 7 })),
      context.queryClient.ensureQueryData(roadmapsQuery()),
      context.queryClient.ensureQueryData(pathsQuery()),
      context.queryClient.ensureQueryData(projectsQuery()),
      context.queryClient.ensureQueryData(resourcesQuery()),
      context.queryClient.ensureQueryData(opportunitiesQuery()),
    ]);
  },
  component: Discover,
});

const INTENTS = [
  { label: "I want to understand AI", to: "/articles", hint: "Start with plain-language explainers" },
  { label: "I want to learn a skill", to: "/learn", hint: "Structured manuals, not video dumps" },
  { label: "I want to build something", to: "/projects", hint: "Projects with real outcomes" },
  { label: "I want a career direction", to: "/careers", hint: "Roles, skills and proof of work" },
] as const;

function Discover() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const articles = useSuspenseQuery(articlesQuery({ limit: 7 })).data;
  const roadmaps = useSuspenseQuery(roadmapsQuery()).data;
  const paths = useSuspenseQuery(pathsQuery()).data;
  const projects = useSuspenseQuery(projectsQuery()).data;
  const resources = useSuspenseQuery(resourcesQuery()).data;
  const opportunities = useSuspenseQuery(opportunitiesQuery()).data;

  const [lead, ...rest] = articles;

  return (
    <>
      <section className="topo relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="eyebrow inline-flex items-center gap-2 text-primary">
            <Compass className="h-3.5 w-3.5" aria-hidden /> Field guide to what's next
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-6xl">
            Explore what's changing in AI — then go and build with it.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Explorers connects the four things scattered across the internet: honest explanation,
            structured learning, verified resources and buildable projects. One search, one map, no
            dead ends.
          </p>

          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const q = term.trim();
              if (q) navigate({ to: "/search", search: { q } });
            }}
            className="mt-8 flex max-w-xl items-center gap-2"
          >
            <label className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="sr-only">Search Explorers</span>
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Try “RAG”, “prompt engineering”, “ML internship”…"
                className="focus-ring w-full rounded-lg border border-border bg-surface/70 py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground"
              />
            </label>
            <button
              type="submit"
              className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-deep"
            >
              Explore
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </form>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INTENTS.map((intent) => (
              <Link
                key={intent.label}
                to={intent.to}
                className="hover-lift focus-ring rounded-xl border border-border bg-card/70 p-4"
              >
                <p className="font-display text-[0.95rem] font-semibold text-foreground">{intent.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{intent.hint}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {lead && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <SectionHeading
              eyebrow="Today on Explorers"
              title="What's worth your attention"
              description="Signal over noise: what happened, what it means and what to do about it."
              action={{ label: "All articles", to: "/articles" }}
            />
            <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
              <Link
                to="/articles/$slug"
                params={{ slug: lead.slug }}
                className="hover-lift focus-ring flex flex-col justify-between rounded-xl border border-border bg-card p-6"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone="primary">{lead.category}</Pill>
                    <Pill>{lead.reading_minutes} min read</Pill>
                    <Pill>{lead.level}</Pill>
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                    {lead.title}
                  </h3>
                  {lead.subtitle && <p className="mt-2 text-base text-muted-foreground">{lead.subtitle}</p>}
                </div>
                {lead.why_it_matters && (
                  <p className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
                    <span className="eyebrow mr-2 text-secondary">Why it matters</span>
                    {lead.why_it_matters}
                  </p>
                )}
              </Link>

              <div className="grid gap-3">
                {rest.slice(0, 4).map((article) => (
                  <Link
                    key={article.id}
                    to="/articles/$slug"
                    params={{ slug: article.slug }}
                    className="hover-lift focus-ring rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Pill tone="secondary">{article.category}</Pill>
                      <span className="eyebrow text-muted-foreground">{article.reading_minutes} min</span>
                    </div>
                    <p className="mt-2 font-display text-base font-semibold leading-snug text-foreground">
                      {article.title}
                    </p>
                    {article.excerpt && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-border bg-surface/25">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionHeading
            eyebrow="Pick a direction"
            title="Roadmaps that show the whole terrain"
            description="Every node is a real step with resources, a project and a way to check yourself."
            action={{ label: "All roadmaps", to: "/roadmaps" }}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roadmaps.slice(0, 6).map((roadmap) => (
              <CardShell key={roadmap.id} to="/roadmaps/$slug" params={{ slug: roadmap.slug }}>
                <Pill tone="primary">{roadmap.difficulty}</Pill>
                <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{roadmap.title}</h3>
                {roadmap.description && (
                  <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{roadmap.description}</p>
                )}
                {roadmap.estimated_hours && (
                  <p className="eyebrow mt-4 text-muted-foreground">~{roadmap.estimated_hours} hours</p>
                )}
              </CardShell>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Learn"
                title="Interactive manuals"
                description="Read, run, check yourself, move on."
                action={{ label: "All paths", to: "/learn" }}
              />
              <div className="grid gap-3">
                {paths.slice(0, 3).map((path) => (
                  <CardShell key={path.id} to="/learn/$pathSlug" params={{ pathSlug: path.slug }}>
                    <div className="flex items-center gap-2">
                      <Pill tone="secondary">{path.difficulty}</Pill>
                      {path.estimated_hours && <Pill>~{path.estimated_hours}h</Pill>}
                    </div>
                    <h3 className="mt-3 font-display text-base font-semibold text-foreground">{path.title}</h3>
                    {path.description && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{path.description}</p>
                    )}
                  </CardShell>
                ))}
              </div>
            </div>
            <div>
              <SectionHeading
                eyebrow="Build"
                title="Projects worth showing"
                description="Each one solves a real problem and belongs in a portfolio."
                action={{ label: "All projects", to: "/projects" }}
              />
              <div className="grid gap-3">
                {projects.slice(0, 3).map((project) => (
                  <CardShell key={project.id} to="/projects/$slug" params={{ slug: project.slug }}>
                    <div className="flex items-center gap-2">
                      <Pill tone="primary">{project.difficulty}</Pill>
                      {project.estimated_hours && <Pill>~{project.estimated_hours}h</Pill>}
                    </div>
                    <h3 className="mt-3 font-display text-base font-semibold text-foreground">
                      {project.title}
                    </h3>
                    {project.outcome && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{project.outcome}</p>
                    )}
                  </CardShell>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface/25">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionHeading
            eyebrow="Verified"
            title="Resources reviewed by humans"
            description="Free-first, official where possible, each one checked before it earns a place."
            action={{ label: "Resource library", to: "/resources" }}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.slice(0, 6).map((resource) => (
              <CardShell key={resource.id} href={resource.url}>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={resource.cost === "free" ? "success" : "muted"}>{resource.cost}</Pill>
                  <Pill>{resource.resource_type}</Pill>
                  {resource.is_official && <Pill tone="secondary">official</Pill>}
                </div>
                <h3 className="mt-3 font-display text-base font-semibold text-foreground">{resource.title}</h3>
                {resource.description && (
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>
                )}
                {resource.organization && (
                  <p className="eyebrow mt-4 text-muted-foreground">{resource.organization}</p>
                )}
              </CardShell>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionHeading
            eyebrow="Go further"
            title="Opportunities with real deadlines"
            description="Fellowships, internships, competitions and programs — global, free-first, verified."
            action={{ label: "All opportunities", to: "/opportunities" }}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.slice(0, 6).map((op) => (
              <CardShell key={op.id} href={op.official_url ?? "#"}>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="primary">{op.category}</Pill>
                  <Pill tone={op.cost === "free" ? "success" : "muted"}>{op.cost}</Pill>
                </div>
                <h3 className="mt-3 font-display text-base font-semibold text-foreground">{op.title}</h3>
                {op.organization && <p className="mt-1 text-sm text-muted-foreground">{op.organization}</p>}
                <p className="eyebrow mt-4 flex items-center gap-2 text-secondary">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  {op.deadline ? `Closes ${new Date(op.deadline).toLocaleDateString()}` : "Rolling"}
                </p>
              </CardShell>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
