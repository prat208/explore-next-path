# Uploads live inside the section you choose

Right now every upload ends up on a separate `/files` page. That's the mistake. New behaviour: the category you pick in Studio *is* where the upload appears on the site.

## 1. Pick a section → the upload lands there

In Studio you name the upload and choose its section: **Roadmap**, **Article**, **Resource**, **Opportunity**, or **Career**.

- Choose **Roadmap** → it shows up as a card on `/roadmaps`, next to the existing roadmaps, and opens its own page with the file running inside (PDF reader, live HTML page, video player, code viewer — by type).
- Choose **Article** → it appears in the `/articles` list and opens as a readable page.
- Same for Resource, Opportunity, Career.
- Optionally it can still be attached *inside* an existing roadmap/article page instead of standing on its own — that choice stays.

No more "everything under Files".

## 2. Remove the clutter

Delete these from the site navigation and remove their pages/links:

- **Files** (its content now lives in Roadmaps / Articles / etc.)
- **Learn**
- **Projects**
- **Discover** as a nav item (the logo still goes home)

Navigation becomes: Articles · Roadmaps · Resources · Opportunities · Careers.

Any card, home-page block, or "Continue exploring" link pointing at the removed pages is removed too, so nothing dead-ends.

## 3. Studio stays one simple screen

- Name it, choose the section, drop the files.
- Each file renders right there exactly as a learner will see it (live HTML output, working PDF, player, code panel).
- One **Publish** switch per upload: draft = only you see it, published = it shows in its section on the site.

## Technical notes

- `upload_sections` gains `published boolean default false`; public reads filter on it (RLS + grants updated in the same migration).
- Listing routes `_site.roadmaps.index.tsx`, `_site.articles.index.tsx`, `_site.resources.tsx`, `_site.opportunities.tsx`, `_site.careers.index.tsx` also read published sections of their category and render them as cards linking to the section reader.
- The section reader replaces `_site.files.$slug.tsx` at a neutral path so links from any listing work; `_site.files.index.tsx`, `_site.learn.*`, `_site.projects.*` route files are deleted.
- `NAV` in `src/routes/_site.tsx` trimmed; home page sections referencing learn/projects removed.
- `src/routes/_site.studio.index.tsx`: per-upload title, section select, publish switch, learner-accurate preview. No AI features.
