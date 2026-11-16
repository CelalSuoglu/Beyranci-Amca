-- =====================================================================
-- Menü güncellemesi — basılı menü (Kasım 2026) + kaloriler
-- 20261026_accounts_roles_menu.sql'den SONRA çalıştırın. Tekrar çalıştırmak güvenlidir.
-- Bu listede olmayan ürünler ve kategoriler silinir (geçmiş siparişler etkilenmez;
-- siparişler ürün adını ve fiyatını kendi içinde saklar).
-- =====================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS calories integer CHECK (calories IS NULL OR calories BETWEEN 0 AND 10000);

BEGIN;

INSERT INTO public.categories (id, title, layout, sort_order, sub_section_title, is_active) VALUES
  ('corbalar', 'Çorbalar', 'cards', 0, null, true),
  ('geleneksel', 'Geleneksel Lezzetler', 'cards', 10, null, true),
  ('firindan', 'Fırından', 'cards', 20, null, true),
  ('cocuk-menu', 'Çocuk Menüsü', 'rows', 30, null, true),
  ('aperatifler', 'Aperatifler', 'rows', 40, null, true),
  ('tatlilar', 'Tatlılar', 'rows', 50, null, true),
  ('icecekler', 'İçecekler', 'rows', 60, null, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, layout = EXCLUDED.layout, sort_order = EXCLUDED.sort_order,
  sub_section_title = EXCLUDED.sub_section_title, is_active = true;

INSERT INTO public.products (id, category_id, name, description, price, calories, sort_order, in_sub_section, is_active, is_orderable, spice_levels, requires_garlic) VALUES
  ('corbalar-beyran', 'corbalar', 'Beyran', 'Kuzu boyun ve kol eti, pirinç ve şifasıyla ilik suyu.', 450, 330, 0, false, true, true, array['acili','az_acili','acisiz']::text[], true),
  ('corbalar-suzme-mercimek', 'corbalar', 'Süzme Mercimek', 'Kırmızı mercimek, soğan, havuç, patates, tereyağ ve baharatlarla enfes lezzet.', 200, 150, 10, false, true, true, null, false),
  ('geleneksel-nohut-durum', 'geleneksel', 'Nohut Dürüm', 'Haşlanmış nohut harmanlanmış baharatlarla hazırlanır. Soğan piyazı ve patates kızartması ile servis edilir.', 150, 700, 0, false, true, true, null, false),
  ('geleneksel-kavurma-durum', 'geleneksel', 'Kavurma Dürüm', 'Kuzu ciğer, soğan piyazı ve harmanlanmış baharat çeşitleri.', 200, 500, 10, false, true, true, null, false),
  ('firindan-gaziantep-isi-lahmacun', 'firindan', 'Gaziantep İşi Lahmacun', 'Sarımsak, domates, maydanoz, taze biber ve özel Gaziantep baharatlarıyla hazırlanan harç, çıtır çıtır hamur.', 200, null, 0, false, true, true, array['acili','acisiz']::text[], false),
  ('firindan-sub-kasarli-lahmacun', 'firindan', 'Kaşarlı Lahmacun', null, 225, null, 10, true, true, true, array['acili','acisiz']::text[], false),
  ('firindan-sub-kasarli-pide', 'firindan', 'Kaşarlı Pide', null, 275, null, 20, true, true, true, null, false),
  ('firindan-sub-kiymali-pide', 'firindan', 'Kıymalı Pide', null, 350, null, 30, true, true, true, null, false),
  ('firindan-sub-kusbasili-pide', 'firindan', 'Kuşbaşılı Pide', null, 400, null, 40, true, true, true, null, false),
  ('firindan-sub-kiymali-kasarli-pide', 'firindan', 'Kıymalı Kaşarlı Pide', null, 375, null, 50, true, true, true, null, false),
  ('firindan-sub-kusbasi-kasar-pide', 'firindan', 'Kuşbaşı Kaşar Pide', null, 425, null, 60, true, true, true, null, false),
  ('firindan-sub-sucuk-kasar-pide', 'firindan', 'Sucuk Kaşar Pide', null, 325, null, 70, true, true, true, null, false),
  ('firindan-sub-kavurma-kasar-pide', 'firindan', 'Kavurma Kaşar Pide', null, 450, null, 80, true, true, true, null, false),
  ('cocuk-menu-karisik-pizza-ayran', 'cocuk-menu', 'Karışık Pizza / Ayran', null, 400, null, 0, false, true, true, null, false),
  ('cocuk-menu-margarita-pizza-ayran', 'cocuk-menu', 'Margarita Pizza / Ayran', null, 370, null, 10, false, true, true, null, false),
  ('aperatifler-icli-kofte', 'aperatifler', 'İçli Köfte', null, 125, null, 0, false, true, true, null, false),
  ('aperatifler-cigkofte-porsiyon', 'aperatifler', 'Çiğköfte Porsiyon', null, 140, null, 10, false, true, true, null, false),
  ('tatlilar-sekerli-borek', 'tatlilar', 'Şekerli Börek', null, 300, null, 0, false, true, true, null, false),
  ('icecekler-gazli-icecekler', 'icecekler', 'Gazlı İçecekler', null, 90, null, 0, false, true, true, null, false),
  ('icecekler-ayran', 'icecekler', 'Ayran', null, 50, null, 10, false, true, true, null, false),
  ('icecekler-acili-acisiz-salgam', 'icecekler', 'Acılı, Acısız Şalgam', null, 60, null, 20, false, true, true, null, false),
  ('icecekler-su', 'icecekler', 'Su', null, 20, null, 30, false, true, true, null, false),
  ('icecekler-soda', 'icecekler', 'Soda', null, 35, null, 40, false, true, true, null, false),
  ('icecekler-turk-kahvesi', 'icecekler', 'Türk Kahvesi', null, 50, null, 50, false, true, false, null, false),
  ('icecekler-cay', 'icecekler', 'Çay', null, 25, null, 60, false, true, false, null, false)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id, name = EXCLUDED.name, option_group = NULL, option_name = NULL,
  description = EXCLUDED.description, description_list = NULL, price = EXCLUDED.price,
  calories = EXCLUDED.calories, sort_order = EXCLUDED.sort_order, in_sub_section = EXCLUDED.in_sub_section,
  is_active = true, is_orderable = EXCLUDED.is_orderable, spice_levels = EXCLUDED.spice_levels,
  requires_garlic = EXCLUDED.requires_garlic;

-- Menüde artık olmayanlar
DELETE FROM public.products WHERE id NOT IN ('corbalar-beyran', 'corbalar-suzme-mercimek', 'geleneksel-nohut-durum', 'geleneksel-kavurma-durum', 'firindan-gaziantep-isi-lahmacun', 'firindan-sub-kasarli-lahmacun', 'firindan-sub-kasarli-pide', 'firindan-sub-kiymali-pide', 'firindan-sub-kusbasili-pide', 'firindan-sub-kiymali-kasarli-pide', 'firindan-sub-kusbasi-kasar-pide', 'firindan-sub-sucuk-kasar-pide', 'firindan-sub-kavurma-kasar-pide', 'cocuk-menu-karisik-pizza-ayran', 'cocuk-menu-margarita-pizza-ayran', 'aperatifler-icli-kofte', 'aperatifler-cigkofte-porsiyon', 'tatlilar-sekerli-borek', 'icecekler-gazli-icecekler', 'icecekler-ayran', 'icecekler-acili-acisiz-salgam', 'icecekler-su', 'icecekler-soda', 'icecekler-turk-kahvesi', 'icecekler-cay');
DELETE FROM public.categories WHERE id NOT IN ('corbalar', 'geleneksel', 'firindan', 'cocuk-menu', 'aperatifler', 'tatlilar', 'icecekler');

COMMIT;
