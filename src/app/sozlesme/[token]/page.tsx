import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalSections } from "@/components/legal/LegalDocumentView";
import { PrintButton } from "@/components/legal/PrintButton";
import { mesafeliSatis, onBilgilendirme, type LegalDoc } from "@/lib/legal/documents";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/orders/constants";
import { formatOrderTime, formatTry } from "@/lib/orders/format";
import type { OrderItemRecord } from "@/lib/orders/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Sipariş sözleşmesi",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * Siparişe özel Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi.
 * Yalnızca siparişe özel tahmin edilemez bağlantı ile açılır; müşteri yazdırabilir / PDF kaydedebilir.
 */
export default async function SozlesmePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();

  const { data: o } = await createAdminClient()
    .from("orders")
    .select(
      "order_number, created_at, customer_name, phone, address, items, total, payment_method, cash_change_for, terms_version, terms_accepted_at, terms_snapshot, tracking_token",
    )
    .eq("tracking_token", token)
    .maybeSingle();
  if (!o) notFound();

  const items = (o.items ?? []) as OrderItemRecord[];
  // Müşterinin onayladığı metin (kopya varsa); yoksa (eski siparişler) güncel metin
  const snap = o.terms_snapshot as { obf?: LegalDoc; mss?: LegalDoc } | null;
  const obf = snap?.obf ?? onBilgilendirme();
  const mss = snap?.mss ?? mesafeliSatis();

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-3xl px-5 pb-[max(3rem,env(safe-area-inset-bottom))] pt-10 sm:px-6 print:max-w-none print:p-0"
    >
      <Link href={`/takip/${o.tracking_token}`} className="no-print text-sm text-[var(--foreground-muted)] hover:text-[var(--accent-soft)]">
        ← Sipariş takibi
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold print:text-2xl">
        Sipariş sözleşmesi · {o.order_number}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="text-sm text-[var(--foreground-muted)]">
          Onay: {o.terms_accepted_at ? formatOrderTime(o.terms_accepted_at) : formatOrderTime(o.created_at)}
          {o.terms_version ? ` · Metin sürümü ${o.terms_version}` : ""}
        </p>
        <PrintButton />
      </div>

      <section className="mt-8 rounded-2xl border border-white/[0.08] bg-[var(--surface)] p-5 print:border-black print:bg-white sm:p-6">
        <h2 className="text-lg font-semibold">Sipariş bilgileri</h2>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-[var(--foreground-muted)]">Sipariş no</dt>
          <dd>{o.order_number}</dd>
          <dt className="text-[var(--foreground-muted)]">Sipariş tarihi</dt>
          <dd>{formatOrderTime(o.created_at)}</dd>
          <dt className="text-[var(--foreground-muted)]">Alıcı</dt>
          <dd>{o.customer_name}</dd>
          <dt className="text-[var(--foreground-muted)]">Teslimat adresi</dt>
          <dd>{o.address}</dd>
          <dt className="text-[var(--foreground-muted)]">Ödeme</dt>
          <dd>
            {PAYMENT_METHOD_LABELS[o.payment_method as PaymentMethod] ?? "Online ödeme"} (teslimatta)
            {o.cash_change_for ? ` · ${formatTry(Number(o.cash_change_for))} üzerinden` : ""}
          </dd>
        </dl>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-left text-[var(--foreground-muted)] print:border-black">
              <th className="py-2 font-medium">Ürün</th>
              <th className="py-2 text-right font-medium">Adet</th>
              <th className="py-2 text-right font-medium">Birim</th>
              <th className="py-2 text-right font-medium">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-b border-white/[0.04] print:border-neutral-300">
                <td className="py-2 pr-2">{it.name}</td>
                <td className="py-2 text-right tabular-nums">{it.quantity}</td>
                <td className="py-2 text-right tabular-nums">{formatTry(it.unitPrice)}</td>
                <td className="py-2 text-right tabular-nums">{formatTry(it.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="pt-3 font-semibold">
                Toplam (KDV dahil, teslimat ücretsiz)
              </td>
              <td className="pt-3 text-right font-semibold tabular-nums">{formatTry(Number(o.total))}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <h2 className="mt-12 font-[family-name:var(--font-display)] text-2xl font-semibold">{obf.title}</h2>
      <div className="mt-5">
        <LegalSections doc={obf} />
      </div>

      <h2 className="mt-12 font-[family-name:var(--font-display)] text-2xl font-semibold print:break-before-page">{mss.title}</h2>
      <div className="mt-5">
        <LegalSections doc={mss} />
      </div>
    </main>
  );
}
