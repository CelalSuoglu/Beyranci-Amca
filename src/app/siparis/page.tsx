import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiparisPageClient } from "@/components/orders/SiparisPageClient";
import { brand } from "@/lib/brand";
import { site } from "@/lib/site";
import { getCatalog, getOrderableCategoriesFrom } from "@/lib/menu/catalog";
import { getStoreSettings } from "@/lib/store/server";
import { CookieSettingsButton } from "@/components/legal/CookieConsent";
import { LEGAL_NAV } from "@/components/legal/LegalDocumentView";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Paket Sipariş",
  description:
    "Beyrancı Amca’dan online paket sipariş verin. Minimum 1.250 TL. Teslimat en fazla 15 km. Kapıda nakit veya kart.",
  alternates: {
    canonical: "/siparis",
  },
};

export default async function SiparisPage() {
  const catalog = await getCatalog();
  const categories = getOrderableCategoriesFrom(catalog.orderable);
  const store = await getStoreSettings();
  return (
    <div className="flex min-h-full min-w-0 flex-col">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[var(--surface)]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2.5 sm:gap-3"
            aria-label={`${site.name} — Ana sayfa`}
          >
            <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#1a0f0c] ring-2 ring-[#d4af37]/25 sm:h-11 sm:w-11">
              <Image
                src={brand.logoSrc}
                alt={brand.logoAltNav}
                width={44}
                height={44}
                className="object-contain"
                priority
              />
            </span>
            <span className="truncate font-[family-name:var(--font-display)] text-base font-semibold tracking-tight sm:text-lg">
              {site.name}
            </span>
          </Link>
          <nav
            className="flex shrink-0 items-center gap-2 text-sm sm:gap-3"
            aria-label="Sipariş sayfası"
          >
            <Link
              href="/hesabim"
              className="text-[var(--foreground-muted)] hover:text-[var(--accent-soft)]"
            >
              Hesabım
            </Link>
            <Link
              href="/qr-menu"
              className="text-[var(--foreground-muted)] hover:text-[var(--accent-soft)]"
            >
              <span className="sm:hidden">Menü</span>
              <span className="hidden sm:inline">QR Menü</span>
            </Link>
            {site.phoneTel ? (
              <a
                href={`tel:${site.phoneTel}`}
                className="rounded-full border border-white/15 px-3 py-2 font-medium text-[var(--foreground)] hover:border-[#d4af37]/4"
              >
                Ara
              </a>
            ) : null}
          </nav>
        </div>
      </header>
      <main id="main-content" className="min-w-0 flex-1" tabIndex={-1}>
        <SiparisPageClient categories={categories} initialStore={store} />
      </main>
      <footer className="border-t border-white/[0.06] px-5 py-8 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] text-sm text-[var(--foreground-muted)] sm:px-8">
        <nav aria-label="Yasal metinler" className="mx-auto max-w-6xl">
          <ul className="flex flex-wrap gap-x-5 gap-y-2.5">
            {LEGAL_NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-[var(--accent-soft)]">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/yasal" className="hover:text-[var(--accent-soft)]">
                Satıcı bilgileri
              </Link>
            </li>
            <li>
              <CookieSettingsButton className="hover:text-[var(--accent-soft)]" />
            </li>
          </ul>
        </nav>
      </footer>
    </div>
  );
}
