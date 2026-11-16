"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CANCEL_REASONS,
  ETA_OPTIONS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  STATUS_TRANSITIONS,
  type OrderStatus,
} from "@/lib/orders/constants";
import {
  formatClockTR,
  formatOrderTime,
  formatPhoneDisplay,
  formatTry,
  startOfTodayTR,
} from "@/lib/orders/format";
import {
  getStoreStatus,
  normalizeStoreSettings,
  type StoreSettings,
} from "@/lib/store/hours";
import type { OrderRecord } from "@/lib/orders/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  playKitchenOrderAlert,
  subscribeKitchenAudioArmed,
  unlockKitchenAudio,
} from "@/lib/orders/kitchen-alert";

type FilterKey =
  | "active"
  | "all"
  | "new"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "active", label: "Aktif" },
  { key: "all", label: "Tümü" },
  { key: "new", label: "Yeni" },
  { key: "preparing", label: "Hazırlanıyor" },
  { key: "ready", label: "Hazır" },
  { key: "completed", label: "Tamamlandı" },
  { key: "cancelled", label: "İptal" },
];

function normalizeOrder(row: Record<string, unknown>): OrderRecord {
  return {
    id: String(row.id),
    order_number: String(row.order_number),
    customer_name: String(row.customer_name),
    phone: String(row.phone),
    address: String(row.address),
    note: (row.note as string | null) ?? null,
    payment_method: row.payment_method as OrderRecord["payment_method"],
    items: Array.isArray(row.items) ? (row.items as OrderRecord["items"]) : [],
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    status: row.status as OrderStatus,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    cash_change_for: row.cash_change_for == null ? null : Number(row.cash_change_for),
    wants_cutlery: row.wants_cutlery === true,
    eta_at: (row.eta_at as string | null) ?? null,
    cancel_reason: (row.cancel_reason as string | null) ?? null,
  };
}

const ACTIVE_STATUSES: OrderStatus[] = ["new", "accepted", "preparing", "ready", "out_for_delivery"];

function minutesSince(iso: string, now: number): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}

