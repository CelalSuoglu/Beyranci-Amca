import { BUSINESS, LEGAL_UPDATED_LABEL, sellerDisplayName } from "@/lib/legal";
import { MAX_DELIVERY_KM, MIN_ORDER_TOTAL_TL } from "@/lib/orders/constants";

/**
 * Yasal metinler (Türkiye). Hukuki danışmanlık yerine geçmez; yayına almadan önce bir
 * avukata / mali müşavire kontrol ettirilmesi önerilir.
 */

export type LegalSection = { heading: string; paragraphs?: string[]; list?: string[] };
export type LegalDoc = {
  slug: string;
  title: string;
  /** Liste sayfası ve meta açıklaması için kısa özet */
  summary: string;
  sections: LegalSection[];
};

const tl = (n: number) => `${n.toLocaleString("tr-TR")} TL`;

function contactSentence(): string {
  const parts = [`${BUSINESS.address}`, BUSINESS.phone ? `telefon: ${BUSINESS.phone}` : "", BUSINESS.email ? `e-posta: ${BUSINESS.email}` : ""].filter(Boolean);
  return parts.join(", ");
}

function sellerSection(): LegalSection {
  return {
    heading: "Satıcı bilgileri",
    list: [
      `Unvan: ${sellerDisplayName()}`,
      ...(BUSINESS.legalName ? [`Marka: ${BUSINESS.tradeName}`] : []),
      `Adres: ${BUSINESS.address}`,
      ...(BUSINESS.phone ? [`Telefon: ${BUSINESS.phone}`] : []),
      ...(BUSINESS.email ? [`E-posta: ${BUSINESS.email}`] : []),
      ...(BUSINESS.taxOffice && BUSINESS.taxNumber ? [`Vergi dairesi / No: ${BUSINESS.taxOffice} / ${BUSINESS.taxNumber}`] : []),
      ...(BUSINESS.mersisNo ? [`MERSİS No: ${BUSINESS.mersisNo}`] : []),
    ],
  };
}

const CAYMA_ISTISNA =
  "6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin (b), (c) ve (ç) bentleri uyarınca; tüketicinin istekleri doğrultusunda hazırlanan (acı, sarımsak vb. seçimlere göre), çabuk bozulabilen ve iadesi sağlık ve hijyen açısından uygun olmayan yiyecek ve içeceklerin teslimine ilişkin sözleşmelerde cayma hakkı bulunmamaktadır.";

const SIKAYET =
  "Şikâyet ve itirazlarınızı öncelikle bize iletebilirsiniz. Ayrıca Ticaret Bakanlığınca her yıl ilan edilen parasal sınırlar dahilinde yerleşim yerinizin veya işlemi yaptığınız yerin Tüketici Hakem Heyetine, bu sınırların üzerindeki uyuşmazlıklarda Tüketici Mahkemesine başvurabilirsiniz. Başvurular e-Devlet üzerinden Tüketici Bilgi Sistemi (TÜBİS) aracılığıyla da yapılabilir.";

