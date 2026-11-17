-- Müşterinin onayladığı Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi metninin değişmez kopyası
-- (Mesafeli Sözleşmeler Yönetmeliği: kalıcı veri saklayıcısı — bilgiye "aynen" ulaşılabilmeli)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS terms_snapshot jsonb;
