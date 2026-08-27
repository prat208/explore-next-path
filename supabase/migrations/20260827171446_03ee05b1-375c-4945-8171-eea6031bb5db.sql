ALTER TABLE public.roadmap_nodes
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS video_title text;