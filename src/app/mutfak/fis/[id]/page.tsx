import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PrintOnLoad } from "@/components/orders/PrintOnLoad";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/orders/constants";
import { formatClockTR, formatOrderTime, formatPhoneDisplay, formatTry } from "@/lib/orders/format";
import type { OrderItemRecord } from "@/lib/orders/types";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mutfak fişi", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** 80 mm termal yazıcı için mutfak / kurye fişi */
export default async function FisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/mutfak/giris?next=/mutfak`);

  // RLS: yalnızca personel/yönetici tüm siparişleri okuyabilir
  const { data: o } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!o) notFound();

  const items = (o.items ?? []) as OrderItemRecord[];
  const total = Number(o.total);
  const change = o.cash_change_for ? Number(o.cash_change_for) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-white text-black print:static print:overflow-visible">
      <style>{`
        @page { size: 80mm auto; margin: 3mm; }
        @media print { body { background: #fff !important; } .no-print { display: none !important; } }
      `}</style>
      <div className="no-print flex justify-center gap-3 border-b border-neutral-200 p-3 text-sm">
        <PrintOnLoad />
      </div>
      <main className="mx-auto w-[74mm] py-3 font-mono text-[12px] leading-snug">
        <p className="text-center text-base font-bold">{site.name.toLocaleUpperCase("tr-TR")}</p>
        <p className="text-center">PAKET SİPARİŞ</p>
        <hr className="my-2 border-dashed border-black" />
        <p className="text-center text-xl font-bold">{o.order_number}</p>
        <p className="text-center">{formatOrderTime(o.created_at)}</p>
        {o.eta_at ? <p className="text-center font-bold">Teslim: {formatClockTR(o.eta_at)}</p> : null}
        <hr className="my-2 border-dashed border-black" />
        <table className="w-full">
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="align-top">
                <td className="w-8 pr-1 font-bold">{it.quantity}×</td>
                <td className="pr-1">{it.name}</td>
                <td className="whitespace-nowrap text-right">{formatTry(it.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr className="my-2 border-dashed border-black" />
        <p className="flex justify-between text-sm font-bold">
          <span>TOPLAM</span>
          <span>{formatTry(total)}</span>
        </p>
        <p>Ödeme: {PAYMENT_METHOD_LABELS[o.payment_method as PaymentMethod] ?? "Online ödeme"}</p>
        {change ? (
          <p className="font-bold">
            {formatTry(change)} üzerinden · Para üstü: {formatTry(change - total)}
          </p>
        ) : null}
        <p className="font-bold">{o.wants_cutlery ? "ÇATAL-BIÇAK + PEÇETE KOY" : "Çatal-bıçak istemiyor"}</p>
        <hr className="my-2 border-dashed border-black" />
        <p className="font-bold">{o.customer_name}</p>
        <p>{formatPhoneDisplay(o.phone)}</p>
        <p className="whitespace-pre-wrap">{o.address}</p>
        {o.note ? (
          <>
            <hr className="my-2 border-dashed border-black" />
            <p className="font-bold">NOT:</p>
            <p className="whitespace-pre-wrap">{o.note}</p>
          </>
        ) : null}
        <hr className="my-2 border-dashed border-black" />
        <p className="text-center">Afiyet olsun!</p>
        {site.phoneDisplay ? <p className="text-center">{site.phoneDisplay}</p> : null}
      </main>
    </div>
  );
}
