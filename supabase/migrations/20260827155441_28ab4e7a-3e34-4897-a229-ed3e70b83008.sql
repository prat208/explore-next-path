-- ENUMS
CREATE TYPE public.app_role AS ENUM ('user','editor','admin','super_admin');
CREATE TYPE public.content_status AS ENUM ('draft','review','published','archived');
CREATE TYPE public.difficulty AS ENUM ('beginner','intermediate','advanced');

-- ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_editor(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('editor','admin','super_admin')
  )
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_editor(auth.uid()));

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  display_name text,
  avatar_url text,
  interests text[] NOT NULL DEFAULT '{}',
  intents text[] NOT NULL DEFAULT '{}',
  experience_level public.difficulty NOT NULL DEFAULT 'beginner',
  goals text[] NOT NULL DEFAULT '{}',
  career_interests text[] NOT NULL DEFAULT '{}',
  country text,
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- TAXONOMY
CREATE TABLE public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  kind text NOT NULL DEFAULT 'topic'
);
CREATE TABLE public.authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  role_title text,
  bio text,
  avatar_url text
);
CREATE TABLE public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  kind text NOT NULL DEFAULT 'image',
  alt text,
  caption text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- CONTENT
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  excerpt text,
  why_it_matters text,
  category text NOT NULL DEFAULT 'news',
  cover_image_url text,
  author_id uuid REFERENCES public.authors(id) ON DELETE SET NULL,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  reading_minutes int NOT NULL DEFAULT 5,
  level public.difficulty NOT NULL DEFAULT 'beginner',
  audience text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  sources jsonb NOT NULL DEFAULT '[]',
  seo_title text,
  seo_description text,
  canonical_url text,
  status public.content_status NOT NULL DEFAULT 'draft',
  featured boolean NOT NULL DEFAULT false,
  view_count int NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type text NOT NULL,
  owner_id uuid NOT NULL,
  position int NOT NULL DEFAULT 0,
  type text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX content_blocks_owner_idx ON public.content_blocks (owner_type, owner_id, position);

CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  resource_type text NOT NULL DEFAULT 'course',
  category text NOT NULL DEFAULT 'learn',
  url text NOT NULL,
  organization text,
  level public.difficulty NOT NULL DEFAULT 'beginner',
  cost text NOT NULL DEFAULT 'free',
  has_free_tier boolean NOT NULL DEFAULT true,
  is_official boolean NOT NULL DEFAULT false,
  audience text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  rating numeric(2,1),
  last_reviewed date,
  reviewer_notes text,
  status public.content_status NOT NULL DEFAULT 'published',
  save_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  description text,
  category text NOT NULL DEFAULT 'ai',
  url text NOT NULL,
  pricing text NOT NULL DEFAULT 'free tier',
  tags text[] NOT NULL DEFAULT '{}',
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  overview text,
  role_summary text,
  technical_skills text[] NOT NULL DEFAULT '{}',
  soft_skills text[] NOT NULL DEFAULT '{}',
  progression jsonb NOT NULL DEFAULT '[]',
  portfolio_expectations text[] NOT NULL DEFAULT '{}',
  interview_prep text[] NOT NULL DEFAULT '{}',
  tools_used text[] NOT NULL DEFAULT '{}',
  related_roles text[] NOT NULL DEFAULT '{}',
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  difficulty public.difficulty NOT NULL DEFAULT 'beginner',
  estimated_hours int,
  career_id uuid REFERENCES public.careers(id) ON DELETE SET NULL,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.roadmap_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  difficulty public.difficulty NOT NULL DEFAULT 'beginner',
  estimated_hours int,
  skills text[] NOT NULL DEFAULT '{}',
  group_label text,
  position_x int NOT NULL DEFAULT 0,
  position_y int NOT NULL DEFAULT 0,
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (roadmap_id, slug)
);

CREATE TABLE public.roadmap_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  source_node_id uuid NOT NULL REFERENCES public.roadmap_nodes(id) ON DELETE CASCADE,
  target_node_id uuid NOT NULL REFERENCES public.roadmap_nodes(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'prerequisite',
  UNIQUE (source_node_id, target_node_id)
);

