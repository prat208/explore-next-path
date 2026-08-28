import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const RefreshInput = z.object({ force: z.boolean() });

const QUERIES: { kind: "news" | "hackathon" | "free_tier" | "opportunity"; query: string; tbs?: string }[] = [
  { kind: "news", query: "latest AI and technology news for students and developers", tbs: "qdr:d" },
  { kind: "hackathon", query: "upcoming online hackathons 2026 open registration students", tbs: "qdr:w" },
  { kind: "free_tier", query: "free tier developer tools and free credits for AI students", tbs: "qdr:m" },
  { kind: "opportunity", query: "open internships, fellowships and scholarships in AI for students", tbs: "qdr:w" },
];

/**
 * Refreshes the daily feed of tech news, hackathons, free tiers and opportunities.
 * Public but self-throttled: it only crawls when the newest item is older than 12h.
 */
export const refreshTechUpdates = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RefreshInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: newest } = await supabaseAdmin
      .from("tech_updates")
      .select("fetched_at")
      .order("fetched_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const stale =
      !newest?.fetched_at || Date.now() - new Date(newest.fetched_at).getTime() > 12 * 60 * 60 * 1000;
    if (!stale && !data.force) return { refreshed: false as const, inserted: 0 };

    const { firecrawlSearch } = await import("./firecrawl.server");

    let inserted = 0;
    const errors: string[] = [];

    for (const spec of QUERIES) {
      try {
        const results = await firecrawlSearch(spec.query, { limit: 8, tbs: spec.tbs });
        const rows = results.slice(0, 8).map((r) => ({
          kind: spec.kind,
          title: (r.title ?? r.url).slice(0, 240),
          url: r.url,
          source: safeHost(r.url),
          summary: (r.description ?? "").slice(0, 600) || null,
          fetched_at: new Date().toISOString(),
        }));
        if (!rows.length) continue;
        const { error } = await supabaseAdmin
          .from("tech_updates")
          .upsert(rows, { onConflict: "kind,url" });
        if (error) errors.push(error.message);
        else inserted += rows.length;
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    return { refreshed: true as const, inserted, errors };
  });

function safeHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
