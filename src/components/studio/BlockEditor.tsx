import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ContentBlock } from "@/lib/content";
import type { StudioField } from "@/lib/studio";
import { FieldInput, JsonField } from "./fields";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { AiBlockAssistant } from "./AiAssist";

type Draft = { key: string; type: string; data: Record<string, unknown> };

type BlockSpec = { type: string; label: string; group: string; fields: StudioField[] };

const f = (name: string, label: string, kind: StudioField["kind"], extra: Partial<StudioField> = {}): StudioField => ({
  name,
  label,
  kind,
  full: true,
  ...extra,
});

export const BLOCK_SPECS: BlockSpec[] = [
  { type: "paragraph", label: "Paragraph", group: "Writing", fields: [f("text", "Text", "textarea", { rows: 5 })] },
  {
    type: "heading",
    label: "Heading",
    group: "Writing",
    fields: [
      f("text", "Heading", "text"),
      f("level", "Level", "select", {
        full: false,
        options: [
          { value: "2", label: "H2" },
          { value: "3", label: "H3" },
        ],
      }),
    ],
  },
  {
    type: "list",
    label: "List",
    group: "Writing",
    fields: [
      f("items", "Items", "array", { rows: 5 }),
      f("ordered", "Numbered", "boolean", { full: false }),
    ],
  },
  { type: "quote", label: "Quote", group: "Writing", fields: [f("text", "Quote", "textarea"), f("attribution", "Attribution", "text")] },
  { type: "divider", label: "Divider", group: "Writing", fields: [] },
  {
    type: "image",
    label: "Image",
    group: "Media",
    fields: [f("url", "Image file or URL", "upload"), f("alt", "Alt text", "text"), f("caption", "Caption", "text")],
  },
  {
    type: "media",
    label: "Upload anything (video, PDF, audio, notebook, image…)",
    group: "Media",
    fields: [
      f("url", "File or link", "upload"),
      f("title", "What is this?", "text", { full: false }),
      f("kind", "Force a presentation", "select", {
        full: false,
        options: [
          { value: "", label: "Auto-detect (recommended)" },
          { value: "video", label: "Video player + chapters" },
          { value: "audio", label: "Audio player" },
          { value: "pdf", label: "Document reader" },
          { value: "image", label: "Visual" },
          { value: "code", label: "Source viewer" },
          { value: "notebook", label: "Notebook viewer" },
          { value: "link", label: "Download card" },
        ],
      }),
      f("chapters", "Chapters / sections", "array", {
        rows: 5,
        hint: 'One per line, e.g. "1:20 Why embeddings matter" — clicking one jumps the player there',
      }),
      f("takeaways", "What to take away", "array", { rows: 4 }),
      f("caption", "Caption", "text"),
      f("note", "Guidance note", "textarea", { rows: 2 }),
    ],
  },
  {
    type: "embed",
    label: "Interactive file / diagram (your own HTML)",
    group: "Media",
    fields: [
      f("title", "Panel label", "text", { full: false }),
      f("height", "Minimum height (px)", "number", { full: false }),
      f("html", "Your HTML file or markup", "html", { rows: 14 }),
      f("url", "…or embed a live URL instead", "text"),
      f("caption", "Caption", "text"),
    ],
  },
  {
    type: "code",
    label: "Code",
    group: "Technical",
    fields: [
      f("language", "Language", "text", { full: false }),
      f("code", "Code", "textarea", { rows: 8 }),
      f("output", "Output", "text"),
    ],
  },
  { type: "terminal", label: "Terminal", group: "Technical", fields: [f("code", "Commands", "textarea", { rows: 5 })] },
  {
    type: "definition",
    label: "Definition",
    group: "Learning",
    fields: [f("term", "Term", "text"), f("text", "Definition", "textarea")],
  },
  {
    type: "checklist",
    label: "Checklist",
    group: "Learning",
    fields: [f("title", "Title", "text"), f("items", "Items", "array", { rows: 5 })],
  },
  {
    type: "quiz",
    label: "Quiz question",
    group: "Learning",
    fields: [
      f("question", "Question", "textarea", { rows: 2 }),
      f("options", "Options", "array", { rows: 4 }),
      f("correctIndex", "Correct option (0-based)", "number", { full: false }),
      f("explanation", "Explanation", "textarea", { rows: 2 }),
    ],
  },
  {
    type: "steps",
    label: "Steps",
    group: "Learning",
    fields: [f("items", "Steps", "json", { rows: 8, hint: '[{ "title": "Install", "text": "…" }]' })],
  },
  {
    type: "timeline",
    label: "Timeline",
    group: "Editorial",
    fields: [f("events", "Events", "json", { rows: 8, hint: '[{ "date": "2024", "title": "…", "text": "…" }]' })],
  },
  {
    type: "comparison",
    label: "Comparison table",
    group: "Editorial",
    fields: [
      f("attributes", "Columns", "array", { rows: 3 }),
      f("items", "Rows", "json", { rows: 8, hint: '[{ "name": "Option A", "values": ["…", "…"] }]' }),
    ],
  },
  {
    type: "stats",
    label: "Stats",
    group: "Editorial",
    fields: [f("items", "Stats", "json", { rows: 6, hint: '[{ "value": "42%", "label": "…" }]' })],
  },
  {
    type: "faq",
    label: "FAQ",
    group: "Editorial",
    fields: [f("items", "Questions", "json", { rows: 8, hint: '[{ "question": "…", "answer": "…" }]' })],
  },
  ...["key-takeaway", "tip", "callout", "warning", "common-mistake", "analogy"].map((type) => ({
    type,
    label: type.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase()),
    group: "Callouts",
    fields: [f("title", "Title", "text"), f("text", "Text", "textarea", { rows: 3 }), f("label", "Custom label", "text")],
  })),
];

