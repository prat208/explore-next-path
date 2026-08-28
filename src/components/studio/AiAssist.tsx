import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateContentBlocks, generateRoadmapPlan, type AiBlock, type AiRoadmapPlan } from "@/lib/ai.functions";
import { RoadmapCanvas } from "@/components/roadmap/RoadmapCanvas";
import type { RoadmapEdge, RoadmapNode } from "@/lib/content";
import { Field, inputClass } from "./fields";

function PromptShell({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** AI panel that drafts interactive body blocks for an article or lesson. */
export function AiBlockAssistant({ onInsert }: { onInsert: (blocks: AiBlock[]) => void }) {
  const run = useServerFn(generateContentBlocks);
  const [prompt, setPrompt] = useState("");
  const [audience, setAudience] = useState("");
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (prompt.trim().length < 3) return;
    setBusy(true);
    try {
      const blocks = await run({
        data: { prompt: prompt.trim(), ...(audience.trim() ? { audience: audience.trim() } : {}) },
      });
      if (!blocks.length) throw new Error("The AI returned no blocks. Try a more specific prompt.");
      onInsert(blocks);
      toast.success(`${blocks.length} interactive blocks added — edit anything you like.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI draft failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PromptShell
      title="Draft with AI"
      hint="Describe the piece — you get paragraphs plus quizzes, comparisons, timelines and checklists you can edit."
    >
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <Field label="What should this cover?">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="How retrieval-augmented generation actually works, with a comparison of vector databases"
            className={inputClass}
          />
        </Field>
        <Field label="Audience (optional)">
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Undergraduate students, no ML background"
            className={inputClass}
          />
        </Field>
      </div>
      <button
        type="button"
        onClick={() => void generate()}
        disabled={busy}
        className="focus-ring mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
        {busy ? "Drafting…" : "Generate blocks"}
      </button>
    </PromptShell>
  );
}

/** AI panel that designs a clickable tree diagram of nodes + connections. */
export function AiRoadmapAssistant({
  roadmapId,
  onInserted,
}: {
  roadmapId: string;
  onInserted: () => void;
}) {
  const run = useServerFn(generateRoadmapPlan);
  const [prompt, setPrompt] = useState("");
  const [audience, setAudience] = useState("");
  const [busy, setBusy] = useState(false);
  const [inserting, setInserting] = useState(false);
  const [plan, setPlan] = useState<AiRoadmapPlan | null>(null);

  async function generate() {
    if (prompt.trim().length < 3) return;
    setBusy(true);
    try {
      const result = await run({
        data: { prompt: prompt.trim(), ...(audience.trim() ? { audience: audience.trim() } : {}) },
      });
      if (!result.nodes.length) throw new Error("The AI returned no steps. Try again.");
      setPlan(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI draft failed");
    } finally {
      setBusy(false);
    }
  }

  async function insert(replace: boolean) {
    if (!plan) return;
    setInserting(true);
    try {
      if (replace) {
        await supabase.from("roadmap_edges").delete().eq("roadmap_id", roadmapId);
        await supabase.from("roadmap_nodes").delete().eq("roadmap_id", roadmapId);
      }
      const { data: inserted, error } = await supabase
        .from("roadmap_nodes")
        .insert(
          plan.nodes.map((node, index) => ({
            roadmap_id: roadmapId,
            title: node.title,
            slug: `${node.slug}-${Math.random().toString(36).slice(2, 6)}`,
            description: node.description,
            difficulty: node.difficulty,
            estimated_hours: node.estimated_hours,
            skills: node.skills,
            group_label: node.group_label,
            sort: index,
            position_x: node.position_x,
            position_y: node.position_y,
            video_title: node.video_query ? `Watch: ${node.video_query}` : null,
            video_url: null,
          })),
        )
        .select("id, title");
      if (error) throw new Error(error.message);

      const idByTitle = new Map((inserted ?? []).map((row) => [row.title, row.id]));
      const edgeRows = plan.edges
        .map((edge) => ({
          roadmap_id: roadmapId,
          source_node_id: idByTitle.get(edge.source),
          target_node_id: idByTitle.get(edge.target),
          kind: (edge.label || "unlocks").trim().slice(0, 24),
        }))
        .filter((row) => row.source_node_id && row.target_node_id);
      if (edgeRows.length) {
        const { error: edgeError } = await supabase.from("roadmap_edges").insert(edgeRows as never);
        if (edgeError) throw new Error(edgeError.message);
      }

      toast.success(`Diagram created — ${plan.nodes.length} steps, ${edgeRows.length} connections.`);
      setPlan(null);
      setPrompt("");
      onInserted();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not insert the diagram");
    } finally {
      setInserting(false);
    }
  }

  const previewNodes: RoadmapNode[] = (plan?.nodes ?? []).map((node, index) => ({
    id: `preview-${index}`,
    roadmap_id: roadmapId,
    title: node.title,
    slug: node.slug,
    description: node.description,
    difficulty: node.difficulty,
    estimated_hours: node.estimated_hours,
    skills: node.skills,
    group_label: node.group_label,
    sort: index,
    position_x: node.position_x,
    position_y: node.position_y,
    video_url: null,
    video_title: node.video_query,
    created_at: new Date().toISOString(),
  })) as RoadmapNode[];

  const previewEdges: RoadmapEdge[] = (plan?.edges ?? [])
    .map((edge, index) => {
      const source = plan?.nodes.findIndex((n) => n.title === edge.source) ?? -1;
      const target = plan?.nodes.findIndex((n) => n.title === edge.target) ?? -1;
      return {
        id: `preview-edge-${index}`,
        roadmap_id: roadmapId,
        source_node_id: `preview-${source}`,
        target_node_id: `preview-${target}`,
        kind: (edge.label || "unlocks").trim().slice(0, 24),
      } as RoadmapEdge;
    })
    .filter((edge) => !edge.source_node_id.endsWith("--1") && !edge.target_node_id.endsWith("--1"));

  return (
    <PromptShell
      title="Generate a clickable tree diagram with AI"
      hint="Describe the roadmap. You get branching nodes, connections, skills, hours and a suggested video topic per step."
    >
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <Field label="Roadmap topic">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Becoming an AI engineer in 2026 — branch into data science first, generative AI first, or both"
            className={inputClass}
          />
        </Field>
        <Field label="Audience (optional)">
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Final-year CS students in India"
            className={inputClass}
          />
        </Field>
      </div>
      <button
        type="button"
        onClick={() => void generate()}
        disabled={busy}
        className="focus-ring mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
        {busy ? "Designing diagram…" : "Generate diagram"}
      </button>

      {plan && (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-muted-foreground">
            Draft: <span className="font-semibold text-foreground">{plan.title}</span> · {plan.nodes.length} steps ·{" "}
            {previewEdges.length} connections
          </p>
          <RoadmapCanvas nodes={previewNodes} edges={previewEdges} selectedId={null} height={420} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void insert(false)}
              disabled={inserting}
              className="focus-ring rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-60"
            >
              {inserting ? "Adding…" : "Add to roadmap"}
            </button>
            <button
              type="button"
              onClick={() => void insert(true)}
              disabled={inserting}
              className="focus-ring rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/50 disabled:opacity-60"
            >
              Replace existing steps
            </button>
            <button
              type="button"
              onClick={() => setPlan(null)}
              className="focus-ring rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </PromptShell>
  );
}
