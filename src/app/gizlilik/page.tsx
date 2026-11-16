import type { Metadata } from "next";
import Link from "next/link";
import { legal } from "@/lib/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gizlilik ve KVKK Aydınlatma Metni",
  alternates: { canonical: "/gizlilik" },
};

export default function GizlilikPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl px-5 pb-[max(3rem,env(safe-area-inset-bottom))] pt-10 sm:px-6">
      <Link href="/" className="text-sm text-[var(--foreground-muted)] hover:text-[var(--accent-soft)]">← Ana sayfa</Link>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold">Gizlilik ve KVKK Aydınlatma Metni</h1>
      <p className="mt-2 text-sm text-[var(--foreground-muted)]">Son güncelleme: {legal.lastUpdated}</p>

      <div className="mt-8 space-y-6 text-[0.9375rem] leading-relaxed text-[var(--foreground-muted)] [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[var(--foreground)]">
        <section>
          <h2>Veri sorumlusu</h2>
          <p>
            {legal.entityName} ({site.name}), {site.address}. Vergi dairesi / no: {legal.taxOffice} / {legal.taxNumber}.
            Kişisel verileriniz 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aşağıda
            açıklanan şekilde işlenir.
          </p>
        </section>
        <section>
          <h2>Hangi verileri işliyoruz?</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Kimlik ve iletişim: ad soyad, cep telefonu, e-posta (üye olursanız).</li>
            <li>Teslimat: adres ve sipariş notları.</li>
            <li>Sipariş: ürünler, tutar, ödeme yöntemi, sipariş zamanı ve durumu.</li>
            <li>Uygulama: bildirim izni verirseniz cihaz bildirim anahtarı.</li>
            <li>Site kullanımı: Google Analytics ile anonim ziyaret istatistikleri.</li>
          </ul>
          <p className="mt-2">Kart bilgileriniz tarafımızca saklanmaz; online ödeme eklendiğinde lisanslı ödeme kuruluşu tarafından işlenir.</p>
        </section>
        <section>
          <h2>Neden işliyoruz? (amaç ve hukuki sebep)</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Siparişinizi almak, hazırlamak ve teslim etmek — sözleşmenin kurulması ve ifası (KVKK m.5/2-c).</li>
            <li>Sipariş durumu hakkında sizi bilgilendirmek — sözleşmenin ifası ve meşru menfaat (m.5/2-c, f).</li>
            <li>Fatura ve muhasebe kayıtları — kanuni yükümlülük (m.5/2-ç).</li>
            <li>Hesabınızı ve güvenliğini yönetmek — meşru menfaat (m.5/2-f).</li>
          </ul>
        </section>
        <section>
          <h2>Kimlerle paylaşıyoruz?</h2>
          <p>
            Verileriniz yalnızca hizmetin yürütülmesi için gerekli olduğu ölçüde, altyapı hizmeti aldığımız
            sağlayıcılarla paylaşılır: barındırma (Vercel), veritabanı ve kimlik doğrulama (Supabase),
            uygulama bildirimleri (Expo), adres doğrulama (OpenStreetMap/Nominatim, Photon). Bu
            sağlayıcıların bir kısmı yurt dışında bulunduğundan veriler KVKK m.9 kapsamında yurt dışına
            aktarılabilir. Yasal zorunluluk hâlinde yetkili kurumlarla paylaşılır.
          </p>
        </section>
        <section>
          <h2>Ne kadar süre saklıyoruz?</h2>
          <p>
            Hesap bilgileri hesabınız açık olduğu sürece; sipariş ve fatura kayıtları vergi mevzuatının
            öngördüğü süre boyunca saklanır. Hesabınızı istediğiniz zaman <Link href="/hesabim/profil" className="text-[#fdba74] hover:underline">Hesabım → Profil</Link>{" "}
            sayfasından veya uygulamadan silebilirsiniz.
          </p>
        </section>
        <section>
          <h2>Haklarınız</h2>
          <p>
            KVKK m.11 uyarınca verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini
            isteme, itiraz etme ve zararın giderilmesini talep etme haklarına sahipsiniz. Başvurularınızı{" "}
            {legal.kvkkEmail} adresine veya {site.address} adresine yazılı olarak iletebilirsiniz.
            {site.phoneDisplay ? ` Telefon: ${site.phoneDisplay}.` : ""}
          </p>
        </section>
      </div>
    </main>
  );
}
