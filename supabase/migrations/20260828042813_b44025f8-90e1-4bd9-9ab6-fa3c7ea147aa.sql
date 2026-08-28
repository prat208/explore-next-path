ALTER TABLE public.upload_sections
  ADD COLUMN entity_type text,
  ADD COLUMN entity_slug text;
CREATE INDEX upload_sections_entity_idx ON public.upload_sections(entity_type, entity_slug);