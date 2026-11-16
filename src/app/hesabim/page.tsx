import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/account/ui";
import { StatusBadge } from "@/components/account/OrderProgress";
import type { OrderStatus } from "@/lib/orders/constants";
import { formatOrderTime, formatTry } from "@/lib/orders/format";
import { createClient } from "@/lib/supabase/server";

export default async function SiparislerimPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Personel tüm siparişleri görebildiği için burada açıkça kendi siparişleri süzülür
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at, items")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return <Card><p className="text-sm text-[#fecaca]">Siparişler yüklenemedi. Sayfayı yenileyin.</p></Card>;
  }

  if (!orders?.length) {
    return (
      <Card className="text-center">
        <p className="text-[var(--foreground-muted)]">Henüz siparişiniz yok.</p>
        <Button href="/siparis" className="mt-5">İlk siparişini ver</Button>
      </Card>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((o) => {
        const count = Array.isArray(o.items)
          ? (o.items as { quantity: number }[]).reduce((s, i) => s + (i.quantity ?? 0), 0)
          : 0;
        return (
          <li key={o.id}>
            <Link
              href={`/hesabim/siparisler/${o.id}`}
              className="block rounded-2xl border border-white/[0.08] bg-[var(--surface)] p-4 transition-colors hover:border-[#d4af37]/35 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#e8c76a]">{o.order_number}</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {formatOrderTime(o.created_at)} · {count} ürün
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={o.status as OrderStatus} />
                  <p className="mt-2 font-semibold tabular-nums">{formatTry(Number(o.total))}</p>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
