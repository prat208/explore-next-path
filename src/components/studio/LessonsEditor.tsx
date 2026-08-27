import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Lesson } from "@/lib/content";
import { slugify } from "@/lib/studio";
import { Field, inputClass } from "./fields";
import { BlockEditor } from "./BlockEditor";

export function LessonsEditor({ pathId }: { pathId: string }) {
  const [newTitle, setNewTitle] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const lessons = useQuery({
    queryKey: ["studio-lessons", pathId],
    queryFn: async () => {
      const { data, error } = await supabase.from("lessons").select("*").eq("path_id", pathId).order("position");
      if (error) throw new Error(error.message);
      return (data ?? []) as Lesson[];
    },
  });

  async function addLesson() {
    if (!newTitle.trim()) return;
    const { error } = await supabase.from("lessons").insert({
      path_id: pathId,
      title: newTitle.trim(),
      slug: slugify(newTitle),
      estimated_minutes: 15,
      position: lessons.data?.length ?? 0,
      module_label: "Module 1",
    });
    if (error) toast.error(error.message);
    else {
      setNewTitle("");
      void lessons.refetch();
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="border-b border-border px-5 py-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Lessons</h2>
        <p className="text-xs text-muted-foreground">
          Each lesson has its own interactive body — code, terminals, checklists and quizzes.
        </p>
      </header>
      <div className="space-y-4 px-5 py-5">
        {(lessons.data ?? []).map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            expanded={open === lesson.id}
            onToggle={() => setOpen((prev) => (prev === lesson.id ? null : lesson.id))}
            onChanged={() => void lessons.refetch()}
          />
        ))}
        {lessons.data?.length === 0 && <p className="text-sm text-muted-foreground">No lessons yet.</p>}
        <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-4">
          <Field label="New lesson title" className="min-w-64 flex-1">
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className={inputClass} />
          </Field>
          <button
            type="button"
            onClick={() => void addLesson()}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
          >
            <Plus className="h-4 w-4" /> Add lesson
          </button>
        </div>
      </div>
    </section>
  );
}

function LessonCard({
  lesson,
  expanded,
  onToggle,
  onChanged,
}: {
  lesson: Lesson;
  expanded: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  const [draft, setDraft] = useState(lesson);
  const set = (patch: Partial<Lesson>) => setDraft((prev) => ({ ...prev, ...patch }));

  async function save() {
    const { error } = await supabase
      .from("lessons")
      .update({
        title: draft.title,
        slug: draft.slug,
        summary: draft.summary,
        module_label: draft.module_label,
        estimated_minutes: draft.estimated_minutes,
        position: draft.position,
      })
      .eq("id", lesson.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Lesson saved");
      onChanged();
    }
  }

  async function remove() {
    await supabase.from("content_blocks").delete().eq("owner_type", "lesson").eq("owner_id", lesson.id);
    const { error } = await supabase.from("lessons").delete().eq("id", lesson.id);
    if (error) toast.error(error.message);
    else onChanged();
  }

  return (
    <article className="rounded-lg border border-border bg-background/60">
      <button
        type="button"
        onClick={onToggle}
        className="focus-ring flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-foreground">
          {draft.position + 1}. {draft.title}
        </span>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="space-y-5 border-t border-border px-4 py-4">
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
            <Field label="Module label">
              <input
                value={draft.module_label ?? ""}
                onChange={(e) => set({ module_label: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Estimated minutes">
              <input
                type="number"
                value={draft.estimated_minutes}
                onChange={(e) => set({ estimated_minutes: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>
            <Field label="Order">
              <input
                type="number"
                value={draft.position}
                onChange={(e) => set({ position: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>
            <Field label="Summary" className="sm:col-span-2">
              <textarea
                rows={2}
                value={draft.summary ?? ""}
                onChange={(e) => set({ summary: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void save()}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:border-primary/50"
            >
              <Save className="h-3.5 w-3.5" /> Save lesson
            </button>
            <button
              type="button"
              onClick={() => void remove()}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-destructive hover:border-destructive/50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete lesson
            </button>
          </div>
          <BlockEditor ownerType="lesson" ownerId={lesson.id} />
        </div>
      )}
    </article>
  );
}
