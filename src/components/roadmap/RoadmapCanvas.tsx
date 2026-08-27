import { youtubeId } from "@/components/roadmap/NodeVideo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Maximize2, Minus, Plus } from "lucide-react";
import type { RoadmapEdge, RoadmapNode } from "@/lib/content";
import { cn } from "@/lib/utils";

export const NODE_W = 216;
export const NODE_H = 78;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.2;

type Point = { x: number; y: number };

type Tone = { border: string; text: string; bg: string; stroke: string };

const BEGINNER_TONE: Tone = {
  border: "border-secondary/60",
  text: "text-secondary",
  bg: "bg-secondary/[0.08]",
  stroke: "hsl(var(--secondary))",
};

const TONES: Record<string, Tone | undefined> = {
  beginner: {
    border: "border-secondary/60",
    text: "text-secondary",
    bg: "bg-secondary/[0.08]",
    stroke: "hsl(var(--secondary))",
  },
  intermediate: {
    border: "border-primary/60",
    text: "text-primary",
    bg: "bg-primary/[0.08]",
    stroke: "hsl(var(--primary))",
  },
  advanced: {
    border: "border-destructive/60",
    text: "text-destructive",
    bg: "bg-destructive/[0.08]",
    stroke: "hsl(var(--destructive))",
  },
};

const toneFor = (node: RoadmapNode): Tone => TONES[node.difficulty] ?? BEGINNER_TONE;

/**
 * Interactive node/edge diagram for a roadmap.
 * Pan by dragging the canvas, zoom with wheel/pinch, click a node to select it.
 * When `editable`, nodes can be dragged and `onMoveNode` persists the position.
 */
