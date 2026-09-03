DROP POLICY IF EXISTS "activity readable" ON public.explorer_activity;
CREATE POLICY "activity readable by owner" ON public.explorer_activity FOR SELECT TO authenticated USING (user_id = auth.uid());
REVOKE SELECT ON public.explorer_activity FROM anon;