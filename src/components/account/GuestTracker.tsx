"use client";

import { useCallback, useEffect, useState } from "react";
import type { OrderStatus } from "@/lib/orders/constants";
import { formatOrderTime } from "@/lib/orders/format";
import { Alert, Card } from "./ui";
import { OrderItems, OrderProgress, StatusBadge, type OrderItemView, type ProgressEvent } from "./OrderProgress";

type TrackData = {
  order: {
    order_number: string;
    status: OrderStatus;
    items: OrderItemView[];
    total: number;
    created_at: string;
    eta_at: string | null;
    cancel_reason: string | null;
  };
  events: ProgressEvent[];
};

export function GuestTracker({ token }: { token: string }) {
  const [data, setData] = useState<TrackData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/track?token=${encodeURIComponent(token)}`, { cache: "no-store" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? "Sipariş bulunamadı.");
        return;
      }
      setData(body as TrackData);
      setError(null);
    } catch {
      setError("Bağlantı kurulamadı. Birazdan tekrar denenecek.");
    }
  }, [token]);

  useEffect(() => {
    const first = window.setTimeout(() => void load(), 0);
    const t = window.setInterval(() => void load(), 15000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
    };
  }, [load]);

  if (error && !data) return <Alert>{error}</Alert>;
  if (!data) return <p className="text-[var(--foreground-muted)]">Yükleniyor…</p>;

  const finished = data.order.status === "completed" || data.order.status === "cancelled";
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#e8c76a]">{data.order.order_number}</p>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">{formatOrderTime(data.order.created_at)}</p>
        <div className="mt-4 flex items-center gap-3">
          <StatusBadge status={data.order.status} />
          {!finished ? <span className="text-xs text-[var(--foreground-muted)]">Otomatik güncellenir</span> : null}
        </div>
        <div className="mt-5">
          <OrderProgress
            status={data.order.status}
            events={data.events}
            etaAt={data.order.eta_at}
            cancelReason={data.order.cancel_reason}
          />
        </div>
      </Card>
      <Card>
        <OrderItems items={data.order.items} total={Number(data.order.total)} />
      </Card>
    </div>
  );
}
