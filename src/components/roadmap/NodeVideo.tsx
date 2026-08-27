/** Extracts a YouTube video id from watch, youtu.be, shorts or embed URLs. */
export function youtubeId(url?: string | null): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/(?:embed|shorts|live)\/([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return /^[\w-]{11}$/.test(url.trim()) ? url.trim() : null;
}

export function NodeVideo({ url, title }: { url?: string | null; title?: string | null }) {
  const id = youtubeId(url);
  if (!id) return null;

  return (
    <div className="mt-5 border-t border-border pt-4">
      <p className="eyebrow text-muted-foreground">Watch</p>
      {title && <p className="mt-1 text-sm font-medium text-foreground">{title}</p>}
      <div className="mt-2 aspect-video overflow-hidden rounded-lg border border-border bg-background">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title ?? "Roadmap step video"}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
