import { useEffect, useRef, useState } from "react";
import {
  Archive,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Film,
  Headphones,
  ImageIcon,
  Maximize2,
  Minimize2,
  ListTree,
  Play,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { detectKind, prettySize, type MediaKind } from "@/lib/upload";
import { youtubeId } from "@/components/roadmap/NodeVideo";
import { EmbedBlock } from "./EmbedBlock";

type Data = Record<string, unknown>;

const str = (d: Data, k: string, fallback = ""): string => (typeof d[k] === "string" ? (d[k] as string) : fallback);
const list = (d: Data, k: string): unknown[] => (Array.isArray(d[k]) ? (d[k] as unknown[]) : []);

const KIND_META: Record<MediaKind, { label: string; icon: typeof Film }> = {
  video: { label: "Watch", icon: Film },
  audio: { label: "Listen", icon: Headphones },
  image: { label: "Visual", icon: ImageIcon },
  pdf: { label: "Read", icon: FileText },
  html: { label: "Interactive", icon: ListTree },
  code: { label: "Source", icon: Code2 },
  notebook: { label: "Notebook", icon: Code2 },
  archive: { label: "Bundle", icon: Archive },
  doc: { label: "Document", icon: FileText },
  link: { label: "Resource", icon: ExternalLink },
};

/** Parses "1:20 Setting up" / "90 Setting up" chapter lines into seconds + label. */
function parseChapters(raw: unknown[]): { seconds: number; label: string }[] {
  return raw
    .map((entry) => {
      if (entry && typeof entry === "object") {
        const obj = entry as Record<string, unknown>;
        const time = String(obj["time"] ?? obj["at"] ?? "0");
        return { seconds: toSeconds(time), label: String(obj["label"] ?? obj["title"] ?? "") };
      }
      const text = String(entry ?? "").trim();
      const match = text.match(/^(\d+(?::\d+){0,2})\s+(.*)$/);
      if (!match) return { seconds: -1, label: text };
      return { seconds: toSeconds(match[1] ?? "0"), label: (match[2] ?? "").trim() };
    })
    .filter((chapter) => chapter.label.length > 0);
}

function toSeconds(value: string): number {
  const parts = value.split(":").map((part) => Number(part) || 0);
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function stamp(seconds: number): string {
  if (seconds < 0) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * One universal presentation surface for any uploaded artefact — video, audio,
 * PDF, image, notebook, code file, archive or link. Chapters, takeaways and a
 * theatre mode turn a raw file into a guided learning step.
 */
export function MediaBlock({ data }: { data: Data }) {
  const url = str(data, "url");
  const html = str(data, "html");
  const name = str(data, "name");
  const title = str(data, "title") || name || "Resource";
  const caption = str(data, "caption");
  const note = str(data, "note");
  const mime = str(data, "mime");
  const size = Number(data["size"]) || 0;
  const kind = (str(data, "kind") as MediaKind) || detectKind(url || name || html, mime);
  const chapters = parseChapters(list(data, "chapters"));
  const takeaways = list(data, "takeaways").map(String).filter(Boolean);

  const [theatre, setTheatre] = useState(false);
  const meta = KIND_META[kind] ?? KIND_META.link;
  const Icon = meta.icon;

  useEffect(() => {
    if (!theatre) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTheatre(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [theatre]);

  if (!url && !html) return null;
  if (kind === "html" && html) return <EmbedBlock data={data} />;

  const surface = <MediaSurface kind={kind} url={url} title={title} chapters={chapters} theatre={theatre} />;

  return (
    <figure
      className={cn(
        "group my-9 overflow-hidden rounded-3xl border border-border bg-card card-soft",
        theatre && "fixed inset-3 z-50 my-0 flex flex-col",
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/70 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <Icon className="h-4.5 w-4.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="eyebrow text-primary">{meta.label}</p>
            <p className="truncate font-display text-[0.98rem] font-semibold text-foreground">{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {size > 0 && (
            <span className="hidden font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground sm:inline">
              {prettySize(size)}
            </span>
          )}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              download={name || undefined}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[0.72rem] font-semibold text-muted-foreground hover:border-primary/50 hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" /> Save
            </a>
          )}
          <button
            type="button"
            onClick={() => setTheatre((value) => !value)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[0.72rem] font-semibold text-muted-foreground hover:border-primary/50 hover:text-foreground"
          >
            {theatre ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            {theatre ? "Close" : "Focus"}
          </button>
        </div>
      </header>

      <div className={cn("bg-background", theatre && "flex-1 overflow-auto")}>{surface}</div>

      {(caption || note || takeaways.length > 0 || chapters.length > 0) && !theatre && (
        <figcaption className="space-y-4 border-t border-border px-4 py-4 sm:px-5">
          {caption && <p className="text-sm text-muted-foreground">{caption}</p>}
          {chapters.length > 0 && kind !== "video" && kind !== "audio" && (
            <ol className="grid gap-1.5 sm:grid-cols-2">
              {chapters.map((chapter, index) => (
                <li key={index} className="flex gap-2 text-sm text-foreground/85">
                  <span className="font-mono text-xs text-secondary">{String(index + 1).padStart(2, "0")}</span>
                  {chapter.label}
                </li>
              ))}
            </ol>
          )}
          {takeaways.length > 0 && (
            <div className="rounded-2xl border border-primary/25 bg-primary/[0.06] p-4">
              <p className="eyebrow text-primary">What to take away</p>
              <ul className="mt-2 space-y-1.5">
                {takeaways.map((item, index) => (
                  <li key={index} className="flex gap-2 text-sm text-foreground/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {note && <p className="text-sm italic text-muted-foreground">{note}</p>}
        </figcaption>
      )}
    </figure>
  );
}

function MediaSurface({
  kind,
  url,
  title,
  chapters,
  theatre,
}: {
  kind: MediaKind;
  url: string;
  title: string;
  chapters: { seconds: number; label: string }[];
  theatre: boolean;
}) {
  switch (kind) {
    case "video":
      return <VideoSurface url={url} title={title} chapters={chapters} theatre={theatre} />;
    case "audio":
      return <AudioSurface url={url} chapters={chapters} />;
    case "image":
      return (
        <div className="grid place-items-center bg-surface p-3">
          <img
            src={url}
            alt={title}
            loading="lazy"
            className={cn("max-h-[70vh] w-full rounded-2xl object-contain", theatre && "max-h-none")}
          />
        </div>
      );
    case "pdf":
      return (
        <iframe
          src={`${url}#view=FitH`}
          title={title}
          className={cn("w-full border-0 bg-white", theatre ? "h-full min-h-[70vh]" : "h-[78vh]")}
        />
      );
    case "code":
    case "notebook":
      return <TextSurface url={url} theatre={theatre} />;
    default:
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="focus-ring flex items-center justify-between gap-4 px-5 py-8 hover:bg-surface/60"
        >
          <span className="text-sm text-muted-foreground">
            Open this file in a new tab — it downloads straight to your machine.
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground">
            Open <ExternalLink className="h-4 w-4" />
          </span>
        </a>
      );
  }
}

function VideoSurface({
  url,
  title,
  chapters,
  theatre,
}: {
  url: string;
  title: string;
  chapters: { seconds: number; label: string }[];
  theatre: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState(0);
  const id = youtubeId(url);
  const isEmbed = Boolean(id) || /vimeo\.com|loom\.com/.test(url);
  const [seek, setSeek] = useState(0);

  const jump = (seconds: number, index: number) => {
    setActive(index);
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, seconds);
      void videoRef.current.play();
    } else {
      setSeek(Math.max(0, seconds));
    }
  };

  const src = id
    ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1${seek ? `&start=${seek}&autoplay=1` : ""}`
    : url;

  return (
    <div className={cn("grid gap-0", chapters.length > 0 && "lg:grid-cols-[1fr_17rem]")}>
      <div className={cn("aspect-video w-full bg-black", theatre && "aspect-auto min-h-[60vh]")}>
        {isEmbed ? (
          <iframe
            key={src}
            src={src}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : (
          <video ref={videoRef} src={url} controls playsInline preload="metadata" className="h-full w-full bg-black">
            <track kind="captions" />
          </video>
        )}
      </div>
      {chapters.length > 0 && (
        <aside className="border-t border-border bg-surface/60 p-3 lg:border-l lg:border-t-0">
          <p className="eyebrow px-1 pb-2 text-muted-foreground">Chapters</p>
          <ol className="max-h-[26rem] space-y-1 overflow-auto">
            {chapters.map((chapter, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => jump(chapter.seconds < 0 ? 0 : chapter.seconds, index)}
                  className={cn(
                    "focus-ring flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition-colors",
                    active === index
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-background hover:text-foreground",
                  )}
                >
                  <Play className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0">
                    <span className="block leading-snug">{chapter.label}</span>
                    {chapter.seconds >= 0 && (
                      <span className="font-mono text-[0.68rem] text-secondary">{stamp(chapter.seconds)}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </aside>
      )}
    </div>
  );
}

function AudioSurface({ url, chapters }: { url: string; chapters: { seconds: number; label: string }[] }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  return (
    <div className="space-y-4 p-5">
      <div className="flex items-end gap-1" aria-hidden>
        {Array.from({ length: 48 }).map((_, index) => (
          <span
            key={index}
            className="w-full rounded-full bg-primary/30"
            style={{ height: `${12 + Math.abs(Math.sin(index * 1.7)) * 44}px` }}
          />
        ))}
      </div>
      <audio ref={audioRef} src={url} controls preload="metadata" className="w-full" />
      {chapters.length > 0 && (
        <ol className="grid gap-1.5 sm:grid-cols-2">
          {chapters.map((chapter, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = Math.max(0, chapter.seconds);
                    void audioRef.current.play();
                  }
                }}
                className="focus-ring flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                <span className="font-mono text-[0.68rem] text-secondary">{stamp(chapter.seconds)}</span>
                {chapter.label}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function TextSurface({ url, theatre }: { url: string; theatre: boolean }) {
  const [text, setText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(url)
      .then((response) => response.text())
      .then((body) => {
        if (alive) setText(body.slice(0, 200000));
      })
      .catch(() => {
        if (alive) setText(null);
      });
    return () => {
      alive = false;
    };
  }, [url]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(text ?? "");
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
        className="focus-ring absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[0.7rem] font-semibold text-muted-foreground hover:text-foreground"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre
        className={cn(
          "overflow-auto px-5 py-5 pr-24 font-mono text-[0.8rem] leading-relaxed text-foreground/90",
          theatre ? "max-h-none" : "max-h-[32rem]",
        )}
      >
        {text ?? "Loading file…"}
      </pre>
    </div>
  );
}
