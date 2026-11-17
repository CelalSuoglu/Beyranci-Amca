# Kurulum ve yayına alma — adım adım

Sıra önemli. **Önce veritabanı, sonra web, sonra mobil.**

## 1. Veritabanı (Supabase) — 5 dk

1. Supabase → **SQL Editor** → `supabase/migrations/20261026_accounts_roles_menu.sql` dosyasının tamamını yapıştır → **Run**.
   - Bu dosya güvenlik açığını kapatır, rolleri, adresleri, menü tablolarını ve bildirim altyapısını kurar.
   - Mevcut 40 ürünü aynı kimliklerle aktarır. Tekrar çalıştırmak güvenlidir.
   - `mutfak@beyranciamca.com` hesabı otomatik **personel** olur.
   - Ardından **`supabase/migrations/20261116_menu_update.sql`** dosyasını da aynı şekilde çalıştır:
     menüyü basılı menüye (Kasım 2026) günceller, kalori kolonunu ekler, listede olmayan ürünleri siler.
   - Son olarak **`supabase/migrations/20261117_store_settings.sql`**: sipariş açık/kapalı, çalışma saatleri,
     tahmini süre, duyuru; para üstü, servis tercihi, teslim saati, iptal nedeni; ürün görselleri.
   - **`20261118_order_terms.sql`**: siparişte onaylanan sözleşme sürümü ve zamanı.
   - **`20261119_terms_snapshot.sql`**: onaylanan sözleşme metninin değişmez kopyası.
   - ✅ 17 Kasım 2026: tüm dosyalar canlı veritabanında çalıştırıldı.

## Yasal metinler

- Metinler: `src/lib/legal/documents.ts` · Satıcı bilgileri: `src/lib/legal.ts` (unvan, vergi no, e-posta **doldurulmalı**).
- Metni değiştirince `LEGAL_VERSION`'ı güncelle; her sipariş onayladığı sürümü saklar.
- Sayfalar: /on-bilgilendirme, /mesafeli-satis-sozlesmesi, /iptal-ve-iade, /teslimat-kosullari, /gizlilik,
  /cerez-politikasi, /kullanim-kosullari, /erisilebilirlik, /yasal; siparişe özel: /sozlesme/[takip-anahtarı].