export function onBilgilendirme(): LegalDoc {
  return {
    slug: "on-bilgilendirme",
    title: "Ön Bilgilendirme Formu",
    summary: "Online paket siparişten önce satıcı, ürün, fiyat, ödeme, teslimat ve haklarınız hakkında bilgiler.",
    sections: [
      sellerSection(),
      {
        heading: "Sözleşmenin konusu ve ürünler",
        paragraphs: [
          "Bu form, internet sitemiz veya mobil uygulamamız üzerinden verdiğiniz paket yemek siparişine ilişkindir. Sipariş ettiğiniz ürünlerin adı, adedi, seçenekleri (acı, sarımsak vb.), birim fiyatları ve toplam tutarı siparişi onaylamadan önce sepet özetinde ve sipariş sonrasında siparişinize özel sözleşme sayfasında gösterilir.",
          "Ürünler siparişiniz üzerine taze olarak hazırlanır. Alerjiniz veya özel bir hassasiyetiniz varsa lütfen sipariş notuna yazın ve bizi arayın; ürünlerimiz gluten, süt ürünleri, yumurta, susam ve kuruyemiş gibi alerjenler içerebilir veya bunlarla aynı mutfakta hazırlanabilir.",
        ],
      },
      {
        heading: "Fiyat ve ödeme",
        list: [
          "Menüde ve sepette gösterilen fiyatlar Türk lirası cinsindendir ve KDV dahildir.",
          "Paket teslimat için ayrıca teslimat ücreti alınmaz.",
          `Minimum sipariş tutarı ${tl(MIN_ORDER_TOTAL_TL)}'dir.`,
          "Ödeme, teslimat sırasında kapıda nakit veya kredi/banka kartı ile yapılır. Nakit ödemede kuryenin para üstü hazırlaması için ödeyeceğiniz tutarı siparişte belirtebilirsiniz.",
          "Fiyatlar sipariş anında sunucularımızda hesaplanır; onayladığınız toplam tutar değişmez.",
        ],
      },
      {
        heading: "Teslimat",
        list: [
          `Teslimat, restoranımıza en fazla ${MAX_DELIVERY_KM} km mesafedeki adreslere kendi kuryemiz tarafından yapılır.`,
          "Tahmini teslim süresi sipariş sayfasında gösterilir; siparişiniz onaylandığında size özel tahmini teslim saati takip ekranında ve (uygulamada) bildirimle iletilir.",
          "Paket siparişler, sipariş sayfasında gösterilen çalışma saatleri içinde alınır.",
          "Siparişiniz herhangi bir nedenle hazırlanamaz veya teslim edilemezse sizi bilgilendirir ve siparişi iptal ederiz; kapıda ödeme yapıldığı için sizden herhangi bir ücret tahsil edilmez.",
        ],
      },
      { heading: "Cayma hakkı", paragraphs: [CAYMA_ISTISNA, "Siparişinizi, hazırlanmaya başlanmadan önce bizi arayarak ücretsiz iptal edebilirsiniz."] },
      {
        heading: "Eksik, yanlış veya ayıplı ürün",
        paragraphs: [
          "Teslim aldığınız siparişte eksik, yanlış veya ayıplı (bozuk, sağlığa uygun olmayan vb.) bir ürün varsa lütfen teslimattan sonra en kısa sürede bizi arayın; mümkünse fotoğrafını paylaşın. 6502 sayılı Kanun'un 11. maddesindeki haklarınız saklıdır: ürünün yenisiyle değiştirilmesini, bedel indirimini veya bedelin iadesini talep edebilirsiniz.",
        ],
      },
      {
        heading: "Sözleşmenin kurulması ve saklanması",
        paragraphs: [
          "Sözleşme, sipariş ekranındaki onay kutusunu işaretleyip “Siparişi onayla” butonuna basmanızla kurulur. Siparişinize özel Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi sipariş sonrasında size verilen bağlantıda yer alır; bu sayfayı kaydedebilir veya yazdırabilirsiniz. Sözleşme kaydı tarafımızca saklanır.",
        ],
      },
      { heading: "Şikâyet ve başvuru yolları", paragraphs: [SIKAYET, `İletişim: ${contactSentence()}.`] },
    ],
  };
}

