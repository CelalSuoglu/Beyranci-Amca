import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiparisPageClient } from "@/components/orders/SiparisPageClient";
import { brand } from "@/lib/brand";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Paket Sipariş",
  description:
    "Beyrancı Amca’dan online paket sipariş verin. Minimum 1.250 TL. Kapıda nakit veya kart.",
  alternates: {
    canonical: "/siparis",
  },
};

export default function SiparisPage() {
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
        <SiparisPageClient />
      </main>
    </div>
  );
}
