import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiparisPageClient } from "@/components/orders/SiparisPageClient";
import { brand } from "@/lib/brand";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Paket Sipariş",
  description:
    "Beyrancı Amca’dan online paket sipariş verin. Minimum 1.000 TL. Kapıda nakit veya kart.",
};

export default function SiparisPage() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-white/[0.06] bg-[var(--surface)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label={`${site.name} — Ana sayfa`}
          >
            <span className="relative flex h-11 w-11 overflow-hidden rounded-full bg-[#1a0f0c] ring-2 ring-[#d4af37]/25">
              <Image
                src={brand.logoSrc}
                alt={brand.logoAltNav}
                width={44}
                height={44}
                className="object-contain"
                priority
              />
            </span>
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
              {site.name}
            </span>
          </Link>
          <nav className="flex items-center gap-3 text-sm" aria-label="Sipariş sayfası">
            <Link
              href="/qr-menu"
              className="text-[var(--foreground-muted)] hover:text-[var(--accent-soft)]"
            >
              QR Menü
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
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <SiparisPageClient />
      </main>
    </div>
  );
}
