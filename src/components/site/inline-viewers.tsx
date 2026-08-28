import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared text loader for every plain-text based viewer. */
function useTextFile(url: string) {
  const [state, setState] = useState<{ text: string | null; failed: boolean }>({ text: null, failed: false });
  useEffect(() => {
    let alive = true;
    setState({ text: null, failed: false });
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.text();
      })
      .then((text) => alive && setState({ text, failed: false }))
      .catch(() => alive && setState({ text: null, failed: true }));
    return () => {
      alive = false;
    };
  }, [url]);
  return state;
}

function Loading({ title }: { title: string }) {
  return <p className="px-6 py-16 text-center text-sm text-muted-foreground">Loading {title}…</p>;
}

function Failed({ url }: { url: string }) {
  return (
    <p className="px-6 py-16 text-center text-sm text-muted-foreground">
      This file could not be opened here.{" "}
      <a href={url} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
        Open it directly
      </a>
      .
    </p>
  );
}

function Toolbar({ url, title, text }: { url: string; title: string; text?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <p className="truncate font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <div className="flex items-center gap-2">
        {text !== undefined && (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(text).then(
                () => {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1600);
                },
                () => undefined,
              );
            }}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[0.72rem] font-semibold text-muted-foreground hover:border-primary/50 hover:text-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[0.72rem] font-semibold text-muted-foreground hover:border-primary/50 hover:text-foreground"
        >
          <Download className="h-3.5 w-3.5" /> Save
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ code / text */

export function CodeFileViewer({ url, title }: { url: string; title: string }) {
  const { text, failed } = useTextFile(url);
  if (failed) return <Failed url={url} />;
  if (text === null) return <Loading title={title} />;
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <Toolbar url={url} title={title} text={text} />
      <pre className="overflow-x-auto rounded-2xl border border-border bg-surface/70 p-5 font-mono text-[0.82rem] leading-relaxed text-foreground">
        <code>{text}</code>
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ markdown */

function inline(md: string): string {
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escape(md)
    .replace(/`([^`]+)`/g, '<code class="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.85em]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|\W)\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer" class="font-semibold text-primary hover:underline">$1</a>',
    );
}

/** Small, dependency-free markdown renderer covering the common blocks. */
export function renderMarkdown(source: string): string {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inCode = false;
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const raw of lines) {
    const line = raw;
    if (/^\s*```/.test(line)) {
      closeList();
      out.push(inCode ? "</code></pre>" : '<pre class="overflow-x-auto rounded-2xl border border-border bg-surface/70 p-4 font-mono text-[0.82rem]"><code>');
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      out.push(line.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "\n");
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1]!.length;
      const sizes = ["text-3xl", "text-2xl", "text-xl", "text-lg", "text-base", "text-base"];
      out.push(
        `<h${level} class="mt-8 font-display font-bold tracking-tight text-foreground ${sizes[level - 1]}">${inline(heading[2] ?? "")}</h${level}>`,
      );
      continue;
    }
    if (/^\s*([-*+])\s+/.test(line)) {
      if (listType !== "ul") {
        closeList();
        out.push('<ul class="mt-3 list-disc space-y-1.5 pl-6">');
        listType = "ul";
      }
      out.push(`<li>${inline(line.replace(/^\s*[-*+]\s+/, ""))}</li>`);
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      if (listType !== "ol") {
        closeList();
        out.push('<ol class="mt-3 list-decimal space-y-1.5 pl-6">');
        listType = "ol";
      }
      out.push(`<li>${inline(line.replace(/^\s*\d+[.)]\s+/, ""))}</li>`);
      continue;
    }
    if (/^\s*>\s?/.test(line)) {
      closeList();
      out.push(`<blockquote class="mt-4 border-l-2 border-primary/50 pl-4 italic text-muted-foreground">${inline(line.replace(/^\s*>\s?/, ""))}</blockquote>`);
      continue;
    }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      closeList();
      out.push('<hr class="my-8 border-border" />');
      continue;
    }
    if (line.trim() === "") {
      closeList();
      continue;
    }
    closeList();
    out.push(`<p class="mt-4 leading-relaxed text-foreground">${inline(line)}</p>`);
  }
  closeList();
  if (inCode) out.push("</code></pre>");
  return out.join("\n");
}

