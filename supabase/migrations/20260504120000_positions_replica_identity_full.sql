-- Realtime subscriptions filtered by line_id need REPLICA IDENTITY FULL on
-- positions so that DELETE events include the line_id column. Without this,
-- only the primary key is sent in the OLD row payload and the filter drops
-- DELETE events for clients listening on a specific line.
ALTER TABLE public.positions REPLICA IDENTITY FULL;