export function RoadmapCanvas({
  nodes,
  edges,
  selectedId,
  doneIds,
  onSelect,
  onToggleDone,
  editable = false,
  onMoveNode,
  className,
  height = 560,
}: {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  selectedId?: string | null;
  doneIds?: Set<string>;
  onSelect?: (node: RoadmapNode) => void;
  onToggleDone?: (node: RoadmapNode) => void;
  editable?: boolean;
  onMoveNode?: (id: string, x: number, y: number) => void;
  className?: string;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 40, y: 40 });
  const [positions, setPositions] = useState<Record<string, Point>>({});
  const drag = useRef<
    | { kind: "pan"; startX: number; startY: number; origin: Point }
    | { kind: "node"; id: string; startX: number; startY: number; origin: Point }
    | null
  >(null);

  /**
   * Layout: stored pixel positions win when an editor has arranged the diagram.
   * Otherwise nodes are auto-placed as a top-down tree using the edge graph,
   * so a roadmap reads as a flow chart instead of a stack of columns.
   */
  const layout = useMemo(() => {
    const usesPixels = nodes.some((n) => Math.abs(n.position_x) > 40 || Math.abs(n.position_y) > 40);
    const map: Record<string, Point> = {};
    if (usesPixels) {
      nodes.forEach((node, i) => {
        map[node.id] = { x: node.position_x, y: node.position_y || i * (NODE_H + 56) };
      });
      return map;
    }

    // Depth = longest chain of incoming edges (falls back to sort order for orphans).
    const depth = new Map<string, number>();
    const incoming = new Map<string, string[]>();
    for (const edge of edges) {
      incoming.set(edge.target_node_id, [...(incoming.get(edge.target_node_id) ?? []), edge.source_node_id]);
    }
    const resolve = (id: string, seen: Set<string>): number => {
      if (depth.has(id)) return depth.get(id)!;
      if (seen.has(id)) return 0;
      seen.add(id);
      const parents = incoming.get(id) ?? [];
      const value = parents.length ? Math.max(...parents.map((p) => resolve(p, seen) + 1)) : 0;
      depth.set(id, value);
      return value;
    };
    for (const node of nodes) resolve(node.id, new Set());

    const rows = new Map<number, RoadmapNode[]>();
    for (const node of [...nodes].sort((a, b) => a.sort - b.sort)) {
      const level = depth.get(node.id) ?? 0;
      rows.set(level, [...(rows.get(level) ?? []), node]);
    }
    const widest = Math.max(1, ...[...rows.values()].map((r) => r.length));
    const stepX = NODE_W + 72;
    for (const [level, rowNodes] of rows) {
      const rowWidth = rowNodes.length * stepX;
      const startX = (widest * stepX - rowWidth) / 2;
      rowNodes.forEach((node, i) => {
        map[node.id] = { x: Math.round(startX + i * stepX), y: level * (NODE_H + 90) };
      });
    }
    return map;
  }, [nodes, edges]);

  const posOf = useCallback((id: string) => positions[id] ?? layout[id] ?? { x: 0, y: 0 }, [positions, layout]);

  const bounds = useMemo(() => {
    const pts = nodes.map((n) => posOf(n.id));
    if (!pts.length) return { w: 800, h: 400 };
    return {
      w: Math.max(...pts.map((p) => p.x)) + NODE_W + 80,
      h: Math.max(...pts.map((p) => p.y)) + NODE_H + 80,
    };
  }, [nodes, posOf]);

  const zoomAt = useCallback((next: number, px: number, py: number) => {
    setZoom((prev) => {
      const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
      const k = clamped / prev;
      setOffset((o) => ({ x: px - (px - o.x) * k, y: py - (py - o.y) * k }));
      return clamped;
    });
  }, []);

  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    zoomAt(zoom * Math.exp(-dy * 0.0018), e.clientX - rect.left, e.clientY - rect.top);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const state = drag.current;
      if (!state) return;
      const dx = (e.clientX - state.startX) / zoom;
      const dy = (e.clientY - state.startY) / zoom;
      if (state.kind === "pan") {
        setOffset({ x: state.origin.x + dx * zoom, y: state.origin.y + dy * zoom });
      } else {
        setPositions((prev) => ({
          ...prev,
          [state.id]: { x: Math.round(state.origin.x + dx), y: Math.round(state.origin.y + dy) },
        }));
      }
    }
    function onUp() {
      const state = drag.current;
      drag.current = null;
      if (state?.kind === "node" && onMoveNode) {
        const p = positions[state.id];
        if (p) onMoveNode(state.id, p.x, p.y);
      }
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [zoom, positions, onMoveNode]);

  function fit() {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = Math.min(1.2, Math.max(MIN_ZOOM, Math.min(rect.width / bounds.w, rect.height / bounds.h)));
    setZoom(next);
    setOffset({ x: 24, y: 24 });
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "roadmap-grid relative overflow-hidden rounded-xl border border-border bg-surface/40 touch-none",
        className,
      )}
      style={{ height }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("[data-node]")) return;
        drag.current = { kind: "pan", startX: e.clientX, startY: e.clientY, origin: offset };
      }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, width: bounds.w, height: bounds.h }}
      >
        <svg width={bounds.w} height={bounds.h} className="absolute left-0 top-0 overflow-visible">
          <defs>
            <marker id="rm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>
          {edges.map((edge) => {
            const from = nodes.find((n) => n.id === edge.source_node_id);
            const to = nodes.find((n) => n.id === edge.target_node_id);
            if (!from || !to) return null;
            const a = posOf(from.id);
            const b = posOf(to.id);
            const x1 = a.x + NODE_W / 2;
            const y1 = a.y + NODE_H;
            const x2 = b.x + NODE_W / 2;
            const y2 = b.y;
            const mid = (y1 + y2) / 2;
            const highlight = selectedId === from.id || selectedId === to.id;
            return (
              <g key={edge.id} style={{ color: toneFor(from).stroke }}>
                <path
                  d={`M${x1},${y1} C${x1},${mid} ${x2},${mid} ${x2},${y2 - 6}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={highlight ? 2.4 : 1.5}
                  strokeOpacity={highlight ? 0.95 : 0.45}
                  markerEnd="url(#rm-arrow)"
                />
                {edge.kind && edge.kind !== "unlocks" && (
                  <text
                    x={(x1 + x2) / 2}
                    y={mid - 6}
                    textAnchor="middle"
                    className="fill-muted-foreground font-mono"
                    style={{ fontSize: 10 }}
                  >
                    {edge.kind}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {nodes.map((node) => {
          const p = posOf(node.id);
          const tone = toneFor(node);
          const isDone = doneIds?.has(node.id) ?? false;
          const isActive = selectedId === node.id;
          return (
            <div
              key={node.id}
              data-node
              onPointerDown={(e) => {
                if (!editable) return;
                e.stopPropagation();
                drag.current = { kind: "node", id: node.id, startX: e.clientX, startY: e.clientY, origin: p };
              }}
              className="absolute"
              style={{ left: p.x, top: p.y, width: NODE_W }}
            >
              <button
                type="button"
                onClick={() => onSelect?.(node)}
                className={cn(
                  "focus-ring block w-full rounded-lg border px-3 py-2.5 text-left shadow-sm transition-all",
                  tone.border,
                  tone.bg,
                  editable ? "cursor-grab active:cursor-grabbing" : "hover:-translate-y-0.5",
                  isActive && "ring-2 ring-primary/60",
                )}
                style={{ minHeight: NODE_H }}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="block font-display text-sm font-semibold leading-snug text-foreground">
                    {node.title}
                  </span>
                  {onToggleDone && (
                    <span
                      role="checkbox"
                      aria-checked={isDone}
                      aria-label={`Mark ${node.title} complete`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleDone(node);
                      }}
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        isDone ? "border-success bg-success text-success-foreground" : "border-border",
                      )}
                    >
                      {isDone && <Check className="h-2.5 w-2.5" />}
                    </span>
                  )}
                </span>
                <span className={cn("mt-1 block font-mono text-[0.62rem] uppercase tracking-wider", tone.text)}>
                  {node.group_label ?? node.difficulty}
                  {node.estimated_hours ? ` · ${node.estimated_hours}h` : ""}
                  {youtubeId(node.video_url) ? " · ▶ video" : ""}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg border border-border bg-card/90 p-1 backdrop-blur">
        <IconBtn label="Zoom out" onClick={() => zoomAt(zoom / 1.2, 0, 0)}>
          <Minus className="h-3.5 w-3.5" />
        </IconBtn>
        <span className="w-10 text-center font-mono text-[0.7rem] text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <IconBtn label="Zoom in" onClick={() => zoomAt(zoom * 1.2, 0, 0)}>
          <Plus className="h-3.5 w-3.5" />
        </IconBtn>
        <IconBtn label="Fit to view" onClick={fit}>
          <Maximize2 className="h-3.5 w-3.5" />
        </IconBtn>
      </div>
      <p className="pointer-events-none absolute left-3 top-3 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
        {editable ? "Drag nodes to arrange · scroll to zoom" : "Click a node · drag to pan · scroll to zoom"}
      </p>
    </div>
  );
}

function IconBtn({
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
      onClick={onClick}
      className="focus-ring rounded-md p-1.5 text-muted-foreground hover:text-foreground"
    >
      {children}
    </button>
  );
}
