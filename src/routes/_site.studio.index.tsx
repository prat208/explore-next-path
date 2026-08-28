import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, ExternalLink, FolderPlus, FolderUp, Link2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { MediaBlock } from "@/components/blocks/MediaBlock";
import { bundleWebFiles, detectKind, prettySize, uploadToLibrary } from "@/lib/upload";
import type { UploadFile, UploadSection } from "@/lib/sections";
import {
  SECTION_CATEGORIES,
  addFile,
  attachTargetsQuery,
  categoryLabel,
  createSection,
  deleteFile,
  deleteSection,
  sectionsQuery,
  updateFile,
  updateSection,
} from "@/lib/sections";

export const Route = createFileRoute("/_site/studio/")({
  component: UploadsPage,
});

function UploadsPage() {
  const qc = useQueryClient();
  const sections = useQuery(sectionsQuery);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("roadmap");
  const [subtitle, setSubtitle] = useState("");
  const [creating, setCreating] = useState(false);

  const refresh = () => void qc.invalidateQueries({ queryKey: ["upload-sections"] });

  async function makeSection() {
    if (!title.trim()) {
      toast.error("Give the section a name, e.g. “AI Engineer Roadmap”");
      return;
    }
    setCreating(true);
    try {
      await createSection({ title: title.trim(), category, subtitle: subtitle.trim() });
      setTitle("");
      setSubtitle("");
      toast.success("Section created — now drop its files in");
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create section");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow text-primary">Explorer Studio</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
          Sections &amp; uploads
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Create a named section — “AI Engineer Roadmap”, “RAG Deep Dive”, “Python Field Manual” — then upload its files
          into it. Everything you drop appears below exactly as a learner sees it, and each section gets its own public
          page.
        </p>
      </header>

      <section className="rounded-3xl border border-border bg-card p-5 card-soft">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
          <FolderPlus className="h-4 w-4 text-primary" /> New section
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1.4fr_1fr_auto]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Section name — e.g. AI Engineer Roadmap"
            className="focus-ring rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="focus-ring rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
          >
            {SECTION_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={creating}
            onClick={() => void makeSection()}
            className="focus-ring rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-60"
          >
            {creating ? "Creating…" : "Create section"}
          </button>
        </div>
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="One line for learners (optional) — what this section helps them do"
          className="focus-ring mt-3 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
        />
      </section>

      {sections.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading your sections…</p>
      ) : (sections.data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">No sections yet — create one above.</p>
      ) : (
        <div className="space-y-12">
          {(sections.data ?? []).map((section) => (
            <SectionPanel
              key={section.id}
              section={section}
              onChanged={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type SectionWithFiles = UploadSection & { files: UploadFile[] };

function SectionPanel({ section, onChanged }: { section: SectionWithFiles; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);

  async function upload(list: FileList | null) {
    if (!list || list.length === 0) return;
    setBusy(true);
    try {
      const picked = Array.from(list);
      const toUpload = await bundleWebFiles(picked);
      const bundled = picked.length > toUpload.length;
      let order = section.files.length;
      for (const file of toUpload) {
        const uploaded = await uploadToLibrary(file, `library/${section.slug}`);
        await addFile(section.id, {
          title: uploaded.name,
          url: uploaded.url,
          path: uploaded.path,
          mime: uploaded.mime,
          size: uploaded.size,
          sort_order: order++,
        });
      }
      toast.success(
        bundled
          ? `Bundled ${picked.length} files into one interactive page`
          : `Added to “${section.title}”`,
      );
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5 card-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow text-primary">{categoryLabel(section.category)}</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-foreground">{section.title}</h2>
          {section.subtitle && <p className="mt-1 text-sm text-muted-foreground">{section.subtitle}</p>}
          <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
            {section.files.length} file{section.files.length === 1 ? "" : "s"} ·{" "}
            <span className={section.published ? "text-primary" : "text-muted-foreground"}>
              {section.published ? `live in /${section.category}s` : "draft — learners cannot see it"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void updateSection(section.id, { published: !section.published })
                .then(() => {
                  toast.success(section.published ? "Unpublished" : "Published — it is live now");
                  onChanged();
                })
                .catch((error: unknown) =>
                  toast.error(error instanceof Error ? error.message : "Could not change status"),
                );
            }}
            className={
              section.published
                ? "focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:border-primary/50"
                : "focus-ring inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-deep"
            }
          >
            {section.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {section.published ? "Unpublish" : "Publish"}
          </button>
          <Link
            to="/section/$slug"
            params={{ slug: section.slug }}
            target="_blank"
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:border-primary/50"
          >
            Learner view <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => {
              void deleteSection(section.id)
                .then(onChanged)
                .catch((error: unknown) =>
                  toast.error(error instanceof Error ? error.message : "Could not delete section"),
                );
            }}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:border-destructive/50 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete section
          </button>
        </div>
      </div>

      <AttachControl section={section} onChanged={onChanged} />

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void upload(event.dataTransfer.files);
        }}
        className="mt-5 rounded-2xl border border-dashed border-primary/40 bg-primary/[0.04] px-5 py-7 text-center"
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            <UploadCloud className="h-4 w-4" />
            {busy ? "Uploading…" : "Add files to this section"}
            <input type="file" multiple className="sr-only" disabled={busy} onChange={(e) => void upload(e.target.files)} />
          </label>
          <label className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">
            <FolderUp className="h-4 w-4" />
            Whole folder
            <input
              type="file"
              multiple
              className="sr-only"
              disabled={busy}
              // @ts-expect-error non-standard but supported directory picker
              webkitdirectory=""
              directory=""
              onChange={(e) => void upload(e.target.files)}
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Video, PDF, audio, image, notebook, code, zip or an interactive <span className="font-mono">index.html</span>{" "}
          with its CSS/JS (they get merged into one self-contained page).
        </p>
      </div>

      {section.files.length > 0 && (
        <div className="mt-8 space-y-10">
          {section.files.map((file) => (
            <div key={file.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <input
                    defaultValue={file.title}
                    aria-label="File title"
                    onBlur={(event) => {
                      const next = event.target.value.trim();
                      if (!next || next === file.title) return;
                      void updateFile(file.id, { title: next })
                        .then(() => {
                          toast.success("Title saved");
                          onChanged();
                        })
                        .catch((error: unknown) =>
                          toast.error(error instanceof Error ? error.message : "Could not rename"),
                        );
                    }}
                    className="focus-ring w-full rounded-lg border border-transparent bg-transparent px-2 py-1 font-display text-base font-semibold text-foreground hover:border-border"
                  />
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {detectKind(file.title, file.mime ?? "")}
                    {prettySize(file.size) && ` · ${prettySize(file.size)}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void deleteFile(file.id)
                      .then(onChanged)
                      .catch((error: unknown) =>
                        toast.error(error instanceof Error ? error.message : "Could not delete file"),
                      );
                  }}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-destructive/50 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
              <MediaBlock
                data={{
                  url: file.url,
                  title: file.title,
                  name: file.title,
                  mime: file.mime ?? "",
                  size: file.size ?? 0,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/** Links a whole section to one page, so its files render inside that page. */
function AttachControl({ section, onChanged }: { section: SectionWithFiles; onChanged: () => void }) {
  const targets = useQuery(attachTargetsQuery);
  const value = section.entity_type && section.entity_slug ? `${section.entity_type}::${section.entity_slug}` : "";

  return (
    <label className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <Link2 className="h-4 w-4 text-primary" />
      Show these files on:
      <select
        value={value}
        onChange={(event) => {
          const [type, slug] = event.target.value.split("::");
          void updateSection(section.id, {
            entity_type: type || null,
            entity_slug: slug || null,
          })
            .then(() => {
              toast.success(type ? "Linked — files now appear on that page" : "Unlinked");
              onChanged();
            })
            .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not link"));
        }}
        className="focus-ring min-w-56 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
      >
        <option value="">Only its own page (/section/{section.slug})</option>
        {(targets.data ?? []).map((target) => (
          <option key={`${target.type}::${target.slug}`} value={`${target.type}::${target.slug}`}>
            {categoryLabel(target.type)}: {target.title}
          </option>
        ))}
      </select>
    </label>
  );
}
