import { supabase } from "@/integrations/supabase/client";
import type { EntityType } from "./content";

/* ------------------------------------------------------------------ fields */

export type FieldKind =
  | "text"
  | "textarea"
  | "slug"
  | "number"
  | "boolean"
  | "select"
  | "array"
  | "date"
  | "json"
  | "html"
  | "upload";

export type StudioField = {
  name: string;
  label: string;
  kind: FieldKind;
  hint?: string;
  rows?: number;
  full?: boolean;
  options?: { value: string; label: string }[];
};

export type StudioCollection = {
  key: string;
  table: string;
  label: string;
  singular: string;
  titleField: "title" | "name";
  hasStatus: boolean;
  /** owner_type used in content_blocks for the rich body editor */
  blockOwner?: string;
  /** entity type used in content_relationships */
  entity?: EntityType;
  /** extra structural editor */
  structure?: "roadmap" | "lessons";
  /** public route for the "view live" link */
  viewTo?: string;
  fields: StudioField[];
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "In review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const DIFFICULTY: StudioField = {
  name: "difficulty",
  label: "Difficulty",
  kind: "select",
  options: DIFFICULTY_OPTIONS,
};

const COST: StudioField = {
  name: "cost",
  label: "Cost",
  kind: "select",
  options: [
    { value: "free", label: "Free" },
    { value: "freemium", label: "Freemium" },
    { value: "paid", label: "Paid" },
    { value: "funded", label: "Funded" },
  ],
};

const statusField: StudioField = { name: "status", label: "Status", kind: "select", options: STATUS_OPTIONS };

