import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, FileStack } from "lucide-react";
import { Pill } from "@/components/site/bits";
import { publishedSectionsQuery } from "@/lib/sections";
import { detectKind } from "@/lib/upload";

/**
 * Uploads an editor published into this category (roadmap, article, resource…)
 * shown as cards next to the hand-authored entries in the same listing.
 */
export function UploadedSections({
  category,
  title = "Uploaded by the Explorers team",
  description = "Files, diagrams and documents you can open and use right here.",
}: {
  category: string;
  title?: string;
  description?: string;
}) {
  const { data } = useQuery(publishedSectionsQuery(category));
  const sections = (data ?? []).filter((s) => s.files.length > 0);
  if (sections.length === 0) return null;

  return (
    <section className="mt-14 border-t border-border pt-10">
      <p className="eyebrow inline-flex items-center gap-2 text-primary">
        <FileStack className="h-3.5 w-3.5" aria-hidden /> {title}
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
        {description}
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const kinds = Array.from(new Set(section.files.map((f) => detectKind(f.title, f.mime ?? "")))).slice(0, 3);
          return (
            <Link
              key={section.id}
              to="/section/$slug"
              params={{ slug: section.slug }}
              className="hover-lift focus-ring group rounded-3xl border border-border bg-card p-5 card-soft"
            >
              <div className="flex flex-wrap items-center gap-2">
                {kinds.map((kind) => (
                  <Pill key={kind}>{kind}</Pill>
                ))}
                <Pill tone="primary">
                  {section.files.length} file{section.files.length === 1 ? "" : "s"}
                </Pill>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{section.title}</h3>
              {section.subtitle && (
                <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{section.subtitle}</p>
              )}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Open <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
