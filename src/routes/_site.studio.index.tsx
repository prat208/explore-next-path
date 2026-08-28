import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { MediaBlock } from "@/components/blocks/MediaBlock";
import { supabase } from "@/integrations/supabase/client";
import { detectKind, prettySize, uploadToLibrary } from "@/lib/upload";

export const Route = createFileRoute("/_site/studio/")({
  component: UploadsPage,
});

type LibraryFile = {
  path: string;
  name: string;
  url: string;
  size: number;
};

const FOLDER = "library";
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

async function loadFiles(): Promise<LibraryFile[]> {
  const { data, error } = await supabase.storage
    .from("uploads")
    .list(FOLDER, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw new Error(error.message);
  const entries = (data ?? []).filter((item) => item.id);
  if (entries.length === 0) return [];
  const paths = entries.map((item) => `${FOLDER}/${item.name}`);
  const { data: signed } = await supabase.storage.from("uploads").createSignedUrls(paths, TEN_YEARS);
  return entries.map((item, index) => ({
    path: `${FOLDER}/${item.name}`,
    name: item.name.replace(/^\d+-[a-z0-9]{2,6}-/, ""),
    url: signed?.[index]?.signedUrl ?? "",
    size: Number((item.metadata as { size?: number } | null)?.size ?? 0),
  }));
}

function UploadsPage() {
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    setLoading(true);
    loadFiles()
      .then(setFiles)
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load files"))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  async function upload(list: FileList | null) {
    if (!list || list.length === 0) return;
    setBusy(true);
    try {
      for (const file of Array.from(list)) {
        await uploadToLibrary(file, FOLDER);
      }
      toast.success(list.length === 1 ? "File uploaded" : `${list.length} files uploaded`);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(path: string) {
    const { error } = await supabase.storage.from("uploads").remove([path]);
    if (error) {
      toast.error(error.message);
      return;
    }
    setFiles((current) => current.filter((file) => file.path !== path));
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow text-primary">Explorer Studio</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">Uploads</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Drop any file — video, PDF, image, audio, notebook, code, interactive HTML. Below each upload you see exactly
          what a learner sees.
        </p>
      </header>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void upload(event.dataTransfer.files);
        }}
        className="rounded-3xl border border-dashed border-primary/40 bg-primary/[0.04] px-6 py-10 text-center"
      >
        <label className="focus-within:ring-primary/40 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
          <UploadCloud className="h-4 w-4" />
          {busy ? "Uploading…" : "Choose files"}
          <input type="file" multiple className="sr-only" disabled={busy} onChange={(e) => void upload(e.target.files)} />
        </label>
        <p className="mt-3 text-xs text-muted-foreground">or drag and drop them anywhere in this box</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading your files…</p>
      ) : files.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing uploaded yet.</p>
      ) : (
        <div className="space-y-10">
          {files.map((file) => (
            <section key={file.path}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-foreground">{file.name}</p>
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {detectKind(file.name)} {prettySize(file.size) && `· ${prettySize(file.size)}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void remove(file.path)}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-destructive/50 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
              <MediaBlock data={{ url: file.url, title: file.name, name: file.name, size: file.size }} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
