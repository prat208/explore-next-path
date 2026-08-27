import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { COLLECTIONS, listRecords } from "@/lib/studio";
import { Pill } from "@/components/site/bits";

export const Route = createFileRoute("/_site/studio/$collection/")({
  component: CollectionList,
});

function CollectionList() {
  const { collection: key } = useParams({ from: "/_site/studio/$collection/" });
  const collection = COLLECTIONS[key];

  const records = useQuery({
    queryKey: ["studio-list", key],
    enabled: Boolean(collection),
    queryFn: () => listRecords(collection!),
  });

  if (!collection)
    return <p className="text-sm text-muted-foreground">Unknown collection “{key}”.</p>;

  const rows = records.data ?? [];

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{collection.label}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {rows.length} record{rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          to="/studio/$collection/$id"
          params={{ collection: key, id: "new" }}
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
        >
          <Plus className="h-4 w-4" /> New {collection.singular.toLowerCase()}
        </Link>
      </header>

      <ul className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {records.isLoading && <li className="px-4 py-6 text-sm text-muted-foreground">Loading…</li>}
        {rows.map((row) => {
          const title = String(row[collection.titleField] ?? "Untitled");
          const status = row['status'] as string | undefined;
          return (
            <li key={row.id}>
              <Link
                to="/studio/$collection/$id"
                params={{ collection: key, id: row.id }}
                className="focus-ring flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 hover:bg-surface/50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">{title}</span>
                  {row['slug'] ? (
                    <span className="block font-mono text-[0.72rem] text-muted-foreground">/{String(row['slug'])}</span>
                  ) : null}
                </span>
                {status && (
                  <Pill tone={status === "published" ? "success" : status === "draft" ? "muted" : "primary"}>
                    {status}
                  </Pill>
                )}
              </Link>
            </li>
          );
        })}
        {!records.isLoading && rows.length === 0 && (
          <li className="px-4 py-6 text-sm text-muted-foreground">Nothing here yet — create the first one.</li>
        )}
      </ul>
    </>
  );
}
