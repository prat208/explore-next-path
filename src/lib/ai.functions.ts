import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { BLOCKS_SYSTEM, ROADMAP_SYSTEM, chatJson, slug } from "./ai.server";

export type AiRoadmapNode = {
  title: string;
  slug: string;
  description: string;
  group_label: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_hours: number;
  skills: string[];
  depth: number;
  branch: number;
  video_query: string;
  position_x: number;
  position_y: number;
};

export type AiRoadmapPlan = {
  title: string;
  description: string;
  nodes: AiRoadmapNode[];
  edges: { source: string; target: string; label: string }[];
};

export type AiBlock = { type: string; data: Record<string, unknown> };

const promptSchema = z.object({
  prompt: z.string().min(3).max(600),
  audience: z.string().max(200).optional(),
});

async function assertEditor(supabase: {
  from: (table: "user_roles") => {
    select: (cols: string) => { eq: (col: string, value: string) => Promise<{ data: { role: string }[] | null }> };
  };
}, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((row) => row.role);
  if (!roles.some((role) => ["editor", "admin", "super_admin"].includes(role))) {
    throw new Error("Only editors can use the Studio AI assistant.");
  }
}

export const generateRoadmapPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => promptSchema.parse(data))
  .handler(async ({ data, context }): Promise<AiRoadmapPlan> => {
    await assertEditor(context.supabase as never, context.userId);

    const raw = await chatJson<AiRoadmapPlan>(
      ROADMAP_SYSTEM,
      `Design a clickable tree roadmap for: ${data.prompt}${data.audience ? `\nAudience: ${data.audience}` : ""}`,
    );

    const laneWidth = 300;
    const rowHeight = 190;
    const byDepth = new Map<number, number>();

    const nodes: AiRoadmapNode[] = (raw.nodes ?? []).map((node, index) => {
      const depth = Number.isFinite(node.depth) ? Math.max(0, Math.round(node.depth)) : index;
      const lane = byDepth.get(depth) ?? 0;
      byDepth.set(depth, lane + 1);
      const branch = Number.isFinite(node.branch) ? Math.max(0, Math.round(node.branch)) : lane;
      return {
        title: node.title,
        slug: slug(node.title) || `step-${index + 1}`,
        description: node.description ?? "",
        group_label: node.group_label || "Core",
        difficulty: ["beginner", "intermediate", "advanced"].includes(node.difficulty)
          ? node.difficulty
          : "beginner",
        estimated_hours: Number.isFinite(node.estimated_hours) ? Math.round(node.estimated_hours) : 6,
        skills: Array.isArray(node.skills) ? node.skills.slice(0, 6).map(String) : [],
        depth,
        branch,
        video_query: node.video_query ?? node.title,
        position_x: branch * laneWidth,
        position_y: depth * rowHeight,
      };
    });

    // Centre each row so the tree reads symmetrically.
    const rows = new Map<number, AiRoadmapNode[]>();
    for (const node of nodes) rows.set(node.depth, [...(rows.get(node.depth) ?? []), node]);
    const widest = Math.max(1, ...[...rows.values()].map((row) => row.length));
    for (const row of rows.values()) {
      const offset = ((widest - row.length) * laneWidth) / 2;
      row.forEach((node, i) => {
        node.position_x = offset + i * laneWidth;
      });
    }

    const titles = new Set(nodes.map((n) => n.title));
    const edges = (raw.edges ?? []).filter(
      (edge) => titles.has(edge.source) && titles.has(edge.target) && edge.source !== edge.target,
    );

    return { title: raw.title ?? data.prompt, description: raw.description ?? "", nodes, edges };
  });

export const generateContentBlocks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => promptSchema.parse(data))
  .handler(async ({ data, context }): Promise<AiBlock[]> => {
    await assertEditor(context.supabase as never, context.userId);

    const raw = await chatJson<{ blocks: AiBlock[] }>(
      BLOCKS_SYSTEM,
      `Write the interactive body for: ${data.prompt}${data.audience ? `\nAudience: ${data.audience}` : ""}`,
    );

    return (raw.blocks ?? [])
      .filter((block) => block && typeof block.type === "string")
      .map((block) => ({ type: block.type, data: (block.data ?? {}) as Record<string, unknown> }));
  });
