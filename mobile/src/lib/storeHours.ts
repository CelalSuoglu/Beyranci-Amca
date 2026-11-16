// Web projesindeki src/lib/store/hours.ts ile aynı (kopya). Değiştirirsen ikisini birden güncelle.
/**
 * Paket sipariş açık mı? — çalışma saatleri + "siparişleri durdur" + son sipariş payı.
 * Saf fonksiyonlar: sunucu, tarayıcı ve mobil uygulama aynı mantığı kullanır.
 * Saat dilimi: Türkiye (UTC+3, yaz saati yok).
 */

export type DayHours = { open: string; close: string; closed: boolean };

export type StoreSettings = {
  orders_enabled: boolean;
  pause_message: string | null;
  announcement: string | null;
  eta_min: number;
  eta_max: number;
  last_order_minutes: number;
  /** 0 = Pazartesi … 6 = Pazar */
  opening_hours: DayHours[];
};

export type StoreStatus = {
  /** Şu an sipariş verilebilir mi */
  open: boolean;
  /** Kapalıysa neden */
  reason: "paused" | "hours" | null;
  /** Müşteriye gösterilecek tek cümle */
  message: string;
  /** Açıkken: son sipariş saati ("00:30") */
  lastOrderAt: string | null;
  /** Kapalıyken: bir sonraki açılış ("Bugün 08:30", "Yarın 08:30", "Pazartesi 08:30") */
  nextOpenLabel: string | null;
};

export const DAY_NAMES = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"] as const;

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  orders_enabled: true,
  pause_message: null,
  announcement: null,
  eta_min: 35,
  eta_max: 50,
  last_order_minutes: 30,
  opening_hours: Array.from({ length: 7 }, () => ({ open: "08:30", close: "00:00", closed: false })),
};

const DAY = 1440;
const WEEK = 7 * DAY;
const TR_OFFSET_MIN = 180;

function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 24 || min > 59 || (h === 24 && min > 0)) return null;
  return h * 60 + min;
}

function fmt(minuteOfDay: number): string {
  const m = ((minuteOfDay % DAY) + DAY) % DAY;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Türkiye saatine göre haftanın dakikası (Pazartesi 00:00 = 0) */
export function weekMinuteTR(now: Date): number {
  const t = new Date(now.getTime() + TR_OFFSET_MIN * 60000);
  const mondayIndex = (t.getUTCDay() + 6) % 7;
  return mondayIndex * DAY + t.getUTCHours() * 60 + t.getUTCMinutes();
}

type Window = { start: number; end: number; lastOrder: number };

/** Haftalık sipariş pencereleri (gece yarısını geçenler ertesi güne taşar) */
export function orderWindows(settings: Pick<StoreSettings, "opening_hours" | "last_order_minutes">): Window[] {
  const out: Window[] = [];
  settings.opening_hours.slice(0, 7).forEach((d, i) => {
    if (!d || d.closed) return;
    const o = toMinutes(d.open);
    const c = toMinutes(d.close);
    if (o === null || c === null) return;
    const start = i * DAY + o;
    const end = i * DAY + (c <= o ? c + DAY : c);
    const lastOrder = Math.max(start, end - Math.max(0, settings.last_order_minutes));
    out.push({ start, end, lastOrder });
  });
  return out;
}

export function getStoreStatus(settings: StoreSettings, now: Date = new Date()): StoreStatus {
  const wm = weekMinuteTR(now);
  const windows = orderWindows(settings);

  // Şu an açık bir pencere var mı? (haftanın sonundan taşan Pazar gecesi için -WEEK kaydırması)
  let current: Window | null = null;
  for (const w of windows) {
    for (const shift of [0, -WEEK, WEEK]) {
      if (wm >= w.start + shift && wm < w.lastOrder + shift) {
        current = { start: w.start + shift, end: w.end + shift, lastOrder: w.lastOrder + shift };
      }
    }
  }

  const nextOpen = (): string | null => {
    let best: number | null = null;
    for (const w of windows) {
      for (const shift of [0, WEEK]) {
        const s = w.start + shift;
        if (s > wm && (best === null || s < best)) best = s;
      }
    }
    if (best === null) return null;
    const todayStart = wm - (wm % DAY);
    const dayDiff = Math.floor((best - todayStart) / DAY);
    const label = dayDiff === 0 ? "Bugün" : dayDiff === 1 ? "Yarın" : DAY_NAMES[Math.floor(best / DAY) % 7];
    return `${label} ${fmt(best)}`;
  };

  if (!settings.orders_enabled) {
    return {
      open: false,
      reason: "paused",
      message:
        settings.pause_message?.trim() ||
        "Şu anda yoğunluk nedeniyle online sipariş alamıyoruz. Lütfen biraz sonra tekrar deneyin veya bizi arayın.",
      lastOrderAt: null,
      nextOpenLabel: null,
    };
  }

  if (current) {
    return {
      open: true,
      reason: null,
      message: `Siparişler açık · Son sipariş ${fmt(current.lastOrder)}`,
      lastOrderAt: fmt(current.lastOrder),
      nextOpenLabel: null,
    };
  }

  const next = nextOpen();
  return {
    open: false,
    reason: "hours",
    message: next
      ? `Şu an paket sipariş saatlerimiz dışındayız. ${next}'da tekrar sipariş alıyoruz.`
      : "Şu an paket sipariş alamıyoruz.",
    lastOrderAt: null,
    nextOpenLabel: next,
  };
}

/** Veritabanından gelen satırı güvenli ayarlara çevirir */
export function normalizeStoreSettings(row: Record<string, unknown> | null | undefined): StoreSettings {
  if (!row) return DEFAULT_STORE_SETTINGS;
  const hours = Array.isArray(row.opening_hours) ? (row.opening_hours as DayHours[]) : DEFAULT_STORE_SETTINGS.opening_hours;
  return {
    orders_enabled: row.orders_enabled !== false,
    pause_message: (row.pause_message as string | null) ?? null,
    announcement: (row.announcement as string | null) ?? null,
    eta_min: Number(row.eta_min ?? 35),
    eta_max: Number(row.eta_max ?? 50),
    last_order_minutes: Number(row.last_order_minutes ?? 30),
    opening_hours: hours.length === 7 ? hours : DEFAULT_STORE_SETTINGS.opening_hours,
  };
}

export function isValidHHMM(v: string): boolean {
  return toMinutes(v) !== null;
}
