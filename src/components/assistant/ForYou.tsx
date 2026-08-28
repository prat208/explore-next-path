import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { preferencesQuery, rankForInterests, techUpdatesQuery } from "@/lib/personalize";
import { renderMarkdown } from "@/components/site/inline-viewers";
import { Pill } from "@/components/site/bits";

/** Personalized strip shown to signed-in explorers on the home page. */
export function ForYou() {
  const { user } = useAuth();
  const prefs = useQuery(preferencesQuery(user?.id));
  const updates = useQuery(techUpdatesQuery);

  if (!user || !prefs.data?.onboarded) return null;

  const picks = rankForInterests(
    (updates.data ?? []).filter((u) => u.kind === "news" || u.kind === "hackathon"),
    prefs.data.interests ?? [],
  ).slice(0, 3);

  return (
    <section className="border-b border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow inline-flex items-center gap-1.5 text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Made for you
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
              {prefs.data.goal ?? "Your path"}
            </h2>
          </div>
          <Link to="/updates" className="focus-ring text-sm font-semibold text-primary">
            Today's updates →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          {prefs.data.plan && (
            <div className="rounded-2xl border border-border bg-background p-5">
              <div
                className="prose-explorer text-sm"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(prefs.data.plan) }}
              />
            </div>
          )}

          {picks.length > 0 && (
            <ul className="grid content-start gap-3">
              {picks.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring block rounded-2xl border border-border bg-background p-4 transition-colors hover:border-primary/40"
                  >
                    <Pill tone={item.kind === "hackathon" ? "secondary" : "primary"}>
                      {item.kind === "hackathon" ? "Hackathon" : item.source ?? "news"}
                    </Pill>
                    <p className="mt-2 font-display text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
