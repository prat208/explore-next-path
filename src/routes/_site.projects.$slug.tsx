import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { projectQuery } from "@/lib/content";
import { ContinueExploring } from "@/components/site/ContinueExploring";
import { SaveButton } from "@/components/site/SaveButton";
import { Pill } from "@/components/site/bits";

export const Route = createFileRoute("/_site/projects/")({
  loader: async ({ context, params }) => {
    const project = await context.queryClient.ensureQueryData(projectQuery(params.slug));
    if (!project) throw notFound();
    return { title: project.title, description: project.problem ?? project.outcome };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Project unavailable | Explorers" }, { name: "robots", content: "noindex" }] };
    const description = loaderData.description ?? "A buildable project brief with stack, architecture and portfolio advice.";
    return {
      meta: [
        { title: `${loaderData.title} — Project brief | Explorers` },
        { name: "description", content: description },
        { property: "og:title", content: `${loaderData.title} — Project brief` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProjectPage,
});

function ProjectPage() {
  const { slug } = Route.useParams();
  const project = useSuspenseQuery(projectQuery(slug)).data;
  if (!project) return null;

  const sections = [
    { label: "The problem", body: project.problem },
    { label: "What you end up with", body: project.outcome },
    { label: "Architecture", body: project.architecture },
    { label: "Portfolio advice", body: project.portfolio_advice },
  ].filter((s) => s.body);

  const lists = [
    { label: "Prerequisites", items: project.prerequisites },
    { label: "Skills practised", items: project.skills },
    { label: "Extensions", items: project.extensions },
  ].filter((l) => l.items?.length);

  return (
    <>
      <header className="topo border-b border-border bg-surface/30">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="eyebrow text-primary">Project brief</p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-[2.5rem]">
            {project.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Pill tone="primary">{project.difficulty}</Pill>
            {project.estimated_hours && <Pill>~{project.estimated_hours}h</Pill>}
            <SaveButton itemType="project" itemId={project.id} label="Save project" />
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline"
              >
                Starter repo <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline"
              >
                Live demo <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.label}>
              <h2 className="font-display text-xl font-semibold text-foreground">{section.label}</h2>
              <p className="mt-2 whitespace-pre-line text-[1.02rem] leading-relaxed text-foreground/90">
                {section.body}
              </p>
            </section>
          ))}
        </div>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {project.tech_stack.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="eyebrow text-secondary">Tech stack</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {project.tech_stack.map((tech) => (
                  <Pill key={tech}>{tech}</Pill>
                ))}
              </div>
            </div>
          )}
          {lists.map((list) => (
            <div key={list.label} className="rounded-xl border border-border bg-card p-5">
              <p className="eyebrow text-secondary">{list.label}</p>
              <ul className="mt-2.5 space-y-1.5 text-sm text-foreground/90">
                {list.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
      </div>

      <ContinueExploring fromType="project" fromId={project.id} />
    </>
  );
}
