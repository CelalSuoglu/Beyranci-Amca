-- Beyrancı Amca paket sipariş sistemi
-- Supabase SQL Editor veya CLI ile çalıştırın.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'new',
    'accepted',
    'preparing',
    'ready',
    'out_for_delivery',
    'completed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM (
    'cash',
    'card'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  seq_val bigint;
BEGIN
  seq_val := nextval('public.order_number_seq');
  RETURN 'BA-' || to_char((now() AT TIME ZONE 'Europe/Istanbul'), 'YYYYMMDD')
    || '-' || lpad(seq_val::text, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT public.generate_order_number(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  note text,
  payment_method public.payment_method NOT NULL,
  items jsonb NOT NULL,
  subtotal numeric(12, 2) NOT NULL CHECK (subtotal >= 0),
  total numeric(12, 2) NOT NULL CHECK (total >= 0),
  status public.order_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_items_is_array CHECK (jsonb_typeof(items) = 'array'),
  CONSTRAINT orders_min_total CHECK (total >= 1000)
);

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);
CREATE INDEX IF NOT EXISTS orders_phone_idx ON public.orders (phone);
CREATE INDEX IF NOT EXISTS orders_order_number_idx ON public.orders (order_number);

DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_authenticated" ON public.orders;
CREATE POLICY "orders_select_authenticated"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "orders_update_authenticated" ON public.orders;
CREATE POLICY "orders_update_authenticated"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anonim / public insert ve select yok.
-- Sipariş oluşturma yalnızca service_role (Next.js Route Handler) ile yapılır.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, UPDATE ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.order_number_seq TO service_role;

-- Realtime
ALTER TABLE public.orders REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;
