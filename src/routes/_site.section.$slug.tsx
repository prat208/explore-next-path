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

  return (
    <>
      <PageHeader eyebrow={categoryLabel(section.category)} title={section.title} description={section.subtitle ?? "Files, diagrams and documents you can open right here."} />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {listing && (
          <Link
            to={listing.listing}
            className="focus-ring inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> All {listing.label.toLowerCase()}s
          </Link>
        )}

        {section.description && (
          <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-muted-foreground">{section.description}</p>
        )}

        {section.files.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="Nothing here yet" hint="Files for this section are on the way." />
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {section.files.map((file, index) => (
              <div key={file.id}>
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <span className="font-mono text-xs font-semibold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-lg font-semibold text-foreground">{file.title}</h2>
                  <Pill>
                    {detectKind(file.title, file.mime ?? "")}
                    {prettySize(file.size) && ` · ${prettySize(file.size)}`}
                  </Pill>
                </div>
                {file.note && <p className="mt-2 text-sm text-muted-foreground">{file.note}</p>}
                <MediaBlock
                  data={{
                    url: file.url,
                    title: file.title,
                    name: file.title,
                    mime: file.mime ?? "",
                    size: file.size ?? 0,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
