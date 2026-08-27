import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { RoadmapEdge, RoadmapNode } from "@/lib/content";
import { slugify } from "@/lib/studio";
import { Field, inputClass } from "./fields";
import { RoadmapCanvas } from "@/components/roadmap/RoadmapCanvas";

export function RoadmapStructureEditor({ roadmapId }: { roadmapId: string }) {
  const [newTitle, setNewTitle] = useState("");
  const [source, setSource] = useState("");
  const [targetNode, setTargetNode] = useState("");
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes = useQuery({
    queryKey: ["studio-roadmap-nodes", roadmapId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roadmap_nodes")
        .select("*")
        .eq("roadmap_id", roadmapId)
        .order("sort");
      if (error) throw new Error(error.message);
      return (data ?? []) as RoadmapNode[];
    },
  });

  const edges = useQuery({
    queryKey: ["studio-roadmap-edges", roadmapId],
    queryFn: async () => {
      const { data, error } = await supabase.from("roadmap_edges").select("*").eq("roadmap_id", roadmapId);
      if (error) throw new Error(error.message);
      return (data ?? []) as RoadmapEdge[];
    },
  });

  async function addNode() {
    if (!newTitle.trim()) return;
    const { error } = await supabase.from("roadmap_nodes").insert({
      roadmap_id: roadmapId,
      title: newTitle.trim(),
      slug: slugify(newTitle),
      difficulty: "beginner",
      skills: [],
      group_label: "Core",
      sort: nodes.data?.length ?? 0,
      position_x: 0,
      position_y: (nodes.data?.length ?? 0) * 120,
    });
    if (error) toast.error(error.message);
    else {
      setNewTitle("");
      void nodes.refetch();
    }
  }

  async function saveNode(node: RoadmapNode) {
    const { error } = await supabase
      .from("roadmap_nodes")
      .update({
        title: node.title,
        slug: node.slug,
        description: node.description,
        difficulty: node.difficulty,
        estimated_hours: node.estimated_hours,
        skills: node.skills,
        group_label: node.group_label,
        sort: node.sort,
        video_url: node.video_url?.trim() ? node.video_url.trim() : null,
        video_title: node.video_title?.trim() ? node.video_title.trim() : null,
      })
      .eq("id", node.id);
    if (error) toast.error(error.message);
    else toast.success("Step saved");
  }

  async function removeNode(id: string) {
    await supabase.from("roadmap_edges").delete().or(`source_node_id.eq.${id},target_node_id.eq.${id}`);
    const { error } = await supabase.from("roadmap_nodes").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      void nodes.refetch();
      void edges.refetch();
    }
  }

  async function addEdge() {
    if (!source || !targetNode || source === targetNode) {
      toast.error("Pick two different steps");
      return;
    }
    const { error } = await supabase.from("roadmap_edges").insert({
      roadmap_id: roadmapId,
      source_node_id: source,
      target_node_id: targetNode,
      kind: "unlocks",
    });
    if (error) toast.error(error.message);
    else {
      setTargetNode("");
      void edges.refetch();
    }
  }

  async function moveNode(id: string, x: number, y: number) {
    const { error } = await supabase.from("roadmap_nodes").update({ position_x: x, position_y: y }).eq("id", id);
    if (error) toast.error(error.message);
  }

  const list = nodes.data ?? [];
  const nameOf = (id: string) => list.find((n) => n.id === id)?.title ?? id;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card">
        <header className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Diagram layout</h2>
          <p className="text-xs text-muted-foreground">
            Drag each step to arrange the clickable diagram readers see. Positions save automatically.
          </p>
        </header>
        <div className="px-5 py-5">
          <RoadmapCanvas
            nodes={list}
            edges={edges.data ?? []}
            selectedId={activeNode}
            onSelect={(node) => setActiveNode(node.id)}
            editable
            onMoveNode={(id, x, y) => void moveNode(id, x, y)}
            height={480}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card">
        <header className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Roadmap steps</h2>
          <p className="text-xs text-muted-foreground">
            Each step becomes an interactive node with skills and unlock connections.
          </p>
        </header>
        <div className="space-y-4 px-5 py-5">
          {list.map((node) => (
            <NodeCard key={node.id} node={node} onSave={saveNode} onDelete={removeNode} />
          ))}
          {!list.length && <p className="text-sm text-muted-foreground">No steps yet.</p>}
          <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-4">
            <Field label="New step title" className="min-w-64 flex-1">
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className={inputClass} />
            </Field>
            <button
              type="button"
              onClick={() => void addNode()}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
            >
              <Plus className="h-4 w-4" /> Add step
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card">
        <header className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Connections</h2>
          <p className="text-xs text-muted-foreground">Which step unlocks which — this draws the roadmap graph.</p>
        </header>
        <ul className="divide-y divide-border">
          {(edges.data ?? []).map((edge) => (
            <li key={edge.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm text-foreground">
              <span>
                {nameOf(edge.source_node_id)} <span className="text-primary">→</span> {nameOf(edge.target_node_id)}
              </span>
              <button
                type="button"
                aria-label="Remove connection"
                onClick={async () => {
                  await supabase.from("roadmap_edges").delete().eq("id", edge.id);
                  void edges.refetch();
                }}
                className="focus-ring rounded-md border border-border p-1.5 text-destructive hover:border-destructive/50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          {edges.data?.length === 0 && <li className="px-5 py-4 text-sm text-muted-foreground">No connections yet.</li>}
        </ul>
        <div className="grid gap-3 border-t border-border px-5 py-4 sm:grid-cols-3">
          <select value={source} onChange={(e) => setSource(e.target.value)} className={inputClass}>
            <option value="">From step…</option>
            {list.map((node) => (
              <option key={node.id} value={node.id}>
                {node.title}
              </option>
            ))}
          </select>
          <select value={targetNode} onChange={(e) => setTargetNode(e.target.value)} className={inputClass}>
            <option value="">Unlocks step…</option>
            {list.map((node) => (
              <option key={node.id} value={node.id}>
                {node.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void addEdge()}
            className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
          >
            <Plus className="h-4 w-4" /> Connect
          </button>
        </div>
      </section>
    </div>
  );
}

function NodeCard({
  node,
  onSave,
  onDelete,
}: {
  node: RoadmapNode;
  onSave: (node: RoadmapNode) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(node);
  const set = (patch: Partial<RoadmapNode>) => setDraft((prev) => ({ ...prev, ...patch }));

  return (
    <article className="rounded-lg border border-border bg-background/60 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input value={draft.title} onChange={(e) => set({ title: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Slug">
          <input
            value={draft.slug}
            onChange={(e) => set({ slug: e.target.value })}
            className={`${inputClass} font-mono text-[0.82rem]`}
          />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <textarea
            rows={2}
            value={draft.description ?? ""}
            onChange={(e) => set({ description: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Group label" hint="e.g. Foundations, Core, Specialisation">
          <input
            value={draft.group_label ?? ""}
            onChange={(e) => set({ group_label: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Difficulty">
          <select
            value={draft.difficulty}
            onChange={(e) => set({ difficulty: e.target.value as RoadmapNode["difficulty"] })}
            className={inputClass}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </Field>
        <Field label="Estimated hours">
          <input
            type="number"
            value={draft.estimated_hours ?? ""}
            onChange={(e) => set({ estimated_hours: e.target.value === "" ? null : Number(e.target.value) })}
            className={inputClass}
          />
        </Field>
        <Field label="Order">
          <input
            type="number"
            value={draft.sort}
            onChange={(e) => set({ sort: Number(e.target.value) })}
            className={inputClass}
          />
        </Field>
        <Field label="YouTube video link" hint="Paste any youtube.com or youtu.be URL" className="sm:col-span-2">
          <input
            value={draft.video_url ?? ""}
            onChange={(e) => set({ video_url: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
            className={`${inputClass} font-mono text-[0.82rem]`}
          />
        </Field>
        <Field label="Video label" hint="Optional title shown above the player" className="sm:col-span-2">
          <input
            value={draft.video_title ?? ""}
            onChange={(e) => set({ video_title: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Skills" hint="One per line" className="sm:col-span-2">
          <textarea
            rows={3}
            value={(draft.skills ?? []).join("\n")}
            onChange={(e) => set({ skills: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
            className={`${inputClass} font-mono text-[0.82rem]`}
          />
        </Field>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => void onSave(draft)}
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:border-primary/50"
        >
          <Save className="h-3.5 w-3.5" /> Save step
        </button>
        <button
          type="button"
          onClick={() => void onDelete(node.id)}
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-destructive hover:border-destructive/50"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    </article>
  );
}
