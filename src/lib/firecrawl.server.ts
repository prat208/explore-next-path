/** Server-only Firecrawl helpers (gateway-backed connection). */

const GATEWAY_V2 = "https://connector-gateway.lovable.dev/firecrawl/v2";

export type FirecrawlResult = {
  url: string;
  title?: string;
  description?: string;
  markdown?: string;
};

/** Web search through Firecrawl. `tbs` filters by recency, e.g. 'qdr:d'. */
export async function firecrawlSearch(
  query: string,
  opts: { limit?: number; tbs?: string } = {},
): Promise<FirecrawlResult[]> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["FIRECRAWL_API_KEY"];
  if (!lovableKey || !connectionKey) throw new Error("Web search is not configured.");

  const res = await fetch(`${GATEWAY_V2}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": connectionKey,
    },
    body: JSON.stringify({
      query,
      limit: opts.limit ?? 8,
      ...(opts.tbs ? { tbs: opts.tbs } : {}),
    }),
  });

  const payload = (await res.json().catch(() => null)) as
    | { success?: boolean; error?: string; data?: unknown; web?: unknown }
    | null;
  if (!res.ok) throw new Error(payload?.error || `Search failed (${res.status})`);

  const raw = payload?.data ?? payload?.web ?? [];
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { web?: unknown[] })?.web)
      ? ((raw as { web: unknown[] }).web as unknown[])
      : [];

  return list
    .map((item) => item as FirecrawlResult)
    .filter((item) => typeof item?.url === "string" && item.url.startsWith("http"));
}
