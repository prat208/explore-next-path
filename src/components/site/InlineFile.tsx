import { useEffect, useRef, useState } from "react";
import { MediaBlock } from "@/components/blocks/MediaBlock";
import {
  AudioFileViewer,
  CodeFileViewer,
  CsvFileViewer,
  MarkdownFileViewer,
  NotebookFileViewer,
  VideoFileViewer,
} from "@/components/site/inline-viewers";
import { detectKind, type MediaKind } from "@/lib/upload";

const RESIZE_SCRIPT = `<script>(function(){
  var lastHeight=0,queued=false;
  function send(){
    queued=false;
    var d=document.documentElement,b=document.body;
    var h=Math.max(d.scrollHeight,b?b.scrollHeight:0,d.offsetHeight);
    if(h!==lastHeight){lastHeight=h;parent.postMessage({__explorersEmbedHeight:h},'*');}
  }
  function schedule(){
    if(!queued){queued=true;requestAnimationFrame(send);}
  }
  window.addEventListener('load',schedule);
  window.addEventListener('resize',schedule);
  document.addEventListener('click',function(){setTimeout(schedule,100);},true);
  if(typeof ResizeObserver!=='undefined'){
    new ResizeObserver(schedule).observe(document.documentElement);
  }
  if(typeof MutationObserver!=='undefined'){
    new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true});
  }
  schedule();

  // Some uploads are app-like: they open modals/overlays with position:fixed.
  // A frame stretched to full document height would place those off-screen, so
  // tell the host to keep this document in its own scrollable viewport instead.
  var appMode=false;
  function detectApp(){
    if(appMode) return;
    var nodes=document.body?document.body.querySelectorAll('*'):[];
    var limit=Math.min(nodes.length,3000);
    for(var i=0;i<limit;i++){
      var pos=getComputedStyle(nodes[i]).position;
      if(pos==='fixed'||pos==='sticky'){
        appMode=true;
        parent.postMessage({__explorersEmbedMode:'app'},'*');
        return;
      }
    }
  }
  window.addEventListener('load',function(){setTimeout(detectApp,60);});
  setTimeout(detectApp,400);


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
 * Renders any uploaded file as a native part of the page: HTML pages become the
 * page body, PDFs read inline, images sit flush, video/audio play, code, CSV,
 * markdown and notebooks render as typeset site content. Only formats a browser
 * genuinely cannot open (Office docs, archives) fall back to a download card.
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
  const name = (title || url).toLowerCase().split("?")[0] ?? "";
  const kind: MediaKind = detectKind(title || url, mime ?? "");

  if (kind === "html") return <HtmlPage url={url} title={title} />;

  if (kind === "pdf") {
    return (
      <object data={url} type="application/pdf" className="block h-[calc(100vh-6rem)] w-full bg-white">
        <iframe src={`${url}#view=FitH`} title={title} className="h-full w-full border-0 bg-white" />
      </object>
    );
  }

  if (kind === "image") {
    return <img src={url} alt={title} loading="lazy" className="mx-auto block w-full max-w-6xl" />;
  }

  if (kind === "video") return <VideoFileViewer url={url} title={title} />;
  if (kind === "audio") return <AudioFileViewer url={url} title={title} />;
  if (kind === "notebook") return <NotebookFileViewer url={url} title={title} />;

  if (kind === "code") {
    if (/\.(md|markdown|mdx)$/.test(name)) return <MarkdownFileViewer url={url} title={title} />;
    if (/\.(csv|tsv)$/.test(name)) return <CsvFileViewer url={url} title={title} />;
    return <CodeFileViewer url={url} title={title} />;
  }

  if (kind === "link" && /\.(txt|log|ini|env|conf|toml|xml|svg|rtf)$/.test(name)) {
    return <CodeFileViewer url={url} title={title} />;
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
  const [appMode, setAppMode] = useState(false);

  useEffect(() => {
    let alive = true;
    setDoc(null);
    setAppMode(false);
    fetch(url)
      .then((r) => r.text())
      .then((body) => {
        if (alive) setDoc(prepare(body, url));
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
      if (!frameRef.current || event.source !== frameRef.current.contentWindow) return;
      const payload = event.data as { __explorersEmbedHeight?: number; __explorersEmbedMode?: string } | null;
      if (payload?.__explorersEmbedMode === "app") setAppMode(true);
      const next = typeof payload?.__explorersEmbedHeight === "number" ? payload.__explorersEmbedHeight : 0;
      if (next > 0) setHeight(Math.max(400, Math.min(next + 24, 40000)));
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
      sandbox="allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-presentation allow-popups-to-escape-sandbox"
      allow="clipboard-write; fullscreen; autoplay"
      className="block w-full border-0 bg-transparent"
      style={appMode ? { height: "calc(100vh - 5rem)" } : { height }}
    />
  );

}
