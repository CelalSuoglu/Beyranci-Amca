import { site } from "@/lib/site";

/**
 * Satıcı (işletme) bilgileri — 6563 sayılı E-Ticaret Kanunu, Mesafeli Sözleşmeler Yönetmeliği
 * ve KVKK gereği alt bilgide, yasal sayfalarda ve sözleşmelerde gösterilir.
 *
 * !!! Boş alanları vergi levhasındaki bilgilerle doldurun. Boş alanlar sitede gösterilmez,
 * ancak yasal olarak unvan, vergi/MERSİS numarası ve e-posta bulunması gerekir.
 */
export const BUSINESS = {
  /** Marka adı */
  tradeName: site.name,
  /** Vergi levhasındaki unvan (şahıs işletmesinde ad soyad + işletme adı). Örn. "Ahmet Yılmaz - Beyrancı Amca" */
  legalName: "",
  taxOffice: "",
  taxNumber: "",
  /** Şirketse MERSİS numarası (şahıs işletmesinde boş bırakılabilir) */
  mersisNo: "",
  address: site.address,
  phone: site.phoneDisplay ?? "",
  /** Müşteri ve KVKK başvuruları için e-posta */
  email: "",
  /** Varsa KEP adresi (KVKK başvuruları için) */
  kep: "",
} as const;

/** Yasal metinlerin sürümü — değiştirdiğinizde güncelleyin (siparişlere kaydedilir) */
export const LEGAL_VERSION = "2026-11-16";
export const LEGAL_UPDATED_LABEL = "16 Kasım 2026";

export function sellerDisplayName(): string {
  return BUSINESS.legalName || BUSINESS.tradeName;
}

/** Doldurulmuş satıcı bilgisi satırları */
export function sellerLines(): { label: string; value: string }[] {
  const rows: [string, string][] = [
    ["Unvan", sellerDisplayName()],
    ["Marka", BUSINESS.legalName ? BUSINESS.tradeName : ""],
    ["Adres", BUSINESS.address],
    ["Telefon", BUSINESS.phone],
    ["E-posta", BUSINESS.email],
    ["KEP", BUSINESS.kep],
    ["Vergi dairesi / No", BUSINESS.taxOffice && BUSINESS.taxNumber ? `${BUSINESS.taxOffice} / ${BUSINESS.taxNumber}` : ""],
    ["MERSİS No", BUSINESS.mersisNo],
  ];
  return rows.filter(([, v]) => v).map(([label, value]) => ({ label, value }));
}

/** Eksik zorunlu bilgiler (yönetim panelinde uyarı için) */
export function missingBusinessFields(): string[] {
  const missing: string[] = [];
  if (!BUSINESS.legalName) missing.push("Unvan (vergi levhasındaki)");
  if (!BUSINESS.taxOffice || !BUSINESS.taxNumber) missing.push("Vergi dairesi ve numarası");
  if (!BUSINESS.email) missing.push("E-posta adresi");
  return missing;
}

/** Eski kodla uyumluluk (gizlilik sayfası vb.) */
export const legal = {
  entityName: sellerDisplayName(),
  lastUpdated: LEGAL_UPDATED_LABEL,
} as const;
