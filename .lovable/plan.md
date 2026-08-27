# Explorers — Phase 1 Foundation

Build the platform skeleton properly instead of many mock pages: design system from your handbook identity, database content model with relationships, auth + roles, public shell, Explorer Studio shell, and the article + resource + roadmap engines rendering seeded, interconnected sample content.

## What ships in this phase

**Design system**
- Tokens derived from the handbook: deep navy base, warm amber accent, cyan secondary, off-white reading surface; Space Grotesk display, IBM Plex Sans body, IBM Plex Mono for technical metadata. Fonts loaded via a link tag in the root route.
- Reusable primitives: cards, tag/level/cost chips, callouts (tip / warning / common mistake / analogy / key takeaway), code block with copy + output, progress indicators.
- Reduced-motion respected; mobile-first layouts.

**Public shell**
- Global nav: Home, Discover, Articles, Learn, Resources, Roadmaps, Projects, Opportunities + search + auth entry. Desktop top nav, mobile header/drawer.
- Each route gets its own SEO metadata (title, description, OG, canonical).

**Home**
- Hero "Explore what's next." with a restrained interactive Explorers visual.
- New-visitor interest/intent picker that writes a lightweight profile.
- "Today in AI & Tech" cards using the what happened / why it matters / who cares / what you can do framing.
- Signed-in variant: greeting + "What should I explore next?" recommendations from profile interests and saves.

**Article engine (block-based)**
- Articles stored as ordered content blocks (JSON per block, typed) — not raw HTML.
- Phase 1 block renderers: heading, paragraph, quote, image, divider, callout family, key takeaway, definition, checklist, code block with copy/output, quiz, reveal, plus ecosystem cards (tool, resource, project, roadmap node, related article, next step).
- Article page: TOC, reading progress, author/date/reading time, tags, save, share, sources.
- "Continue Exploring" footer generated from real content relationships: Understand it / Learn it / Use it / Build it / Go deeper / Career.

**Resources engine**
- Library with filters (category, level, cost, topic) and sorting (recommended, newest, rated); save / open / share.
- Structured metadata per resource including official status, last reviewed, reviewer notes.

**Roadmap engine (structural, not images)**
- Nodes + edges in the database, rendered as an interactive graph with pan/zoom and touch support.
- Node states: locked / available / in progress / completed / recommended, driven by prerequisites and user progress.
- Node detail panel: description, Learn / Read / Watch / Use / Build / Practice / Next, all pulled from relationships.

**Learn, Projects, Opportunities, Careers**
- Listing + detail pages backed by the same entities and block renderer, with the metadata fields you specified. Careers link to a roadmap.

**Search**
- Site-wide search returning grouped results (tools, articles, resources, projects, roadmaps + nodes, careers, opportunities) rather than an article list. Every query logged for later gap detection.

**Auth + roles**
- Email/password sign-up and sign-in via Lovable Cloud.
- Roles in a dedicated table (user / editor / admin / super_admin) checked server-side; Studio routes gated.

**Explorer Studio (admin)**
- Dashboard: content counts, most viewed/saved/completed, top searches, searches with no results.
- CRUD managers for articles, resources, tools, roadmaps + nodes, learning paths, projects, challenges, careers, opportunities, quizzes, tags, authors, collections, media.
- Article builder with the block palette (add / reorder / delete / edit), draft → review → published → archived workflow, SEO fields, preview.
- Visual roadmap builder: add / rename / drag / connect / delete nodes, prerequisites, attach articles, resources, projects, quizzes, publish toggle.
- Relationship picker shared across all content types so a single item can appear in many places.

**Sample content**
- Seeded via migration: the 7 articles, 7 roadmaps, resource sets, and 6 projects you listed, plus topics, careers, opportunities and the relationships connecting them, so the "article → learn → resource → project → career → opportunity" journey works end to end.

## Everything else in your prompt — built in order after the foundation

Nothing from your spec is dropped. The foundation above is built first because every item below plugs into it; each numbered step is a follow-up build in this same project.

