import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { MediaBlock } from "@/components/blocks/MediaBlock";
import { attachedSectionsQuery, categoryLabel } from "@/lib/sections";
import { detectKind, prettySize } from "@/lib/upload";
import { Pill } from "@/components/site/bits";

/**
 * Renders every upload pack an editor attached to this page — the videos, PDFs,
 * notebooks and interactive diagrams that belong to this exact roadmap, article
 * or manual — each one playable/readable inline.
 */
export function AttachedFiles({ entityType, slug }: { entityType: string; slug: string }) {
  const { data: sections } = useQuery(attachedSectionsQuery(entityType, slug));
  const packs = (sections ?? []).filter((section) => section.files.length > 0);
  if (packs.length === 0) return null;

  return (
    <section className="mt-14 border-t border-border pt-10">
      <p className="eyebrow text-primary">Files for this {entityType}</p>
      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
        Open it, watch it, play with it
      </h2>

      <div className="mt-8 space-y-12">
        {packs.map((section) => (
          <div key={section.id} className="rounded-3xl border border-border bg-card p-5 card-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <Pill>{categoryLabel(section.category)}</Pill>
                <h3 className="mt-2 font-display text-xl font-bold text-foreground">{section.title}</h3>
                {section.subtitle && <p className="mt-1 text-sm text-muted-foreground">{section.subtitle}</p>}
              </div>
              <Link
                to="/section/$slug"
                params={{ slug: section.slug }}
                className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Open pack <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 space-y-10">
              {section.files.map((file, index) => (
                <div key={file.id}>
                  <div className="flex flex-wrap items-baseline gap-2.5">
                    <span className="font-mono text-xs font-semibold text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h4 className="font-display text-base font-semibold text-foreground">{file.title}</h4>
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
                      {detectKind(file.title, file.mime ?? "")}
                      {prettySize(file.size) && ` · ${prettySize(file.size)}`}
                    </span>
                  </div>
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
          </div>
        ))}
      </div>
    </section>
  );
}
