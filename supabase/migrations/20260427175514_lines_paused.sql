ALTER TABLE public.lines ADD COLUMN IF NOT EXISTS paused boolean NOT NULL DEFAULT false;
