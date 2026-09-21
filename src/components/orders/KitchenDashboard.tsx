"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  STATUS_TRANSITIONS,
  type OrderStatus,
} from "@/lib/orders/constants";
import { formatOrderTime, formatPhoneDisplay, formatTry } from "@/lib/orders/format";
import type { OrderRecord } from "@/lib/orders/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type FilterKey =
  | "all"
  | "new"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "new", label: "Yeni" },
  { key: "preparing", label: "Hazırlanıyor" },
  { key: "ready", label: "Hazır" },
  { key: "completed", label: "Tamamlandı" },
  { key: "cancelled", label: "İptal" },
];

function playNotificationSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.stop(ctx.currentTime + 0.4);
    window.setTimeout(() => void ctx.close(), 500);
  } catch {
    // Ses engellendiyse sessiz devam
  }
}

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
  };
}

export function KitchenDashboard() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<
    "connecting" | "live" | "disconnected"
  >("connecting");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const knownIds = useRef<Set<string>>(new Set());
  const initialLoadDone = useRef(false);

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

      setOrders((prev) => {
        if (initialLoadDone.current && prev.length > 0) {
          const prevIds = new Set(prev.map((o) => o.id));
          for (const order of list) {
            if (!prevIds.has(order.id) && !knownIds.current.has(order.id)) {
              knownIds.current.add(order.id);
              setBanner(`Yeni sipariş: ${order.order_number}`);
              setHighlightIds((h) => new Set(h).add(order.id));
              playNotificationSound();
              window.setTimeout(() => {
                setHighlightIds((h) => {
                  const next = new Set(h);
                  next.delete(order.id);
                  return next;
                });
              }, 12000);
              break;
            }
          }
        }
        return list;
      });

      knownIds.current = new Set(list.map((o) => o.id));
      setError(null);
    } catch {
      if (!opts?.silent) {
        setError("Bağlantı kurulamadı.");
      }
    } finally {
      setLoading(false);
      initialLoadDone.current = true;
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null =
      null;
    let supabase: ReturnType<typeof createClient> | null = null;
    let pollTimer: number | undefined;
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
                  knownIds.current.add(order.id);
                  setBanner(`Yeni sipariş: ${order.order_number}`);
                  setHighlightIds((prev) => new Set(prev).add(order.id));
                  playNotificationSound();
                  window.setTimeout(() => {
                    setHighlightIds((prev) => {
                      const next = new Set(prev);
                      next.delete(order.id);
                      return next;
                    });
                  }, 12000);
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
              if (!pollTimer) {
                pollTimer = window.setInterval(() => {
                  void loadOrders({ silent: true });
                }, 8000);
              }
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
          if (!pollTimer) {
            pollTimer = window.setInterval(() => {
              void loadOrders({ silent: true });
            }, 8000);
          }
        }
      }
    }

    void connectRealtime();

    return () => {
      cancelled = true;
      if (pollTimer) window.clearInterval(pollTimer);
      if (retryTimer) window.clearTimeout(retryTimer);
      if (channel && supabase) {
        void supabase.removeChannel(channel);
      }
    };
  }, [loadOrders]);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 8000);
    return () => window.clearTimeout(t);
  }, [banner]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    if (updatingId) return;
    setUpdatingId(orderId);
    setError(null);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (updateError) {
        setError("Durum güncellenemedi. Tekrar deneyin.");
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

  return (
    <div className="space-y-6">
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
                  : "Kesildi — sayfayı yenileyin"}
            </span>
          </p>
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
                      </p>
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
                      <dd>{PAYMENT_METHOD_LABELS[order.payment_method]}</dd>
                    </div>
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
                      {order.items.map((item) => (
                        <li
                          key={`${order.id}-${item.productId}`}
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

                  {transitions.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {transitions.map((status) => (
                        <Button
                          key={status}
                          type="button"
                          variant={status === "cancelled" ? "outline" : "primary"}
                          className="!min-h-10 !px-4 text-sm"
                          disabled={updatingId === order.id}
                          onClick={() => void updateStatus(order.id, status)}
                        >
                          {ORDER_STATUS_LABELS[status]}
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