export function mesafeliSatis(): LegalDoc {
  return {
    slug: "mesafeli-satis-sozlesmesi",
    title: "Mesafeli Satış Sözleşmesi",
    summary: "Online paket siparişlerde sizinle aramızda kurulan sözleşmenin şartları.",
    sections: [
      {
        heading: "1. Taraflar",
        paragraphs: [
          `SATICI: ${sellerDisplayName()} (${BUSINESS.tradeName}) — ${contactSentence()}.`,
          "ALICI: Siparişi veren ve sipariş formunda adı, telefonu ve teslimat adresi bulunan kişi.",
        ],
      },
      {
        heading: "2. Konu",
        paragraphs: [
          "Bu sözleşmenin konusu, ALICI'nın SATICI'ya ait internet sitesi veya mobil uygulama üzerinden elektronik ortamda sipariş verdiği yiyecek ve içeceklerin satışı ve teslimidir. Taraflar, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümlerine tabidir.",
        ],
      },
      {
        heading: "3. Ürünler, fiyat ve ödeme",
        paragraphs: [
          "Ürünlerin adı, seçenekleri, adedi, KDV dahil satış fiyatı ve toplam tutar sipariş özetinde ve siparişe özel sözleşme sayfasında yer alır. Teslimat ücreti alınmaz. Ödeme teslimatta kapıda nakit veya kart ile yapılır.",
        ],
      },
      {
        heading: "4. Teslimat",
        paragraphs: [
          `Ürünler, ALICI'nın belirttiği ve restorana en fazla ${MAX_DELIVERY_KM} km mesafedeki adrese SATICI'nın kuryesi tarafından teslim edilir. Tahmini teslim süresi sipariş sırasında ve sipariş onaylandığında bildirilir; yoğunluk, hava ve trafik koşullarına göre değişebilir. Teslimat, yasal 30 günlük süreyi hiçbir durumda aşmaz.`,
        ],
      },
      {
        heading: "5. ALICI'nın yükümlülükleri",
        list: [
          "Ad, telefon ve teslimat adresini doğru ve eksiksiz vermek.",
          "Teslimat sırasında adreste bulunmak veya teslim alacak bir kişi bulundurmak; kurye ulaşamazsa telefonla ulaşılabilir olmak.",
          "Sipariş bedelini teslimatta ödemek.",
        ],
      },
      {
        heading: "6. SATICI'nın yükümlülükleri",
        list: [
          "Ürünleri sipariş edilen seçeneklere uygun, hijyen kurallarına uygun ve taze olarak hazırlamak ve teslim etmek.",
          "Siparişin hazırlanamaması veya teslim edilememesi halinde ALICI'yı derhal bilgilendirip siparişi iptal etmek; kapıda ödeme nedeniyle herhangi bir bedel tahsil etmemek.",
          "Eksik, yanlış veya ayıplı ürünlerde ALICI'nın yasal haklarını yerine getirmek.",
        ],
      },
      { heading: "7. Cayma hakkı", paragraphs: [CAYMA_ISTISNA] },
      {
        heading: "8. İptal",
        paragraphs: [
          "ALICI, siparişi hazırlanmaya başlanmadan önce SATICI'yı arayarak ücretsiz iptal edebilir. Ürünler ALICI'nın isteğine göre hazırlanmaya başladıktan sonra yapılan iptal talepleri kabul edilmeyebilir. SATICI; teslimat alanı dışındaki adresler, ürünün tükenmesi, ALICI'ya ulaşılamaması veya mücbir sebepler halinde siparişi gerekçesini bildirerek iptal edebilir.",
        ],
      },
      {
        heading: "9. Ayıplı ifa",
        paragraphs: [
          "Teslim edilen üründe ayıp, eksiklik veya yanlışlık bulunması halinde ALICI, 6502 sayılı Kanun'un 11. maddesi uyarınca ürünün ayıpsız misliyle değiştirilmesini, ayıp oranında bedel indirimini veya sözleşmeden dönülerek bedelin iadesini talep edebilir. ALICI'nın durumu teslimattan sonra en kısa sürede SATICI'ya bildirmesi beklenir.",
        ],
      },
      { heading: "10. Uyuşmazlıklar", paragraphs: [SIKAYET] },
      {
        heading: "11. Yürürlük",
        paragraphs: [
          "ALICI, Ön Bilgilendirme Formu'nu ve bu sözleşmeyi okuyup onayladığını sipariş ekranındaki onay kutusu ile kabul eder. Sözleşme, siparişin onaylanması ile kurulur ve SATICI tarafından saklanır.",
        ],
      },
    ],
  };
}

