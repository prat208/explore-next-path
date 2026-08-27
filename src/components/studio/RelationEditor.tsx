import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RELATION_SECTIONS, type EntityType } from "@/lib/content";
import { inputClass } from "./fields";

const TARGETS: { type: EntityType; table: string; label: string; titleField: string }[] = [
  { type: "article", table: "articles", label: "Article", titleField: "title" },
  { type: "learning_path", table: "learning_paths", label: "Learning path", titleField: "title" },
  { type: "roadmap", table: "roadmaps", label: "Roadmap", titleField: "title" },
  { type: "project", table: "projects", label: "Project", titleField: "title" },
  { type: "challenge", table: "challenges", label: "Challenge", titleField: "title" },
  { type: "career", table: "careers", label: "Career hub", titleField: "title" },
  { type: "opportunity", table: "opportunities", label: "Opportunity", titleField: "title" },
  { type: "resource", table: "resources", label: "Resource", titleField: "title" },
  { type: "tool", table: "tools", label: "Tool", titleField: "name" },
];

type Row = { id: string; to_type: string; to_id: string; relation: string; sort: number };

export function RelationEditor({ fromType, fromId }: { fromType: EntityType; fromId: string }) {
  const [relation, setRelation] = useState(RELATION_SECTIONS[0].relation as string);
  const [targetType, setTargetType] = useState<EntityType>("roadmap");
  const [targetId, setTargetId] = useState("");

  const target = TARGETS.find((t) => t.type === targetType)!;

  const links = useQuery({
    queryKey: ["studio-relations", fromType, fromId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_relationships")
        .select("id, to_type, to_id, relation, sort")
        .eq("from_type", fromType)
        .eq("from_id", fromId)
        .order("sort");
      if (error) throw new Error(error.message);
      return (data ?? []) as Row[];
    },
  });

  const options = useQuery({
    queryKey: ["studio-relation-options", target.table],
    queryFn: async () => {
      const res = (await supabase
        .from(target.table as never)
        .select(`id, ${target.titleField}`)) as unknown as {
        data: Record<string, string>[] | null;
        error: { message: string } | null;
      };
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []).map((row) => ({ id: row['id']!, title: row[target.titleField] ?? "Untitled" }));
    },
  });

  const titleFor = (row: Row) => {
    const meta = TARGETS.find((t) => t.type === row.to_type);
    if (meta?.table === target.table) return options.data?.find((o) => o.id === row.to_id)?.title ?? row.to_id;
    return row.to_id;
  };

  async function add() {
    if (!targetId) {
      toast.error("Pick something to link to");
      return;
    }
    const { error } = await supabase.from("content_relationships").insert({
      from_type: fromType,
      from_id: fromId,
      to_type: targetType,
      to_id: targetId,
      relation,
      sort: links.data?.length ?? 0,
    });
    if (error) toast.error(error.message);
    else {
      setTargetId("");
      toast.success("Link added");
      void links.refetch();
    }
  }

  async function remove(id: string) {
    const { error } = await supabase.from("content_relationships").delete().eq("id", id);
    if (error) toast.error(error.message);
    else void links.refetch();
  }

  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="border-b border-border px-5 py-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Knowledge graph links</h2>
        <p className="text-xs text-muted-foreground">
          These power the “Continue exploring” rail: read it, learn it, build it, where it leads.
        </p>
      </header>
      <ul className="divide-y divide-border">
        {(links.data ?? []).map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <span className="text-sm text-foreground">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-primary">{row.relation}</span>{" "}
              → {TARGETS.find((t) => t.type === row.to_type)?.label ?? row.to_type}: {titleFor(row)}
            </span>
            <button
              type="button"
              aria-label="Remove link"
              onClick={() => void remove(row.id)}
              className="focus-ring rounded-md border border-border p-1.5 text-destructive hover:border-destructive/50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
        {links.data?.length === 0 && (
          <li className="px-5 py-4 text-sm text-muted-foreground">No links yet.</li>
        )}
      </ul>
      <div className="grid gap-3 border-t border-border px-5 py-4 sm:grid-cols-4">
        <select value={relation} onChange={(e) => setRelation(e.target.value)} className={inputClass}>
          {RELATION_SECTIONS.map((section) => (
            <option key={section.relation} value={section.relation}>
              {section.title}
            </option>
          ))}
        </select>
        <select
          value={targetType}
          onChange={(e) => {
            setTargetType(e.target.value as EntityType);
            setTargetId("");
          }}
          className={inputClass}
        >
          {TARGETS.map((t) => (
            <option key={t.type} value={t.type}>
              {t.label}
            </option>
          ))}
        </select>
        <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className={inputClass}>
          <option value="">Select {target.label.toLowerCase()}…</option>
          {(options.data ?? []).map((option) => (
            <option key={option.id} value={option.id}>
              {option.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void add()}
          className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
        >
          <Plus className="h-4 w-4" /> Link
        </button>
      </div>
    </section>
  );
}
