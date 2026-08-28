import { useState, type ReactNode } from "react";
import { Check, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { detectKind, uploadToLibrary } from "@/lib/upload";
import { cn } from "@/lib/utils";
import type { StudioField } from "@/lib/studio";

export const inputClass =
  "focus-ring w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function toLines(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join("\n");
  return typeof value === "string" ? value : "";
}

export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: StudioField;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  switch (field.kind) {
    case "textarea":
      return (
        <Field label={field.label} {...(field.hint ? { hint: field.hint } : {})} className={field.full ? "sm:col-span-2" : ""}>
          <textarea
            rows={field.rows ?? 3}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            className={cn(inputClass, "resize-y leading-relaxed")}
          />
        </Field>
      );
    case "array":
      return (
        <Field
          label={field.label}
          hint={field.hint ?? "One item per line"}
          className={field.full ? "sm:col-span-2" : ""}
        >
          <textarea
            rows={field.rows ?? 4}
            value={toLines(value)}
            onChange={(e) =>
              onChange(
                e.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              )
            }
            className={cn(inputClass, "resize-y font-mono text-[0.82rem] leading-relaxed")}
          />
        </Field>
      );
    case "json":
      return (
        <JsonField
          label={field.label}
          {...(field.hint ? { hint: field.hint } : {})}
          rows={field.rows ?? 5}
          value={value}
          onChange={onChange}
          className={field.full ? "sm:col-span-2" : ""}
        />
      );
    case "html":
      return (
        <Field
          label={field.label}
          hint={field.hint ?? "Paste HTML/CSS/JS, or upload your own .html file — it renders as a live interactive block"}
          className={field.full ? "sm:col-span-2" : ""}
        >
          <div className="space-y-2">
            <input
              type="file"
              accept=".html,.htm,.svg,text/html,image/svg+xml"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => onChange(String(reader.result ?? ""));
                reader.readAsText(file);
              }}
              className="focus-ring w-full rounded-lg border border-dashed border-border bg-background px-3 py-2 text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground"
            />
            <textarea
              rows={field.rows ?? 10}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={'<div class="tree">…</div>'}
              className={cn(inputClass, "resize-y font-mono text-[0.78rem] leading-relaxed")}
            />
          </div>
        </Field>
      );
    case "upload":
      return (
        <Field
          label={field.label}
          hint={field.hint ?? "Upload a video, PDF, image, audio, notebook or any file — readers get a purpose-built player for it"}
          className={field.full ? "sm:col-span-2" : ""}
        >
          <UploadControl value={typeof value === "string" ? value : ""} onChange={onChange} />
        </Field>
      );
    case "boolean":
      return (
        <div className={cn("flex items-center gap-3 pt-6", field.full ? "sm:col-span-2" : "")}>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(value)}
            onClick={() => onChange(!value)}
            className={cn(
              "focus-ring relative h-6 w-11 rounded-full border transition-colors",
              value ? "border-primary bg-primary" : "border-border bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all",
                value ? "left-6" : "left-0.5",
              )}
            />
          </button>
          <span className="text-sm text-foreground">{field.label}</span>
        </div>
      );
    case "select":
      return (
        <Field label={field.label} {...(field.hint ? { hint: field.hint } : {})}>
          <select
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          >
            {(field.options ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      );
    case "number":
      return (
        <Field label={field.label} {...(field.hint ? { hint: field.hint } : {})}>
          <input
            type="number"
            value={value === null || value === undefined ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            className={inputClass}
          />
        </Field>
      );
    case "date":
      return (
        <Field label={field.label} {...(field.hint ? { hint: field.hint } : {})}>
          <input
            type="date"
            value={typeof value === "string" ? value.slice(0, 10) : ""}
            onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
            className={inputClass}
          />
        </Field>
      );
    default:
      return (
        <Field
          label={field.label}
          {...(field.hint ? { hint: field.hint } : {})}
          className={field.full ? "sm:col-span-2" : ""}
        >
          <input
            type="text"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            className={cn(inputClass, field.kind === "slug" && "font-mono text-[0.82rem]")}
          />
        </Field>
      );
  }
}

export function JsonField({
  label,
  hint,
  rows = 5,
  value,
  onChange,
  className,
}: {
  label: string;
  hint?: string | undefined;
  rows?: number;
  value: unknown;
  onChange: (next: unknown) => void;
  className?: string | undefined;
}) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? [], null, 2);
  let valid = true;
  try {
    JSON.parse(text);
  } catch {
    valid = false;
  }
  return (
    <Field
      label={label}
      hint={valid ? hint : "Invalid JSON — fix before saving"}
      {...(className ? { className } : {})}
    >
      <textarea
        rows={rows}
        value={text}
        onChange={(e) => {
          const raw = e.target.value;
          try {
            onChange(JSON.parse(raw));
          } catch {
            onChange(raw);
          }
        }}
        className={cn(
          inputClass,
          "resize-y font-mono text-[0.8rem] leading-relaxed",
          !valid && "border-destructive",
        )}
      />
    </Field>
  );
}

export function UploadControl({
  value,
  onChange,
  folder = "library",
}: {
  value: string;
  onChange: (next: string) => void;
  folder?: string;
}) {
  const [busy, setBusy] = useState(false);
  const kind = value ? detectKind(value) : null;

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const uploaded = await uploadToLibrary(file, folder);
      onChange(uploaded.url);
      toast.success(`${file.name} uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void pick(e.dataTransfer.files?.[0]);
        }}
        className="rounded-xl border border-dashed border-border bg-background px-3 py-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <label className="focus-within:ring-primary/40 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            <UploadCloud className="h-3.5 w-3.5" />
            {busy ? "Uploading…" : "Choose file"}
            <input
              type="file"
              className="sr-only"
              disabled={busy}
              onChange={(e) => void pick(e.target.files?.[0])}
            />
          </label>
          <span className="text-xs text-muted-foreground">or drop it here — video, PDF, image, audio, code, zip</span>
        </div>
      </div>
      <input
        type="text"
        value={value}
        placeholder="…or paste a link (YouTube, Vimeo, Loom, any file URL)"
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, "font-mono text-[0.75rem]")}
      />
      {value && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="h-3.5 w-3.5 text-primary" /> Attached as{" "}
          <span className="font-semibold text-foreground">{kind}</span> — readers see a dedicated {kind} experience.
        </p>
      )}
    </div>
  );
}
