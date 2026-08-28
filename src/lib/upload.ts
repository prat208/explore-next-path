import { supabase } from "@/integrations/supabase/client";

export type UploadedFile = {
  url: string;
  path: string;
  name: string;
  mime: string;
  size: number;
};

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

function safeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-80);
}

/** Uploads any file to the shared library bucket and returns a long-lived readable URL. */
export async function uploadToLibrary(file: File, folder = "library"): Promise<UploadedFile> {
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from("uploads").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    ...(file.type ? { contentType: file.type } : {}),
  });
  if (error) throw new Error(error.message);

  const { data, error: signError } = await supabase.storage.from("uploads").createSignedUrl(path, TEN_YEARS);
  if (signError || !data?.signedUrl) throw new Error(signError?.message ?? "Could not create a link for this file");

  return { url: data.signedUrl, path, name: file.name, mime: file.type, size: file.size };
}

function baseName(path: string): string {
  return (path.split("/").pop() ?? path).toLowerCase();
}

/**
 * Turns a multi-file web bundle (index.html + style.css + app.js + images) into ONE
 * self-contained .html file, so it renders exactly as intended inside the platform.
 * Files that are not part of a bundle are returned untouched.
 */
export async function bundleWebFiles(files: File[]): Promise<File[]> {
  const html = files.filter((f) => /\.html?$/i.test(f.name));
  if (html.length === 0) return files;

  const assets = files.filter((f) => !/\.html?$/i.test(f.name));
  if (assets.length === 0) return files;

  const texts = new Map<string, string>();
  const dataUrls = new Map<string, string>();
  for (const asset of assets) {
    const key = baseName(asset.name);
    if (/\.(css|js|mjs)$/i.test(key)) texts.set(key, await asset.text());
    else dataUrls.set(key, await fileToDataUrl(asset));
  }

  const out: File[] = [];
  for (const page of html) {
    let source = await page.text();

    // inline <link rel="stylesheet" href="style.css">
    source = source.replace(/<link\b[^>]*>/gi, (tag) => {
      if (!/stylesheet/i.test(tag)) return tag;
      const href = tag.match(/href\s*=\s*["']([^"']+)["']/i)?.[1];
      const css = href ? texts.get(baseName(href)) : undefined;
      return css ? `<style>\n${css}\n</style>` : tag;
    });

    // inline <script src="app.js"></script>
    source = source.replace(/<script\b([^>]*)>\s*<\/script>/gi, (tag, attrs: string) => {
      const src = String(attrs).match(/src\s*=\s*["']([^"']+)["']/i)?.[1];
      const js = src ? texts.get(baseName(src)) : undefined;
      return js ? `<script>\n${js}\n</script>` : tag;
    });

    // inline local images / fonts referenced by filename
    for (const [name, dataUrl] of dataUrls) {
      source = source.replaceAll(`"${name}"`, `"${dataUrl}"`).replaceAll(`'${name}'`, `'${dataUrl}'`);
      source = source.replaceAll(`"./${name}"`, `"${dataUrl}"`).replaceAll(`'./${name}'`, `'${dataUrl}'`);
    }

    out.push(new File([source], page.name, { type: "text/html" }));
  }

  // Keep only the bundled page(s) — assets are now embedded.
  return out;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export type MediaKind = "video" | "audio" | "image" | "pdf" | "html" | "code" | "notebook" | "archive" | "doc" | "link";

/** Best-effort classification from a filename, URL or MIME type. */
export function detectKind(source: string, mime = ""): MediaKind {
  const s = source.toLowerCase().split("?")[0] ?? "";
  const m = mime.toLowerCase();
  if (/youtube\.com|youtu\.be|vimeo\.com|loom\.com/.test(source)) return "video";
  if (m.startsWith("video/") || /\.(mp4|webm|mov|m4v|ogv)$/.test(s)) return "video";
  if (m.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|flac)$/.test(s)) return "audio";
  if (m.startsWith("image/") || /\.(png|jpe?g|gif|webp|avif|svg)$/.test(s)) return "image";
  if (m === "application/pdf" || /\.pdf$/.test(s)) return "pdf";
  if (/\.(html?|svgz)$/.test(s) || m === "text/html") return "html";
  if (/\.ipynb$/.test(s)) return "notebook";
  if (/\.(py|js|ts|tsx|json|css|sql|sh|ya?ml|md|txt|csv)$/.test(s)) return "code";
  if (/\.(zip|tar|gz|rar|7z)$/.test(s)) return "archive";
  if (/\.(docx?|pptx?|xlsx?|epub)$/.test(s)) return "doc";
  return "link";
}

export function prettySize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value < 10 && i > 0 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}
