-- =====================================================================
-- Beyrancı Amca — Üyelik, roller, menü, bildirim altyapısı
-- Supabase → SQL Editor'da TEK SEFERDE çalıştırın.
-- Tekrar çalıştırılması güvenlidir (idempotent).
-- =====================================================================

-- ---------- 1. Roller ve profiller ----------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('customer', 'staff', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text CHECK (full_name IS NULL OR char_length(full_name) <= 120),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 20),
  role public.app_role NOT NULL DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Rol okuyucu yardımcılar (RLS içinde kullanılır; SECURITY DEFINER döngüyü önler)
CREATE OR REPLACE FUNCTION public.app_user_role()
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), 'customer'::public.app_role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND public.app_user_role() IN ('staff', 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND public.app_user_role() = 'admin';
$$;

-- Yeni kullanıcı → her zaman müşteri profili
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    NULLIF(left(NEW.raw_user_meta_data ->> 'full_name', 120), ''),
    NULLIF(left(NEW.raw_user_meta_data ->> 'phone', 20), ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Rol yükseltme koruması: sadece yönetici veya sunucu (service_role) rol değiştirebilir
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Yalnızca site/uygulama kullanıcılarından (anon, authenticated) gelen değişiklik denetlenir.
  -- Sunucu (service_role anahtarı) ve Supabase paneli (anahtar yok) rol atayabilir.
  IF NEW.role IS DISTINCT FROM OLD.role
     AND COALESCE(auth.role(), '') IN ('authenticated', 'anon')
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Rol değiştirme yetkiniz yok' USING ERRCODE = '42501';
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Profil kimliği değiştirilemez' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_role_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_role_escalation BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.prevent_role_escalation();

-- Mevcut kullanıcılar: hepsi müşteri olarak başlar, mutfak hesabı personel olur
INSERT INTO public.profiles (id, role)
SELECT id, 'customer' FROM auth.users
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles SET role = 'staff'
WHERE id IN (SELECT id FROM auth.users WHERE lower(email) = 'mutfak@beyranciamca.com')
  AND role = 'customer';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

REVOKE ALL ON public.profiles FROM anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
-- Kullanıcı yalnızca ad ve telefonunu güncelleyebilir; rol kolonu yetkisi yok
GRANT UPDATE (full_name, phone) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- ---------- 2. Adresler ----------
CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Ev' CHECK (char_length(label) BETWEEN 1 AND 40),
  address text NOT NULL CHECK (char_length(address) BETWEEN 10 AND 500),
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS addresses_user_idx ON public.addresses (user_id);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS addresses_own ON public.addresses;
CREATE POLICY addresses_own ON public.addresses FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

REVOKE ALL ON public.addresses FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;

-- ---------- 3. Menü: kategoriler ve ürünler ----------
CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY CHECK (id ~ '^[a-z0-9-]+$'),
  title text NOT NULL,
  layout text NOT NULL DEFAULT 'rows' CHECK (layout IN ('cards', 'rows')),
  sub_section_title text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY CHECK (id ~ '^[a-z0-9-]+$'),
  category_id text NOT NULL REFERENCES public.categories (id) ON UPDATE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 160),
  option_group text,          -- dolu ise kart altında seçenek satırı olarak gösterilir
  option_name text,
  description text,
  description_list text[],
  price numeric(12, 2) NOT NULL CHECK (price >= 0),
  sort_order integer NOT NULL DEFAULT 0,
  in_sub_section boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,     -- menüde görünür
  is_orderable boolean NOT NULL DEFAULT true,  -- paket siparişte satılır
  spice_levels text[] CHECK (spice_levels IS NULL OR spice_levels <@ ARRAY['acili','az_acili','acisiz']),
  requires_garlic boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category_id, sort_order);

DROP TRIGGER IF EXISTS categories_set_updated_at ON public.categories;
CREATE TRIGGER categories_set_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS categories_read ON public.categories;
CREATE POLICY categories_read ON public.categories FOR SELECT TO anon, authenticated
  USING (is_active OR public.is_admin());
DROP POLICY IF EXISTS categories_admin_write ON public.categories;
CREATE POLICY categories_admin_write ON public.categories FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS products_read ON public.products;
CREATE POLICY products_read ON public.products FOR SELECT TO anon, authenticated
  USING (is_active OR public.is_admin());
DROP POLICY IF EXISTS products_admin_write ON public.products;
CREATE POLICY products_admin_write ON public.products FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

REVOKE ALL ON public.categories, public.products FROM anon, authenticated;
GRANT SELECT ON public.categories, public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories, public.products TO authenticated;
GRANT ALL ON public.categories, public.products TO service_role;

