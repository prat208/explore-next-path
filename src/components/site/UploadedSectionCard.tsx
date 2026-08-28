import { Link } from "@tanstack/react-router";
import { FileStack } from "lucide-react";
import { Pill } from "@/components/site/bits";
import type { UploadFile, UploadSection } from "@/lib/sections";
import { detectKind } from "@/lib/upload";

export function UploadedSectionCard({
  section,
}: {
  section: UploadSection & { files: UploadFile[] };
}) {
  const kinds = Array.from(
    new Set(section.files.map((file) => detectKind(file.title, file.mime ?? ""))),
  ).slice(0, 3);

  return (
    <Link
      to="/section/$slug"
      params={{ slug: section.slug }}
      className="hover-lift focus-ring group flex h-full flex-col rounded-xl border border-border bg-card p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        {kinds.map((kind) => (
          <Pill key={kind}>{kind}</Pill>
        ))}
        <Pill tone="primary">
          {section.files.length} file{section.files.length === 1 ? "" : "s"}
        </Pill>
      </div>
      <h2 className="mt-3 font-display text-lg font-semibold text-foreground">{section.title}</h2>
      {(section.subtitle || section.description) && (
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {section.subtitle ?? section.description}
        </p>
      )}
      <span className="mt-auto flex items-center gap-2 pt-4 text-sm font-semibold text-primary">
        <FileStack className="h-4 w-4" aria-hidden /> Open inside Explorers
      </span>
    </Link>
  );
}