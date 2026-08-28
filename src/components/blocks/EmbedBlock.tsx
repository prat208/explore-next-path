import { useEffect, useRef, useState } from "react";
import { ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Data = Record<string, unknown>;

const RESIZE_SCRIPT = `<script>(function(){
  function send(){
    var d=document.documentElement, b=document.body;
    var h=Math.max(d.scrollHeight,b?b.scrollHeight:0,d.offsetHeight);
    parent.postMessage({__explorersEmbedHeight:h},'*');
  }
  window.addEventListener('load',send);
  window.addEventListener('resize',send);
  document.addEventListener('click',function(){setTimeout(send,120);},true);
  setInterval(send,700);
})();<\/script>`;

function wrap(html: string) {
  const hasDoc = /<html[\s>]/i.test(html);
  const doc = hasDoc
    ? html
    : `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;font-family:'IBM Plex Sans',system-ui,sans-serif;}</style></head><body>${html}</body></html>`;
  return doc.replace(/<\/body>/i, `${RESIZE_SCRIPT}</body>`) === doc
    ? doc + RESIZE_SCRIPT
    : doc.replace(/<\/body>/i, `${RESIZE_SCRIPT}</body>`);
}

/**
 * Renders an author-supplied interactive document (their own HTML/CSS/JS file —
 * diagrams, tree charts, playable widgets) inside a sandboxed frame that grows
 * to fit its content.
 */
export function EmbedBlock({ data }: { data: Data }) {
  const html = typeof data["html"] === "string" ? (data["html"] as string) : "";
  const url = typeof data["url"] === "string" ? (data["url"] as string) : "";
  const title = typeof data["title"] === "string" ? (data["title"] as string) : "Interactive";
  const caption = typeof data["caption"] === "string" ? (data["caption"] as string) : "";
  const minHeight = Number(data["height"]) > 0 ? Number(data["height"]) : 520;

  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState(minHeight);
  const [full, setFull] = useState(false);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const payload = event.data as { __explorersEmbedHeight?: number } | null;
      const next = payload && typeof payload.__explorersEmbedHeight === "number" ? payload.__explorersEmbedHeight : 0;
      if (next > 0 && frameRef.current && event.source === frameRef.current.contentWindow) {
        setHeight(Math.max(minHeight, Math.min(next + 8, 8000)));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [minHeight]);

  if (!html && !url) return null;

  return (
    <figure
      className={cn(
        "my-8 overflow-hidden rounded-2xl border border-border bg-card card-soft",
        full && "fixed inset-3 z-50 my-0 flex flex-col",
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border bg-surface/70 px-4 py-2.5">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-secondary">{title}</span>
        <div className="flex items-center gap-2">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[0.7rem] font-semibold text-muted-foreground hover:text-foreground"
            >
              Open <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          )}
          <button
            type="button"
            onClick={() => setFull((f) => !f)}
            aria-label={full ? "Exit full screen" : "Expand to full screen"}
            className="focus-ring inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[0.7rem] font-semibold text-muted-foreground hover:text-foreground"
          >
            {full ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            {full ? "Close" : "Expand"}
          </button>
        </div>
      </header>
      <iframe
        ref={frameRef}
        title={title}
        {...(html ? { srcDoc: wrap(html) } : { src: url })}
        sandbox="allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
        loading="lazy"
        className={cn("w-full border-0 bg-white", full && "flex-1")}
        style={full ? undefined : { height }}
      />
      {caption && !full && (
        <figcaption className="border-t border-border px-4 py-2.5 text-sm text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  );
}
