import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  COLLECTIONS,
  deleteRecord,
  emptyRecord,
  getRecord,
  insertRecord,
  normalizeForSave,
  slugify,
  updateRecord,
} from "@/lib/studio";
import { FieldInput } from "@/components/studio/fields";
import { BlockEditor } from "@/components/studio/BlockEditor";
import { RelationEditor } from "@/components/studio/RelationEditor";
import { RoadmapStructureEditor } from "@/components/studio/RoadmapStructureEditor";
import { LessonsEditor } from "@/components/studio/LessonsEditor";

export const Route = createFileRoute("/_site/studio/$collection/$id")({
  component: RecordEditor,
});

function RecordEditor() {
  const { collection: key, id } = useParams({ from: "/_site/studio/$collection/$id" });
  const navigate = useNavigate();
  const collection = COLLECTIONS[key];
  const isNew = id === "new";

  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  const record = useQuery({
    queryKey: ["studio-record", key, id],
    enabled: Boolean(collection) && !isNew,
    queryFn: () => getRecord(collection!, id),
  });

  useEffect(() => {
    if (!collection) return;
    if (isNew) setDraft(emptyRecord(collection));
    else if (record.data) setDraft({ ...record.data });
  }, [collection, isNew, record.data]);

  if (!collection) return <p className="text-sm text-muted-foreground">Unknown collection “{key}”.</p>;
  if (!draft) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const set = (name: string, value: unknown) =>
    setDraft((prev) => {
      const next = { ...(prev ?? {}), [name]: value };
      if (
        (name === "title" || name === "name") &&
        typeof value === "string" &&
        (!prev?.['slug'] || prev['slug'] === slugify(String(prev[name] ?? "")))
      ) {
        next['slug'] = slugify(value);
      }
      return next;
    });

  async function save() {
    setSaving(true);
    try {
      const values = normalizeForSave(collection!, draft!);
      if (!values['slug']) values['slug'] = slugify(String(values[collection!.titleField] ?? "untitled"));
      if (isNew) {
        const created = await insertRecord(collection!.table, values);
        toast.success(`${collection!.singular} created`);
        void navigate({ to: "/studio/$collection/$id", params: { collection: key, id: created.id } });
      } else {
        await updateRecord(collection!.table, id, values);
        toast.success("Saved");
        void record.refetch();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await deleteRecord(collection!.table, id);
      toast.success("Deleted");
      void navigate({ to: "/studio/$collection", params: { collection: key } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete");
    }
  }

  const title = String(draft[collection.titleField] ?? "") || `New ${collection.singular.toLowerCase()}`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/studio/$collection"
          params={{ collection: key }}
          className="focus-ring inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {collection.label}
        </Link>
        <div className="flex items-center gap-2">
          {!isNew && collection.viewTo && draft['slug'] ? (
            <a
              href={`${collection.viewTo}/${String(draft['slug'])}`}
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:border-primary/50"
            >
              View live <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
          {!isNew && (
            <button
              type="button"
              onClick={() => void remove()}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-destructive hover:border-destructive/50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving…" : isNew ? "Create" : "Save"}
          </button>
        </div>
      </div>

      <h1 className="mt-4 font-display text-2xl font-bold text-foreground">{title}</h1>

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {collection.fields.map((field) => (
            <FieldInput
              key={field.name}
              field={field}
              value={draft[field.name]}
              onChange={(next) => set(field.name, next)}
            />
          ))}
        </div>
      </section>

      {!isNew && (
        <div className="mt-8 space-y-8">
          {collection.blockOwner && <BlockEditor ownerType={collection.blockOwner} ownerId={id} />}
          {collection.structure === "roadmap" && <RoadmapStructureEditor roadmapId={id} />}
          {collection.structure === "lessons" && <LessonsEditor pathId={id} />}
          {collection.entity && <RelationEditor fromType={collection.entity} fromId={id} />}
        </div>
      )}
    </>
  );
}
