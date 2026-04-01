DROP POLICY IF EXISTS "Users manage own saved searches" ON public.saved_searches;
CREATE POLICY "Users manage own saved searches" ON public.saved_searches FOR ALL USING (auth.uid() = user_id);