# Simple upload → run → publish flow

Goal: in Studio you upload any file (PDF, HTML/CSS/JS, video, audio, image, notebook, code, zip), give it a title, choose the section it belongs to, see exactly how a learner will see it, then publish it so it shows on that article / roadmap / manual / project / career page.

Most of this pipeline already exists (sections, uploads, learner-style previews, "Show these files on" linking, `/files/<section>` pages). This plan fills the four real gaps.

## 1. Title the file while uploading

Right now the file's raw filename becomes its title. Change the section uploader to a small staging step:

- Pick or drop files → they appear in a "ready to upload" list.
- Each row has a **Title** input (pre-filled from the filename, editable) and an optional one-line note.
- One **Upload** button saves them all in order, with the titles you typed.

## 2. Real web output for HTML + CSS + JS

Today CSS/JS only get merged when selected in the same pick. Improvements:

- Selecting a whole folder or multiple files keeps working (index.html + style.css + app.js merged into one self-contained page).
- If you upload `style.css` / `app.js` later into a section that already has an HTML file, Studio offers **"Attach to <page>.html and rebuild"** so the page is recompiled with the new assets instead of being stored as a loose code file.
- The compiled page renders in a sandboxed live frame (auto-height, Full screen) in both Studio preview and the learner view — that is the "compiled web output".
- Loose `.css` / `.js` you deliberately want shown as code still render in the code viewer with copy.

## 3. Per-file type handling (already mostly in place, verified end to end)

| Upload | What the learner gets |
| --- | --- |
| PDF | full-height in-page reader (no download needed) |
| HTML(+CSS/JS) | live sandboxed running page, expand to full screen |
| Video / YouTube link | player with chapter jump rail |
| Audio | waveform player |
| Image | contained visual |
| .ipynb / code | scrollable source panel with copy |
| zip / other | clean open-or-download card |

Each of these will be checked in the browser after the change, not assumed.

## 4. Publish control

Sections currently go live the moment they exist. Add an explicit state:

- New sections start as **Draft** — visible only in Studio.
- A **Publish** switch on each section; published sections appear on `/files` and inside whatever page you attached them to.
- Draft sections show a "Draft — only you can see this" badge in Studio.

## Technical notes

- Migration: add `published boolean not null default false` to `upload_sections`, plus `note` on `upload_files` if missing; update RLS so anon reads only published sections, editors read all. Grants included.
- `src/lib/sections.ts`: filter public queries by `published`, add `publishSection` / `unpublishSection`, and a `rebuildHtmlBundle` helper.
- `src/lib/upload.ts`: expose bundling so it can be re-run against an already-stored HTML file plus newly uploaded assets.
- `src/routes/_site.studio.index.tsx`: staging list with titles, publish switch, rebuild action.
- No AI features are added anywhere; Studio stays the single upload page.
