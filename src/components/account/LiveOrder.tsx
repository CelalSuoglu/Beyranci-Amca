"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/lib/orders/constants";
import { OrderProgress, StatusBadge, type ProgressEvent } from "./OrderProgress";

/** Müşterinin kendi siparişini canlı izler (RLS: yalnızca kendi siparişi) */
export function LiveOrderStatus({
  orderId,
  initialStatus,
  initialEvents,
  initialEtaAt = null,
  initialCancelReason = null,
}: {
  orderId: string;
  initialStatus: OrderStatus;
  initialEvents: ProgressEvent[];
  initialEtaAt?: string | null;
  initialCancelReason?: string | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [events, setEvents] = useState(initialEvents);
  const [etaAt, setEtaAt] = useState(initialEtaAt);
  const [cancelReason, setCancelReason] = useState(initialCancelReason);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const refresh = async () => {
      const [{ data: order }, { data: ev }] = await Promise.all([
        supabase.from("orders").select("status, eta_at, cancel_reason").eq("id", orderId).maybeSingle(),
        supabase.from("order_events").select("to_status, created_at").eq("order_id", orderId).order("created_at"),
      ]);
      if (cancelled) return;
      if (order?.status) setStatus(order.status as OrderStatus);
      setEtaAt((order?.eta_at as string | null) ?? null);
      setCancelReason((order?.cancel_reason as string | null) ?? null);
      if (ev) setEvents(ev as ProgressEvent[]);
    };

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        () => void refresh(),
      )
      .subscribe();

    // Canlı bağlantı kopsa bile 20 sn'de bir güncelle
    const poll = window.setInterval(() => void refresh(), 20000);
    const onVisible = () => document.visibilityState === "visible" && void refresh();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      void supabase.removeChannel(channel);
    };
  }, [orderId]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--foreground-muted)]">Durum</span>
        <StatusBadge status={status} />
      </div>
      <OrderProgress status={status} events={events} etaAt={etaAt} cancelReason={cancelReason} />
    </div>
  );
}
