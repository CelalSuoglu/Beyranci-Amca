import type { ReactNode } from "react";
import Link from "next/link";
import { LEGAL_UPDATED_LABEL, type LegalDoc } from "@/lib/legal/documents";
import { PrintButton } from "./PrintButton";

export const LEGAL_NAV = [
  { href: "/on-bilgilendirme", label: "Ön Bilgilendirme Formu" },
  { href: "/mesafeli-satis-sozlesmesi", label: "Mesafeli Satış Sözleşmesi" },
  { href: "/iptal-ve-iade", label: "İptal ve İade" },
  { href: "/teslimat-kosullari", label: "Teslimat Koşulları" },
  { href: "/gizlilik", label: "KVKK ve Gizlilik" },
  { href: "/cerez-politikasi", label: "Çerez Politikası" },
  { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
  { href: "/erisilebilirlik", label: "Erişilebilirlik" },
] as const;

export function LegalSections({ doc }: { doc: LegalDoc }) {
  return (
    <div className="space-y-7 text-[0.9375rem] leading-relaxed text-[var(--foreground-muted)] print:text-black">
      {doc.sections.map((sec) => (
        <section key={sec.heading}>
          <h2 className="mb-2 text-lg font-semibold text-[var(--foreground)] print:text-black">{sec.heading}</h2>
          {sec.paragraphs?.map((p, i) => (
            <p key={i} className="mt-2 first:mt-0">
              {p}
            </p>
          ))}
          {sec.list?.length ? (
            <ul className="mt-2 list-disc space-y-1.5 pl-5 marker:text-[#d4af37]/80">
              {sec.list.map((li, i) => (
                <li key={i}>{li}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}

/** Yasal sayfa kabuğu: başlık, tarih, yazdırma, diğer metinler */
export function LegalDocumentView({ doc, before }: { doc: LegalDoc; before?: ReactNode }) {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-3xl px-5 pb-[max(3rem,env(safe-area-inset-bottom))] pt-10 sm:px-6 print:max-w-none print:bg-white print:p-0 print:text-black"
    >
      <Link href="/" className="no-print text-sm text-[var(--foreground-muted)] hover:text-[var(--accent-soft)] print:hidden">
        ← Ana sayfa
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold print:text-2xl">{doc.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="text-sm text-[var(--foreground-muted)]">Son güncelleme: {LEGAL_UPDATED_LABEL}</p>
        <PrintButton />
      </div>
      {before ? <div className="mt-8">{before}</div> : null}
      <div className="mt-8">
        <LegalSections doc={doc} />
      </div>
      <nav aria-label="Diğer yasal metinler" className="no-print mt-12 border-t border-white/[0.08] pt-6 print:hidden">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d4af37]">Diğer yasal metinler</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {LEGAL_NAV.filter((n) => n.href !== `/${doc.slug}`).map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="inline-flex min-h-10 items-center rounded-full border border-white/12 px-4 text-sm text-[var(--foreground-muted)] hover:border-white/25 hover:text-[var(--foreground)]">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
