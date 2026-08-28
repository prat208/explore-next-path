import { MediaBlock } from "@/components/blocks/MediaBlock";

export { youtubeId } from "@/lib/youtube";

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
