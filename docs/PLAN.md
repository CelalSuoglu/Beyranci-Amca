# Beyrancı Amca — Web + Android + iOS Planı

_Aşama 1 (inceleme) ve Aşama 2 (plan) — 26 Ekim 2026_

## 1. Mevcut durum

| Parça | Durum |
|---|---|
| Web | Next.js 16 + Tailwind 4, Vercel'de. Ana sayfa, QR menü, `/siparis` paket sipariş, `/mutfak` paneli. |
| Veritabanı | Supabase. Tek tablo: `orders`. Realtime açık. |
| Sipariş oluşturma | `POST /api/orders` — fiyatı sunucu hesaplıyor, 15 km teslimat kontrolü yapıyor, service role ile kaydediyor. **İyi yapılmış.** |
| Menü | `src/lib/menu-data.ts` içinde sabit kod. |
| Ödeme | Sadece kapıda nakit / kapıda kart. |
| Üyelik | Yok. Tek bir mutfak hesabı var. |
| Mobil | `mobile/` — dün eklenen Expo mutfak paneli (henüz cihazda denenmedi). |

## 2. Eksikler ve riskler

**Acil güvenlik açığı.** `orders` tablosunda kural şu: _giriş yapmış herkes_ tüm siparişleri okuyup değiştirebilir.
Supabase'de "yeni kayda izin ver" açıksa, sitedeki public anahtarla biri hesap açıp tüm müşterilerin
ad, telefon ve adresini görebilir. Müşteri üyeliği açılmadan önce mutlaka rol kontrolüne geçilmeli
(Aşama 4'ün ilk işi). O zamana kadar: Supabase → Authentication → Sign In / Providers →
**"Allow new users to sign up" kapalı** olmalı.

Diğer eksikler:
1. Rol sistemi yok (müşteri / personel / yönetici ayrımı).
2. Sipariş durumu geçişleri veritabanında doğrulanmıyor; panelden herhangi bir durum yazılabilir.
3. Siparişler bir kullanıcıya bağlı değil; müşteri geçmişini göremez.
4. Menü kodda; yönetici ürün/fiyat değiştiremez, her değişiklik deploy ister.
5. Online ödeme yok.
6. Bildirim yok; alarm sadece panel açıkken çalışıyor.
7. Durum geçmişi tutulmuyor (kim, ne zaman değiştirdi).
8. `scripts/reset-mutfak-user.mjs` içinde mutfak şifresi açık yazılı ve zayıf. Değiştirilmeli.
9. Küçük: Next 16'da `middleware.ts` yerine `proxy.ts` önerilir (şu an çalışıyor).

## 3. Teknik yaklaşım — neden bu?

- **Web baştan yazılmayacak.** Next.js sitesi kalır; aynı zamanda tüm sistemin sunucusu (API) olur.
- **Mobil: Expo (React Native), tek uygulama.** Mevcut `mobile/` projesi büyütülür.
  - Siteyi bir kabuğa sarmak (Capacitor/WebView) yerine bunu seçme nedeni: Apple sadece web sitesini
    saran uygulamaları sık reddediyor; push bildirimi, klavye, geri hareketi ve ekran kenarları
    native'de çok daha sorunsuz.
- **Tek arka uç:** Supabase (veri + giriş + realtime) + Next.js API (sipariş, ödeme, bildirim).
  Web ve mobil aynı API'yi ve aynı veritabanını kullanır.
- Gizli anahtarlar (Supabase service role, iyzico secret, Expo push token) **sadece Vercel ortam değişkenlerinde** durur.

```
 Web (Next.js)  ─┐
 Android (Expo) ─┼─►  Next.js API (Vercel)  ─►  Supabase (DB + Auth + Realtime)
 iOS (Expo)     ─┘          │                         ▲
                            ├─► iyzico (ödeme, 3D Secure)
                            └─► Expo Push (bildirim)
```

## Kararlar

- Misafir sipariş **devam eder**; sipariş geçmişi ve canlı takip için üyelik gerekir. Misafire sipariş numarası + telefonla takip bağlantısı verilir.
- Kapıda nakit ve kapıda kart **kalır**, yanına online kart ödemesi eklenir.

## 4. Roller ve yetki (sunucu tarafında)

| Rol | Görebildiği / yapabildiği |
|---|---|
| Müşteri | Kendi profili, kendi adresleri, kendi siparişleri. Sipariş verir, öder, durumu izler. |
| Personel | Tüm siparişleri görür, durum günceller. Ürün/kullanıcı yönetemez. |
| Yönetici | Kullanıcılar ve rolleri, ürünler/kategoriler/fiyatlar, tüm siparişler. |

- Rol `profiles.role` kolonunda. Kullanıcı bu kolonu **değiştiremez** (kolon yetkisi + tetikleyici). Yeni hesap her zaman `customer`.
- Kontrol veritabanında (Supabase RLS) ve API'de yapılır; ekran gizlemek sadece görünüm içindir.
- Tek şube olduğu için personel tüm siparişleri görür. İleride şube eklenirse `branch_id` ile daraltılır.

## 5. Veritabanı değişiklikleri

- `profiles` — ad, telefon, rol
- `addresses` — müşteri adresleri (etiket, adres, varsayılan)
- `categories`, `products` — menü buraya taşınır (`menu-data.ts`'ten tohumlanır, QR menü de buradan okur)
- `orders` + `user_id`, `payment_method` (+ `online`), `payment_status`, `idempotency_key` (tekrar gönderimde çift sipariş olmasın)
- `order_events` — durum geçmişi
- `payments` — sağlayıcı referansı, durum; sağlayıcı işlem no'su **unique** (çift tahsilat/çift kayıt engeli)
- `push_tokens` — cihaz bildirim anahtarları
- Durum geçişleri veritabanı fonksiyonuyla doğrulanır (ör. `completed` → `new` olamaz).

## 6. Ekranlar

**Müşteri (web + mobil):** Menü → ürün seçenekleri (acı/sarımsak) → Sepet → Adres + ödeme seçimi →
Ödeme (iyzico) → Sipariş takibi (canlı) · Siparişlerim · Profil · Adreslerim · Giriş/Kayıt/Şifre sıfırlama

**Personel:** Sipariş paneli (mevcut panel, canlı + alarm + bildirim) → sipariş detayı → durum butonları

**Yönetici:** Web'de `/yonetim`: ürünler, kategoriler, fiyatlar, kullanıcılar ve roller, tüm siparişler.
Mobilde personel paneli + temel sipariş yönetimi.

Mobil: alt sekmeler (Menü · Sepet · Siparişlerim · Profil), personelde "Panel" sekmesi açılır.

## 7. Ödeme — öneri: iyzico

- Şahıs şirketi, limited ve anonim şirket başvurabiliyor; Visa/Mastercard logoları sitede zorunlu.
- 3D Secure var; hazır **Checkout Form** (kart bilgisi bizim sunucuya hiç gelmez).
- Test ortamında Visa, Mastercard, Amex ve Troy test kartları var.
- Liste komisyonu: başarılı işlem başı %4,29 + 0,25 TL (aylık 20.000 TL üstü satışta), kurulum ücreti yok.
- Tek sağlayıcı yeterli. Alternatif: PayTR (benzer kapsam).
- Akış: sipariş `payment_status = pending` oluşur → iyzico formu açılır → iyzico geri dönüşünde
  **sunucu iyzico'ya sorup doğrular** → ancak o zaman `paid` olur ve mutfağa düşer.
  Başarısız/iptal → sipariş ödenmemiş kalır, müşteri tekrar dener.
- **App Store / Google Play:** Yemek fiziksel bir ürün ve uygulama dışında tüketiliyor.
  Apple kuralı 3.1.5'e göre bu tür ödemelerde uygulama içi satın alma (IAP) **kullanılmaz**;
  normal kart ödemesi doğru yol. Google Play'de de fiziksel ürünler Play Billing dışında tutulur.
- Canlıya geçmek için gerekenler: vergi levhası, imza sirküleri, ortak kimlikleri, IBAN belgesi;
  sitede gizlilik politikası, mesafeli satış sözleşmesi, iade koşulları, iletişim bilgisi.

## 8. Bildirimler

- Expo Push (iOS + Android tek API). Yeni sipariş → personele; onay ve durum değişimi → müşteriye.
- Bildirime dokununca ilgili sipariş ekranı açılır.
- Bildirim gelmese bile panel realtime + 6 sn yenileme ile çalışmaya devam eder.
- Web'de müşteri durumu canlı görür; personel web panelinde ses alarmı sürer.

## 9. Aşamalar

| # | Aşama | Durum |
|---|---|---|
| 1 | İnceleme, eksikler | ✅ |
| 2 | Plan | ✅ |
| 3 | Tasarım ve cihaz uyumu | ✅ Mobil: sekmeler, güvenli alanlar, klavye, geri hareketi; web: yeni sayfalar güvenli alan uyumlu |
| 4 | Üyelik + roller + RLS | ✅ Kod hazır — migration Supabase'de çalıştırılınca devreye girer |
| 5 | Menü DB'de, sipariş akışı, müşteri takibi, yönetim paneli | ✅ |
| 6 | Bildirimler | ✅ Kod hazır — `eas init` + geliştirme sürümü gerekir |
| 7 | Online ödeme (iyzico) | ⏸ Ertelendi (sen ekleyeceksin). Veritabanında `payment_status` ve `online` yöntemi hazır |
| 8 | Testler | 🟡 Web: tip kontrolü + lint temiz. Mobil: paketler kurulamadığı için cihazda denenmedi. Elle test listesi: `docs/KURULUM.md` |
| 9 | Mağaza hazırlığı | ✅ eas.json, simgeler, izinler, gizlilik sayfası, hesap silme. Hesaplar ve ekran görüntüleri sende |

## 10. Senden gerekecekler (sırası gelince)

- Supabase'de SQL çalıştırmak (her aşamanın migration dosyasını hazır vereceğim) — Aşama 4
- Personel ve yönetici olacak e-posta adresleri — Aşama 4
- Expo hesabı — Aşama 6
- iyzico test (sandbox) hesabı — Aşama 7; canlı için şirket belgeleri
- Apple Developer (yıllık 99 USD) ve Google Play Console (tek sefer 25 USD) hesapları — Aşama 9
