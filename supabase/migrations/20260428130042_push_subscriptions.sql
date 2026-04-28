CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  position_id bigint NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_position
  ON public.push_subscriptions(position_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can register a subscription for an existing position. The position
-- ID is the gate (knowing it implies the user holds that ticket).
CREATE POLICY "Anyone can subscribe to a valid position" ON public.push_subscriptions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.positions WHERE positions.id = push_subscriptions.position_id)
  );

-- No one needs to read these from the client; only the server (service role)
-- queries them when sending push. So no SELECT/UPDATE/DELETE policies for anon.