export const COLLECTIONS: Record<string, StudioCollection> = {
  articles: {
    key: "articles",
    table: "articles",
    label: "Articles",
    singular: "Article",
    titleField: "title",
    hasStatus: true,
    blockOwner: "article",
    entity: "article",
    viewTo: "/articles/$slug",
    fields: [
      { name: "title", label: "Title", kind: "text", full: true },
      { name: "slug", label: "Slug", kind: "slug" },
      {
        name: "category",
        label: "Format",
        kind: "select",
        options: [
          { value: "news", label: "News" },
          { value: "explained", label: "Explained" },
          { value: "how-to", label: "How-To" },
          { value: "deep-dive", label: "Deep Dive" },
          { value: "analysis", label: "Analysis" },
          { value: "opinion", label: "Opinion" },
        ],
      },
      { name: "subtitle", label: "Subtitle", kind: "text", full: true },
      { name: "excerpt", label: "Excerpt", kind: "textarea", full: true, rows: 3 },
      {
        name: "why_it_matters",
        label: "Why it matters",
        kind: "textarea",
        full: true,
        rows: 3,
        hint: "Shown in the highlighted callout under the header.",
      },
      { name: "cover_image_url", label: "Cover image", kind: "upload", full: true, hint: "Upload an image or paste a URL" },
      { name: "reading_minutes", label: "Reading minutes", kind: "number" },
      { name: "level", label: "Level", kind: "select", options: DIFFICULTY_OPTIONS },
      { name: "audience", label: "Audience", kind: "array", hint: "One per line, e.g. students" },
      { name: "tags", label: "Tags", kind: "array" },
      { name: "featured", label: "Featured on home", kind: "boolean" },
      statusField,
      { name: "published_at", label: "Publish date", kind: "date" },
      { name: "seo_title", label: "SEO title", kind: "text", full: true },
      { name: "seo_description", label: "SEO description", kind: "textarea", full: true, rows: 2 },
      {
        name: "sources",
        label: "Sources",
        kind: "json",
        full: true,
        rows: 5,
        hint: '[{ "label": "OpenAI docs", "url": "https://..." }]',
      },
    ],
  },
  roadmaps: {
    key: "roadmaps",
    table: "roadmaps",
    label: "Roadmaps",
    singular: "Roadmap",
    titleField: "title",
    hasStatus: true,
    entity: "roadmap",
    structure: "roadmap",
    viewTo: "/roadmaps/$slug",
    fields: [
      { name: "title", label: "Title", kind: "text", full: true },
      { name: "slug", label: "Slug", kind: "slug" },
      { name: "description", label: "Description", kind: "textarea", full: true, rows: 3 },
      DIFFICULTY,
      { name: "estimated_hours", label: "Estimated hours", kind: "number" },
      statusField,
    ],
  },
  learning_paths: {
    key: "learning_paths",
    table: "learning_paths",
    label: "Learning paths",
    singular: "Learning path",
    titleField: "title",
    hasStatus: true,
    entity: "learning_path",
    structure: "lessons",
    viewTo: "/learn/$pathSlug",
    fields: [
      { name: "title", label: "Title", kind: "text", full: true },
      { name: "slug", label: "Slug", kind: "slug" },
      { name: "description", label: "Description", kind: "textarea", full: true, rows: 3 },
      { name: "audience", label: "Who it is for", kind: "text", full: true },
      { name: "prerequisites", label: "Prerequisites", kind: "array" },
      { name: "skills", label: "Skills gained", kind: "array" },
      { name: "milestones", label: "Milestones", kind: "array" },
      { name: "next_steps", label: "Next steps", kind: "array" },
      { name: "estimated_hours", label: "Estimated hours", kind: "number" },
      DIFFICULTY,
      { name: "cover_image_url", label: "Cover image", kind: "upload", full: true, hint: "Upload an image or paste a URL" },
      statusField,
    ],
  },
  projects: {
    key: "projects",
    table: "projects",
    label: "Projects",
    singular: "Project",
    titleField: "title",
    hasStatus: true,
    blockOwner: "project",
    entity: "project",
    viewTo: "/projects/$slug",
    fields: [
      { name: "title", label: "Title", kind: "text", full: true },
      { name: "slug", label: "Slug", kind: "slug" },
      { name: "problem", label: "Problem", kind: "textarea", full: true, rows: 3 },
      { name: "outcome", label: "Outcome", kind: "textarea", full: true, rows: 3 },
      { name: "architecture", label: "Architecture", kind: "textarea", full: true, rows: 4 },
      { name: "portfolio_advice", label: "Portfolio advice", kind: "textarea", full: true, rows: 3 },
      { name: "tech_stack", label: "Tech stack", kind: "array" },
      { name: "prerequisites", label: "Prerequisites", kind: "array" },
      { name: "skills", label: "Skills", kind: "array" },
      { name: "extensions", label: "Extensions", kind: "array" },
      DIFFICULTY,
      { name: "estimated_hours", label: "Estimated hours", kind: "number" },
      { name: "repo_url", label: "Repo URL", kind: "text" },
      { name: "demo_url", label: "Demo URL", kind: "text" },
      { name: "cover_image_url", label: "Cover image", kind: "upload", full: true, hint: "Upload an image or paste a URL" },
      statusField,
    ],
  },
  challenges: {
    key: "challenges",
    table: "challenges",
    label: "Build challenges",
    singular: "Challenge",
    titleField: "title",
    hasStatus: true,
    entity: "challenge",
    fields: [
      { name: "title", label: "Title", kind: "text", full: true },
      { name: "slug", label: "Slug", kind: "slug" },
      { name: "number", label: "Challenge number", kind: "number" },
      { name: "statement", label: "Statement", kind: "textarea", full: true, rows: 4 },
      { name: "requirements", label: "Requirements", kind: "array" },
      { name: "bonus", label: "Bonus", kind: "array" },
      { name: "judging", label: "Judging criteria", kind: "array" },
      { name: "deadline", label: "Deadline", kind: "date" },
      statusField,
    ],
  },
  careers: {
    key: "careers",
    table: "careers",
    label: "Career hubs",
    singular: "Career hub",
    titleField: "title",
    hasStatus: true,
    entity: "career",
    viewTo: "/careers/$slug",
    fields: [
      { name: "title", label: "Role title", kind: "text", full: true },
      { name: "slug", label: "Slug", kind: "slug" },
      { name: "overview", label: "Overview", kind: "textarea", full: true, rows: 3 },
      { name: "role_summary", label: "What the role really does", kind: "textarea", full: true, rows: 3 },
      { name: "technical_skills", label: "Technical skills", kind: "array" },
      { name: "soft_skills", label: "Soft skills", kind: "array" },
      { name: "tools_used", label: "Tools used", kind: "array" },
      { name: "portfolio_expectations", label: "Portfolio expectations", kind: "array" },
      { name: "interview_prep", label: "Interview prep", kind: "array" },
      { name: "related_roles", label: "Related roles", kind: "array" },
      {
        name: "progression",
        label: "Progression stages",
        kind: "json",
        full: true,
        rows: 6,
        hint: '[{ "stage": "Junior", "focus": "…", "years": "0-2" }]',
      },
      statusField,
    ],
  },
  opportunities: {
    key: "opportunities",
    table: "opportunities",
    label: "Opportunities",
    singular: "Opportunity",
    titleField: "title",
    hasStatus: true,
    entity: "opportunity",
    viewTo: "/opportunities",
    fields: [
      { name: "title", label: "Title", kind: "text", full: true },
      { name: "slug", label: "Slug", kind: "slug" },
      { name: "organization", label: "Organisation", kind: "text" },
      {
        name: "category",
        label: "Category",
        kind: "select",
        options: [
          { value: "scholarship", label: "Scholarship" },
          { value: "internship", label: "Internship" },
          { value: "fellowship", label: "Fellowship" },
          { value: "competition", label: "Competition" },
          { value: "grant", label: "Grant" },
          { value: "program", label: "Program" },
        ],
      },
      { name: "description", label: "Description", kind: "textarea", full: true, rows: 3 },
      { name: "eligibility", label: "Eligibility", kind: "textarea", full: true, rows: 2 },
      { name: "location", label: "Location", kind: "text" },
      { name: "country", label: "Country", kind: "text" },
      {
        name: "work_mode",
        label: "Mode",
        kind: "select",
        options: [
          { value: "remote", label: "Remote" },
          { value: "onsite", label: "On-site" },
          { value: "hybrid", label: "Hybrid" },
        ],
      },
      COST,
      DIFFICULTY,
      { name: "deadline", label: "Deadline", kind: "date" },
      { name: "official_url", label: "Official URL", kind: "text", full: true },
      { name: "source", label: "Source", kind: "text" },
      { name: "verified_at", label: "Verified on", kind: "date" },
      statusField,
    ],
  },
  resources: {
    key: "resources",
    table: "resources",
    label: "Resources",
    singular: "Resource",
    titleField: "title",
    hasStatus: true,
    entity: "resource",
    viewTo: "/resources",
    fields: [
      { name: "title", label: "Title", kind: "text", full: true },
      { name: "slug", label: "Slug", kind: "slug" },
      { name: "description", label: "Description", kind: "textarea", full: true, rows: 3 },
      { name: "url", label: "URL", kind: "text", full: true },
      {
        name: "resource_type",
        label: "Type",
        kind: "select",
        options: [
          { value: "course", label: "Course" },
          { value: "docs", label: "Docs" },
          { value: "book", label: "Book" },
          { value: "video", label: "Video" },
          { value: "newsletter", label: "Newsletter" },
          { value: "dataset", label: "Dataset" },
          { value: "community", label: "Community" },
          { value: "tool", label: "Tool" },
        ],
      },
      { name: "category", label: "Category", kind: "text" },
      { name: "organization", label: "Organisation", kind: "text" },
      { name: "level", label: "Level", kind: "select", options: DIFFICULTY_OPTIONS },
      COST,
      { name: "has_free_tier", label: "Has free tier", kind: "boolean" },
      { name: "is_official", label: "Official source", kind: "boolean" },
      { name: "audience", label: "Audience", kind: "array" },
      { name: "tags", label: "Tags", kind: "array" },
      { name: "rating", label: "Rating (0-5)", kind: "number" },
      { name: "last_reviewed", label: "Last reviewed", kind: "date" },
      { name: "reviewer_notes", label: "Reviewer notes", kind: "textarea", full: true, rows: 3 },
      statusField,
    ],
  },
  tools: {
    key: "tools",
    table: "tools",
    label: "Tools",
    singular: "Tool",
    titleField: "name",
    hasStatus: true,
    entity: "tool",
    viewTo: "/resources",
    fields: [
      { name: "name", label: "Name", kind: "text", full: true },
      { name: "slug", label: "Slug", kind: "slug" },
      { name: "tagline", label: "Tagline", kind: "text", full: true },
      { name: "description", label: "Description", kind: "textarea", full: true, rows: 3 },
      { name: "url", label: "URL", kind: "text", full: true },
      { name: "category", label: "Category", kind: "text" },
      {
        name: "pricing",
        label: "Pricing",
        kind: "select",
        options: [
          { value: "free", label: "Free" },
          { value: "freemium", label: "Freemium" },
          { value: "paid", label: "Paid" },
        ],
      },
      { name: "tags", label: "Tags", kind: "array" },
      statusField,
    ],
  },
  topics: {
    key: "topics",
    table: "topics",
    label: "Topics",
    singular: "Topic",
    titleField: "title",
    hasStatus: false,
    fields: [
      { name: "title", label: "Title", kind: "text", full: true },
      { name: "slug", label: "Slug", kind: "slug" },
      { name: "summary", label: "Summary", kind: "textarea", full: true, rows: 3 },
      { name: "icon", label: "Icon name", kind: "text" },
    ],
  },
  authors: {
    key: "authors",
    table: "authors",
    label: "Authors",
    singular: "Author",
    titleField: "name",
    hasStatus: false,
    fields: [
      { name: "name", label: "Name", kind: "text", full: true },
      { name: "slug", label: "Slug", kind: "slug" },
      { name: "role_title", label: "Role", kind: "text", full: true },
      { name: "bio", label: "Bio", kind: "textarea", full: true, rows: 3 },
      { name: "avatar_url", label: "Avatar", kind: "upload", full: true, hint: "Upload an image or paste a URL" },
    ],
  },
};