CREATE TABLE public.learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  audience text,
  prerequisites text[] NOT NULL DEFAULT '{}',
  estimated_hours int,
  difficulty public.difficulty NOT NULL DEFAULT 'beginner',
  skills text[] NOT NULL DEFAULT '{}',
  milestones text[] NOT NULL DEFAULT '{}',
  next_steps text[] NOT NULL DEFAULT '{}',
  cover_image_url text,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id uuid NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  summary text,
  module_label text,
  estimated_minutes int NOT NULL DEFAULT 20,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (path_id, slug)
);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  problem text,
  outcome text,
  difficulty public.difficulty NOT NULL DEFAULT 'beginner',
  estimated_hours int,
  tech_stack text[] NOT NULL DEFAULT '{}',
  prerequisites text[] NOT NULL DEFAULT '{}',
  skills text[] NOT NULL DEFAULT '{}',
  architecture text,
  repo_url text,
  demo_url text,
  extensions text[] NOT NULL DEFAULT '{}',
  portfolio_advice text,
  cover_image_url text,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  number int,
  title text NOT NULL,
  statement text,
  requirements text[] NOT NULL DEFAULT '{}',
  bonus text[] NOT NULL DEFAULT '{}',
  judging text[] NOT NULL DEFAULT '{}',
  deadline date,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  organization text,
  description text,
  category text NOT NULL DEFAULT 'hackathon',
  location text,
  country text,
  work_mode text NOT NULL DEFAULT 'remote',
  eligibility text,
  deadline date,
  difficulty public.difficulty NOT NULL DEFAULT 'beginner',
  cost text NOT NULL DEFAULT 'free',
  official_url text,
  source text,
  verified_at date,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  prompt text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  correct_index int NOT NULL DEFAULT 0,
  explanation text
);

CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  position int NOT NULL DEFAULT 0
);

-- KNOWLEDGE GRAPH
CREATE TABLE public.content_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_type text NOT NULL,
  from_id uuid NOT NULL,
  to_type text NOT NULL,
  to_id uuid NOT NULL,
  relation text NOT NULL DEFAULT 'related',
  sort int NOT NULL DEFAULT 0,
  UNIQUE (from_type, from_id, to_type, to_id, relation)
);
CREATE INDEX content_rel_from_idx ON public.content_relationships (from_type, from_id);
CREATE INDEX content_rel_to_idx ON public.content_relationships (to_type, to_id);

-- USER DATA
CREATE TABLE public.user_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);
CREATE TABLE public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  percent int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);
CREATE TABLE public.user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  item_type text,
  item_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.search_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  user_id uuid,
  results_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- GRANTS + RLS
DO $$
DECLARE t text;
BEGIN
  -- published-content tables
  FOREACH t IN ARRAY ARRAY['articles','resources','tools','careers','roadmaps','learning_paths','projects','challenges','opportunities','quizzes','collections']
  LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($f$CREATE POLICY "public reads published" ON public.%I FOR SELECT USING (status = 'published' OR public.is_editor(auth.uid()))$f$, t);
    EXECUTE format($f$CREATE POLICY "editors manage" ON public.%I FOR ALL TO authenticated USING (public.is_editor(auth.uid())) WITH CHECK (public.is_editor(auth.uid()))$f$, t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t || '_touch', t);
  END LOOP;

  -- always-public supporting tables
  FOREACH t IN ARRAY ARRAY['topics','tags','authors','media','content_blocks','roadmap_nodes','roadmap_edges','lessons','quiz_questions','collection_items','content_relationships']
  LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "public read" ON public.%I FOR SELECT USING (true)', t);
    EXECUTE format($f$CREATE POLICY "editors manage" ON public.%I FOR ALL TO authenticated USING (public.is_editor(auth.uid())) WITH CHECK (public.is_editor(auth.uid()))$f$, t);
  END LOOP;

  -- per-user tables
  FOREACH t IN ARRAY ARRAY['user_saves','user_progress','user_activity']
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($f$CREATE POLICY "own rows" ON public.%I FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())$f$, t);
  END LOOP;
END $$;

GRANT INSERT ON public.search_queries TO anon, authenticated;
GRANT SELECT ON public.search_queries TO authenticated;
GRANT ALL ON public.search_queries TO service_role;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can log a search" ON public.search_queries FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "editors read searches" ON public.search_queries FOR SELECT TO authenticated USING (public.is_editor(auth.uid()));