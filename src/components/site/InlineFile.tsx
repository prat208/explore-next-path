import { useEffect, useRef, useState } from "react";
import { MediaBlock } from "@/components/blocks/MediaBlock";
import { detectKind, type MediaKind } from "@/lib/upload";

const RESIZE_SCRIPT = `<script>(function(){
  function send(){
    var d=document.documentElement,b=document.body;
    var h=Math.max(d.scrollHeight,b?b.scrollHeight:0,d.offsetHeight);
    parent.postMessage({__explorersEmbedHeight:h},'*');
  }
  window.addEventListener('load',send);
  window.addEventListener('resize',send);
  document.addEventListener('click',function(){setTimeout(send,150);},true);
  setInterval(send,600);

  // Keep navigation inside this document: in-page anchors scroll here,
  // anything external opens in a new tab instead of loading a site in the frame.
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
    if(!a) return;
    var raw=a.getAttribute('href')||'';
    if(!raw||raw.toLowerCase().indexOf('javascript:')===0) return;
    if(raw.charAt(0)==='#'){
      e.preventDefault();
      var id=decodeURIComponent(raw.slice(1));
      var t=id?(document.getElementById(id)||document.getElementsByName(id)[0]):document.body;
      if(t&&t.scrollIntoView){t.scrollIntoView({behavior:'smooth',block:'start'});}
      setTimeout(send,300);
      return;
    }
    var abs;
    try{abs=new URL(raw,document.baseURI).href;}catch(err){return;}
    if(abs.split('#')[0]===document.baseURI.split('#')[0]){
      e.preventDefault();
      return;
    }
    e.preventDefault();
    window.open(abs,'_blank','noopener');
  },true);
})();<\/script>`;

function prepare(html: string, url: string): string {
  const base = `<base href="${url.replace(/"/g, "&quot;")}">`;
  let doc = /<html[\s>]/i.test(html)
    ? html
    : `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${html}</body></html>`;
  if (!/<base[\s>]/i.test(doc)) {
    doc = /<head[^>]*>/i.test(doc)
      ? doc.replace(/<head[^>]*>/i, (m) => `${m}${base}`)
      : `${base}${doc}`;
  }
  return /<\/body>/i.test(doc) ? doc.replace(/<\/body>/i, `${RESIZE_SCRIPT}</body>`) : doc + RESIZE_SCRIPT;
}


/**
 * Renders an uploaded file as a native part of the page — an uploaded HTML page
 * becomes the page body itself (full width, no card, no frame chrome), a PDF
 * reads inline, an image sits flush. Anything else falls back to MediaBlock.
 */
export function InlineFile({
  url,
  title,
  mime,
  size,
}: {
  url: string;
  title: string;
  mime?: string | null;
  size?: number | null;
}) {
  const kind: MediaKind = detectKind(title || url, mime ?? "");

  if (kind === "html") return <HtmlPage url={url} title={title} />;

  if (kind === "pdf") {
    return (
      <iframe
        src={`${url}#view=FitH`}
        title={title}
        className="h-[calc(100vh-6rem)] w-full border-0 bg-white"
      />
    );
  }

  if (kind === "image") {
    return <img src={url} alt={title} loading="lazy" className="mx-auto block w-full max-w-6xl" />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <MediaBlock data={{ url, title, name: title, mime: mime ?? "", size: size ?? 0 }} />
    </div>
  );
}

function HtmlPage({ url, title }: { url: string; title: string }) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [doc, setDoc] = useState<string | null>(null);
  const [height, setHeight] = useState(900);

  useEffect(() => {
    let alive = true;
    setDoc(null);
    fetch(url)
      .then((r) => r.text())
      .then((body) => {
        if (alive) setDoc(prepare(body));
      })
      .catch(() => {
        if (alive) setDoc("");
      });
    return () => {
      alive = false;
    };
  }, [url]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const payload = event.data as { __explorersEmbedHeight?: number } | null;
      const next = payload && typeof payload.__explorersEmbedHeight === "number" ? payload.__explorersEmbedHeight : 0;
      if (next > 0 && frameRef.current && event.source === frameRef.current.contentWindow) {
        setHeight(Math.max(400, Math.min(next + 24, 40000)));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (doc === null) {
    return <p className="px-6 py-16 text-center text-sm text-muted-foreground">Loading {title}…</p>;
  }
  if (doc === "") {
    return (
      <p className="px-6 py-16 text-center text-sm text-muted-foreground">
        This file could not be opened.{" "}
        <a href={url} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
          Open it directly
        </a>
        .
      </p>
    );
  }

  return (
    <iframe
      ref={frameRef}
      srcDoc={doc}
      title={title}
      sandbox="allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
      className="block w-full border-0 bg-transparent"
      style={{ height }}
    />
  );
}
