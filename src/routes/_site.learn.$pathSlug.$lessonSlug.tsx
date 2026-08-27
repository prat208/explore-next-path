import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { lessonQuery } from "@/lib/content";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { SaveButton } from "@/components/site/SaveButton";
import { Pill } from "@/components/site/bits";

export const Route = createFileRoute("/_site/learn/$pathSlug/$lessonSlug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(
      lessonQuery(params.pathSlug, params.lessonSlug),
    );
    if (!data) throw notFound();
    return { title: data.lesson.title, path: data.path.title, description: data.lesson.summary };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Lesson unavailable | Explorers" }, { name: "robots", content: "noindex" }] };
    const description = loaderData.description ?? `A hands-on lesson from the ${loaderData.path} path on Explorers.`;
    return {
      meta: [
        { title: `${loaderData.title} — ${loaderData.path} | Explorers` },
        { name: "description", content: description },
        { property: "og:title", content: `${loaderData.title} — ${loaderData.path}` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: LessonPage,
});

function LessonPage() {
  const { pathSlug, lessonSlug } = Route.useParams();
  const data = useSuspenseQuery(lessonQuery(pathSlug, lessonSlug)).data;
  if (!data) return null;
  const { path, lessons, lesson, blocks } = data;

  const index = lessons.findIndex((l) => l.id === lesson.id);
  const prev = index > 0 ? lessons[index - 1] : null;
  const next = index < lessons.length - 1 ? lessons[index + 1] : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Link
          to="/learn/$pathSlug"
          params={{ pathSlug: path.slug }}
          className="focus-ring inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {path.title}
        </Link>
        <nav className="mt-4 max-h-[60vh] space-y-0.5 overflow-y-auto pr-1">
          {lessons.map((item) => (
            <Link
              key={item.id}
              to="/learn/$pathSlug/$lessonSlug"
              params={{ pathSlug: path.slug, lessonSlug: item.slug }}
              className="focus-ring block rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-surface hover:text-foreground data-[status=active]:bg-primary/10 data-[status=active]:font-semibold data-[status=active]:text-primary"
              activeProps={{ "data-status": "active" }}
            >
              <span className="font-mono text-xs text-muted-foreground/70">{item.position}.</span> {item.title}
            </Link>
          ))}
        </nav>
      </aside>

      <article className="min-w-0">
        <p className="eyebrow text-primary">
          {lesson.module_label ?? "Lesson"} · {lesson.estimated_minutes} min
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-[2.25rem]">
          {lesson.title}
        </h1>
        {lesson.summary && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{lesson.summary}</p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Pill tone="secondary">
            Lesson {index + 1} of {lessons.length}
          </Pill>
          <SaveButton itemType="lesson" itemId={lesson.id} label="Save lesson" />
        </div>

        <div className="mt-10">
          <BlockRenderer blocks={blocks} />
        </div>

        <nav className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          {prev ? (
            <Link
              to="/learn/$pathSlug/$lessonSlug"
              params={{ pathSlug: path.slug, lessonSlug: prev.slug }}
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:border-border-strong"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to="/learn/$pathSlug/$lessonSlug"
              params={{ pathSlug: path.slug, lessonSlug: next.slug }}
              className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
            >
              {next.title}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