export function gizlilik(): LegalDoc {
  return {
    slug: "gizlilik",
    title: "KVKK Aydınlatma Metni ve Gizlilik Politikası",
    summary: "Kişisel verilerinizin hangi amaçlarla, hangi hukuki sebeplerle işlendiği ve haklarınız.",
    sections: [
      {
        heading: "Veri sorumlusu",
        paragraphs: [
          `6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu ${sellerDisplayName()} (${BUSINESS.tradeName})'dir. Adres: ${BUSINESS.address}.`,
        ],
      },
      {
        heading: "İşlenen kişisel veriler",
        list: [
          "Kimlik ve iletişim: ad soyad, cep telefonu; üye olursanız e-posta adresi.",
          "Teslimat: adres ve sipariş notu.",
          "Müşteri işlem: sipariş içeriği, tutarı, ödeme yöntemi, para üstü tutarı, çatal-bıçak tercihi, sipariş zamanı ve durumu.",
          "İşlem güvenliği: oturum bilgileri, şifrenizin geri döndürülemez özeti (şifrenizi göremeyiz), uygulamada bildirim izni verirseniz cihaz bildirim anahtarı.",
          "Pazarlama ve analiz: yalnızca çerez onayı verirseniz, site kullanımına dair Google Analytics istatistikleri.",
        ],
      },
      {
        heading: "Amaçlar ve hukuki sebepler",
        list: [
          "Siparişinizi almak, hazırlamak, teslim etmek ve sizinle iletişim kurmak — sözleşmenin kurulması ve ifası (KVKK m.5/2-c).",
          "Sipariş durumunu ve tahmini teslim saatini bildirmek — sözleşmenin ifası ve meşru menfaat (m.5/2-c, f).",
          "Fatura, muhasebe ve yasal saklama yükümlülükleri — hukuki yükümlülük (m.5/2-ç).",
          "Hesabınızı yönetmek, sahte siparişleri ve kötüye kullanımı önlemek — meşru menfaat (m.5/2-f).",
          "Uyuşmazlıklarda hakların tesisi ve korunması — m.5/2-e.",
          "Site kullanım istatistikleri (Google Analytics) — açık rızanız (m.5/1); çerez tercihlerinden istediğiniz zaman geri alabilirsiniz.",
        ],
      },
      {
        heading: "Toplama yöntemi",
        paragraphs: [
          "Veriler; internet sitemiz ve mobil uygulamamızdaki sipariş, üyelik ve profil formları ile çerezler aracılığıyla elektronik ortamda toplanır.",
        ],
      },
      {
        heading: "Aktarım",
        paragraphs: [
          "Verileriniz yalnızca hizmetin yürütülmesi için gerekli olduğu ölçüde, altyapı hizmeti aldığımız tedarikçilere aktarılır: barındırma (Vercel Inc.), veritabanı ve kimlik doğrulama (Supabase Inc.), uygulama bildirimleri (Expo / 650 Industries Inc.), adres doğrulama (OpenStreetMap Nominatim ve Photon) onay vermeniz halinde Google Analytics ve konum haritasını görüntülemeyi seçmeniz halinde Google Haritalar (Google LLC). Bu hizmetlerin sunucuları yurt dışında (ABD ve AB) bulunduğundan veriler KVKK m.9 kapsamında, Kanun'da öngörülen uygun güvenceler çerçevesinde yurt dışına aktarılmaktadır.",
          "Kanunen yetkili kamu kurum ve kuruluşlarına talep halinde ve mevzuatın gerektirdiği ölçüde aktarım yapılabilir. Verileriniz satılmaz ve reklam amacıyla üçüncü kişilerle paylaşılmaz.",
        ],
      },
      {
        heading: "Saklama süreleri",
        list: [
          "Sipariş ve muhasebe kayıtları: Türk Ticaret Kanunu ve Vergi Usul Kanunu'nda öngörülen süreler boyunca (10 yıla kadar).",
          "Üyelik bilgileri ve kayıtlı adresler: hesabınız açık olduğu sürece; hesabınızı sildiğinizde silinir (siparişler hesapla bağlantısı kaldırılarak yasal süre boyunca saklanır).",
          "Bildirim anahtarları: çıkış yaptığınızda veya hesabınızı sildiğinizde silinir.",
          "Analiz verileri: Google Analytics'te en fazla 14 ay.",
        ],
      },
      {
        heading: "Haklarınız (KVKK m.11)",
        list: [
          "Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse bilgi talep etme,",
          "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,",
          "Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,",
          "Eksik veya yanlış işlenmişse düzeltilmesini, şartları oluşmuşsa silinmesini veya yok edilmesini ve bu işlemlerin aktarılan kişilere bildirilmesini isteme,",
          "Münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuca itiraz etme,",
          "Kanuna aykırı işleme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme.",
        ],
      },
      {
        heading: "Başvuru",
        paragraphs: [
          `Başvurularınızı, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ'e uygun olarak yazılı şekilde ${BUSINESS.address} adresine${BUSINESS.kep ? `, KEP adresimize (${BUSINESS.kep})` : ""}${BUSINESS.email ? ` veya sistemimizde kayıtlı e-posta adresinizden ${BUSINESS.email} adresine` : ""} iletebilirsiniz. Başvurunuz en geç 30 gün içinde ücretsiz olarak sonuçlandırılır.`,
          "Hesabınızı ve hesabınıza bağlı kişisel verilerinizi istediğiniz zaman Hesabım → Profil sayfasından veya mobil uygulamada Hesabım → Hesabımı sil adımıyla kendiniz silebilirsiniz.",
        ],
      },
    ],
  };
}

