DELETE FROM public.content_relationships;
DELETE FROM public.content_blocks;
DELETE FROM public.roadmap_edges;
DELETE FROM public.roadmap_nodes;
DELETE FROM public.roadmaps;
DELETE FROM public.lessons;
DELETE FROM public.learning_paths;
DELETE FROM public.articles;
DELETE FROM public.resources;
DELETE FROM public.tools;
DELETE FROM public.projects;
DELETE FROM public.challenges;
DELETE FROM public.careers;
DELETE FROM public.opportunities;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS handle text UNIQUE,
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text;

CREATE TABLE IF NOT EXISTS public.explorer_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id text NOT NULL,
  title text NOT NULL,
  path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS explorer_activity_user_idx ON public.explorer_activity (user_id, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.explorer_activity TO authenticated;
GRANT SELECT ON public.explorer_activity TO anon;
GRANT ALL ON public.explorer_activity TO service_role;
ALTER TABLE public.explorer_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity readable" ON public.explorer_activity FOR SELECT USING (true);
CREATE POLICY "own activity insert" ON public.explorer_activity FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own activity delete" ON public.explorer_activity FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'problem' CHECK (kind IN ('problem','project')),
  title text NOT NULL,
  summary text,
  details text,
  tags text[] NOT NULL DEFAULT '{}',
  link_url text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','solved','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS submissions_kind_idx ON public.submissions (kind, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT SELECT ON public.submissions TO anon;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "submissions readable" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "submissions insert own" ON public.submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "submissions update own or admin" ON public.submissions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "submissions delete own or admin" ON public.submissions FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER submissions_touch_updated_at BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();