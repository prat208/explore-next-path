import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { RELATION_SECTIONS, relatedQuery, type RelatedItem } from "@/lib/content";
import { Pill } from "./bits";

const ORDER: string[] = RELATION_SECTIONS.map((r) => r.relation);
const TITLES = new Map<string, string>(RELATION_SECTIONS.map((r) => [r.relation, r.title]));


/**
 * The knowledge-graph footer that every content page ends with:
 * understand it → learn it → use it → build it → go deeper → career.
 */
export function ContinueExploring({
  fromType,
  fromId,
  heading = "Continue exploring",
}: {
  fromType: string;
  fromId: string;
  heading?: string;
}) {
  const { data } = useQuery(relatedQuery(fromType, fromId));
  const items = data ?? [];
  if (items.length === 0) return null;

  const groups = new Map<string, RelatedItem[]>();
  for (const item of items) {
    groups.set(item.relation, [...(groups.get(item.relation) ?? []), item]);
  }
  const rank = (relation: string) => {
    const i = ORDER.indexOf(relation);
    return i === -1 ? ORDER.length : i;
  };
  const ordered = [...groups.entries()].sort((a, b) => rank(a[0]) - rank(b[0]));


  return (
    <section className="border-t border-border bg-surface/25">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="eyebrow text-primary">The map continues</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">{heading}</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Nothing here is a dead end. Pick the next step that matches what you want to do.
        </p>

        <div className="mt-8 space-y-8">
          {ordered.map(([relation, group]) => (
            <div key={relation}>
              <h3 className="eyebrow text-secondary">{TITLES.get(relation) ?? relation}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    to={item.href}
                    className="hover-lift focus-ring group rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Pill>{item.type.replace("_", " ")}</Pill>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                    </div>
                    <p className="mt-3 font-display text-base font-semibold leading-snug text-foreground">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{item.subtitle}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
