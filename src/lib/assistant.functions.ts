import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const AskInput = z.object({ message: z.string().min(1).max(2000) });

type Prefs = {
  goal: string | null;
  level: string | null;
  interests: string[] | null;
  hours_per_week: number | null;
  learning_style: string | null;
  region: string | null;
  status: string | null;
  plan: string | null;
};

function prefsSummary(p: Prefs | null): string {
  if (!p) return "The explorer has not completed onboarding yet.";
  return [
    `Goal: ${p.goal ?? "unknown"}`,
    `Level: ${p.level ?? "unknown"}`,
    `Interests: ${(p.interests ?? []).join(", ") || "unknown"}`,
    `Weekly time: ${p.hours_per_week ?? "?"} hours`,
    `Learning style: ${p.learning_style ?? "unknown"}`,
    `Where they are: ${p.status ?? "unknown"}${p.region ? ` (${p.region})` : ""}`,
  ].join("\n");
}

const VOICE = `You are the Explorers Guide — the AI mentor inside Explorers, a discovery platform for students and builders in AI and technology.
Be concrete, warm and brief. Prefer short paragraphs and tight bullet lists.
Always tie advice to what exists on the site and use markdown links with these paths:
/roadmaps, /articles, /resources, /opportunities, /careers, /updates (daily tech news, hackathons and free-tier tools).
Never invent slugs you were not given. When unsure, point to the listing page.
End with one clear next action.`;

/** Personalized chat reply, stored in the explorer's assistant history. */
export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => AskInput.parse(input))
  .handler(async ({ data, context }) => {
    const { chatComplete, AiError } = await import("./ai.server");
    const { supabase, userId } = context;

    const [prefsRes, historyRes, roadmapsRes, articlesRes, updatesRes] = await Promise.all([
      supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("assistant_messages")
        .select("role, content")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase.from("roadmaps").select("title, slug").limit(24),
      supabase.from("articles").select("title, slug").eq("status", "published").limit(24),
      supabase.from("tech_updates").select("kind, title, url").order("fetched_at", { ascending: false }).limit(12),
    ]);

    const catalog = [
      "Roadmaps:",
      ...(roadmapsRes.data ?? []).map((r) => `- ${r.title} → /roadmaps/${r.slug}`),
      "Articles:",
      ...(articlesRes.data ?? []).map((a) => `- ${a.title} → /articles/${a.slug}`),
      "Fresh updates (from /updates):",
      ...(updatesRes.data ?? []).map((u) => `- [${u.kind}] ${u.title} → ${u.url}`),
    ].join("\n");

    const history = [...(historyRes.data ?? [])]
      .reverse()
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    let reply: string;
    try {
      reply = await chatComplete([
        { role: "system", content: `${VOICE}\n\nExplorer profile:\n${prefsSummary(prefsRes.data as Prefs | null)}\n\nSite catalog:\n${catalog}` },
        ...history,
        { role: "user", content: data.message },
      ]);
    } catch (error) {
      if (error instanceof AiError) return { ok: false as const, error: error.message, status: error.status };
      throw error;
    }

    await supabase.from("assistant_messages").insert([
      { user_id: userId, role: "user", content: data.message },
      { user_id: userId, role: "assistant", content: reply },
    ]);

    return { ok: true as const, reply };
  });

const PlanInput = z.object({
  goal: z.string(),
  level: z.string(),
  interests: z.array(z.string()),
  hours_per_week: z.number(),
  learning_style: z.string(),
  status: z.string(),
  region: z.string(),
});

/** Turns onboarding answers into a personalized plan, saved on the profile. */
export const buildPersonalPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data, context }) => {
    const { chatComplete, AiError } = await import("./ai.server");
    const { supabase, userId } = context;

    const [roadmapsRes, articlesRes] = await Promise.all([
      supabase.from("roadmaps").select("title, slug").limit(24),
      supabase.from("articles").select("title, slug").eq("status", "published").limit(24),
    ]);

    const catalog = [
      ...(roadmapsRes.data ?? []).map((r) => `Roadmap: ${r.title} → /roadmaps/${r.slug}`),
      ...(articlesRes.data ?? []).map((a) => `Article: ${a.title} → /articles/${a.slug}`),
    ].join("\n");

    let plan = "";
    try {
      plan = await chatComplete([
        { role: "system", content: `${VOICE}\n\nWrite a personalized starting plan in markdown, max 220 words. Structure it as:\n**Your focus** (1 sentence)\n**Start here** (2-3 links from the catalog, one line each with why)\n**This week** (3 checkboxes sized to their weekly hours)\n**Watch for** (one line about /updates for hackathons, free tiers and opportunities).\nOnly use links from the catalog plus the listing pages.` },
        {
          role: "user",
          content: `Catalog:\n${catalog}\n\nExplorer:\nGoal: ${data.goal}\nLevel: ${data.level}\nInterests: ${data.interests.join(", ")}\nWeekly hours: ${data.hours_per_week}\nLearning style: ${data.learning_style}\nStatus: ${data.status}\nRegion: ${data.region}`,
        },
      ]);
    } catch (error) {
      if (!(error instanceof AiError)) throw error;
    }

    const { error } = await supabase.from("user_preferences").upsert({
      user_id: userId,
      goal: data.goal,
      level: data.level,
      interests: data.interests,
      hours_per_week: data.hours_per_week,
      learning_style: data.learning_style,
      status: data.status,
      region: data.region,
      plan: plan || null,
      onboarded: true,
    });
    if (error) throw new Error(error.message);

    return { plan };
  });
