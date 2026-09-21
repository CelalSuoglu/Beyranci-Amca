-- Minimum paket sipariş tutarı: 1.250 TL
-- NOT VALID: mevcut düşük tutarlı test siparişlerini bozmaz; yeni siparişler denetlenir.
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_min_total;
ALTER TABLE public.orders ADD CONSTRAINT orders_min_total CHECK (total >= 1250) NOT VALID;
