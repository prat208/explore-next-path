import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  Lightbulb,
  Quote as QuoteIcon,
  Sparkles,
  Target,
  Terminal as TerminalIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentBlock } from "@/lib/content";
import { EmbedBlock } from "./EmbedBlock";

type Data = Record<string, unknown>;

const str = (d: Data, k: string, fallback = ""): string =>
  typeof d[k] === "string" ? (d[k] as string) : fallback;
const arr = (d: Data, k: string): unknown[] => (Array.isArray(d[k]) ? (d[k] as unknown[]) : []);

/** The editorial callout family — one visual grammar, different intents. */
const NOTE_STYLES: Record<
  string,
  { label: string; icon: typeof Lightbulb; tone: string; ring: string }
> = {
  "key-takeaway": {
    label: "Key takeaway",
    icon: Target,
    tone: "text-primary",
    ring: "border-primary/35 bg-primary/[0.07]",
  },
  tip: {
    label: "Tip",
    icon: Lightbulb,
    tone: "text-secondary",
    ring: "border-secondary/35 bg-secondary/[0.07]",
  },
  callout: {
    label: "Note",
    icon: Sparkles,
    tone: "text-secondary",
    ring: "border-secondary/30 bg-secondary/[0.06]",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    tone: "text-warning",
    ring: "border-warning/40 bg-warning/[0.08]",
  },
  "common-mistake": {
    label: "Common mistake",
    icon: X,
    tone: "text-destructive",
    ring: "border-destructive/35 bg-destructive/[0.07]",
  },
  analogy: {
    label: "Think of it like",
    icon: BookOpen,
    tone: "text-accent-foreground",
    ring: "border-border bg-muted/40",
  },
};

function NoteBlock({ type, data }: { type: string; data: Data }) {
  const cfg = NOTE_STYLES[type] ?? NOTE_STYLES["callout"]!;
  const Icon = cfg.icon;
  return (
    <aside className={cn("my-7 rounded-xl border px-5 py-4", cfg.ring)}>
      <div className={cn("flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]", cfg.tone)}>
        <Icon className="h-4 w-4" aria-hidden />
        {str(data, "label") || cfg.label}
      </div>
      {str(data, "title") && (
        <p className="mt-2 font-display text-lg font-semibold text-foreground">{str(data, "title")}</p>
      )}
      {str(data, "text") && (
        <p className="mt-1.5 text-[0.975rem] leading-relaxed text-muted-foreground">{str(data, "text")}</p>
      )}
    </aside>
  );
}

function CodeBlock({ data }: { data: Data }) {
  const code = str(data, "code");
  const [copied, setCopied] = useState(false);
  return (
    <figure className="my-7 overflow-hidden rounded-xl border border-border bg-code">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-2">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
          {str(data, "language", "code")}
        </span>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          }}
          className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[0.85rem] leading-relaxed">
        <code className="font-mono text-foreground">{code}</code>
      </pre>
      {str(data, "output") && (
        <figcaption className="border-t border-border/70 bg-background/40 px-4 py-2.5 font-mono text-[0.78rem] text-secondary">
          <span className="text-muted-foreground">output ▸ </span>
          {str(data, "output")}
        </figcaption>
      )}
    </figure>
  );
}

function TerminalBlock({ data }: { data: Data }) {
  return (
    <div className="my-7 overflow-hidden rounded-xl border border-border bg-code">
      <div className="flex items-center gap-2 border-b border-border/70 px-4 py-2 text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
        <TerminalIcon className="h-3.5 w-3.5" aria-hidden /> terminal
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.85rem] leading-relaxed text-foreground">
        <code>{str(data, "code") || str(data, "text")}</code>
      </pre>
    </div>
  );
}