export function cerezPolitikasi(): LegalDoc {
  return {
    slug: "cerez-politikasi",
    title: "Çerez Politikası",
    summary: "Sitemizde kullanılan çerezler, amaçları ve tercihlerinizi nasıl değiştirebileceğiniz.",
    sections: [
      {
        heading: "Çerez nedir?",
        paragraphs: [
          "Çerezler, ziyaret ettiğiniz sitenin tarayıcınıza kaydettiği küçük metin dosyalarıdır. Benzer amaçla tarayıcının yerel depolama alanı (localStorage) da kullanılabilir.",
        ],
      },
      {
        heading: "Zorunlu çerezler (onay gerekmez)",
        list: [
          "Oturum çerezleri (sb-…): giriş yaptığınızda oturumunuzu güvenli şekilde açık tutar. Hukuki sebep: sözleşmenin ifası ve meşru menfaat.",
          "Sepet ve tercih kayıtları (yerel depolama): sepetinizdeki ürünleri ve çerez tercihinizi hatırlar.",
        ],
      },
      {
        heading: "Analiz çerezleri (yalnızca onayınızla)",
        list: [
          "Google Analytics (_ga, _ga_…): sitenin nasıl kullanıldığını anonim istatistiklerle anlamamıza yardımcı olur. Sağlayıcı: Google LLC (ABD). Saklama: en fazla 14 ay.",
        ],
        paragraphs: [
          "Analiz çerezleri, “Kabul et” seçeneğini işaretlemediğiniz sürece yüklenmez. Reklam veya yeniden hedefleme çerezi kullanmıyoruz.",
        ],
      },
      {
        heading: "Üçüncü taraf içerik: Google Haritalar",
        paragraphs: [
          "Ana sayfadaki konum haritası Google LLC tarafından sağlanır. Harita, siz “Haritayı göster” düğmesine basmadan yüklenmez; yüklendiğinde Google kendi çerezlerini yerleştirebilir ve IP adresiniz gibi verileri kendi gizlilik politikasına göre işleyebilir. “Her zaman göster” seçeneğinde bu tercih tarayıcınızda saklanır; tarayıcı verilerini silerek geri alabilirsiniz.",
        ],
      },
      {
        heading: "Tercihlerinizi değiştirme",
        paragraphs: [
          "Sayfanın en altındaki “Çerez tercihleri” bağlantısından onayınızı istediğiniz zaman verebilir veya geri alabilirsiniz. Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz; zorunlu çerezleri engellemeniz halinde giriş ve sepet çalışmayabilir.",
          "Kişisel verilerinizle ilgili ayrıntılar için KVKK Aydınlatma Metni'ne bakabilirsiniz.",
        ],
      },
    ],
  };
}