export function MarkdownFileViewer({ url, title }: { url: string; title: string }) {
  const { text, failed } = useTextFile(url);
  const html = useMemo(() => (text ? renderMarkdown(text) : ""), [text]);
  if (failed) return <Failed url={url} />;
  if (text === null) return <Loading title={title} />;
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <Toolbar url={url} title={title} text={text} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

/* ------------------------------------------------------------------ csv */

function parseCsv(source: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") cell += ch;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export function CsvFileViewer({ url, title }: { url: string; title: string }) {
  const { text, failed } = useTextFile(url);
  const rows = useMemo(() => (text ? parseCsv(text) : []), [text]);
  if (failed) return <Failed url={url} />;
  if (text === null) return <Loading title={title} />;
  if (rows.length === 0) return <CodeFileViewer url={url} title={title} />;
  const [head, ...body] = rows;
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <Toolbar url={url} title={title} text={text} />
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-surface/80">
            <tr>
              {(head ?? []).map((cell, i) => (
                <th key={i} className="border-b border-border px-3 py-2 text-left font-semibold text-foreground">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.slice(0, 2000).map((r, ri) => (
              <tr key={ri} className={cn(ri % 2 === 1 && "bg-surface/40")}>
                {r.map((cell, ci) => (
                  <td key={ci} className="border-b border-border/60 px-3 py-2 align-top text-muted-foreground">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {body.length > 2000 && (
        <p className="mt-3 text-xs text-muted-foreground">Showing the first 2,000 rows of {body.length}.</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ notebook */

type NotebookCell = {
  cell_type?: string;
  source?: string[] | string;
  outputs?: {
    text?: string[] | string;
    data?: Record<string, unknown>;
    traceback?: string[];
  }[];
};

const joinSource = (value: string[] | string | undefined) =>
  Array.isArray(value) ? value.join("") : (value ?? "");

export function NotebookFileViewer({ url, title }: { url: string; title: string }) {
  const { text, failed } = useTextFile(url);
  const cells = useMemo<NotebookCell[] | null>(() => {
    if (!text) return null;
    try {
      const parsed = JSON.parse(text) as { cells?: NotebookCell[] };
      return Array.isArray(parsed.cells) ? parsed.cells : [];
    } catch {
      return [];
    }
  }, [text]);

  if (failed) return <Failed url={url} />;
  if (text === null) return <Loading title={title} />;
  if (!cells || cells.length === 0) return <CodeFileViewer url={url} title={title} />;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <Toolbar url={url} title={title} />
      <div className="space-y-4">
        {cells.map((cell, index) => {
          const source = joinSource(cell.source);
          if (cell.cell_type === "markdown") {
            return (
              <div key={index} dangerouslySetInnerHTML={{ __html: renderMarkdown(source) }} />
            );
          }
          const outputs = cell.outputs ?? [];
          const images = outputs
            .map((o) => {
              const data = (o.data ?? {}) as Record<string, unknown>;
              const png = data["image/png"];
              return typeof png === "string" ? `data:image/png;base64,${png.replace(/\s/g, "")}` : null;
            })
            .filter((v): v is string => Boolean(v));
          const streams = outputs
            .map((o) => {
              const data = (o.data ?? {}) as Record<string, unknown>;
              return (
                joinSource(o.text) ||
                joinSource(o.traceback) ||
                joinSource(data["text/plain"] as string[] | string | undefined)
              );
            })
            .filter(Boolean);
          return (
            <div key={index} className="overflow-hidden rounded-2xl border border-border">
              <pre className="overflow-x-auto bg-surface/70 p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
                <code>{source}</code>
              </pre>
              {streams.length > 0 && (
                <pre className="overflow-x-auto border-t border-border bg-background p-4 font-mono text-[0.78rem] text-muted-foreground">
                  <code>{streams.join("\n")}</code>
                </pre>
              )}
              {images.map((src, i) => (
                <img key={i} src={src} alt="" className="block w-full border-t border-border" />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ media */

export function VideoFileViewer({ url, title }: { url: string; title: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        title={title}
        className="block w-full rounded-2xl bg-black"
      />
    </div>
  );
}

export function AudioFileViewer({ url, title }: { url: string; title: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <p className="mb-3 truncate font-display font-semibold text-foreground">{title}</p>
        <audio src={url} controls preload="metadata" className="w-full" />
      </div>
    </div>
  );
}
