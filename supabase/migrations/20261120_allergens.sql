-- Ürün alerjenleri (Türk Gıda Kodeksi Etiketleme Yönetmeliği Ek-1, 14 grup)
-- Kodlar: gluten, kabuklular, yumurta, balik, yer_fistigi, soya, sut,
-- kabuklu_yemis, kereviz, hardal, susam, sulfit, aci_bakla, yumusakcalar

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS allergens text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_allergens_valid;
ALTER TABLE public.products
  ADD CONSTRAINT products_allergens_valid CHECK (
    allergens <@ ARRAY['gluten','kabuklular','yumurta','balik','yer_fistigi','soya','sut',
      'kabuklu_yemis','kereviz','hardal','susam','sulfit','aci_bakla','yumusakcalar']::text[]
  );

-- Yalnızca ürünün tanımı gereği kesin olan alerjenler. Diğerleri (ör. çorbalar,
-- börek içindeki yumurta/süt) mutfak tarafından yönetim panelinden işaretlenmelidir.
UPDATE public.products SET allergens = ARRAY['gluten']
  WHERE allergens = '{}' AND id IN (
    'geleneksel-nohut-durum','geleneksel-kavurma-durum',
    'firindan-gaziantep-isi-lahmacun','firindan-sub-kiymali-pide','firindan-sub-kusbasili-pide',
    'aperatifler-icli-kofte','aperatifler-cigkofte-porsiyon','tatlilar-sekerli-borek'
  );
UPDATE public.products SET allergens = ARRAY['gluten','sut']
  WHERE allergens = '{}' AND id IN (
    'firindan-sub-kasarli-lahmacun','firindan-sub-kasarli-pide','firindan-sub-kiymali-kasarli-pide',
    'firindan-sub-kusbasi-kasar-pide','firindan-sub-sucuk-kasar-pide','firindan-sub-kavurma-kasar-pide',
    'cocuk-menu-karisik-pizza-ayran','cocuk-menu-margarita-pizza-ayran'
  );
UPDATE public.products SET allergens = ARRAY['sut']
  WHERE allergens = '{}' AND id = 'icecekler-ayran';