export function KitchenDashboard() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<
    "connecting" | "live" | "disconnected"
  >("connecting");
  const [filter, setFilter] = useState<FilterKey>("active");
  const [etaPick, setEtaPick] = useState<Record<string, number>>({});
  const [cancelOpen, setCancelOpen] = useState<string | null>(null);
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [storeBusy, setStoreBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [query, setQuery] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [audioArmed, setAudioArmed] = useState(false);
  const knownIds = useRef<Set<string>>(new Set());
  const initialLoadDone = useRef(false);

  const announceNewOrder = useCallback((order: OrderRecord) => {
    if (knownIds.current.has(order.id)) return;
    knownIds.current.add(order.id);
    setBanner(`Yeni sipariş: ${order.order_number}`);
    setHighlightIds((h) => new Set(h).add(order.id));
    void playKitchenOrderAlert().then((played) => {
      if (!played) {
        setBanner(
          `Yeni sipariş: ${order.order_number} — ses kapalı, “Ses test et”e basın`,
        );
      }
    });
    window.setTimeout(() => {
      setHighlightIds((h) => {
        const next = new Set(h);
        next.delete(order.id);
        return next;
      });
    }, 12000);
  }, []);

  const loadOrders = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (fetchError) {
        if (!opts?.silent) {
          setError("Siparişler yüklenemedi. Oturumunuzu kontrol edin.");
        }
        setLoading(false);
        return;
      }

      const list = (data ?? []).map((row) =>
        normalizeOrder(row as Record<string, unknown>),
      );

      if (initialLoadDone.current) {
        for (const order of list) {
          if (!knownIds.current.has(order.id)) {
            announceNewOrder(order);
            break;
          }
        }
      }

      knownIds.current = new Set(list.map((o) => o.id));
      setOrders(list);
      setError(null);
    } catch {
      if (!opts?.silent) {
        setError("Bağlantı kurulamadı.");
      }
    } finally {
      setLoading(false);
      initialLoadDone.current = true;
    }
  }, [announceNewOrder]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => subscribeKitchenAudioArmed(setAudioArmed), []);

  /** Bekleme süreleri için dakikada bir yenile */
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(t);
  }, []);

  /** Mağaza ayarları (sipariş açık/durduruldu) — canlı */
  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
      if (data) setStore(normalizeStoreSettings(data as Record<string, unknown>));
    };
    void load();
    const ch = supabase
      .channel("kitchen-store-settings")
      .on("postgres_changes", { event: "*", schema: "public", table: "store_settings" }, () => void load())
      .subscribe();
    const poll = window.setInterval(() => void load(), 60000);
    return () => {
      window.clearInterval(poll);
      void supabase.removeChannel(ch);
    };
  }, []);

  async function toggleOrders() {
    if (!store || storeBusy) return;
    const next = !store.orders_enabled;
    if (
      !next &&
      !window.confirm("Online siparişler durdurulsun mu? Müşteriler siz tekrar açana kadar sipariş veremez.")
    ) {
      return;
    }
    setStoreBusy(true);
    try {
      const res = await fetch("/api/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders_enabled: next }),
      });
      const body = (await res.json().catch(() => null)) as { error?: string; settings?: StoreSettings } | null;
      if (!res.ok || !body?.settings) setError(body?.error ?? "Sipariş durumu değiştirilemedi.");
      else setStore(body.settings);
    } catch {
      setError("Sipariş durumu değiştirilemedi.");
    } finally {
      setStoreBusy(false);
    }
  }

  /** Ses kilidini her etkileşimde ve sekme geri gelince yenile */
  useEffect(() => {
    const unlock = () => {
      void unlockKitchenAudio();
    };
    document.addEventListener("pointerdown", unlock);
    document.addEventListener("keydown", unlock);
    document.addEventListener("touchstart", unlock, { passive: true });
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void unlockKitchenAudio();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  /** Realtime kaçsa bile sipariş kaçmasın */
  useEffect(() => {
    const pollTimer = window.setInterval(() => {
      void loadOrders({ silent: true });
    }, 6000);
    return () => window.clearInterval(pollTimer);
  }, [loadOrders]);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null =
      null;
    let supabase: ReturnType<typeof createClient> | null = null;
    let retryTimer: number | undefined;

    async function connectRealtime() {
      try {
        supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (cancelled) return;

        if (!session) {
          setConnection("disconnected");
          setError("Oturum bulunamadı. Tekrar giriş yapın.");
          return;
        }

        setConnection("connecting");

        channel = supabase
          .channel(`kitchen-orders-${session.user.id}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "orders" },
            (payload) => {
              if (payload.eventType === "INSERT" && payload.new) {
                const order = normalizeOrder(
                  payload.new as Record<string, unknown>,
                );
                setOrders((prev) => {
                  if (prev.some((o) => o.id === order.id)) return prev;
                  return [order, ...prev];
                });

                if (
                  initialLoadDone.current &&
                  !knownIds.current.has(order.id)
                ) {
                  announceNewOrder(order);
                } else {
                  knownIds.current.add(order.id);
                }
              }

              if (payload.eventType === "UPDATE" && payload.new) {
                const order = normalizeOrder(
                  payload.new as Record<string, unknown>,
                );
                setOrders((prev) =>
                  prev.map((o) => (o.id === order.id ? order : o)),
                );
              }

              if (payload.eventType === "DELETE" && payload.old) {
                const id = String(
                  (payload.old as Record<string, unknown>).id ?? "",
                );
                if (!id) return;
                setOrders((prev) => prev.filter((o) => o.id !== id));
                knownIds.current.delete(id);
              }
            },
          )
          .subscribe((status) => {
            if (cancelled) return;
            if (status === "SUBSCRIBED") {
              setConnection("live");
              setError(null);
              return;
            }
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              setConnection("disconnected");
              retryTimer = window.setTimeout(() => {
                if (cancelled || !supabase || !channel) return;
                void supabase.removeChannel(channel);
                channel = null;
                void connectRealtime();
              }, 4000);
            }
          });
      } catch {
        if (!cancelled) {
          setConnection("disconnected");
          setError(
            "Canlı bağlantı kurulamadı. Siparişler birkaç saniyede bir yenilenecek.",
          );
        }
      }
    }

    void connectRealtime();

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      if (channel && supabase) {
        void supabase.removeChannel(channel);
      }
    };
  }, [announceNewOrder]);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 8000);
    return () => window.clearTimeout(t);
  }, [banner]);

  async function updateStatus(
    orderId: string,
    status: OrderStatus,
    extra?: { etaMinutes?: number; cancelReason?: string },
  ) {
    if (updatingId) return;
    setUpdatingId(orderId);
    setError(null);
    try {
      // Sunucu: yetki kontrolü + geçiş kuralı + müşteriye bildirim
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      const body = (await res.json().catch(() => null)) as {
        error?: string;
        etaAt?: string | null;
        cancelReason?: string | null;
      } | null;

      if (!res.ok) {
        setError(body?.error ?? "Durum güncellenemedi. Tekrar deneyin.");
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status,
                  eta_at: body?.etaAt ?? o.eta_at,
                  cancel_reason: body?.cancelReason ?? o.cancel_reason,
                }
              : o,
          ),
        );
        setCancelOpen(null);
      }
    } catch {
      setError("Durum güncellenirken bağlantı kesildi.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter === "active" && !ACTIVE_STATUSES.includes(order.status)) return false;
      if (filter === "new" && order.status !== "new") return false;
      if (filter === "preparing" && order.status !== "preparing") return false;
      if (filter === "ready" && order.status !== "ready") return false;
      if (filter === "completed" && order.status !== "completed") return false;
      if (filter === "cancelled" && order.status !== "cancelled") return false;

      if (!q) return true;
      return (
        order.order_number.toLowerCase().includes(q) ||
        order.phone.includes(q.replace(/\s/g, "")) ||
        order.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        order.customer_name.toLowerCase().includes(q)
      );
    });
  }, [orders, filter, query]);

  const summary = useMemo(() => {
    const since = startOfTodayTR(new Date(now)).getTime();
    const today = orders.filter((o) => new Date(o.created_at).getTime() >= since);
    const valid = today.filter((o) => o.status !== "cancelled");
    return {
      count: valid.length,
      revenue: valid.reduce((s, o) => s + o.total, 0),
      active: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
      waiting: orders.filter((o) => o.status === "new").length,
      cancelled: today.length - valid.length,
    };
  }, [orders, now]);

  const storeStatus = store ? getStoreStatus(store, new Date(now)) : null;
  /** Varsayılan süre: ayarlardaki üst sınıra en yakın seçenek */
  const defaultEta: number =
    ETA_OPTIONS.find((m) => m >= (store?.eta_max ?? 45)) ?? ETA_OPTIONS[ETA_OPTIONS.length - 1];

  return (
    <div className="space-y-6">
      {!audioArmed ? (
        <button
          type="button"
          className="w-full rounded-xl border border-amber-400/50 bg-amber-950/50 px-4 py-3 text-center text-sm font-semibold text-amber-100 shadow-lg"
          onClick={() => {
            void unlockKitchenAudio().then((ok) => {
              if (ok) void playKitchenOrderAlert();
            });
          }}
        >
          Ses kapalı — sipariş alarmı için buraya dokunun
        </button>
      ) : null}

      {banner ? (
        <div
          className="rounded-xl border border-[#d4af37]/50 bg-[#d4af37]/15 px-4 py-3 text-center text-sm font-semibold text-[#fde68a] shadow-lg"
          role="status"
          aria-live="assertive"
        >
          {banner}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Mutfak paneli
          </h1>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Bağlantı:{" "}
            <span
              className={cn(
                connection === "live" && "text-emerald-400",
                connection === "connecting" && "text-amber-300",
                connection === "disconnected" && "text-[#fecaca]",
              )}
            >
              {connection === "live"
                ? "Canlı"
                : connection === "connecting"
                  ? "Bağlanıyor…"
                  : "Kesildi — siparişler yenilenmeye devam eder"}
            </span>
            {" · "}
            <span className={audioArmed ? "text-emerald-400" : "text-amber-300"}>
              {audioArmed ? "Ses açık" : "Ses kapalı"}
            </span>
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 !min-h-10 !px-4 text-sm"
            onClick={() => {
              void unlockKitchenAudio().then(() => playKitchenOrderAlert());
            }}
          >
            Ses test et
          </Button>
        </div>
        <div className="flex w-full flex-col gap-3 sm:max-w-md">
          <label htmlFor="kitchen-search" className="sr-only">
            Sipariş numarası veya telefon ara
          </label>
          <input
            id="kitchen-search"
            type="search"
            placeholder="Sipariş no veya telefon ara…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-white/12 bg-black/25 px-3 py-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          />
        </div>
      </div>

      <section aria-label="Bugünün özeti" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Bekleyen", value: String(summary.waiting), tone: summary.waiting > 0 ? "text-orange-200" : "" },
          { label: "Aktif", value: String(summary.active), tone: "" },
          { label: "Bugün sipariş", value: String(summary.count), tone: "" },
          { label: "Bugün ciro", value: formatTry(summary.revenue), tone: "text-[#e8c76a]" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.08] bg-[var(--surface)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--foreground-muted)]">{s.label}</p>
            <p className={cn("mt-1 text-xl font-semibold tabular-nums", s.tone)}>{s.value}</p>
          </div>
        ))}
      </section>

      {store ? (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
            storeStatus?.open
              ? "border-emerald-500/30 bg-emerald-950/30"
              : "border-red-500/40 bg-red-950/40",
          )}
          role="status"
        >
          <div className="min-w-0">
            <p className="font-semibold">
              {store.orders_enabled
                ? storeStatus?.open
                  ? "Online siparişler açık"
                  : "Çalışma saatleri dışında — sipariş alınmıyor"
                : "Online siparişler DURDURULDU"}
            </p>
            <p className="text-sm text-[var(--foreground-muted)]">{storeStatus?.message}</p>
          </div>
          <Button
            type="button"
            variant={store.orders_enabled ? "outline" : "primary"}
            className="!min-h-10 !px-4 text-sm"
            disabled={storeBusy}
            onClick={() => void toggleOrders()}
          >
            {store.orders_enabled ? "Siparişleri durdur" : "Siparişleri aç"}
          </Button>
        </div>
      ) : null}

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Sipariş filtreleri"
      >
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={filter === item.key}
            className={cn(
              "min-h-10 rounded-full border px-4 text-sm font-medium transition-colors",
              filter === item.key
                ? "border-[#d4af37]/55 bg-[#d4af37]/15 text-[#fde68a]"
                : "border-white/12 text-[var(--foreground-muted)] hover:border-white/25 hover:text-[var(--foreground)]",
            )}
            onClick={() => setFilter(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-[#fecaca]" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-[var(--foreground-muted)]" role="status">
          Siparişler yükleniyor…
        </p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-[var(--foreground-muted)]">
          Bu filtrede sipariş yok.
        </p>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {filtered.map((order) => {
            const transitions = STATUS_TRANSITIONS[order.status] ?? [];
            const highlighted = highlightIds.has(order.id);
            return (
              <li key={order.id}>
                <article
                  className={cn(
                    "rounded-2xl border bg-[var(--surface)] p-5 transition-shadow sm:p-6",
                    highlighted
                      ? "border-[#d4af37] shadow-[0_0_0_2px_rgba(212,175,55,0.35)] ring-2 ring-[#d4af37]/40"
                      : "border-white/[0.08]",
                  )}
                >
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#e8c76a]">
                        {order.order_number}
                      </p>
                      <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                        {formatOrderTime(order.created_at)}
                        {ACTIVE_STATUSES.includes(order.status) ? (
                          <span
                            className={cn(
                              "ml-2 font-medium",
                              order.status === "new" && minutesSince(order.created_at, now) >= 5
                                ? "text-orange-300"
                                : "",
                            )}
                          >
                            · {minutesSince(order.created_at, now)} dk
                          </span>
                        ) : null}
                      </p>
                      <a
                        href={`/mutfak/fis/${order.id}`}
                        target="_blank"
                        rel="noopener"
                        className="mt-2 inline-flex text-sm font-medium text-[#fdba74] underline-offset-2 hover:underline"
                      >
                        Fiş yazdır
                      </a>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                        order.status === "new" && "bg-orange-500/20 text-orange-200",
                        order.status === "cancelled" && "bg-red-500/20 text-red-200",
                        order.status === "completed" && "bg-emerald-500/20 text-emerald-200",
                        !["new", "cancelled", "completed"].includes(order.status) &&
                          "bg-white/10 text-[var(--foreground)]",
                      )}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </header>

                  <dl className="mt-4 space-y-2 text-sm">
                    <div>
                      <dt className="text-[var(--foreground-muted)]">Müşteri</dt>
                      <dd className="font-medium">{order.customer_name}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--foreground-muted)]">Telefon</dt>
                      <dd>
                        <a
                          href={`tel:+90${order.phone.replace(/^0/, "")}`}
                          className="font-medium text-[#fdba74] underline-offset-2 hover:underline"
                        >
                          {formatPhoneDisplay(order.phone)}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--foreground-muted)]">Adres</dt>
                      <dd className="leading-relaxed">{order.address}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--foreground-muted)]">Ödeme</dt>
                      <dd>
                        {PAYMENT_METHOD_LABELS[order.payment_method] ?? "Online ödeme"}
                        {order.cash_change_for ? (
                          <span className="ml-2 rounded-md bg-amber-500/15 px-2 py-0.5 text-amber-100">
                            {formatTry(order.cash_change_for)} üzerinden · para üstü{" "}
                            {formatTry(order.cash_change_for - order.total)}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--foreground-muted)]">Servis</dt>
                      <dd>{order.wants_cutlery ? "Çatal-bıçak ve peçete İSTİYOR" : "Çatal-bıçak istemiyor"}</dd>
                    </div>
                    {order.eta_at && ACTIVE_STATUSES.includes(order.status) ? (
                      <div>
                        <dt className="text-[var(--foreground-muted)]">Müşteriye söylenen teslim saati</dt>
                        <dd className="font-semibold text-[#fde68a]">{formatClockTR(order.eta_at)}</dd>
                      </div>
                    ) : null}
                    {order.status === "cancelled" && order.cancel_reason ? (
                      <div>
                        <dt className="text-[var(--foreground-muted)]">İptal nedeni</dt>
                        <dd className="text-[#fecaca]">{order.cancel_reason}</dd>
                      </div>
                    ) : null}
                    {order.note ? (
                      <div>
                        <dt className="text-[var(--foreground-muted)]">Not</dt>
                        <dd className="rounded-lg bg-black/25 px-3 py-2 leading-relaxed">
                          {order.note}
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  <div className="mt-4 border-t border-white/[0.06] pt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d4af37]/90">
                      Ürünler
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {order.items.map((item, idx) => (
                        <li
                          key={`${order.id}-${idx}`}
                          className="flex justify-between gap-3"
                        >
                          <span>
                            {item.quantity}× {item.name}
                          </span>
                          <span className="tabular-nums text-[#e8c76a]">
                            {formatTry(item.lineTotal)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 flex justify-between border-t border-white/[0.06] pt-3 text-base font-semibold">
                      <span>Toplam</span>
                      <span className="tabular-nums text-[#e8c76a]">
                        {formatTry(order.total)}
                      </span>
                    </p>
                  </div>

                  {order.status === "new" ? (
                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d4af37]/90">
                        Tahmini teslim süresi
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Tahmini süre">
                        {ETA_OPTIONS.map((m) => {
                          const picked = (etaPick[order.id] ?? defaultEta) === m;
                          return (
                            <button
                              key={m}
                              type="button"
                              role="radio"
                              aria-checked={picked}
                              onClick={() => setEtaPick((p) => ({ ...p, [order.id]: m }))}
                              className={cn(
                                "min-h-10 rounded-full border px-3 text-sm font-medium",
                                picked
                                  ? "border-[#d4af37]/55 bg-[#d4af37]/15 text-[#fde68a]"
                                  : "border-white/12 text-[var(--foreground-muted)]",
                              )}
                            >
                              {m} dk
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {cancelOpen === order.id ? (
                    <div className="mt-5 rounded-xl border border-red-500/30 bg-red-950/30 p-3">
                      <p className="text-sm font-semibold text-[#fecaca]">İptal nedeni (müşteriye gösterilir)</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {CANCEL_REASONS.map((r) => (
                          <button
                            key={r}
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => void updateStatus(order.id, "cancelled", { cancelReason: r })}
                            className="min-h-10 rounded-full border border-red-400/40 px-3 text-sm text-[#fecaca] hover:bg-red-900/40 disabled:opacity-50"
                          >
                            {r}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setCancelOpen(null)}
                          className="min-h-10 rounded-full border border-white/12 px-3 text-sm"
                        >
                          Vazgeç
                        </button>
                      </div>
                    </div>
                  ) : transitions.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {transitions.map((status) => (
                        <Button
                          key={status}
                          type="button"
                          variant={status === "cancelled" ? "outline" : "primary"}
                          className="!min-h-10 !px-4 text-sm"
                          disabled={updatingId === order.id}
                          onClick={() => {
                            if (status === "cancelled") {
                              setCancelOpen(order.id);
                              return;
                            }
                            const etaMinutes =
                              order.status === "new"
                                ? (etaPick[order.id] ?? defaultEta)
                                : undefined;
                            void updateStatus(order.id, status, etaMinutes ? { etaMinutes } : undefined);
                          }}
                        >
                          {order.status === "new" && status !== "cancelled"
                            ? `${ORDER_STATUS_LABELS[status]} · ${etaPick[order.id] ?? defaultEta} dk`
                            : ORDER_STATUS_LABELS[status]}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
