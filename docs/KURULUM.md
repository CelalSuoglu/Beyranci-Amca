# Kurulum ve yayına alma — adım adım

Sıra önemli. **Önce veritabanı, sonra web, sonra mobil.**

## 1. Veritabanı (Supabase) — 5 dk

1. Supabase → **SQL Editor** → `supabase/migrations/20261026_accounts_roles_menu.sql` dosyasının tamamını yapıştır → **Run**.
   - Bu dosya güvenlik açığını kapatır, rolleri, adresleri, menü tablolarını ve bildirim altyapısını kurar.
   - Mevcut 40 ürünü aynı kimliklerle aktarır. Tekrar çalıştırmak güvenlidir.
   - `mutfak@beyranciamca.com` hesabı otomatik **personel** olur.
   - Ardından **`supabase/migrations/20261116_menu_update.sql`** dosyasını da aynı şekilde çalıştır:
     menüyü basılı menüye (Kasım 2026) günceller, kalori kolonunu ekler, listede olmayan ürünleri siler.
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
- [ ] Sipariş ver → Siparişlerim'de görünüyor, durum canlı değişiyor, bildirim geliyor
- [ ] "Siparişi onayla"ya iki kez hızlı bas → tek sipariş oluşuyor
- [ ] 15 km dışı adres ve 1.250 TL altı sepet reddediliyor
- [ ] Hesabı sil → giriş yapılamıyor

**Personel**
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
