import { useEffect } from "react";
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Submission = Database["public"]["Tables"]["submissions"]["Row"];
export type Activity = Database["public"]["Tables"]["explorer_activity"]["Row"];

export const SUBMISSION_KINDS = [
  { value: "problem", label: "Problem", hint: "A real problem worth solving" },
  { value: "project", label: "Project", hint: "Something you built" },
] as const;

export type SubmissionKind = (typeof SUBMISSION_KINDS)[number]["value"];

/* ---------------------------------------------------------------- reads */

export const submissionsQuery = (kind?: SubmissionKind) =>
  queryOptions({
    queryKey: ["submissions", kind ?? "all"],
    queryFn: async (): Promise<Submission[]> => {
      let q = supabase
        .from("submissions")
        .select("*")
        .neq("status", "archived")
        .order("created_at", { ascending: false });
      if (kind) q = q.eq("kind", kind);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const mySubmissionsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["my-submissions", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Submission[]> => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const activityQuery = (userId: string | undefined, limit = 30) =>
  queryOptions({
    queryKey: ["explorer-activity", userId, limit],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Activity[]> => {
      const { data, error } = await supabase
        .from("explorer_activity")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

/* --------------------------------------------------------------- writes */

export async function createSubmission(input: {
  userId: string;
  kind: SubmissionKind;
  title: string;
  summary: string;
  details: string;
  tags: string[];
  linkUrl: string;
}) {
  const { error } = await supabase.from("submissions").insert({
    user_id: input.userId,
    kind: input.kind,
    title: input.title.trim(),
    summary: input.summary.trim() || null,
    details: input.details.trim() || null,
    tags: input.tags,
    link_url: input.linkUrl.trim() || null,
  });
  if (error) throw new Error(error.message);
}

/**
 * Records that the signed-in explorer opened a piece of content, so their
 * profile can show what they explored on Explorers.
 */
export function useLogVisit(
  userId: string | undefined,
  item: { type: string; id: string; title: string; path: string } | null,
) {
  const key = userId && item ? `${userId}:${item.type}:${item.id}` : null;
  useEffect(() => {
    if (!userId || !item || !key) return;
    const seen = window.sessionStorage.getItem(`explorers.seen.${key}`);
    if (seen) return;
    window.sessionStorage.setItem(`explorers.seen.${key}`, "1");
    void supabase.from("explorer_activity").insert({
      user_id: userId,
      item_type: item.type,
      item_id: item.id,
      title: item.title,
      path: item.path,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
