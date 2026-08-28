ALTER TABLE public.upload_sections ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;
UPDATE public.upload_sections SET published = true WHERE published = false;
ALTER TABLE public.upload_files ADD COLUMN IF NOT EXISTS note text;

DROP POLICY IF EXISTS "upload_sections_public_read" ON public.upload_sections;
DROP POLICY IF EXISTS "Anyone can read upload sections" ON public.upload_sections;
CREATE POLICY "upload_sections_read_published" ON public.upload_sections
  FOR SELECT TO anon, authenticated
  USING (published OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));