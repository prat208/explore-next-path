import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { MediaBlock } from "@/components/blocks/MediaBlock";
import { categoryLabel, sectionQuery } from "@/lib/sections";
import { EmptyState, PageHeader, Pill } from "@/components/site/bits";
import { detectKind, prettySize } from "@/lib/upload";

export const Route = createFileRoute("/_site/files/$slug")({
  loader: async ({ context, params }) => {
    const section = await context.queryClient.ensureQueryData(sectionQuery(params.slug));
    if (!section) throw notFound();
    return section;
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title ?? "File pack";
    const description =
      loaderData?.subtitle ??
      `Videos, PDFs, notebooks and interactive diagrams for ${title} on Explorers.`;
    return {
      meta: [
        { title: `${title} — files | Explorers` },
        { name: "description", content: description },
        { property: "og:title", content: `${title} — files` },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: SectionPage,
});

function SectionPage() {
  const { slug } = useParams({ from: "/_site/files/$slug" });
  const { data: section } = useSuspenseQuery(sectionQuery(slug));

  if (!section) return <EmptyState title="Pack not found" hint="This file pack may have been removed." />;

  return (
    <div>
      <PageHeader eyebrow={categoryLabel(section.category)} title={section.title} description={section.subtitle ?? undefined}>
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {section.files.length} file{section.files.length === 1 ? "" : "s"} ·{" "}
          {prettySize(section.files.reduce((sum, file) => sum + (file.size ?? 0), 0)) || "ready to explore"}
        </p>
      </PageHeader>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link
          to="/files"
          className="focus-ring inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All packs
        </Link>

        {section.description && (
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">{section.description}</p>
        )}

        {section.files.length === 0 ? (
          <div className="mt-10">
            <EmptyState title="Nothing in this pack yet" hint="Files are being added." />
          </div>
        ) : (
          <ol className="mt-10 space-y-14">
            {section.files.map((file, index) => (
              <li key={file.id} id={`file-${index + 1}`}>
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-xl font-bold text-foreground">{file.title}</h2>
                  <Pill>{detectKind(file.title, file.mime ?? "")}</Pill>
                </div>
                {file.note && <p className="mt-2 pl-11 text-sm text-muted-foreground">{file.note}</p>}
                <MediaBlock
                  data={{
                    url: file.url,
                    title: file.title,
                    name: file.title,
                    mime: file.mime ?? "",
                    size: file.size ?? 0,
                  }}
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
