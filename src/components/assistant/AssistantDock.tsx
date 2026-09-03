import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/useAuth";
import { askAssistant } from "@/lib/assistant.functions";
import { assistantHistoryQuery, preferencesQuery } from "@/lib/personalize";
import { OnboardingDialog } from "./OnboardingDialog";
import { renderMarkdown } from "@/components/site/inline-viewers";
import { cn } from "@/lib/utils";

const STARTERS = [
  "What should I learn this week?",
  "Show me a hackathon I can join",
  "Which free tools should I use?",
  "Explain my roadmap next step",
];

export function AssistantDock() {
  const { user } = useAuth();
  const userId = user?.id;
  const qc = useQueryClient();
  const ask = useServerFn(askAssistant);

  const [open, setOpen] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const prefs = useQuery(preferencesQuery(userId));
  const history = useQuery(assistantHistoryQuery(userId));

  const needsOnboarding = Boolean(userId) && prefs.isSuccess && !prefs.data?.onboarded && !skipped;

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [history.data, pending, open]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy || !userId) return;
    setInput("");
    setPending(message);
    setBusy(true);
    try {
      const res = await ask({ data: { message } });
      if (!res.ok) toast.error(res.error);
      await qc.invalidateQueries({ queryKey: ["assistant-history", userId] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The guide could not answer");
    } finally {
      setPending(null);
      setBusy(false);
    }
  }

  return (
    <>
      {needsOnboarding && (
        <OnboardingDialog
          userId={userId}
          onDone={() => setOpen(true)}
          onSkip={() => setSkipped(true)}
        />
      )}

      {open && (
        <div className="fixed bottom-0 right-0 z-40 flex h-[85vh] w-full flex-col border border-border bg-background shadow-2xl sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[420px] sm:rounded-3xl">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-surface/60 px-4 py-3 sm:rounded-t-3xl">
            <div>
              <p className="eyebrow inline-flex items-center gap-1.5 text-primary">
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> Explorers Guide
              </p>
              <p className="text-sm font-semibold text-foreground">
                {prefs.data?.goal ? `Tuned for: ${prefs.data.goal}` : "Your personal AI mentor"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="focus-ring rounded-full p-1.5 text-muted-foreground hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {prefs.data?.plan && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3.5">
                <p className="eyebrow text-primary">Your plan</p>
                <div
                  className="prose-explorer mt-1.5 text-sm"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(prefs.data.plan) }}
                />
              </div>
            )}

            {(history.data ?? []).map((m) => (
              <Bubble key={m.id} role={m.role} content={m.content} />
            ))}
            {pending && <Bubble role="user" content={pending} />}
            {busy && (
              <p className="text-xs text-muted-foreground">The guide is thinking…</p>
            )}

            {!history.data?.length && !pending && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Try one of these:</p>
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="focus-ring block w-full rounded-xl border border-border bg-surface/50 px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
                <Link
                  to="/updates"
                  onClick={() => setOpen(false)}
                  className="focus-ring block text-sm font-semibold text-primary"
                >
                  See today's tech updates →
                </Link>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-end gap-2 border-t border-border px-3 py-3"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={1}
              placeholder="Ask anything about your path…"
              className="focus-ring max-h-28 flex-1 resize-none rounded-xl border border-border bg-surface/60 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="focus-ring rounded-xl bg-primary p-2.5 text-primary-foreground hover:bg-primary-deep disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus-ring fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl hover:bg-primary-deep"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Ask the Guide
        </button>
      )}
    </>
  );
}

function Bubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const mine = role === "user";
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm",
          mine
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-surface/60 text-foreground",
        )}
      >
        {mine ? (
          content
        ) : (
          <div
            className="prose-explorer"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
      </div>
    </div>
  );
}
