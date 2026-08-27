import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { pathQuery } from "@/lib/content";
import { ContinueExploring } from "@/components/site/ContinueExploring";
import { SaveButton } from "@/components/site/SaveButton";
import { Pill } from "@/components/site/bits";

export const Route = createFileRoute("/_site/learn/$pathSlug/")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(pathQuery(params.pathSlug));
    if (!data) throw notFound();
    return { title: data.path.title, description: data.path.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Path unavailable | Explorers" }, { name: "robots", content: "noindex" }] };
    const description = loaderData.description ?? "An interactive learning path with checkpoints and a final project.";
    return {
      meta: [
        { title: `${loaderData.title} — Learning path | Explorers` },
        { name: "description", content: description },
        { property: "og:title", content: `${loaderData.title} — Learning path` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: PathPage,
});

function PathPage() {
  const { pathSlug } = Route.useParams();
  const data = useSuspenseQuery(pathQuery(pathSlug)).data;
  if (!data) return null;
  const { path, lessons } = data;

  const modules = lessons.reduce<Record<string, typeof lessons>>((acc, lesson) => {
    const key = lesson.module_label ?? "Lessons";
    acc[key] = [...(acc[key] ?? []), lesson];
    return acc;
  }, {});

  return (
    <>
      <header className="topo border-b border-border bg-surface/30">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="eyebrow text-primary">Learning path</p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-[2.5rem]">
            {path.title}
          </h1>
          {path.description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{path.description}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Pill tone="primary">{path.difficulty}</Pill>
            {path.estimated_hours && <Pill>~{path.estimated_hours}h</Pill>}
            <Pill>{lessons.length} lessons</Pill>
            <SaveButton itemType="learning_path" itemId={path.id} label="Save path" />
          </div>
          {lessons[0] && (
            <Link
              to="/learn/$pathSlug/$lessonSlug"
              params={{ pathSlug: path.slug, lessonSlug: lessons[0].slug }}
              className="focus-ring mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
            >
              Start lesson 1
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          {Object.entries(modules).map(([label, items], mi) => (
            <section key={label}>
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-semibold text-primary">
                  {mi + 1}
                </span>
                <h2 className="font-display text-lg font-semibold text-foreground">{label}</h2>
              </div>
              <ol className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {items.map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      to="/learn/$pathSlug/$lessonSlug"
                      params={{ pathSlug: path.slug, lessonSlug: lesson.slug }}
                      className="focus-ring flex items-start justify-between gap-4 px-4 py-3.5 hover:bg-surface/60"
                    >
                      <span className="min-w-0">
                        <span className="block font-display text-[0.975rem] font-semibold text-foreground">
                          {lesson.position}. {lesson.title}
                        </span>
                        {lesson.summary && (
                          <span className="mt-0.5 block line-clamp-2 text-sm text-muted-foreground">
                            {lesson.summary}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {lesson.estimated_minutes} min
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {[
            { label: "Prerequisites", items: path.prerequisites },
            { label: "Skills you gain", items: path.skills },
            { label: "Milestones", items: path.milestones },
            { label: "Where to go next", items: path.next_steps },
          ]
            .filter((section) => section.items?.length)
            .map((section) => (
              <div key={section.label} className="rounded-xl border border-border bg-card p-5">
                <p className="eyebrow text-secondary">{section.label}</p>
                <ul className="mt-2.5 space-y-1.5 text-sm text-foreground/90">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          {path.audience && (
            <p className="text-sm text-muted-foreground">
              Written for <span className="text-foreground">{path.audience}</span>.
            </p>
          )}
        </aside>
      </div>

      <ContinueExploring fromType="learning_path" fromId={path.id} />
    </>
  );
}
