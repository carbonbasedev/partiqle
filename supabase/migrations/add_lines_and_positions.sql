-- Migration: Add businesses, lines, and positions tables
-- This migration creates the tables and enum needed for the line management feature

-- Create position_status enum
CREATE TYPE public.position_status AS ENUM ('waiting', 'called', 'skipped');

-- Create businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  description text,
  CONSTRAINT businesses_pkey PRIMARY KEY (id),
  CONSTRAINT businesses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on businesses
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- RLS policies for businesses
CREATE POLICY "Users can view own businesses" ON public.businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own businesses" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own businesses" ON public.businesses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own businesses" ON public.businesses
  FOR DELETE USING (auth.uid() = user_id);

-- Create lines table
CREATE TABLE IF NOT EXISTS public.lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  business_id uuid NOT NULL,
  position integer NOT NULL DEFAULT 0,
  CONSTRAINT lines_pkey PRIMARY KEY (id),
  CONSTRAINT lines_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE
);

-- Enable RLS on lines
ALTER TABLE public.lines ENABLE ROW LEVEL SECURITY;

-- RLS policies for lines (users can manage lines for their own businesses)
CREATE POLICY "Users can view lines for own businesses" ON public.lines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = lines.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert lines for own businesses" ON public.lines
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = lines.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update lines for own businesses" ON public.lines
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = lines.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete lines for own businesses" ON public.lines
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = lines.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Create positions table
CREATE TABLE IF NOT EXISTS public.positions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  phone text,
  position bigint NOT NULL,
  joined_at timestamp without time zone DEFAULT now(),
  line_id uuid NOT NULL,
  status position_status DEFAULT 'waiting'::position_status,
  CONSTRAINT positions_pkey PRIMARY KEY (id),
  CONSTRAINT positions_line_id_fkey FOREIGN KEY (line_id) REFERENCES public.lines(id) ON DELETE CASCADE
);

-- Enable RLS on positions
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- RLS policies for positions (users can manage positions for lines in their own businesses)
CREATE POLICY "Users can view positions for own business lines" ON public.positions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lines
      JOIN public.businesses ON businesses.id = lines.business_id
      WHERE lines.id = positions.line_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert positions for own business lines" ON public.positions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lines
      JOIN public.businesses ON businesses.id = lines.business_id
      WHERE lines.id = positions.line_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update positions for own business lines" ON public.positions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.lines
      JOIN public.businesses ON businesses.id = lines.business_id
      WHERE lines.id = positions.line_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete positions for own business lines" ON public.positions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.lines
      JOIN public.businesses ON businesses.id = lines.business_id
      WHERE lines.id = positions.line_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lines_business_id ON public.lines(business_id);
CREATE INDEX IF NOT EXISTS idx_positions_line_id ON public.positions(line_id);
CREATE INDEX IF NOT EXISTS idx_positions_status ON public.positions(status);
CREATE INDEX IF NOT EXISTS idx_positions_line_status ON public.positions(line_id, status);

