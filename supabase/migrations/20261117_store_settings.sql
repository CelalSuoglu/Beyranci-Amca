-- =====================================================================
-- Profesyonel paket sipariş: mağaza ayarları, sipariş ayrıntıları, ürün görselleri
-- 20261116_menu_update.sql'den SONRA çalıştırın. Tekrar çalıştırmak güvenlidir.
-- =====================================================================

-- ---------- 1. Mağaza ayarları (tek satır) ----------
CREATE TABLE IF NOT EXISTS public.store_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  -- Personel "siparişleri durdur" ile kapatabilir (yoğunluk, malzeme bitti vb.)
  orders_enabled boolean NOT NULL DEFAULT true,
  pause_message text CHECK (pause_message IS NULL OR char_length(pause_message) <= 200),
  -- Sipariş sayfasının üstünde gösterilen duyuru
  announcement text CHECK (announcement IS NULL OR char_length(announcement) <= 300),
  eta_min integer NOT NULL DEFAULT 35 CHECK (eta_min BETWEEN 5 AND 240),
  eta_max integer NOT NULL DEFAULT 50 CHECK (eta_max BETWEEN 5 AND 240),
  -- Kapanıştan kaç dakika önce paket sipariş alımı biter
  last_order_minutes integer NOT NULL DEFAULT 30 CHECK (last_order_minutes BETWEEN 0 AND 180),
  -- 0=Pazartesi … 6=Pazar; {"open":"08:30","close":"00:00","closed":false}; kapanış açılıştan küçükse ertesi gün
  opening_hours jsonb NOT NULL DEFAULT '[
    {"open":"08:30","close":"00:00","closed":true},
    {"open":"08:30","close":"00:00","closed":false},
    {"open":"08:30","close":"00:00","closed":false},
    {"open":"08:30","close":"00:00","closed":false},
    {"open":"08:30","close":"00:00","closed":false},
    {"open":"08:30","close":"00:00","closed":false},
    {"open":"08:30","close":"00:00","closed":false}
  ]'::jsonb CHECK (jsonb_typeof(opening_hours) = 'array' AND jsonb_array_length(opening_hours) = 7),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_settings_eta_order CHECK (eta_min <= eta_max)
);

INSERT INTO public.store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS store_settings_set_updated_at ON public.store_settings;
CREATE TRIGGER store_settings_set_updated_at BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_settings_read ON public.store_settings;
CREATE POLICY store_settings_read ON public.store_settings FOR SELECT TO anon, authenticated USING (true);
-- Yazma yalnızca sunucu API'si (rol kontrolü orada) üzerinden
REVOKE ALL ON public.store_settings FROM anon, authenticated;
GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT ALL ON public.store_settings TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                 WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'store_settings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
  END IF;
END $$;

-- ---------- 2. Sipariş ayrıntıları ----------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cash_change_for numeric(12, 2) CHECK (cash_change_for IS NULL OR cash_change_for >= 0),
  ADD COLUMN IF NOT EXISTS wants_cutlery boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS eta_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_reason text CHECK (cancel_reason IS NULL OR char_length(cancel_reason) <= 200);

-- Personel: durum, tahmini teslim saati ve iptal nedeni (RLS: yalnızca personel/yönetici)
REVOKE UPDATE ON public.orders FROM authenticated;
GRANT UPDATE (status, eta_at, cancel_reason) ON public.orders TO authenticated;

-- ---------- 3. Ürün görselleri ----------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_url text CHECK (image_url IS NULL OR char_length(image_url) <= 500);

UPDATE public.products SET image_url = '/images/menu/beyran.jpg' WHERE id = 'corbalar-beyran' AND image_url IS NULL;
UPDATE public.products SET image_url = '/images/menu/kavurma.jpg' WHERE id = 'geleneksel-kavurma-durum' AND image_url IS NULL;
UPDATE public.products SET image_url = '/images/menu/lahmacun.jpg'
  WHERE id IN ('firindan-gaziantep-isi-lahmacun', 'firindan-sub-kasarli-lahmacun') AND image_url IS NULL;
UPDATE public.products SET image_url = '/images/menu/pide.jpg'
  WHERE category_id = 'firindan' AND name ILIKE '%pide%' AND image_url IS NULL;
