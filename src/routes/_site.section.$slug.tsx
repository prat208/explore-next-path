import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { MediaBlock } from "@/components/blocks/MediaBlock";
import { EmptyState, PageHeader, Pill } from "@/components/site/bits";
import { SECTION_CATEGORIES, categoryLabel, sectionQuery } from "@/lib/sections";
import { detectKind, prettySize } from "@/lib/upload";

export const Route = createFileRoute("/_site/section/$slug")({
  loader: async ({ context, params }) => {
    const section = await context.queryClient.ensureQueryData(sectionQuery(params.slug));
    if (!section) throw notFound();
    return { title: section.title, subtitle: section.subtitle };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable | Explorers" }, { name: "robots", content: "noindex" }] };
    }
    const description = loaderData.subtitle ?? `Open ${loaderData.title} — files, diagrams and documents you can use right here.`;
    return {
      meta: [
        { title: `${loaderData.title} | Explorers` },
        { name: "description", content: description },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: SectionPage,
});

function SectionPage() {
  const { slug } = Route.useParams();
  const section = useSuspenseQuery(sectionQuery(slug)).data;
  if (!section) return null;

  const listing = SECTION_CATEGORIES.find((c) => c.value === section.category);
  const single = section.files.length === 1;

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {listing && (
          <Link
            to={listing.listing}
            className="focus-ring inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> All {listing.label.toLowerCase()}s
          </Link>
        )}
        <p className="eyebrow mt-5 text-primary">{categoryLabel(section.category)}</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {section.title}
        </h1>
        {section.subtitle && <p className="mt-3 max-w-2xl text-base text-muted-foreground">{section.subtitle}</p>}
        {section.description && (
          <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-relaxed text-muted-foreground">
            {section.description}
          </p>
        )}
      </div>

      {section.files.length === 0 ? (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <EmptyState title="Nothing here yet" hint="Files for this section are on the way." />
        </div>
      ) : (
        <div className="mt-8 pb-16">
          {section.files.map((file) => (
            <section key={file.id} className="border-t border-border/70 pt-2 first:border-t-0">
              {!single && (
                <div className="mx-auto max-w-6xl px-4 pb-2 pt-6 sm:px-6">
                  <h2 className="font-display text-xl font-semibold text-foreground">{file.title}</h2>
                  {file.note && <p className="mt-1.5 text-sm text-muted-foreground">{file.note}</p>}
                </div>
              )}
              {single && file.note && (
                <p className="mx-auto max-w-6xl px-4 pb-4 text-sm text-muted-foreground sm:px-6">{file.note}</p>
              )}
              <InlineFile url={file.url} title={file.title} mime={file.mime} size={file.size} />
            </section>
          ))}
        </div>
      )}
    </>
  );
}

