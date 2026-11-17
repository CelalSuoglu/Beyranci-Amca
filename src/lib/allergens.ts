/**
 * Türk Gıda Kodeksi Gıda Etiketleme ve Tüketicileri Bilgilendirme Yönetmeliği
 * Ek-1'deki 14 alerjen grubu. Kodlar veritabanında (products.allergens) saklanır.
 */
export const ALLERGENS = [
  { code: "gluten", label: "Gluten (buğday vb.)", short: "Gluten" },
  { code: "kabuklular", label: "Kabuklular (karides, yengeç vb.)", short: "Kabuklular" },
  { code: "yumurta", label: "Yumurta", short: "Yumurta" },
  { code: "balik", label: "Balık", short: "Balık" },
  { code: "yer_fistigi", label: "Yer fıstığı", short: "Yer fıstığı" },
  { code: "soya", label: "Soya", short: "Soya" },
  { code: "sut", label: "Süt ve süt ürünleri (laktoz dahil)", short: "Süt" },
  { code: "kabuklu_yemis", label: "Sert kabuklu meyveler (fındık, ceviz, antep fıstığı vb.)", short: "Kuruyemiş" },
  { code: "kereviz", label: "Kereviz", short: "Kereviz" },
  { code: "hardal", label: "Hardal", short: "Hardal" },
  { code: "susam", label: "Susam", short: "Susam" },
  { code: "sulfit", label: "Kükürt dioksit ve sülfitler", short: "Sülfit" },
  { code: "aci_bakla", label: "Acı bakla (lupin)", short: "Acı bakla" },
  { code: "yumusakcalar", label: "Yumuşakçalar (midye, kalamar vb.)", short: "Yumuşakçalar" },
] as const;

export type AllergenCode = (typeof ALLERGENS)[number]["code"];

const CODES = new Set<string>(ALLERGENS.map((a) => a.code));

export function normalizeAllergens(raw: unknown): AllergenCode[] {
  if (!Array.isArray(raw)) return [];
  const out = raw.filter((v): v is AllergenCode => typeof v === "string" && CODES.has(v));
  return ALLERGENS.map((a) => a.code).filter((c) => out.includes(c));
}

export function allergenShortLabels(codes: readonly string[] | undefined | null): string[] {
  if (!codes?.length) return [];
  return ALLERGENS.filter((a) => codes.includes(a.code)).map((a) => a.short);
}

/** Menülerde ve sipariş sayfasında gösterilen genel uyarı */
export const ALLERGEN_NOTICE =
  "Ürünlerimiz aynı mutfakta hazırlandığından listede belirtilmeyen alerjenlerle (gluten, süt, yumurta, susam, kuruyemiş vb.) temas etmiş olabilir. Alerjiniz varsa sipariş vermeden önce bizi arayın.";

/**
 * Kod tabanlı menü (veritabanı yoksa) için ürün adına göre alerjenler.
 * Yalnızca ürünün tanımı gereği kesin olanlar (hamur/lavaş/bulgur → gluten,
 * kaşar/ayran/pizza → süt). Tarif ayrıntıları mutfak tarafından yönetim
 * panelinden tamamlanmalıdır.
 */
export function codeAllergensForName(name: string): AllergenCode[] {
  const n = name.toLocaleLowerCase("tr-TR");
  const set = new Set<AllergenCode>();
  if (/dürüm|lahmacun|pide|pizza|köfte|börek/.test(n)) set.add("gluten");
  if (/kaşar|pizza|ayran/.test(n)) set.add("sut");
  return ALLERGENS.map((a) => a.code).filter((c) => set.has(c));
}
