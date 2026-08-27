import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { careerQuery } from "@/lib/content";
import { ContinueExploring } from "@/components/site/ContinueExploring";
import { SaveButton } from "@/components/site/SaveButton";
import { Pill } from "@/components/site/bits";

type Stage = { title?: string; level?: string; focus?: string; years?: string };

export const Route = createFileRoute("/_site/careers/$slug")({
  loader: async ({ context, params }) => {
    const career = await context.queryClient.ensureQueryData(careerQuery(params.slug));
    if (!career) throw notFound();
    return { title: career.title, description: career.role_summary ?? career.overview };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Career hub unavailable | Explorers" }, { name: "robots", content: "noindex" }] };
    const description = loaderData.description ?? "A full role breakdown: skills, tools, portfolio and progression.";
    return {
      meta: [
        { title: `${loaderData.title} — Career hub | Explorers` },
        { name: "description", content: description },
        { property: "og:title", content: `${loaderData.title} — Career hub` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CareerPage,
});

function CareerPage() {
  const { slug } = Route.useParams();
  const career = useSuspenseQuery(careerQuery(slug)).data;
  if (!career) return null;

  const progression = Array.isArray(career.progression) ? (career.progression as Stage[]) : [];
  const lists = [
    { label: "Technical skills", items: career.technical_skills },
    { label: "Soft skills", items: career.soft_skills },
    { label: "Tools used", items: career.tools_used },
    { label: "Portfolio expectations", items: career.portfolio_expectations },
    { label: "Interview prep", items: career.interview_prep },
    { label: "Adjacent roles", items: career.related_roles },
  ].filter((l) => l.items?.length);

  return (
    <>
      <header className="topo border-b border-border bg-surface/30">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="eyebrow text-primary">Career hub</p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-[2.5rem]">
            {career.title}
          </h1>
          {career.role_summary && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{career.role_summary}</p>
          )}
          <div className="mt-6">
            <SaveButton itemType="career" itemId={career.id} label="Save role" />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-10">
          {career.overview && (
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground">The day to day</h2>
              <p className="mt-2 whitespace-pre-line text-[1.02rem] leading-relaxed text-foreground/90">
                {career.overview}
              </p>
            </section>
          )}
          {progression.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground">Progression</h2>
              <ol className="mt-4 space-y-3 border-l border-border pl-6">
                {progression.map((stage, i) => (
                  <li key={`${stage.title ?? stage.level ?? i}`} className="relative">
                    <span className="absolute -left-[1.9rem] mt-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                    <p className="font-display text-[0.975rem] font-semibold text-foreground">
                      {stage.title ?? stage.level ?? `Stage ${i + 1}`}
                      {stage.years && <span className="ml-2 font-mono text-xs text-muted-foreground">{stage.years}</span>}
                    </p>
                    {stage.focus && <p className="mt-1 text-sm text-muted-foreground">{stage.focus}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {lists.map((list) => (
            <div key={list.label} className="rounded-xl border border-border bg-card p-5">
              <p className="eyebrow text-secondary">{list.label}</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {list.items.map((item) => (
                  <Pill key={item}>{item}</Pill>
                ))}
              </div>
            </div>
          ))}
        </aside>
      </div>

      <ContinueExploring fromType="career" fromId={career.id} />
    </>
  );
}
