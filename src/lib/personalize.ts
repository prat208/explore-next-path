import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserPreferences = {
  user_id: string;
  goal: string | null;
  level: string | null;
  interests: string[];
  hours_per_week: number | null;
  learning_style: string | null;
  region: string | null;
  status: string | null;
  plan: string | null;
  onboarded: boolean;
};

export type TechUpdate = {
  id: string;
  kind: "news" | "hackathon" | "free_tier" | "opportunity";
  title: string;
  url: string;
  source: string | null;
  summary: string | null;
  tags: string[];
  fetched_at: string;
};

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export const UPDATE_KINDS = [
  { value: "news", label: "Today in tech" },
  { value: "hackathon", label: "Hackathons" },
  { value: "free_tier", label: "Free tiers" },
  { value: "opportunity", label: "Opportunities" },
] as const;

export const GOALS = [
  "Become an AI engineer",
  "Get my first tech internship",
  "Build and ship projects",
  "Crack data science",
  "Learn programming fundamentals",
  "Move into research",
] as const;

export const LEVELS = ["Absolute beginner", "Some basics", "Comfortable coder", "Advanced"] as const;

export const INTERESTS = [
  "Artificial intelligence",
  "Machine learning",
  "Python",
  "Web development",
  "Data science",
  "Cloud & DevOps",
  "Cybersecurity",
  "Robotics",
  "Product & design",
  "Open source",
] as const;

export const STYLES = ["Video first", "Read and take notes", "Learn by building", "Guided step-by-step"] as const;

export const STATUSES = ["School student", "College student", "Fresh graduate", "Working professional", "Self-taught"] as const;

export function preferencesQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["user-preferences", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<UserPreferences | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as UserPreferences | null) ?? null;
    },
  });
}

export const techUpdatesQuery = queryOptions({
  queryKey: ["tech-updates"],
  queryFn: async (): Promise<TechUpdate[]> => {
    const { data, error } = await supabase
      .from("tech_updates")
      .select("*")
      .order("fetched_at", { ascending: false })
      .limit(120);
    if (error) throw new Error(error.message);
    return (data ?? []) as TechUpdate[];
  },
});

export function assistantHistoryQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["assistant-history", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<AssistantMessage[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("assistant_messages")
        .select("id, role, content, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(60);
      if (error) throw new Error(error.message);
      return (data ?? []) as AssistantMessage[];
    },
  });
}

/** Ranks updates so the explorer's interests float to the top. */
export function rankForInterests(items: TechUpdate[], interests: string[]): TechUpdate[] {
  if (!interests.length) return items;
  const words = interests
    .flatMap((i) => i.toLowerCase().split(/[^a-z]+/))
    .filter((w) => w.length > 3);
  const score = (item: TechUpdate) => {
    const haystack = `${item.title} ${item.summary ?? ""} ${item.tags.join(" ")}`.toLowerCase();
    return words.reduce((total, w) => (haystack.includes(w) ? total + 1 : total), 0);
  };
  return [...items].sort((a, b) => score(b) - score(a));
}