function ChecklistBlock({ data }: { data: Data }) {
  const items = arr(data, "items").map(String);
  const [done, setDone] = useState<Set<number>>(new Set());
  return (
    <div className="my-7 rounded-xl border border-border bg-surface/60 p-5">
      {str(data, "title") && (
        <p className="mb-3 font-display text-base font-semibold text-foreground">{str(data, "title")}</p>
      )}
      <ul className="space-y-2.5">
        {items.map((item, i) => {
          const checked = done.has(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() =>
                  setDone((prev) => {
                    const next = new Set(prev);
                    if (next.has(i)) next.delete(i);
                    else next.add(i);
                    return next;
                  })
                }
                className="focus-ring group flex w-full items-start gap-3 rounded-md text-left"
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-transparent group-hover:border-primary/60",
                  )}
                >
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span
                  className={cn(
                    "text-[0.95rem] leading-relaxed transition-colors",
                    checked ? "text-muted-foreground line-through" : "text-foreground",
                  )}
                >
                  {item}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function QuizBlock({ data }: { data: Data }) {
  const options = arr(data, "options").map(String);
  const correct = typeof data["correctIndex"] === "number" ? (data["correctIndex"] as number) : 0;
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="my-7 rounded-xl border border-primary/25 bg-primary/[0.05] p-5">
      <p className="eyebrow text-primary">Check yourself</p>
      <p className="mt-2 font-display text-lg font-semibold text-foreground">{str(data, "question")}</p>
      <div className="mt-4 grid gap-2">
        {options.map((option, i) => {
          const isPicked = picked === i;
          const isCorrect = i === correct;
          const reveal = picked !== null;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setPicked(i)}
              className={cn(
                "focus-ring flex items-center justify-between rounded-lg border px-4 py-2.5 text-left text-[0.95rem] transition-colors",
                !reveal && "border-border hover:border-primary/50 hover:bg-primary/[0.06]",
                reveal && isCorrect && "border-success/60 bg-success/10 text-foreground",
                reveal && isPicked && !isCorrect && "border-destructive/60 bg-destructive/10",
                reveal && !isPicked && !isCorrect && "border-border/60 text-muted-foreground",
              )}
            >
              <span>{option}</span>
              {reveal && isCorrect && <Check className="h-4 w-4 text-success" aria-hidden />}
              {reveal && isPicked && !isCorrect && <X className="h-4 w-4 text-destructive" aria-hidden />}
            </button>
          );
        })}
      </div>
      {picked !== null && str(data, "explanation") && (
        <p className="mt-4 border-t border-border/70 pt-3 text-[0.925rem] leading-relaxed text-muted-foreground">
          {str(data, "explanation")}
        </p>
      )}
    </div>
  );
}

function DefinitionBlock({ data }: { data: Data }) {
  return (
    <dl className="my-7 rounded-xl border border-border border-l-2 border-l-secondary bg-surface/60 px-5 py-4">
      <dt className="font-display text-base font-semibold text-secondary">{str(data, "term")}</dt>
      <dd className="mt-1.5 text-[0.95rem] leading-relaxed text-muted-foreground">{str(data, "text")}</dd>
    </dl>
  );
}

function TimelineBlock({ data }: { data: Data }) {
  const events = arr(data, "events") as Data[];
  return (
    <ol className="my-7 space-y-0 border-l border-border pl-6">
      {events.map((event, i) => (
        <li key={i} className="relative pb-6 last:pb-0">
          <span className="absolute -left-[1.9rem] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-primary">
            {str(event, "date")}
          </p>
          <p className="mt-1 font-display text-base font-semibold text-foreground">{str(event, "title")}</p>
          <p className="mt-1 text-[0.925rem] leading-relaxed text-muted-foreground">{str(event, "text")}</p>
        </li>
      ))}
    </ol>
  );
}

