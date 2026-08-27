DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['articles','resources','tools','careers','roadmaps','learning_paths','projects','challenges','opportunities','quizzes','collections']
  LOOP
    EXECUTE format('DROP POLICY "public reads published" ON public.%I', t);
    EXECUTE format($f$CREATE POLICY "anon reads published" ON public.%I FOR SELECT TO anon USING (status = 'published')$f$, t);
    EXECUTE format($f$CREATE POLICY "users read published" ON public.%I FOR SELECT TO authenticated USING (status = 'published' OR public.is_editor(auth.uid()))$f$, t);
  END LOOP;
END $$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE ALL ON FUNCTION public.is_editor(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_editor(uuid) TO authenticated;