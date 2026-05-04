-- Track per-position serve duration so the line management page can show the
-- elapsed time for the current turn and an average across all served turns.

ALTER TABLE public.positions
  ADD COLUMN IF NOT EXISTS called_at timestamptz,
  ADD COLUMN IF NOT EXISTS served_at timestamptz;

ALTER TABLE public.lines
  ADD COLUMN IF NOT EXISTS avg_serve_seconds numeric;