export const COLLECTION_ORDER = [
  "articles",
  "learning_paths",
  "roadmaps",
  "projects",
  "challenges",
  "careers",
  "opportunities",
  "resources",
  "tools",
  "topics",
  "authors",
];

/* ----------------------------------------------------------------- helpers */

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function emptyRecord(collection: StudioCollection): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const field of collection.fields) {
    switch (field.kind) {
      case "array":
        record[field.name] = [];
        break;
      case "boolean":
        record[field.name] = false;
        break;
      case "json":
        record[field.name] = [];
        break;
      case "select":
        record[field.name] = field.name === "status" ? "draft" : (field.options?.[0]?.value ?? null);
        break;
      case "number":
        record[field.name] = field.name === "reading_minutes" ? 6 : null;
        break;
      default:
        record[field.name] = "";
    }
  }
  return record;
}

export function normalizeForSave(collection: StudioCollection, draft: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const field of collection.fields) {
    const value = draft[field.name];
    if (field.kind === "number") {
      out[field.name] = value === "" || value === null || value === undefined ? null : Number(value);
    } else if (field.kind === "text" || field.kind === "textarea" || field.kind === "slug" || field.kind === "date") {
      out[field.name] = value === "" ? null : value;
    } else {
      out[field.name] = value;
    }
  }
  if (collection.fields.some((f) => f.name === "reading_minutes") && !out['reading_minutes']) out['reading_minutes'] = 5;
  return out;
}

