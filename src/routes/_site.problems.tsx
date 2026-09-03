import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ExternalLink, Lightbulb, Plus, Wrench } from "lucide-react";
import { EmptyState, PageHeader, Pill } from "@/components/site/bits";
import { useAuth } from "@/lib/useAuth";
import { cn } from "@/lib/utils";
import {
  SUBMISSION_KINDS,
  createSubmission,
  submissionsQuery,
  type SubmissionKind,
} from "@/lib/community";

export const Route = createFileRoute("/_site/problems")({
  head: () => ({
    meta: [
      { title: "Problems & Projects — submit what you're building | Explorers" },
      {
        name: "description",
        content:
          "Post a real problem worth solving or a project you shipped. Explorers browse open problems and pick one to build.",
      },
      { property: "og:title", content: "Problems & Projects on Explorers" },
      {
        property: "og:description",
        content: "Submit problems worth solving and projects you built — then find someone to build with.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProblemsPage,
});

function ProblemsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<SubmissionKind | "all">("all");
  const [open, setOpen] = useState(false);
  const items = useQuery(submissionsQuery()).data ?? [];
  const filtered = tab === "all" ? items : items.filter((i) => i.kind === tab);

  return (
    <>
      <PageHeader
        eyebrow="Problems & Projects"
        title="Bring a problem. Leave with a project."
        description="Submit a problem worth solving, or show a project you built. Everything here comes from explorers, not editors."
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Chip active={tab === "all"} onClick={() => setTab("all")}>
            Everything
          </Chip>
          {SUBMISSION_KINDS.map((k) => (
            <Chip key={k.value} active={tab === k.value} onClick={() => setTab(k.value)}>
              {k.label}s
            </Chip>
          ))}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="focus-ring ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
          >
            <Plus className="h-4 w-4" aria-hidden /> Submit
          </button>
        </div>

        {open && (
          <div className="mt-5">
            {user ? (
              <SubmitForm userId={user.id} onDone={() => setOpen(false)} />
            ) : (
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="font-display text-base font-semibold text-foreground">
                  Sign in to submit
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Your submissions appear on your explorer profile.
                </p>
                <Link
                  to="/auth"
                  className="focus-ring mt-4 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => (
            <article key={item.id} className="hover-lift flex flex-col rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="primary">
                  <span className="inline-flex items-center gap-1">
                    {item.kind === "project" ? (
                      <Wrench className="h-3 w-3" aria-hidden />
                    ) : (
                      <Lightbulb className="h-3 w-3" aria-hidden />
                    )}
                    {item.kind}
                  </span>
                </Pill>
                <Pill>{item.status}</Pill>
                {item.tags.slice(0, 3).map((tag) => (
                  <Pill key={tag}>{tag}</Pill>
                ))}
              </div>
              <h2 className="mt-3 font-display text-lg font-semibold leading-snug text-foreground">
                {item.title}
              </h2>
              {item.summary && <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>}
              {item.details && (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {item.details}
                </p>
              )}
              <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                <span className="eyebrow text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                {item.link_url && (
                  <a
                    href={item.link_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="focus-ring inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    Open <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-6">
            <EmptyState
              title="No submissions yet"
              hint="Be first — post a problem you keep running into, or a project you shipped."
            />
          </div>
        )}
      </div>
    </>
  );
}

function SubmitForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const qc = useQueryClient();
  const [kind, setKind] = useState<SubmissionKind>("problem");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [tags, setTags] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createSubmission({
        userId,
        kind,
        title,
        summary,
        details,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        linkUrl,
      });
      await qc.invalidateQueries({ queryKey: ["submissions"] });
      await qc.invalidateQueries({ queryKey: ["my-submissions"] });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap gap-2">
        {SUBMISSION_KINDS.map((k) => (
          <Chip key={k.value} active={kind === k.value} onClick={() => setKind(k.value)}>
            {k.label}
          </Chip>
        ))}
      </div>
      <div className="mt-4 grid gap-3">
        <Field label="Title" value={title} onChange={setTitle} placeholder="What is it?" />
        <Field
          label="One-line summary"
          value={summary}
          onChange={setSummary}
          placeholder={kind === "problem" ? "Who has this problem and why it hurts" : "What it does in one line"}
        />
        <label className="block">
          <span className="eyebrow text-muted-foreground">Details</span>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={5}
            placeholder={
              kind === "problem"
                ? "Context, what you tried, what a good solution looks like…"
                : "Stack, what you learned, what's next…"
            }
            className="focus-ring mt-1.5 w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm text-foreground"
          />
        </label>
        <Field label="Tags (comma separated)" value={tags} onChange={setTags} placeholder="ai, python, education" />
        <Field label="Link (optional)" value={linkUrl} onChange={setLinkUrl} placeholder="https://" />
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          disabled={busy || !title.trim()}
          className="focus-ring rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-50"
        >
          {busy ? "Posting…" : `Post ${kind}`}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="focus-ring rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring mt-1.5 w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm text-foreground"
      />
    </label>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "eyebrow focus-ring rounded-full border px-3 py-1.5 transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