const SPEC_BY_TYPE = new Map(BLOCK_SPECS.map((spec) => [spec.type, spec]));

function toDraft(block: ContentBlock): Draft {
  return { key: block.id, type: block.type, data: (block.data ?? {}) as Record<string, unknown> };
}

export function BlockEditor({ ownerType, ownerId }: { ownerType: string; ownerId: string }) {
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState("paragraph");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["studio-blocks", ownerType, ownerId],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("content_blocks")
        .select("*")
        .eq("owner_type", ownerType)
        .eq("owner_id", ownerId)
        .order("position");
      if (error) throw new Error(error.message);
      return (rows ?? []) as ContentBlock[];
    },
  });

  useEffect(() => {
    if (data) setDrafts(data.map(toDraft));
  }, [data]);

  const groups = useMemo(() => {
    const map = new Map<string, BlockSpec[]>();
    for (const spec of BLOCK_SPECS) {
      const list = map.get(spec.group) ?? [];
      list.push(spec);
      map.set(spec.group, list);
    }
    return [...map.entries()];
  }, []);

  const list = drafts ?? [];

  const update = (index: number, next: Partial<Draft>) =>
    setDrafts((prev) => (prev ?? []).map((d, i) => (i === index ? { ...d, ...next } : d)));

  const move = (index: number, dir: -1 | 1) =>
    setDrafts((prev) => {
      const next = [...(prev ?? [])];
      const target = index + dir;
      if (target < 0 || target >= next.length) return next;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item!);
      return next;
    });

  const add = () =>
    setDrafts((prev) => [
      ...(prev ?? []),
      { key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type: adding, data: {} },
    ]);

  async function save() {
    setSaving(true);
    try {
      const { error: delError } = await supabase
        .from("content_blocks")
        .delete()
        .eq("owner_type", ownerType)
        .eq("owner_id", ownerId);
      if (delError) throw new Error(delError.message);
      if (list.length) {
        const { error } = await supabase.from("content_blocks").insert(
          list.map((draft, index) => ({
            owner_type: ownerType,
            owner_id: ownerId,
            position: index,
            type: draft.type,
            data: draft.data as never,
          })),
        );
        if (error) throw new Error(error.message);
      }
      await refetch();
      toast.success("Body saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save body");
    } finally {
      setSaving(false);
    }
  }

  const previewBlocks: ContentBlock[] = list.map((draft, index) => ({
    id: draft.key,
    owner_type: ownerType,
    owner_id: ownerId,
    position: index,
    type: draft.type,
    data: draft.data as never,
    created_at: new Date().toISOString(),
  }));

  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Body blocks</h2>
          <p className="text-xs text-muted-foreground">
            {list.length} block{list.length === 1 ? "" : "s"} · interactive components render exactly as readers see them
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:border-primary/50"
          >
            {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="focus-ring rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save body"}
          </button>
        </div>
      </header>

      {isLoading && <p className="px-5 py-6 text-sm text-muted-foreground">Loading blocks…</p>}

      {!isLoading && preview && (
        <div className="px-5 py-6">
          <BlockRenderer blocks={previewBlocks} />
          {!list.length && <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>}
        </div>
      )}

      {!isLoading && !preview && (
        <div className="space-y-4 px-5 py-5">
          <AiBlockAssistant
            onInsert={(blocks) =>
              setDrafts((prev) => [
                ...(prev ?? []),
                ...blocks.map((block, i) => ({
                  key: `ai-${Date.now()}-${i}`,
                  type: block.type,
                  data: block.data as Record<string, unknown>,
                })),
              ])
            }
          />
          {list.map((draft, index) => {
            const spec = SPEC_BY_TYPE.get(draft.type);
            return (
              <article key={draft.key} className="rounded-lg border border-border bg-background/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-secondary">
                    {index + 1}. {spec?.label ?? draft.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <IconButton label="Move up" onClick={() => move(index, -1)}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton label="Move down" onClick={() => move(index, 1)}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton
                      label="Delete block"
                      onClick={() => setDrafts((prev) => (prev ?? []).filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </IconButton>
                  </div>
                </div>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {spec ? (
                    spec.fields.map((field) => (
                      <FieldInput
                        key={field.name}
                        field={field}
                        value={draft.data[field.name]}
                        onChange={(next) => update(index, { data: { ...draft.data, [field.name]: next } })}
                      />
                    ))
                  ) : (
                    <JsonField
                      label="Raw data"
                      className="sm:col-span-2"
                      value={draft.data}
                      onChange={(next) =>
                        update(index, { data: (next ?? {}) as Record<string, unknown> })
                      }
                    />
                  )}
                </div>
              </article>
            );
          })}

          <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-4">
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Add block
              <select
                value={adding}
                onChange={(e) => setAdding(e.target.value)}
                className="focus-ring mt-1.5 block rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground"
              >
                {groups.map(([group, specs]) => (
                  <optgroup key={group} label={group}>
                    {specs.map((spec) => (
                      <option key={spec.type} value={spec.type}>
                        {spec.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={add}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:border-primary/50"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="focus-ring rounded-md border border-border p-1.5 text-muted-foreground hover:border-primary/50 hover:text-foreground"
    >
      {children}
    </button>
  );
}
