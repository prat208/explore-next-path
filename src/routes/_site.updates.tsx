import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Pill, EmptyState, CardGridSkeleton } from "@/components/site/bits";
import { refreshTechUpdates } from "@/lib/updates.functions";
import {
  UPDATE_KINDS,
  preferencesQuery,
  rankForInterests,
  techUpdatesQuery,
  type TechUpdate,
} from "@/lib/personalize";
import { useAuth } from "@/lib/useAuth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/updates")({
  head: () => ({
    meta: [
      { title: "Daily tech updates, hackathons & free tiers — Explorers" },
      {
        name: "description",
        content:
          "A fresh daily feed of AI and tech news, open hackathons, free-tier developer tools and student opportunities — ranked around what you are learning.",
      },
      { property: "og:title", content: "Daily tech updates, hackathons & free tiers" },
      {
        property: "og:description",
        content: "Today's AI news, open hackathons, free tools and opportunities for students and builders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UpdatesPage,
});

function UpdatesPage() {
  const qc = useQueryClient();
  const { user, isEditor } = useAuth();
  const refresh = useServerFn(refreshTechUpdates);
  const updates = useQuery(techUpdatesQuery);
  const prefs = useQuery(preferencesQuery(user?.id));
  const [kind, setKind] = useState<TechUpdate["kind"]>("news");
  const [busy, setBusy] = useState(false);

  async function run(force: boolean) {
    setBusy(true);
    try {
      const res = await refresh({ data: { force } });
      if (res.refreshed) {
        await qc.invalidateQueries({ queryKey: ["tech-updates"] });
        if (force) toast.success(`Pulled ${res.inserted} fresh links`);
      }
    } catch (error) {
      if (force) toast.error(error instanceof Error ? error.message : "Could not refresh");
    } finally {
      setBusy(false);
    }
  }

  // Self-throttled: only crawls when the newest item is older than 12 hours.
  useEffect(() => {
    if (!updates.isSuccess) return;
    void run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updates.isSuccess]);

  const items = useMemo(() => {
    const list = (updates.data ?? []).filter((u) => u.kind === kind);
    return rankForInterests(list, prefs.data?.interests ?? []);
  }, [updates.data, kind, prefs.data?.interests]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Refreshed daily"
        title="Today in tech, and what you can join"
        description="Live news, open hackathons, free-tier tools and student opportunities — pulled from the web every day and ordered around your interests."
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {UPDATE_KINDS.map((k) => (
          <button
            key={k.value}
            type="button"
            onClick={() => setKind(k.value)}
            className={cn(
              "focus-ring rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              kind === k.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface/60 text-foreground hover:bg-accent",
            )}
          >
            {k.label}
          </button>
        ))}
        {isEditor && (
          <button
            type="button"
            onClick={() => void run(true)}
            disabled={busy}
            className="focus-ring ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", busy && "animate-spin")} aria-hidden />
            Refresh now
          </button>
        )}
      </div>

      {prefs.data?.interests?.length ? (
        <p className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          Ranked for {prefs.data.interests.slice(0, 3).join(", ")}
        </p>
      ) : null}

      {updates.isLoading || busy && !items.length ? (
        <CardGridSkeleton count={6} />
      ) : items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring flex h-full flex-col gap-2 rounded-2xl border border-border bg-surface/50 p-4 transition-colors hover:border-primary/40 hover:bg-accent"
              >
                <div className="flex items-center justify-between gap-2">
                  <Pill tone="primary">{item.source ?? "web"}</Pill>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                </div>
                <h2 className="font-display text-base font-semibold leading-snug text-foreground">
                  {item.title}
                </h2>
                {item.summary && (
                  <p className="line-clamp-4 text-sm text-muted-foreground">{item.summary}</p>
                )}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Nothing here yet"
          hint="The daily crawl runs when this page is opened — check back in a moment."
        />
      )}
    </div>
  );
}
