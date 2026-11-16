-- Siparişte onaylanan yasal metin sürümü ve onay zamanı (Mesafeli Sözleşmeler Yönetmeliği ispat yükü)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS terms_version text CHECK (terms_version IS NULL OR char_length(terms_version) <= 40),
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;
