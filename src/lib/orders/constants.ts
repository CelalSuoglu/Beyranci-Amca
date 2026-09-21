/** Minimum paket sipariş tutarı (TL) */
export const MIN_ORDER_TOTAL_TL = 1250;

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

export const PAYMENT_METHODS = ["cash", "card"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

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
};

/** Mutfak panelinde durum geçiş butonları */
export const STATUS_TRANSITIONS: Partial<
  Record<OrderStatus, readonly OrderStatus[]>
> = {
  new: ["accepted", "preparing", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["out_for_delivery", "completed", "cancelled"],
  out_for_delivery: ["completed", "cancelled"],
};
