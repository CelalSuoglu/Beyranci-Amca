import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_DOCS } from "@/lib/legal/documents";
import { sellerLines } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Yasal Bilgiler",
  description: "Satıcı bilgileri, sözleşmeler, KVKK ve politikalar.",
  alternates: { canonical: "/yasal" },
};

export default function YasalPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl px-5 pb-[max(3rem,env(safe-area-inset-bottom))] pt-10 sm:px-6">
      <Link href="/" className="text-sm text-[var(--foreground-muted)] hover:text-[var(--accent-soft)]">
        ← Ana sayfa
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold">Yasal Bilgiler</h1>

      <section aria-labelledby="satici" className="mt-8 rounded-2xl border border-white/[0.08] bg-[var(--surface)] p-5 sm:p-6">
        <h2 id="satici" className="text-lg font-semibold">Satıcı bilgileri</h2>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          {sellerLines().map((r) => (
            <div key={r.label} className="contents">
              <dt className="text-[var(--foreground-muted)]">{r.label}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {LEGAL_DOCS.map((d) => {
          const doc = d.get();
          return (
            <li key={d.slug}>
              <Link
                href={`/${d.slug}`}
                className="block h-full rounded-2xl border border-white/[0.08] bg-[var(--surface)] p-5 transition-colors hover:border-[#d4af37]/35"
              >
                <p className="font-semibold">{doc.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--foreground-muted)]">{doc.summary}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