export function kullanimKosullari(): LegalDoc {
  return {
    slug: "kullanim-kosullari",
    title: "Kullanım Koşulları",
    summary: "İnternet sitesi, mobil uygulama ve üyelik kullanım şartları.",
    sections: [
      sellerSection(),
      {
        heading: "Hizmet",
        paragraphs: [
          `${BUSINESS.tradeName} internet sitesi ve mobil uygulaması; menüyü incelemenizi, paket sipariş vermenizi, siparişinizi takip etmenizi ve üye olarak adres ve sipariş geçmişinizi yönetmenizi sağlar. Paket siparişler ayrıca Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi'ne tabidir.`,
        ],
      },
      {
        heading: "Üyelik ve hesap güvenliği",
        list: [
          "Üyelik ücretsizdir; doğru ve güncel bilgi vermeniz gerekir.",
          "Şifrenizin gizliliğinden siz sorumlusunuz; hesabınızda yetkisiz bir kullanım fark ederseniz şifrenizi değiştirip bize bildirin.",
          "Hesabınızı istediğiniz zaman uygulama veya site üzerinden silebilirsiniz.",
        ],
      },
      {
        heading: "Yasak kullanımlar",
        list: [
          "Sahte, şaka amaçlı veya başkası adına izinsiz sipariş vermek,",
          "Sistemlerin işleyişini bozmaya, yetkisiz erişim sağlamaya veya verileri toplu olarak çekmeye çalışmak,",
          "Personelimize veya kuryelerimize karşı hakaret ve taciz içeren kullanımlar.",
        ],
        paragraphs: ["Bu durumlarda siparişler iptal edilebilir ve hesap kapatılabilir."],
      },
      {
        heading: "Menü, fiyat ve görseller",
        paragraphs: [
          "Menü ve fiyatlar önceden bildirimde bulunmaksızın değiştirilebilir; siparişiniz onayladığınız andaki fiyattan hesaplanır. Ürün görselleri temsilidir, sunum farklılık gösterebilir.",
        ],
      },
      {
        heading: "Fikri mülkiyet",
        paragraphs: [`Sitedeki ve uygulamadaki logo, marka, metin ve görsellerin hakları ${BUSINESS.tradeName}'ya aittir; izinsiz kullanılamaz.`],
      },
      {
        heading: "Sorumluluk",
        paragraphs: [
          "Hizmeti kesintisiz sunmaya çalışırız; ancak bakım, altyapı arızası veya mücbir sebeplerle oluşan kesintilerden dolayı, mevzuatın izin verdiği ölçüde sorumluluk kabul edilmez. Tüketici mevzuatından doğan haklarınız saklıdır.",
        ],
      },
      {
        heading: "Değişiklikler ve uygulanacak hukuk",
        paragraphs: [
          "Bu koşullar güncellenebilir; güncel sürüm her zaman bu sayfada yayımlanır. Türkiye Cumhuriyeti hukuku uygulanır.",
        ],
      },
    ],
  };
}

export function iptalIade(): LegalDoc {
  return {
    slug: "iptal-ve-iade",
    title: "İptal ve İade Koşulları",
    summary: "Siparişinizi nasıl iptal edebileceğiniz ve eksik, yanlış veya ayıplı ürünlerde haklarınız.",
    sections: [
      {
        heading: "Siparişi iptal etme",
        paragraphs: [
          `Siparişinizi, hazırlanmaya başlanmadan önce ${BUSINESS.phone ? `${BUSINESS.phone} numaralı telefondan` : "bizi arayarak"} ücretsiz iptal edebilirsiniz. Ödeme kapıda yapıldığı için iptalde herhangi bir ücret alınmaz. Siparişiniz hazırlanmaya başladıktan sonra, ürünler isteğinize göre hazırlandığından iptal talebi kabul edilmeyebilir.`,
        ],
      },
      { heading: "Cayma hakkı", paragraphs: [CAYMA_ISTISNA] },
      {
        heading: "Restoranın iptal etmesi",
        paragraphs: [
          "Adresin teslimat alanımız dışında olması, ürünün tükenmesi, size ulaşılamaması veya yoğunluk gibi nedenlerle siparişinizi iptal etmemiz gerekirse nedenini sipariş takip ekranında ve (uygulamada) bildirimle görürsünüz. Bu durumda sizden ücret alınmaz.",
        ],
      },
      {
        heading: "Eksik, yanlış veya ayıplı ürün",
        list: [
          "Teslimattan sonra en kısa sürede bizi arayın; mümkünse ürünün fotoğrafını paylaşın.",
          "Eksik veya yanlış ürünü yeniden göndeririz ya da ödediğiniz bedeli iade ederiz.",
          "Ayıplı (bozuk, soğuk, hijyene aykırı vb.) üründe 6502 sayılı Kanun'un 11. maddesindeki seçimlik haklarınızı (yenisiyle değiştirme, bedel indirimi, bedel iadesi) kullanabilirsiniz.",
          "Nakit ödemelerde iade nakit olarak, kartla ödemelerde ödeme yapılan karta yapılır.",
        ],
      },
      { heading: "Şikâyet", paragraphs: [SIKAYET] },
    ],
  };
}

