/** Web projesindeki src/lib/orders/* ile birebir aynı kurallar */

/** Minimum paket sipariş tutarı (TL) — sunucu da ayrıca kontrol eder */
export const MIN_ORDER_TOTAL_TL = 1250;
export const MAX_DELIVERY_KM = 15;

export const ORDER_STATUSES = [
  "new",
  "accepted",
  "preparing",
  "ready",
  "out_for_delivery",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentMethod = "cash" | "card" | "online";
export type SpiceLevel = "acili" | "az_acili" | "acisiz";
export type GarlicLevel = "az_sarimsakli" | "bol_sarimsakli";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Yeni",
  accepted: "Kabul edildi",
  preparing: "Hazırlanıyor",
  ready: "Hazır",
  out_for_delivery: "Yolda",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Kapıda nakit",
  card: "Kapıda kart",
  online: "Online ödeme",
};

export const SPICE_LEVEL_LABELS: Record<SpiceLevel, string> = {
  acili: "Acılı",
  az_acili: "Az acılı",
  acisiz: "Acısız",
};

export const GARLIC_LEVEL_LABELS: Record<GarlicLevel, string> = {
  az_sarimsakli: "Az sarımsaklı",
  bol_sarimsakli: "Bol sarımsaklı",
};

export const STATUS_TRANSITIONS: Partial<
  Record<OrderStatus, readonly OrderStatus[]>
> = {
  new: ["accepted", "preparing", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["out_for_delivery", "completed", "cancelled"],
  out_for_delivery: ["completed", "cancelled"],
};

export type OrderItemRecord = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  spiceLevel?: SpiceLevel | null;
  garlicLevel?: GarlicLevel | null;
};

export type OrderRecord = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  note: string | null;
  payment_method: PaymentMethod;
  items: OrderItemRecord[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};

export function normalizeOrder(row: Record<string, unknown>): OrderRecord {
  return {
    id: String(row.id),
    order_number: String(row.order_number),
    customer_name: String(row.customer_name),
    phone: String(row.phone),
    address: String(row.address),
    note: (row.note as string | null) ?? null,
    payment_method: row.payment_method as PaymentMethod,
    items: Array.isArray(row.items) ? (row.items as OrderItemRecord[]) : [],
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    status: row.status as OrderStatus,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function formatModifiers(item: OrderItemRecord): string | null {
  const parts: string[] = [];
  if (item.spiceLevel) parts.push(SPICE_LEVEL_LABELS[item.spiceLevel]);
  if (item.garlicLevel) parts.push(GARLIC_LEVEL_LABELS[item.garlicLevel]);
  return parts.length ? parts.join(", ") : null;
}

/* Biçimlendirme — telefonlarda Intl desteği değişken olduğu için elle yapılıyor */

/** 1250.5 → "₺1.250,50" */
export function formatTry(amount: number): string {
  const fixed = (Number.isFinite(amount) ? amount : 0).toFixed(2);
  const [intPart, dec] = fixed.split(".");
  const negative = intPart.startsWith("-");
  const digits = negative ? intPart.slice(1) : intPart;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negative ? "-" : ""}₺${grouped},${dec}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Türkiye saati (UTC+3, yaz saati yok) → "26.10.2026 00:17" */
export function formatOrderTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const tr = new Date(d.getTime() + 3 * 60 * 60 * 1000);
  return `${pad(tr.getUTCDate())}.${pad(tr.getUTCMonth() + 1)}.${tr.getUTCFullYear()} ${pad(tr.getUTCHours())}:${pad(tr.getUTCMinutes())}`;
}

/** Siparişin üzerinden geçen süre: "3 dk", "1 sa 12 dk" */
export function formatElapsed(iso: string, now: number): string {
  const mins = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} dk`;
  const h = Math.floor(mins / 60);
  if (h >= 24) return `${Math.floor(h / 24)} gün`;
  return `${h} sa ${mins % 60} dk`;
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  }
  return phone;
}

export function phoneTelUrl(phone: string): string {
  return `tel:+90${phone.replace(/\D/g, "").replace(/^0/, "")}`;
}

/** Türkiye cep telefonunu normalize eder; geçersizse null */
export function normalizeTurkishPhone(input: string): string | null {
  let national = input.replace(/\D/g, "");
  if (national.startsWith("90") && national.length === 12) national = national.slice(2);
  if (national.startsWith("0") && national.length === 11) national = national.slice(1);
  if (!/^5\d{9}$/.test(national)) return null;
  return `0${national}`;
}

export const CUSTOMER_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "new", label: "Sipariş alındı" },
  { status: "accepted", label: "Onaylandı" },
  { status: "preparing", label: "Hazırlanıyor" },
  { status: "ready", label: "Hazır" },
  { status: "out_for_delivery", label: "Yolda" },
  { status: "completed", label: "Teslim edildi" },
];
