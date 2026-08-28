import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Clock, ExternalLink } from "lucide-react";
import { articleQuery } from "@/lib/content";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { ContinueExploring } from "@/components/site/ContinueExploring";
import { AttachedFiles } from "@/components/site/AttachedFiles";
import { SaveButton } from "@/components/site/SaveButton";
import { Pill } from "@/components/site/bits";

export const Route = createFileRoute("/_site/articles/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    if (!data) throw notFound();
    return { title: data.article.seo_title ?? data.article.title, description: data.article.seo_description ?? data.article.excerpt };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article unavailable | Explorers" }, { name: "robots", content: "noindex" }] };
    }
    const description = loaderData.description ?? "An Explorers article on AI and technology.";
    return {
      meta: [
        { title: `${loaderData.title} | Explorers` },
        { name: "description", content: description },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const data = useSuspenseQuery(articleQuery(slug)).data;
  if (!data) return null;
  const { article, blocks, author } = data;
  const sources = Array.isArray(article.sources) ? (article.sources as Record<string, string>[]) : [];

  return (
    <>
      <article>
        <header className="topo border-b border-border bg-surface/30">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="primary">{article.category}</Pill>
              <Pill>{article.level}</Pill>
              <Pill>
                <Clock className="mr-1.5 h-3 w-3" aria-hidden />
                {article.reading_minutes} min
              </Pill>
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-[2.75rem]">
              {article.title}
            </h1>
            {article.subtitle && (
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{article.subtitle}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
              <div>
                {author && (
                  <p className="text-sm font-medium text-foreground">
                    {author.name}
                    {author.role_title && (
                      <span className="text-muted-foreground"> · {author.role_title}</span>
                    )}
                  </p>
                )}
                {article.published_at && (
                  <p className="eyebrow mt-1 text-muted-foreground">
                    {new Date(article.published_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
              <SaveButton itemType="article" itemId={article.id} label="Save article" />
            </div>
          </div>
        </header>

        {article.why_it_matters && (
          <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
            <div className="rounded-xl border border-primary/30 bg-primary/[0.06] px-5 py-4">
              <p className="eyebrow text-primary">Why it matters</p>
              <p className="mt-2 text-[0.975rem] leading-relaxed text-foreground/90">
                {article.why_it_matters}
              </p>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-3xl px-4 pb-14 pt-4 sm:px-6">
          <BlockRenderer blocks={blocks} />

          {article.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
              {article.tags.map((tag) => (
                <Link key={tag} to="/search" search={{ q: tag }} className="focus-ring">
                  <Pill>#{tag}</Pill>
                </Link>
              ))}
            </div>
          )}

          {sources.length > 0 && (
            <section className="mt-8 rounded-xl border border-border bg-surface/50 px-5 py-4">
              <h2 className="eyebrow text-secondary">Sources</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {sources.map((source, i) => (
                  <li key={i}>
                    <a
                      href={source["url"] ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="focus-ring inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      {source["title"] ?? source["url"]}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>

      <AttachedFiles entityType="article" slug={article.slug} />
      <ContinueExploring fromType="article" fromId={article.id} />
    </>
  );
}
