import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
export type Article = Tables["articles"]["Row"];
export type ContentBlock = Tables["content_blocks"]["Row"];
export type Resource = Tables["resources"]["Row"];
export type Tool = Tables["tools"]["Row"];
export type Roadmap = Tables["roadmaps"]["Row"];
export type RoadmapNode = Tables["roadmap_nodes"]["Row"];
export type RoadmapEdge = Tables["roadmap_edges"]["Row"];
export type LearningPath = Tables["learning_paths"]["Row"];
export type Lesson = Tables["lessons"]["Row"];
export type Project = Tables["projects"]["Row"];
export type Challenge = Tables["challenges"]["Row"];
export type Career = Tables["careers"]["Row"];
export type Opportunity = Tables["opportunities"]["Row"];
export type Author = Tables["authors"]["Row"];
export type Topic = Tables["topics"]["Row"];
export type Profile = Tables["profiles"]["Row"];
export type Difficulty = Database["public"]["Enums"]["difficulty"];
export type ContentStatus = Database["public"]["Enums"]["content_status"];

/** Every entity type that can take part in the knowledge graph. */
export type EntityType =
  | "article"
  | "resource"
  | "tool"
  | "project"
  | "roadmap"
  | "roadmap_node"
  | "learning_path"
  | "lesson"
  | "career"
  | "opportunity"
  | "challenge";

export const ARTICLE_CATEGORIES = [
  { value: "news", label: "News", question: "What happened?" },
  { value: "explained", label: "Explained", question: "What does it actually mean?" },
  { value: "how-to", label: "How-To", question: "How can I do this?" },
  { value: "deep-dive", label: "Deep Dive", question: "Understand it deeply." },
  { value: "analysis", label: "Analysis", question: "Why does this matter?" },
  { value: "opinion", label: "Opinion", question: "A thoughtful viewpoint." },
] as const;

export const RELATION_SECTIONS = [
  { relation: "understand", title: "Understand it", hint: "Related explainer" },
  { relation: "learn", title: "Learn it", hint: "Relevant learning path" },
  { relation: "read", title: "Read it", hint: "Relevant articles" },
  { relation: "use", title: "Use it", hint: "Relevant tools & docs" },
  { relation: "build", title: "Build it", hint: "Relevant project" },
  { relation: "deeper", title: "Go deeper", hint: "Advanced resources" },
  { relation: "career", title: "Career", hint: "Where this leads" },
  { relation: "opportunity", title: "Opportunity", hint: "Apply what you learn" },
] as const;

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/* ------------------------------------------------------------------ blocks */

export const blocksQuery = (ownerType: string, ownerId: string | undefined) =>
  queryOptions({
    queryKey: ["blocks", ownerType, ownerId],
    enabled: Boolean(ownerId),
    queryFn: async () =>
      unwrap(
        await supabase
          .from("content_blocks")
          .select("*")
          .eq("owner_type", ownerType)
          .eq("owner_id", ownerId!)
          .order("position"),
      ),
  });

/* ---------------------------------------------------------------- articles */

export const articlesQuery = (opts?: {
  limit?: number;
  category?: string;
  featured?: boolean;
  includeDrafts?: boolean;
}) =>
  queryOptions({
    queryKey: ["articles", opts ?? {}],
    queryFn: async () => {
      let q = supabase.from("articles").select("*").order("published_at", { ascending: false });
      if (!opts?.includeDrafts) q = q.eq("status", "published");
      if (opts?.category) q = q.eq("category", opts.category);
      if (opts?.featured) q = q.eq("featured", true);
      if (opts?.limit) q = q.limit(opts.limit);
      return unwrap(await q);
    },
  });