type AnyRow = Record<string, unknown> & { id: string };

const table = (name: string) => supabase.from(name as never) as never as {
  select: (cols: string) => never;
  insert: (rows: unknown) => never;
  update: (row: unknown) => never;
  delete: () => never;
};

export async function listRecords(collection: StudioCollection): Promise<AnyRow[]> {
  const q = supabase.from(collection.table as never).select("*") as unknown as {
    order: (c: string, o?: { ascending: boolean }) => Promise<{ data: AnyRow[] | null; error: { message: string } | null }>;
  };
  const orderCol = collection.hasStatus ? "updated_at" : "slug";
  const res = await q.order(orderCol, { ascending: collection.hasStatus ? false : true });
  if (res.error) throw new Error(res.error.message);
  return res.data ?? [];
}

export async function getRecord(collection: StudioCollection, id: string): Promise<AnyRow | null> {
  const res = (await (supabase.from(collection.table as never).select("*") as never as {
    eq: (c: string, v: string) => { maybeSingle: () => Promise<{ data: AnyRow | null; error: { message: string } | null }> };
  })
    .eq("id", id)
    .maybeSingle()) as { data: AnyRow | null; error: { message: string } | null };
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export async function insertRecord(tableName: string, values: Record<string, unknown>): Promise<AnyRow> {
  const res = (await (table(tableName).insert(values) as never as {
    select: () => { single: () => Promise<{ data: AnyRow | null; error: { message: string } | null }> };
  })
    .select()
    .single()) as { data: AnyRow | null; error: { message: string } | null };
  if (res.error) throw new Error(res.error.message);
  return res.data as AnyRow;
}

export async function updateRecord(tableName: string, id: string, values: Record<string, unknown>) {
  const res = (await (table(tableName).update(values) as never as {
    eq: (c: string, v: string) => Promise<{ error: { message: string } | null }>;
  }).eq("id", id)) as { error: { message: string } | null };
  if (res.error) throw new Error(res.error.message);
}

export async function deleteRecord(tableName: string, id: string) {
  const res = (await (table(tableName).delete() as never as {
    eq: (c: string, v: string) => Promise<{ error: { message: string } | null }>;
  }).eq("id", id)) as { error: { message: string } | null };
  if (res.error) throw new Error(res.error.message);
}
