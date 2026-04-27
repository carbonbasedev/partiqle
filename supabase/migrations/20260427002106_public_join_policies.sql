-- Allow anonymous (public) access to view a line and join it via the
-- public share link. The line UUID acts as the share secret.

CREATE POLICY "Anyone can view a line by id" ON public.lines
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can join a line" ON public.positions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.lines WHERE lines.id = positions.line_id)
  );

CREATE POLICY "Anyone can view positions" ON public.positions
  FOR SELECT TO anon, authenticated
  USING (true);
