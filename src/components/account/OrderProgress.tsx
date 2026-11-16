import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orders/constants";
import { formatClockTR, formatOrderTime, formatTry } from "@/lib/orders/format";
import { cn } from "@/lib/utils";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "new", label: "Sipariş alındı" },
  { status: "accepted", label: "Onaylandı" },
  { status: "preparing", label: "Hazırlanıyor" },
  { status: "ready", label: "Hazır" },
  { status: "out_for_delivery", label: "Yolda" },
  { status: "completed", label: "Teslim edildi" },
];

export type ProgressEvent = { to_status: OrderStatus; created_at: string };

export function OrderProgress({
  status,
  events,
  etaAt,
  cancelReason,
}: {
  status: OrderStatus;
  events: ProgressEvent[];
  etaAt?: string | null;
  cancelReason?: string | null;
}) {
  if (status === "cancelled") {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-[#fecaca]">
        Bu sipariş iptal edildi{cancelReason ? `: ${cancelReason}` : "."} Sorunuz varsa restoranı
        arayabilirsiniz.
      </p>
    );
  }
  const showEta = etaAt && status !== "completed";
  const reached = new Map(events.map((e) => [e.to_status, e.created_at]));
  const currentIndex = Math.max(0, STEPS.findIndex((s) => s.status === status));

  return (
    <div>
    {showEta ? (
      <p className="mb-4 rounded-xl border border-[#d4af37]/35 bg-[#d4af37]/10 px-4 py-3 text-[#fde68a]">
        Tahmini teslimat: <strong className="text-lg">{formatClockTR(etaAt)}</strong>
      </p>
    ) : status === "new" ? (
      <p className="mb-4 text-sm text-[var(--foreground-muted)]">
        Restoran siparişinizi onayladığında tahmini teslim saati burada görünecek.
      </p>
    ) : null}
    <ol className="space-y-0" aria-label="Sipariş durumu">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const current = i === currentIndex;
        const at = reached.get(step.status);
        // "Onaylandı" atlanıp doğrudan "Hazırlanıyor"a geçildiyse adımı soluk göster
        const skipped = done && !current && !at && step.status !== "new";
        return (
          <li key={step.status} className="relative flex gap-4 pb-5 last:pb-0">
            {i < STEPS.length - 1 ? (
              <span
                className={cn(
                  "absolute left-[0.6875rem] top-6 h-[calc(100%-1rem)] w-px",
                  i < currentIndex ? "bg-[#d4af37]/60" : "bg-white/10",
                )}
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                done && !skipped ? "border-[#d4af37] bg-[#d4af37] text-[#1a120e]" : "border-white/20 text-[var(--foreground-muted)]",
                current && "ring-4 ring-[#d4af37]/25",
              )}
              aria-hidden
            >
              {done && !skipped ? "✓" : i + 1}
            </span>
            <div className="min-w-0">
              <p className={cn("font-medium", done && !skipped ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]")}>
                {step.label}
                {current ? <span className="sr-only"> (şu anki durum)</span> : null}
              </p>
              {at ? <p className="text-xs text-[var(--foreground-muted)]">{formatOrderTime(at)}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
    </div>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        status === "new" && "bg-orange-500/20 text-orange-200",
        status === "cancelled" && "bg-red-500/20 text-red-200",
        status === "completed" && "bg-emerald-500/20 text-emerald-200",
        !["new", "cancelled", "completed"].includes(status) && "bg-[#d4af37]/15 text-[#fde68a]",
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export type OrderItemView = { name: string; quantity: number; lineTotal: number };

export function OrderItems({ items, total }: { items: OrderItemView[]; total: number }) {
  return (
    <div>
      <ul className="space-y-1.5 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex justify-between gap-3">
            <span className="min-w-0 break-words">
              {item.quantity}× {item.name}
            </span>
            <span className="shrink-0 tabular-nums text-[#e8c76a]">{formatTry(item.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex justify-between border-t border-white/[0.06] pt-3 font-semibold">
        <span>Toplam</span>
        <span className="tabular-nums text-[#e8c76a]">{formatTry(total)}</span>
      </p>
    </div>
  );
}
