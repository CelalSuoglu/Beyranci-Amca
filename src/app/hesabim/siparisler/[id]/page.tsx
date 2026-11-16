import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/account/ui";
import { LiveOrderStatus } from "@/components/account/LiveOrder";
import { OrderItems, type OrderItemView, type ProgressEvent } from "@/components/account/OrderProgress";
import { PAYMENT_METHOD_LABELS, type OrderStatus, type PaymentMethod } from "@/lib/orders/constants";
import { formatOrderTime } from "@/lib/orders/format";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export default async function SiparisDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status, items, total, created_at, address, note, payment_method, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!order) notFound();

  const { data: events } = await supabase
    .from("order_events")
    .select("to_status, created_at")
    .eq("order_id", id)
    .order("created_at");

  return (
    <div className="space-y-4">
      <Link href="/hesabim" className="text-sm text-[var(--foreground-muted)] hover:text-[var(--accent-soft)]">
        ← Siparişlerim
      </Link>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#e8c76a]">{order.order_number}</p>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">{formatOrderTime(order.created_at)}</p>
          <div className="mt-5">
            <LiveOrderStatus
              orderId={order.id}
              initialStatus={order.status as OrderStatus}
              initialEvents={(events ?? []) as ProgressEvent[]}
            />
          </div>
        </Card>
        <Card>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d4af37]">Sipariş detayı</h2>
          <div className="mt-3">
            <OrderItems items={(order.items ?? []) as OrderItemView[]} total={Number(order.total)} />
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div>
              <dt className="text-[var(--foreground-muted)]">Teslimat adresi</dt>
              <dd className="leading-relaxed">{order.address}</dd>
            </div>
            <div>
              <dt className="text-[var(--foreground-muted)]">Ödeme</dt>
              <dd>{PAYMENT_METHOD_LABELS[order.payment_method as PaymentMethod] ?? "Online ödeme"}</dd>
            </div>
            {order.note ? (
              <div>
                <dt className="text-[var(--foreground-muted)]">Not</dt>
                <dd>{order.note}</dd>
              </div>
            ) : null}
          </dl>
          {site.phoneTel ? (
            <a href={`tel:${site.phoneTel}`} className="mt-5 inline-flex text-sm font-medium text-[#fdba74] hover:underline">
              Restoranı ara: {site.phoneDisplay}
            </a>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