-- ---------- 4. Siparişler: kullanıcı, takip, tekrar koruması, ödeme durumu ----------
DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('unpaid', 'pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- iyzico eklendiğinde kullanılacak
ALTER TYPE public.payment_method ADD VALUE IF NOT EXISTS 'online';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tracking_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS payment_status public.payment_status NOT NULL DEFAULT 'unpaid';

CREATE UNIQUE INDEX IF NOT EXISTS orders_tracking_token_key ON public.orders (tracking_token);
CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_key ON public.orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_user_idx ON public.orders (user_id, created_at DESC);

-- Durum geçmişi
CREATE TABLE IF NOT EXISTS public.order_events (
  id bigserial PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  from_status public.order_status,
  to_status public.order_status NOT NULL,
  changed_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_events_order_idx ON public.order_events (order_id, created_at);

-- Geçerli durum geçişleri veritabanında zorunlu (yönetici düzeltme yapabilir)
CREATE OR REPLACE FUNCTION public.validate_order_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  allowed boolean;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  allowed := CASE OLD.status
    WHEN 'new' THEN NEW.status IN ('accepted', 'preparing', 'cancelled')
    WHEN 'accepted' THEN NEW.status IN ('preparing', 'cancelled')
    WHEN 'preparing' THEN NEW.status IN ('ready', 'cancelled')
    WHEN 'ready' THEN NEW.status IN ('out_for_delivery', 'completed', 'cancelled')
    WHEN 'out_for_delivery' THEN NEW.status IN ('completed', 'cancelled')
    ELSE false
  END;

  IF NOT allowed AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Geçersiz durum geçişi: % → %', OLD.status, NEW.status
      USING ERRCODE = '23514';
  END IF;

  INSERT INTO public.order_events (order_id, from_status, to_status, changed_by)
  VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_validate_status ON public.orders;
CREATE TRIGGER orders_validate_status BEFORE UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.validate_order_status();

CREATE OR REPLACE FUNCTION public.log_order_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.order_events (order_id, from_status, to_status, changed_by)
  VALUES (NEW.id, NULL, NEW.status, NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_log_created ON public.orders;
CREATE TRIGGER orders_log_created AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.log_order_created();

-- *** GÜVENLİK AÇIĞI KAPATMA: eski "giriş yapan herkes" kuralları kaldırılıyor ***
DROP POLICY IF EXISTS "orders_select_authenticated" ON public.orders;
DROP POLICY IF EXISTS "orders_update_authenticated" ON public.orders;

DROP POLICY IF EXISTS orders_select ON public.orders;
CREATE POLICY orders_select ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS orders_staff_update ON public.orders;
CREATE POLICY orders_staff_update ON public.orders FOR UPDATE TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

REVOKE ALL ON public.orders FROM anon, authenticated;
GRANT SELECT ON public.orders TO authenticated;
-- Personel sadece durum kolonunu değiştirebilir; fiyat, ürün, müşteri bilgisi değiştirilemez
GRANT UPDATE (status) ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
-- Sipariş oluşturma hâlâ yalnızca sunucu (service_role) üzerinden: fiyat sunucuda hesaplanır.

ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS order_events_select ON public.order_events;
CREATE POLICY order_events_select ON public.order_events FOR SELECT TO authenticated
  USING (
    public.is_staff()
    OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );
REVOKE ALL ON public.order_events FROM anon, authenticated;
GRANT SELECT ON public.order_events TO authenticated;
GRANT ALL ON public.order_events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.order_events_id_seq TO service_role;

-- ---------- 5. Bildirim cihaz anahtarları ----------
CREATE TABLE IF NOT EXISTS public.push_tokens (
  token text PRIMARY KEY CHECK (char_length(token) <= 255),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS push_tokens_user_idx ON public.push_tokens (user_id);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS push_tokens_own ON public.push_tokens;
CREATE POLICY push_tokens_own ON public.push_tokens FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
REVOKE ALL ON public.push_tokens FROM anon, authenticated;
GRANT SELECT, DELETE ON public.push_tokens TO authenticated;
GRANT ALL ON public.push_tokens TO service_role;

-- Aynı cihaz başka hesapla giriş yaparsa anahtar yeni hesaba geçer
CREATE OR REPLACE FUNCTION public.register_push_token(p_token text, p_platform text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Giriş gerekli' USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.push_tokens (token, user_id, platform, updated_at)
  VALUES (p_token, auth.uid(), p_platform, now())
  ON CONFLICT (token) DO UPDATE
    SET user_id = auth.uid(), platform = EXCLUDED.platform, updated_at = now();
END;
$$;
REVOKE ALL ON FUNCTION public.register_push_token(text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.register_push_token(text, text) TO authenticated;

-- Yardımcı fonksiyonları dışarıya kapat
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_role_escalation() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_order_status() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_order_created() FROM public, anon, authenticated;

-- ---------- 6. Menü verisi ----------
-- Menü içeriği 20261116_menu_update.sql dosyasından yüklenir.
