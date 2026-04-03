/**
 * İşletme bilgileri — yalnızca doğrulanmış verileri girin.
 * Telefon, WhatsApp veya çalışma saati yoksa ilgili alanı `null` bırakın;
 * arayüz `sitePlaceholders` metinlerini gösterir.
 */
export type HoursRow = {
  day: string;
  hours: string;
};

export type SiteConfig = {
  name: string;
  tagline: string;
  description: string;
  address: string;
  phoneDisplay: string | null;
  phoneTel: string | null;
  whatsapp: string | null;
  instagramUrl: string;
  instagramHandle: string;
  googleBusinessName: string;
  hours: {
    label: string;
    /** Gün + 24 saat formatında aralık; boşsa yer tutucu gösterilir */
    weekly: readonly HoursRow[] | null;
  };
  googleMapsOpenUrl: string;
  mapsEmbedSrc: string;
};

export { sitePlaceholders } from "./site-placeholders";

export const site: SiteConfig = {
  name: "Beyrancı Amca",
  tagline: "Geleneksel Beyran ve Anadolu lezzetleri",
  description:
    "Antalya Döşemealtı’nda ateşten gelen otantik Beyran deneyimi. Zengin çorba, seçkin et ve sıcak misafirperverlik.",
  address:
    "Yeşilbayır, Atatürk Cd. No:72, 07190 Döşemealtı/Antalya, Türkiye",
  /** Görünen numara (UI); tel: için `phoneTel` kullanılır */
  phoneDisplay: "0534 060 07 07",
  /** uluslararası biçim — tel: ve WhatsApp (wa.me) bağlantıları için */
  phoneTel: "+905340600707",
  /** WhatsApp sohbet: `wa.me/` sonrası ülke kodu (90) + 10 hane, boşluksuz */
  whatsapp: "https://wa.me/905340600707",
  instagramUrl:
    "https://www.instagram.com/beyranciamca?igsh=YnZhc3dhbXhrZW1j",
  instagramHandle: "@beyranciamca",
  googleBusinessName: "Beyrancı Amca",
  hours: {
    label: "Çalışma saatleri",
    weekly: [
      { day: "Pazartesi", hours: "08:30 – 01:00" },
      { day: "Salı", hours: "08:30 – 01:00" },
      { day: "Çarşamba", hours: "08:30 – 01:00" },
      { day: "Perşembe", hours: "08:30 – 01:00" },
      { day: "Cuma", hours: "08:30 – 01:00" },
      { day: "Cumartesi", hours: "08:30 – 01:00" },
      { day: "Pazar", hours: "08:30 – 01:00" },
    ],
  },
  googleMapsOpenUrl:
    "https://www.google.com/maps/search/?api=1&query=Ye%C5%9Filbay%C4%B1r%2C%20Atat%C3%BCrk%20Cd.%20No%3A72%2C%2007190%20D%C3%B6%C5%9Femealt%C4%B1%2FAntalya%2C%20T%C3%BCrkiye",
  mapsEmbedSrc:
    "https://www.google.com/maps?q=Ye%C5%9Filbay%C4%B1r%2C%20Atat%C3%BCrk%20Cd.%20No%3A72%2C%2007190%20D%C3%B6%C5%9Femealt%C4%B1%2FAntalya%2C%20T%C3%BCrkiye&output=embed",
};

/** Navbar + footer hızlı linkler */
export const navItems = [
  { href: "#hero", label: "Ana Sayfa" },
  { href: "#about", label: "Hakkımızda" },
  { href: "#menu", label: "Menü" },
  { href: "#campaign", label: "Kampanyalar" },
  { href: "#gallery", label: "Galeri" },
  { href: "#contact", label: "İletişim" },
] as const;
