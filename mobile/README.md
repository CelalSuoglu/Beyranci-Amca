# Beyrancı Amca — iOS / Android

Tek uygulama, role göre farklı ekranlar:

| Rol | Sekmeler |
|---|---|
| Misafir | Menü · Sepet · Siparişlerim (giriş daveti) · Hesabım |
| Müşteri | Menü · Sepet · Siparişlerim (canlı) · Hesabım (profil, adresler, bildirim, hesap silme) |
| Personel / Yönetici | + **Panel** (canlı sipariş, alarm, durum güncelleme). Yönetici web'deki /yonetim'i açar |

Ekran gizlemek sadece görünüm içindir. Her veri erişimi Supabase kuralları (RLS) ve web API'leriyle denetlenir.

## Yapı

- `app/` — ekranlar (expo-router). `(tabs)/` alt sekmeler.
- `src/context/` — oturum/rol (`AuthContext`), menü + sepet (`CartContext`, telefonda saklanır)
- `src/lib/api.ts` — web API'si (sipariş, durum, takip, hesap silme). Adres: `EXPO_PUBLIC_API_URL`
- `src/lib/notifications.ts` — bildirim izni (bağlam içinde istenir), cihaz anahtarı kaydı, Android kanalları
- `src/screens/KitchenScreen.tsx` — personel paneli

Kurulum ve mağaza adımları: `../docs/KURULUM.md`

`_to_delete/` klasörü eski dosyaları içerir; silebilirsin.
