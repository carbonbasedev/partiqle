-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

-- Enum for position status
CREATE TYPE public.position_status AS ENUM ('waiting', 'called', 'skipped');

CREATE TABLE public.businesses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text,
  description text,
  CONSTRAINT businesses_pkey PRIMARY KEY (id),
  CONSTRAINT businesses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.customers (
  id uuid NOT NULL,
  stripe_customer_id text,
  CONSTRAINT customers_pkey PRIMARY KEY (id),
  CONSTRAINT customers_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  business_id uuid NOT NULL,
  position integer NOT NULL DEFAULT 0,
  CONSTRAINT lines_pkey PRIMARY KEY (id),
  CONSTRAINT lines_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);
CREATE TABLE public.positions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  phone text,
  position bigint,
  joined_at timestamp without time zone DEFAULT now(),
  line_id uuid NOT NULL,
  status position_status DEFAULT 'waiting'::position_status,
  CONSTRAINT positions_pkey PRIMARY KEY (id),
  CONSTRAINT positions_line_id_fkey FOREIGN KEY (line_id) REFERENCES public.lines(id)
);
CREATE TABLE public.prices (
  id text NOT NULL,
  product_id text,
  active boolean,
  description text,
  unit_amount bigint,
  currency text CHECK (char_length(currency) = 3),
  type USER-DEFINED,
  interval USER-DEFINED,
  interval_count integer,
  trial_period_days integer,
  metadata jsonb,
  CONSTRAINT prices_pkey PRIMARY KEY (id),
  CONSTRAINT prices_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.products (
  id text NOT NULL,
  active boolean,
  name text,
  description text,
  image text,
  metadata jsonb,
  CONSTRAINT products_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subscriptions (
  id text NOT NULL,
  user_id uuid NOT NULL,
  status USER-DEFINED,
  metadata jsonb,
  price_id text,
  quantity integer,
  cancel_at_period_end boolean,
  created timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  current_period_start timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  current_period_end timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  ended_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  cancel_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  canceled_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  trial_start timestamp with time zone DEFAULT timezone('utc'::text, now()),
  trial_end timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT subscriptions_price_id_fkey FOREIGN KEY (price_id) REFERENCES public.prices(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  full_name text,
  avatar_url text,
  billing_address jsonb,
  payment_method jsonb,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);