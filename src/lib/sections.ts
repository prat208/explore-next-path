import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/studio";

export type UploadSection = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string;
  sort_order: number;
  entity_type: string | null;
  entity_slug: string | null;
};

export type UploadFile = {
  id: string;
  section_id: string;
  title: string;
  note: string | null;
  url: string;
  path: string | null;
  mime: string | null;
  size: number | null;
  sort_order: number;
};

export const SECTION_CATEGORIES = [
  { value: "roadmap", label: "Roadmap" },
  { value: "article", label: "Article" },
  { value: "manual", label: "Learning manual" },
  { value: "project", label: "Project" },
  { value: "career", label: "Career" },
  { value: "resource", label: "Resource pack" },
] as const;

export function categoryLabel(value: string): string {
  return SECTION_CATEGORIES.find((c) => c.value === value)?.label ?? "Resource pack";
}

/* ------------------------------------------------------------------- reads */

export const sectionsQuery = queryOptions({
  queryKey: ["upload-sections"],
  queryFn: async (): Promise<(UploadSection & { files: UploadFile[] })[]> => {
    const { data, error } = await supabase
      .from("upload_sections")
      .select("*, upload_files(*)")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => {
      const { upload_files: files, ...section } = row as UploadSection & { upload_files: UploadFile[] };
      return {
        ...section,
        files: [...(files ?? [])].sort((a, b) => a.sort_order - b.sort_order),
      };
    });
  },
});

export const sectionQuery = (slug: string) =>
  queryOptions({
    queryKey: ["upload-section", slug],
    queryFn: async (): Promise<(UploadSection & { files: UploadFile[] }) | null> => {
      const { data, error } = await supabase
        .from("upload_sections")
        .select("*, upload_files(*)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      const { upload_files: files, ...section } = data as UploadSection & { upload_files: UploadFile[] };
      return { ...section, files: [...(files ?? [])].sort((a, b) => a.sort_order - b.sort_order) };
    },
  });

/* ------------------------------------------------------------------ writes */

export async function createSection(input: {
  title: string;
  category: string;
  subtitle?: string;
  description?: string;
}): Promise<UploadSection> {
  const { data, error } = await supabase
    .from("upload_sections")
    .insert({
      title: input.title,
      slug: slugify(input.title),
      category: input.category,
      subtitle: input.subtitle || null,
      description: input.description || null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as UploadSection;
}

export async function updateSection(id: string, patch: Partial<UploadSection>): Promise<void> {
  const { error } = await supabase.from("upload_sections").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteSection(id: string): Promise<void> {
  const { error } = await supabase.from("upload_sections").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function addFile(
  sectionId: string,
  file: { title: string; url: string; path?: string; mime?: string; size?: number; sort_order?: number },
): Promise<void> {
  const { error } = await supabase.from("upload_files").insert({
    section_id: sectionId,
    title: file.title,
    url: file.url,
    path: file.path ?? null,
    mime: file.mime ?? null,
    size: file.size ?? null,
    sort_order: file.sort_order ?? 0,
  });
  if (error) throw new Error(error.message);
}

export async function updateFile(id: string, patch: Partial<UploadFile>): Promise<void> {
  const { error } = await supabase.from("upload_files").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteFile(id: string): Promise<void> {
  const { error } = await supabase.from("upload_files").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------- attaching to a content page */

export type AttachTarget = { type: string; slug: string; title: string };

const ATTACH_TABLES: { type: string; table: "roadmaps" | "articles" | "learning_paths" | "projects" | "careers" }[] = [
  { type: "roadmap", table: "roadmaps" },
  { type: "article", table: "articles" },
  { type: "manual", table: "learning_paths" },
  { type: "project", table: "projects" },
  { type: "career", table: "careers" },
];

export const attachTargetsQuery = queryOptions({
  queryKey: ["attach-targets"],
  queryFn: async (): Promise<AttachTarget[]> => {
    const results = await Promise.all(
      ATTACH_TABLES.map(async ({ type, table }) => {
        const { data } = await supabase.from(table).select("slug, title").order("title");
        return (data ?? []).map((row) => ({ type, slug: String(row.slug), title: String(row.title) }));
      }),
    );
    return results.flat();
  },
});

/** Packs an editor attached to one specific page (roadmap, article, manual…). */
export const attachedSectionsQuery = (entityType: string, entitySlug: string) =>
  queryOptions({
    queryKey: ["attached-sections", entityType, entitySlug],
    queryFn: async (): Promise<(UploadSection & { files: UploadFile[] })[]> => {
      const { data, error } = await supabase
        .from("upload_sections")
        .select("*, upload_files(*)")
        .eq("entity_type", entityType)
        .eq("entity_slug", entitySlug)
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => {
        const { upload_files: files, ...section } = row as UploadSection & { upload_files: UploadFile[] };
        return { ...section, files: [...(files ?? [])].sort((a, b) => a.sort_order - b.sort_order) };
      });
    },
  });
