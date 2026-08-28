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
    if (match?.[1]) return match[1];
  }
  return /^[\w-]{11}$/.test(url.trim()) ? url.trim() : null;
}

/**
 * Renders whatever the author attached to a roadmap step — a YouTube link, an
 * uploaded MP4, a PDF, a notebook or any other file — with the presentation
 * that suits it.
 */
export function NodeVideo({ url, title }: { url?: string | null; title?: string | null }) {
  if (!url?.trim()) return null;

  return (
    <div className="mt-5 border-t border-border pt-2">
      <MediaBlock data={{ url: url.trim(), title: title ?? "Resource for this step" }} />
    </div>
  );
}