export function teslimat(): LegalDoc {
  return {
    slug: "teslimat-kosullari",
    title: "Teslimat ve Sipariş Koşulları",
    summary: "Teslimat alanı, minimum tutar, süre, ödeme ve alerjen bilgileri.",
    sections: [
      {
        heading: "Teslimat alanı ve tutar",
        list: [
          `Restoranımıza en fazla ${MAX_DELIVERY_KM} km mesafedeki adreslere teslimat yapıyoruz; adresiniz sipariş sırasında haritada kontrol edilir.`,
          `Minimum sipariş tutarı ${tl(MIN_ORDER_TOTAL_TL)}'dir. Teslimat ücreti alınmaz.`,
        ],
      },
      {
        heading: "Sipariş saatleri ve süre",
        list: [
          "Paket siparişler, sipariş sayfasında gösterilen çalışma saatleri içinde ve kapanıştan kısa bir süre öncesine kadar alınır.",
          "Tahmini teslim süresi sipariş sayfasında; siparişiniz onaylandığında size özel tahmini teslim saati takip ekranında gösterilir.",
          "Yoğunluk durumlarında online sipariş geçici olarak durdurulabilir; bu durumda telefonla sipariş verebilirsiniz.",
        ],
      },
      {
        heading: "Teslim alma",
        list: [
          "Siparişiniz kendi kuryemiz tarafından teslim edilir.",
          "Kuryemiz adresi bulamazsa veya size ulaşamazsa siparişte yazdığınız telefonu arar; ulaşılamaması halinde sipariş iptal edilebilir.",
          "Ödemeyi teslimatta nakit veya kart ile yapabilirsiniz. Nakitte para üstü için ödeyeceğiniz tutarı siparişte belirtebilirsiniz.",
          "Çevreyi korumak için plastik çatal-bıçak ve peçete yalnızca istediğinizde gönderilir.",
        ],
      },
      {
        heading: "Alerjen bilgisi",
        paragraphs: [
          "Ürünlerimiz gluten (buğday), süt ürünleri, yumurta, susam ve kuruyemiş gibi alerjenler içerebilir veya bunlarla aynı mutfakta hazırlanabilir. Alerjiniz varsa sipariş notuna yazmanızı ve bizi aramanızı rica ederiz; ürün içerikleri hakkında bilgi veririz.",
        ],
      },
    ],
  };
}

export function erisilebilirlik(): LegalDoc {
  return {
    slug: "erisilebilirlik",
    title: "Erişilebilirlik Beyanı",
    summary: "Sitemizi ve uygulamamızı herkesin kullanabilmesi için yaptıklarımız.",
    sections: [
      {
        heading: "Taahhüdümüz",
        paragraphs: [
          "Sitemizin ve mobil uygulamamızın engelli kullanıcılar dahil herkes tarafından kullanılabilmesini amaçlıyoruz ve WCAG 2.1 AA ilkelerini esas alıyoruz.",
        ],
      },
      {
        heading: "Yaptıklarımız",
        list: [
          "Klavye ile gezinme ve “içeriğe atla” bağlantısı,",
          "Ekran okuyucular için anlamlı başlıklar, form etiketleri ve durum duyuruları,",
          "Koyu tema üzerinde yüksek kontrastlı metinler ve en az 44 piksellik dokunma alanları,",
          "Telefon, tablet ve bilgisayarda uyumlu yerleşim.",
        ],
      },
      {
        heading: "Bize ulaşın",
        paragraphs: [
          `Sitemizi kullanırken bir engelle karşılaşırsanız lütfen bize bildirin (${contactSentence()}). Siparişinizi telefonla da verebilirsiniz.`,
        ],
      },
    ],
  };
}

export const LEGAL_DOCS: { slug: string; get: () => LegalDoc }[] = [
  { slug: "on-bilgilendirme", get: onBilgilendirme },
  { slug: "mesafeli-satis-sozlesmesi", get: mesafeliSatis },
  { slug: "iptal-ve-iade", get: iptalIade },
  { slug: "teslimat-kosullari", get: teslimat },
  { slug: "gizlilik", get: gizlilik },
  { slug: "cerez-politikasi", get: cerezPolitikasi },
  { slug: "kullanim-kosullari", get: kullanimKosullari },
  { slug: "erisilebilirlik", get: erisilebilirlik },
];

export { LEGAL_UPDATED_LABEL };