- Google Analytics yalnızca çerez onayından sonra yüklenir.
- Yayından önce bir avukat / mali müşavire kontrol ettir. Yurt dışı aktarım (Vercel, Supabase, Expo, Google ABD'de)
  için KVKK m.9 kapsamında standart sözleşme yükümlülüğünü danış.
2. **Authentication → URL Configuration**
   - Site URL: `https://beyranciamca.com`
   - Redirect URLs: `https://beyranciamca.com/auth/callback` ve `http://localhost:3000/auth/callback`
3. **Authentication → Sign In / Providers → Email**
   - "Confirm email" **açık**
   - "Allow new users to sign up" → migration'dan **sonra** tekrar açabilirsin (artık güvenli)
   - Minimum şifre uzunluğu: 8
4. **Authentication → Emails → SMTP**: Supabase'in hazır e-postası saatte birkaç e-postayla sınırlı.
   Canlıda kendi SMTP'ni bağla (ör. Resend, Brevo). Yoksa kayıt/şifre e-postaları gitmeyebilir.
5. (İsteğe bağlı) E-posta şablonlarını Türkçeleştir.

## 2. İlk yönetici ve mutfak hesabı

```bash
# Önce siteden kendi e-postanla üye ol, doğrula. Sonra:
node scripts/set-role.mjs senin@mailin.com admin

# Mutfak hesabının şifresini değiştir (eski şifre kodda açık yazılıydı):
node scripts/reset-mutfak-user.mjs "YeniGüçlüŞifre2026"
```

Sonrasında personel eklemek için: kişi siteden üye olur → **/yonetim → Kullanıcılar** → rolünü "Personel" yap.

## 3. Web (Vercel)

1. Değişiklikleri Cursor'dan commit edip GitHub'a gönder → Vercel otomatik yayınlar.
2. Vercel → Settings → Environment Variables: mevcutlar yeterli.
   Push güvenliğini açarsan `EXPO_ACCESS_TOKEN` ekle.
3. `src/lib/legal.ts` içindeki köşeli parantezli alanları (unvan, vergi no, KVKK e-postası) doldur.

## 4. Mobil uygulama

```bash
cd mobile
npm install
npx expo install expo@latest
npx expo install --fix
npx eas login          # expo.dev hesabı (ücretsiz)
npx eas init           # app.json'a projectId yazar — bildirimler için şart
```

**Not:** Android'de bildirimler Expo Go'da çalışmaz. Denemek için geliştirme sürümü kur:

```bash
npx eas build --profile development --platform android   # (iOS için --platform ios)
npx expo start --dev-client
```

## 5. Mağazalar

| | App Store | Google Play |
|---|---|---|
| Hesap | Apple Developer — yıllık 99 USD | Play Console — tek sefer 25 USD |
| Derleme | `npx eas build --profile production --platform ios` | `... --platform android` |
| Gönderim | `npx eas submit --platform ios` | `npx eas submit --platform android` |
| Gizlilik URL | `https://beyranciamca.com/gizlilik` | aynı |
| Hesap silme | Uygulama içinde: Hesabım → Hesabımı sil ✅ | Aynı + web: /hesabim/profil ✅ |
| Kategori | Food & Drink | Yiyecek ve İçecek |

İnceleme ekibi için **iki test hesabı** hazırla ve başvuru formuna yaz: bir müşteri, bir personel.

Veri beyanı (App Privacy / Data safety) için toplanan veriler: ad, telefon, e-posta, adres, sipariş geçmişi,
cihaz bildirim anahtarı. Hiçbiri reklam veya takip için kullanılmıyor; hepsi uygulama işlevi için.

Ödeme: Yemek fiziksel ürün olduğu için uygulama içi satın alma (IAP) gerekmez. iyzico eklendiğinde de aynı.

## 6. Test listesi (her yayından önce)

**Müşteri**
- [ ] Misafir olarak sipariş ver → takip sayfası açılıyor, durum değişince güncelleniyor
- [ ] Üye ol → doğrulama e-postası geliyor → giriş
- [ ] Şifremi unuttum → e-posta → yeni şifre → giriş
- [ ] Profil ve adres kaydet → sipariş formunda otomatik doluyor
- [ ] Sayfayı yenile → sepet duruyor
- [ ] Kapıda nakit + "2000" yaz → mutfakta para üstü görünüyor; toplamdan az tutar reddediliyor
- [ ] Geçmiş sipariş → "Tekrar sipariş ver" → ürünler sepette, fiyatlar güncel
- [ ] Sipariş ver → Siparişlerim'de görünüyor, durum canlı değişiyor, bildirim geliyor
- [ ] "Siparişi onayla"ya iki kez hızlı bas → tek sipariş oluşuyor
- [ ] 15 km dışı adres ve 1.250 TL altı sepet reddediliyor
- [ ] Hesabı sil → giriş yapılamıyor

**Paket sipariş ayarları**
- [ ] /yonetim/ayarlar → saatleri değiştir → sipariş sayfasındaki "Son sipariş" saati değişiyor
- [ ] Mutfak panelinde "Siparişleri durdur" → sipariş sayfası anında "Şu an sipariş alınmıyor" gösteriyor, sipariş gönderilemiyor
- [ ] Duyuru yaz → sipariş sayfasının üstünde görünüyor

**Personel**
- [ ] Yeni siparişte süre seç (ör. 45 dk) → "Kabul edildi" → müşteri takip ekranında teslim saati görünüyor
- [ ] İptal → neden seç → müşteri ekranında neden görünüyor
- [ ] "Fiş yazdır" → 80 mm fiş açılıyor (para üstü, çatal-bıçak, not, adres)
- [ ] Mutfak paneline giriş → yeni sipariş sesli düşüyor, telefon kilitliyken bildirim geliyor
- [ ] Bildirime dokununca panel açılıyor
- [ ] Durumları sırayla değiştir → müşteri ekranına yansıyor
- [ ] Müşteri hesabıyla /mutfak'a girmeye çalış → engelleniyor

**Yönetici**
- [ ] Ürün fiyatı değiştir → sitede ve uygulamada yeni fiyat, sipariş yeni fiyattan hesaplanıyor
- [ ] Ürünü "Siparişte: Kapalı" yap → siparişte görünmüyor, menüde görünüyor
- [ ] Kullanıcıya personel rolü ver/al

**Güvenlik (bir kez, Supabase SQL Editor'da "Run as authenticated user" ile veya müşteri hesabıyla)**
- [ ] Müşteri başka birinin siparişini göremiyor
- [ ] Müşteri kendi rolünü değiştiremiyor
- [ ] Personel sipariş fiyatını/ürünlerini değiştiremiyor