function ComparisonBlock({ data }: { data: Data }) {
  const attributes = arr(data, "attributes").map(String);
  const items = arr(data, "items") as Data[];
  return (
    <div className="my-7 overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-left text-[0.9rem]">
        <thead>
          <tr className="bg-surface/70">
            <th className="px-4 py-3 font-display text-sm font-semibold text-foreground">Option</th>
            {attributes.map((a) => (
              <th key={a} className="px-4 py-3 font-display text-sm font-semibold text-foreground">
                {a}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-t border-border/70">
              <th scope="row" className="px-4 py-3 align-top font-medium text-foreground">
                {str(item, "name")}
              </th>
              {arr(item, "values").map((v, j) => (
                <td key={j} className="px-4 py-3 align-top text-muted-foreground">
                  {String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StepsBlock({ data }: { data: Data }) {
  const items = arr(data, "items") as (Data | string)[];
  return (
    <ol className="my-7 space-y-4">
      {items.map((raw, i) => {
        const item = typeof raw === "string" ? { text: raw } : raw;
        return (
          <li key={i} className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-semibold text-primary">
              {i + 1}
            </span>
            <div>
              {str(item, "title") && (
                <p className="font-display text-base font-semibold text-foreground">{str(item, "title")}</p>
              )}
              <p className="text-[0.95rem] leading-relaxed text-muted-foreground">{str(item, "text")}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StatBlock({ data }: { data: Data }) {
  const items = arr(data, "items") as Data[];
  return (
    <div className="my-7 grid gap-3 sm:grid-cols-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface/60 px-4 py-4">
          <p className="font-display text-2xl font-bold text-primary">{str(item, "value")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{str(item, "label")}</p>
        </div>
      ))}
    </div>
  );
}

function FaqBlock({ data }: { data: Data }) {
  const items = arr(data, "items") as Data[];
  return (
    <div className="my-7 divide-y divide-border rounded-xl border border-border">
      {items.map((item, i) => (
        <details key={i} className="group px-5 py-4">
          <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-3 font-display text-base font-semibold text-foreground">
            {str(item, "question")}
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
          </summary>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">{str(item, "answer")}</p>
        </details>
      ))}
    </div>
  );
}

function Block({ block }: { block: ContentBlock }) {
  const data = (block.data ?? {}) as Data;

  switch (block.type) {
    case "paragraph":
      return (
        <p className="my-5 text-[1.0625rem] leading-[1.75] text-foreground/90">{str(data, "text")}</p>
      );
    case "heading": {
      const level = typeof data["level"] === "number" ? (data["level"] as number) : 2;
      const text = str(data, "text");
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (level >= 3)
        return (
          <h3 id={id} className="mt-9 mb-2 font-display text-xl font-semibold text-foreground">
            {text}
          </h3>
        );
      return (
        <h2 id={id} className="mt-11 mb-3 font-display text-2xl font-bold tracking-tight text-foreground">
          {text}
        </h2>
      );
    }
    case "quote":
      return (
        <blockquote className="my-7 border-l-2 border-primary pl-5">
          <QuoteIcon className="mb-2 h-4 w-4 text-primary" aria-hidden />
          <p className="font-display text-xl leading-relaxed text-foreground">{str(data, "text")}</p>
          {str(data, "attribution") && (
            <footer className="mt-2 text-sm text-muted-foreground">— {str(data, "attribution")}</footer>
          )}
        </blockquote>
      );
    case "list":
      return (
        <ul className="my-5 space-y-2 pl-1">
          {arr(data, "items").map((item, i) => (
            <li key={i} className="flex gap-3 text-[1.0125rem] leading-relaxed text-foreground/90">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {String(item)}
            </li>
          ))}
        </ul>
      );
    case "image":
      return (
        <figure className="my-7">
          <img
            src={str(data, "url")}
            alt={str(data, "alt")}
            loading="lazy"
            className="w-full rounded-xl border border-border"
          />
          {str(data, "caption") && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {str(data, "caption")}
            </figcaption>
          )}
        </figure>
      );
    case "divider":
      return <hr className="my-10 border-border" />;
    case "code":
      return <CodeBlock data={data} />;
    case "terminal":
      return <TerminalBlock data={data} />;
    case "checklist":
      return <ChecklistBlock data={data} />;
    case "quiz":
      return <QuizBlock data={data} />;
    case "definition":
      return <DefinitionBlock data={data} />;
    case "timeline":
      return <TimelineBlock data={data} />;
    case "comparison":
      return <ComparisonBlock data={data} />;
    case "steps":
      return <StepsBlock data={data} />;
    case "stats":
      return <StatBlock data={data} />;
    case "faq":
      return <FaqBlock data={data} />;
    case "embed":
    case "html":
      return <EmbedBlock data={data} />;
    case "key-takeaway":
    case "tip":
    case "callout":
    case "warning":
    case "common-mistake":
    case "analogy":
      return <NoteBlock type={block.type} data={data} />;
    default:
      return str(data, "text") ? (
        <p className="my-5 text-[1.0625rem] leading-[1.75] text-foreground/90">{str(data, "text")}</p>
      ) : null;
  }
}

export function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div>
      {blocks.map((block) => (
        <Block key={block.id} block={block} />
      ))}
    </div>
  );
}

/** All block types the Studio editor can insert. */
export const BLOCK_TYPES = [
  "paragraph",
  "heading",
  "list",
  "quote",
  "code",
  "terminal",
  "checklist",
  "quiz",
  "definition",
  "timeline",
  "comparison",
  "steps",
  "stats",
  "faq",
  "key-takeaway",
  "tip",
  "callout",
  "warning",
  "common-mistake",
  "analogy",
  "embed",
  "image",
  "divider",
] as const;