1. **Full interactive block library** — remaining blocks: gallery, video, flashcards, multiple choice, true/false, sorting, drag and drop, interactive scenario, comparison, timeline, chart, diagram, skill tree, flowchart, code challenge, embedded playground, terminal/output. Each is authorable in the Studio's interactive content builder and reusable across articles, lessons, roadmaps and resource pages.
2. **Learn depth** — learning paths with modules, lessons, prerequisites, milestones, challenges and next steps rendered as interactive field manuals in the spirit of your Python handbook (persistent chapter nav, mission progress, copy-code, expected output, callouts, analogies, reveals, project cards) — as a reusable engine, not a hard-coded layout.
3. **Careers** — full career pages: overview, role description, technical and non-technical skills, beginner-to-advanced progression, roadmap link, projects, resources, portfolio expectations, interview prep, related roles, tools, opportunities, articles. No fixed timeline promises.
4. **Build challenges** — recurring challenges with statement, requirements, bonus features, deadline, examples, judging, leaderboard and featured projects; project upgrade ladders (basic → RAG → voice → tool use → agents).
5. **My Explorers + personalization** — profile (interests, level, goals, career interests, learning preferences), saved items, completions, recent searches and activity; What's happening / Learn next / Read next / Build next / Opportunity / Continue / Saved.
6. **Progress system** — real activity tracking only (article read, lesson, quiz, node, project, save, submission). No fake gamification.
7. **Recommendation engine + "What should I do next?"** — driven by profile, relationships, activity, saves, completions, searches and roadmap progress, with explainable reasons ("because you saved 3 AI-agent resources") and a single "Your next move" surface.
8. **Studio analytics** — content analytics (views, unique users, reading time, scroll depth, saves, shares, completion rate), search analytics (top terms, zero-result, rising, topic demand) and content gap detection that turns demand into a "create this" action.
9. **Explorer AI layer** — assistant grounded in the Explorers content graph (e.g. a 5-hours-a-week AI-engineering plan that links to real articles, resources, roadmap nodes and projects), via Lovable AI.
10. **Admin AI copilot** — draft roadmaps, find gaps in a learning path, propose article ideas from search demand, plus the article assistant actions (clarity, beginner-friendly, analogy, summary, quiz, related resources, project, tags, SEO, social post, internal links). Never auto-publishes.
11. **Distribution + digest** — share targets (Instagram, LinkedIn, X, WhatsApp, Telegram, email), generated social cards, quote cards, summaries and carousel content; Daily AI Drop / Weekly Explorer Brief infrastructure with later personalization.
12. **Community and campus readiness** — user/builder profiles, project submissions, challenge participation, featured builds, comments, community collections, creator contributions; campus communities, ambassadors, local events and leaderboards as an optional extension, never the core identity.
13. **Global architecture** — countries, currencies, locations, organizations, global vs local opportunities and multi-language support in the schema and UI from the start; India is a launch market, not a hard-coded assumption.

Throughout: SEO metadata and structured data on every content page, sitemap and robots support, loading/empty/error/success states everywhere, accessibility, reduced-motion support, mobile bottom nav plus pan/zoom canvases, lazy loading and code splitting. No button ships that does nothing.


## Technical notes

- TanStack Start + React 19 + Tailwind v4; Lovable Cloud (Postgres + auth + storage) for data.
- Tables: profiles, user_roles, authors, topics, concepts, tags, articles, article_blocks, resources, tools, roadmaps, roadmap_nodes, roadmap_edges, learning_paths, lessons, projects, challenges, careers, opportunities, quizzes, quiz_questions, media, collections, content_relationships, user_saves, user_progress, user_activity, search_queries. Relational FKs everywhere; JSON only inside a typed content-block payload.
- `content_relationships` is a polymorphic edge table (from_type/from_id → to_type/to_id + relation kind) powering "Continue Exploring", node hubs and recommendations.
- RLS on every table with explicit grants: public read of published rows for anon, per-user rows scoped to `auth.uid()`, writes limited to editor/admin via a `has_role` security-definer function.
- Reads go through route loaders + TanStack Query; writes and admin actions through authenticated server functions.
- Interactive roadmap canvas rendered with SVG/Canvas built in-house so it stays lightweight and touch-friendly.
- Route-level code splitting; Studio bundle kept out of the public paths.
