CREATE TABLE public.upload_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  description text,
  category text NOT NULL DEFAULT 'resource',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.upload_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.upload_sections(id) ON DELETE CASCADE,
  title text NOT NULL,
  note text,
  url text NOT NULL,
  path text,
  mime text,
  size bigint,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX upload_files_section_idx ON public.upload_files(section_id, sort_order);

GRANT SELECT ON public.upload_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.upload_sections TO authenticated;
GRANT ALL ON public.upload_sections TO service_role;
GRANT SELECT ON public.upload_files TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.upload_files TO authenticated;
GRANT ALL ON public.upload_files TO service_role;

ALTER TABLE public.upload_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sections public read" ON public.upload_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "sections editor write" ON public.upload_sections FOR ALL TO authenticated
  USING (public.is_editor(auth.uid())) WITH CHECK (public.is_editor(auth.uid()));

CREATE POLICY "files public read" ON public.upload_files FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "files editor write" ON public.upload_files FOR ALL TO authenticated
  USING (public.is_editor(auth.uid())) WITH CHECK (public.is_editor(auth.uid()));

CREATE TRIGGER upload_sections_touch BEFORE UPDATE ON public.upload_sections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();