export const articleQuery = (slug: string) =>
  queryOptions({
    queryKey: ["article", slug],
    queryFn: async () => {
      const article = unwrap(
        await supabase.from("articles").select("*").eq("slug", slug).maybeSingle(),
      ) as Article | null;
      if (!article) return null;
      const [blocks, author] = await Promise.all([
        supabase
          .from("content_blocks")
          .select("*")
          .eq("owner_type", "article")
          .eq("owner_id", article.id)
          .order("position"),
        article.author_id
          ? supabase.from("authors").select("*").eq("id", article.author_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);
      return {
        article,
        blocks: (blocks.data ?? []) as ContentBlock[],
        author: (author.data ?? null) as Author | null,
      };
    },
  });

/* --------------------------------------------------------------- resources */

export const resourcesQuery = (includeDrafts = false) =>
  queryOptions({
    queryKey: ["resources", { includeDrafts }],
    queryFn: async () => {
      let q = supabase.from("resources").select("*").order("rating", { ascending: false });
      if (!includeDrafts) q = q.eq("status", "published");
      return unwrap(await q);
    },
  });

export const toolsQuery = () =>
  queryOptions({
    queryKey: ["tools"],
    queryFn: async () =>
      unwrap(await supabase.from("tools").select("*").eq("status", "published").order("name")),
  });

/* ---------------------------------------------------------------- roadmaps */

export const roadmapsQuery = (includeDrafts = false) =>
  queryOptions({
    queryKey: ["roadmaps", { includeDrafts }],
    queryFn: async () => {
      let q = supabase.from("roadmaps").select("*").order("title");
      if (!includeDrafts) q = q.eq("status", "published");
      return unwrap(await q);
    },
  });

export const roadmapQuery = (slug: string) =>
  queryOptions({
    queryKey: ["roadmap", slug],
    queryFn: async () => {
      const roadmap = unwrap(
        await supabase.from("roadmaps").select("*").eq("slug", slug).maybeSingle(),
      ) as Roadmap | null;
      if (!roadmap) return null;
      const [nodes, edges] = await Promise.all([
        supabase.from("roadmap_nodes").select("*").eq("roadmap_id", roadmap.id).order("sort"),
        supabase.from("roadmap_edges").select("*").eq("roadmap_id", roadmap.id),
      ]);
      return {
        roadmap,
        nodes: (nodes.data ?? []) as RoadmapNode[],
        edges: (edges.data ?? []) as RoadmapEdge[],
      };
    },
  });

export const roadmapByIdQuery = (id: string | undefined) =>
  queryOptions({
    queryKey: ["roadmap-id", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const [roadmap, nodes, edges] = await Promise.all([
        supabase.from("roadmaps").select("*").eq("id", id!).maybeSingle(),
        supabase.from("roadmap_nodes").select("*").eq("roadmap_id", id!).order("sort"),
        supabase.from("roadmap_edges").select("*").eq("roadmap_id", id!),
      ]);
      return {
        roadmap: (roadmap.data ?? null) as Roadmap | null,
        nodes: (nodes.data ?? []) as RoadmapNode[],
        edges: (edges.data ?? []) as RoadmapEdge[],
      };
    },
  });

/* ------------------------------------------------------------------- learn */

export const pathsQuery = (includeDrafts = false) =>
  queryOptions({
    queryKey: ["paths", { includeDrafts }],
    queryFn: async () => {
      let q = supabase.from("learning_paths").select("*").order("title");
      if (!includeDrafts) q = q.eq("status", "published");
      return unwrap(await q);
    },
  });

export const pathQuery = (slug: string) =>
  queryOptions({
    queryKey: ["path", slug],
    queryFn: async () => {
      const path = unwrap(
        await supabase.from("learning_paths").select("*").eq("slug", slug).maybeSingle(),
      ) as LearningPath | null;
      if (!path) return null;
      const lessons = await supabase
        .from("lessons")
        .select("*")
        .eq("path_id", path.id)
        .order("position");
      return { path, lessons: (lessons.data ?? []) as Lesson[] };
    },
  });

export const lessonQuery = (pathSlug: string, lessonSlug: string) =>
  queryOptions({
    queryKey: ["lesson", pathSlug, lessonSlug],
    queryFn: async () => {
      const path = unwrap(
        await supabase.from("learning_paths").select("*").eq("slug", pathSlug).maybeSingle(),
      ) as LearningPath | null;
      if (!path) return null;
      const lessons = ((
        await supabase.from("lessons").select("*").eq("path_id", path.id).order("position")
      ).data ?? []) as Lesson[];
      const lesson = lessons.find((l) => l.slug === lessonSlug) ?? null;
      if (!lesson) return null;
      const blocks = ((
        await supabase
          .from("content_blocks")
          .select("*")
          .eq("owner_type", "lesson")
          .eq("owner_id", lesson.id)
          .order("position")
      ).data ?? []) as ContentBlock[];
      return { path, lessons, lesson, blocks };
    },
  });

/* -------------------------------------------------- projects / challenges */

export const projectsQuery = (includeDrafts = false) =>
  queryOptions({
    queryKey: ["projects", { includeDrafts }],
    queryFn: async () => {
      let q = supabase.from("projects").select("*").order("difficulty");
      if (!includeDrafts) q = q.eq("status", "published");
      return unwrap(await q);
    },
  });

export const projectQuery = (slug: string) =>
  queryOptions({
    queryKey: ["project", slug],
    queryFn: async () =>
      unwrap(
        await supabase.from("projects").select("*").eq("slug", slug).maybeSingle(),
      ) as Project | null,
  });

export const challengesQuery = () =>
  queryOptions({
    queryKey: ["challenges"],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("challenges")
          .select("*")
          .eq("status", "published")
          .order("number", { ascending: false }),
      ),
  });

/* ------------------------------------------------ careers / opportunities */

export const careersQuery = (includeDrafts = false) =>
  queryOptions({
    queryKey: ["careers", { includeDrafts }],
    queryFn: async () => {
      let q = supabase.from("careers").select("*").order("title");
      if (!includeDrafts) q = q.eq("status", "published");
      return unwrap(await q);
    },
  });

export const careerQuery = (slug: string) =>
  queryOptions({
    queryKey: ["career", slug],
    queryFn: async () =>
      unwrap(
        await supabase.from("careers").select("*").eq("slug", slug).maybeSingle(),
      ) as Career | null,
  });

export const opportunitiesQuery = (includeDrafts = false) =>
  queryOptions({
    queryKey: ["opportunities", { includeDrafts }],
    queryFn: async () => {
      let q = supabase.from("opportunities").select("*").order("deadline");
      if (!includeDrafts) q = q.eq("status", "published");
      return unwrap(await q);
    },
  });

/* -------------------------------------------------------- knowledge graph */

export type RelatedItem = {
  relation: string;
  type: EntityType;
  id: string;
  title: string;
  subtitle: string | null;
  href: string;
  meta?: string | null;
};

const TABLE_FOR: Record<string, { table: string; title: string; sub: string }> = {
  article: { table: "articles", title: "title", sub: "excerpt" },
  resource: { table: "resources", title: "title", sub: "description" },
  tool: { table: "tools", title: "name", sub: "tagline" },
  roadmap: { table: "roadmaps", title: "title", sub: "description" },
  career: { table: "careers", title: "title", sub: "overview" },
  opportunity: { table: "opportunities", title: "title", sub: "description" },
};

export function hrefFor(type: string, slug: string, extra?: string): string {
  switch (type) {
    case "article":
      return `/articles/${slug}`;
    case "resource":
      return `/resources?highlight=${slug}`;
    case "tool":
      return `/resources?tool=${slug}`;
    case "roadmap":
      return `/roadmaps/${slug}`;
    case "roadmap_node":
      return `/roadmaps/${extra ?? ""}?node=${slug}`;
    case "career":
      return `/careers/${slug}`;
    case "opportunity":
      return `/opportunities?highlight=${slug}`;
    default:
      return "/";
  }
}

/** Resolves the "Continue Exploring" graph for any entity. */
export const relatedQuery = (fromType: string, fromId: string | undefined) =>
  queryOptions({
    queryKey: ["related", fromType, fromId],
    enabled: Boolean(fromId),
    queryFn: async (): Promise<RelatedItem[]> => {
      const rels =
        (
          await supabase
            .from("content_relationships")
            .select("*")
            .eq("from_type", fromType)
            .eq("from_id", fromId!)
            .order("sort")
        ).data ?? [];
      if (rels.length === 0) return [];

      const byType = new Map<string, string[]>();
      for (const r of rels) {
        byType.set(r.to_type, [...(byType.get(r.to_type) ?? []), r.to_id]);
      }

      const lookups = await Promise.all(
        [...byType.entries()].map(async ([type, ids]) => {
          const cfg = TABLE_FOR[type];
          if (!cfg) return [] as { type: string; row: Record<string, unknown> }[];
          const { data } = await supabase
            .from(cfg.table as never)
            .select("*")
            .in("id", ids);
          return ((data ?? []) as Record<string, unknown>[]).map((row) => ({ type, row }));
        }),
      );

      const rowIndex = new Map<string, { type: string; row: Record<string, unknown> }>();
      for (const group of lookups) {
        for (const entry of group) rowIndex.set(String(entry.row["id"]), entry);
      }

      return rels.flatMap((rel) => {
        const found = rowIndex.get(rel.to_id);
        if (!found) return [];
        const cfg = TABLE_FOR[found.type]!;
        const row = found.row;
        return [
          {
            relation: rel.relation,
            type: found.type as EntityType,
            id: rel.to_id,
            title: String(row[cfg.title] ?? "Untitled"),
            subtitle: (row[cfg.sub] as string | null) ?? null,
            href: hrefFor(found.type, String(row["slug"] ?? "")),
            meta: (row["level"] ?? row["difficulty"] ?? row["category"] ?? null) as string | null,
          },
        ];
      });
    },
  });

/* -------------------------------------------------------------- discovery */

export type SearchGroup = { type: EntityType; label: string; items: RelatedItem[] };

export async function siteSearch(term: string): Promise<SearchGroup[]> {
  const q = term.trim();
  if (!q) return [];
  const like = `%${q}%`;

  const [articles, resources, tools, roadmaps, nodes, careers, opportunities] =
    await Promise.all([
      supabase
        .from("articles")
        .select("id,slug,title,excerpt,category")
        .eq("status", "published")
        .or(`title.ilike.${like},excerpt.ilike.${like},subtitle.ilike.${like}`)
        .limit(8),
      supabase
        .from("resources")
        .select("id,slug,title,description,level")
        .eq("status", "published")
        .or(`title.ilike.${like},description.ilike.${like}`)
        .limit(8),
      supabase
        .from("tools")
        .select("id,slug,name,tagline,category")
        .eq("status", "published")
        .or(`name.ilike.${like},tagline.ilike.${like},description.ilike.${like}`)
        .limit(8),
      supabase
        .from("roadmaps")
        .select("id,slug,title,description,difficulty")
        .eq("status", "published")
        .or(`title.ilike.${like},description.ilike.${like}`)
        .limit(6),
      supabase
        .from("roadmap_nodes")
        .select("id,slug,title,description,roadmap_id")
        .or(`title.ilike.${like},description.ilike.${like}`)
        .limit(6),
      supabase
        .from("careers")
        .select("id,slug,title,overview")
        .eq("status", "published")
        .or(`title.ilike.${like},overview.ilike.${like}`)
        .limit(6),
      supabase
        .from("opportunities")
        .select("id,slug,title,description,category")
        .eq("status", "published")
        .or(`title.ilike.${like},description.ilike.${like},organization.ilike.${like}`)
        .limit(6),
    ]);

  const roadmapSlugById = new Map(
    ((roadmaps.data ?? []) as { id: string; slug: string }[]).map((r) => [r.id, r.slug]),
  );
  const extraRoadmapIds = ((nodes.data ?? []) as { roadmap_id: string }[])
    .map((n) => n.roadmap_id)
    .filter((id) => !roadmapSlugById.has(id));
  if (extraRoadmapIds.length) {
    const { data } = await supabase.from("roadmaps").select("id,slug").in("id", extraRoadmapIds);
    for (const r of (data ?? []) as { id: string; slug: string }[])
      roadmapSlugById.set(r.id, r.slug);
  }

  const groups: SearchGroup[] = [
    {
      type: "tool",
      label: "Recommended tools",
      items: ((tools.data ?? []) as Record<string, string>[]).map((t) => ({
        relation: "use",
        type: "tool" as const,
        id: t["id"]!,
        title: t["name"]!,
        subtitle: t["tagline"] ?? null,
        href: hrefFor("tool", t["slug"]!),
        meta: t["category"] ?? null,
      })),
    },
    {
      type: "article",
      label: "Related articles",
      items: ((articles.data ?? []) as Record<string, string>[]).map((a) => ({
        relation: "read",
        type: "article" as const,
        id: a["id"]!,
        title: a["title"]!,
        subtitle: a["excerpt"] ?? null,
        href: hrefFor("article", a["slug"]!),
        meta: a["category"] ?? null,
      })),
    },
    {
      type: "resource",
      label: "Learning resources",
      items: ((resources.data ?? []) as Record<string, string>[]).map((r) => ({
        relation: "use",
        type: "resource" as const,
        id: r["id"]!,
        title: r["title"]!,
        subtitle: r["description"] ?? null,
        href: hrefFor("resource", r["slug"]!),
        meta: r["level"] ?? null,
      })),
    },
    {
      type: "roadmap",
      label: "Roadmaps",
      items: ((roadmaps.data ?? []) as Record<string, string>[]).map((r) => ({
        relation: "learn",
        type: "roadmap" as const,
        id: r["id"]!,
        title: r["title"]!,
        subtitle: r["description"] ?? null,
        href: hrefFor("roadmap", r["slug"]!),
        meta: r["difficulty"] ?? null,
      })),
    },
    {
      type: "roadmap_node",
      label: "Related concepts",
      items: ((nodes.data ?? []) as Record<string, string>[]).map((n) => ({
        relation: "understand",
        type: "roadmap_node" as const,
        id: n["id"]!,
        title: n["title"]!,
        subtitle: n["description"] ?? null,
        href: hrefFor("roadmap_node", n["slug"]!, roadmapSlugById.get(n["roadmap_id"]!) ?? ""),
        meta: "concept",
      })),
    },
    {
      type: "career",
      label: "Career paths",
      items: ((careers.data ?? []) as Record<string, string>[]).map((c) => ({
        relation: "career",
        type: "career" as const,
        id: c["id"]!,
        title: c["title"]!,
        subtitle: c["overview"] ?? null,
        href: hrefFor("career", c["slug"]!),
        meta: null,
      })),
    },
    {
      type: "opportunity",
      label: "Opportunities",
      items: ((opportunities.data ?? []) as Record<string, string>[]).map((o) => ({
        relation: "opportunity",
        type: "opportunity" as const,
        id: o["id"]!,
        title: o["title"]!,
        subtitle: o["description"] ?? null,
        href: hrefFor("opportunity", o["slug"]!),
        meta: o["category"] ?? null,
      })),
    },
  ];

  return groups.filter((g) => g.items.length > 0);
}

export const searchQueryOptions = (term: string) =>
  queryOptions({
    queryKey: ["search", term],
    queryFn: async () => {
      const groups = await siteSearch(term);
      if (term.trim()) {
        const count = groups.reduce((n, g) => n + g.items.length, 0);
        const { data } = await supabase.auth.getUser();
        await supabase
          .from("search_queries")
          .insert({ query: term.trim().slice(0, 200), results_count: count, user_id: data.user?.id ?? null });
      }
      return groups;
    },
  });
