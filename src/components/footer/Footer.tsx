import Image from "next/image";
import { brand } from "@/lib/brand";
import { site, navItems } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { OpeningHoursList } from "@/components/ui/OpeningHoursList";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons/SocialIcons";

const footerLink =
  "rounded-lg text-sm text-[var(--foreground-muted)] transition-colors hover:text-[var(--accent)]";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[var(--surface-elevated)]">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-14">
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
              <div className="relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-full border border-[#d4af37]/20 bg-[#14100e] shadow-lg shadow-black/40 sm:mx-0 sm:h-32 sm:w-32">
                <Image
                  src="/beyranci-amca.png"
                  alt={brand.logoAlt}
                  width={256}
                  height={256}
                  className="h-full w-full object-contain object-center p-2"
                />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)]">
                  {site.name}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#d4af37]/80">
                  {brand.slogan}
                </p>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--foreground-muted)]">
                  {site.description}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-[44px] max-w-full flex-col justify-center gap-0.5 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-left text-sm text-[var(--foreground)] shadow-sm shadow-black/20 transition hover:border-[#d4af37]/35 hover:bg-white/[0.07] sm:min-w-0 sm:flex-row sm:items-center sm:gap-3 sm:py-2"
              >
                <span className="inline-flex items-center gap-2 font-medium">
                  <InstagramIcon
                    className="h-4 w-4 shrink-0 text-[#f58529]"
                    aria-hidden
                  />
                  Instagram&apos;da Takip Et
                </span>
                <span className="text-xs text-[var(--foreground-muted)] group-hover:text-[#d4af37]/90">
                  {site.instagramHandle}
                </span>
              </a>
              {site.whatsapp ? (
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#25D366]/35 bg-[#25D366]/10 px-4 py-2 text-sm font-medium text-[#86efac] transition hover:border-[#25D366]/60 hover:bg-[#25D366]/18"
                >
                  <WhatsAppIcon className="h-4 w-4" aria-hidden />
                  WhatsApp
                </a>
              ) : null}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
              Keşfet
            </p>
            <ul className="mt-4 space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-[var(--foreground-muted)] transition-colors hover:text-[var(--accent)]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
              İletişim
            </p>
            <address className="mt-4 space-y-3 text-sm not-italic text-[var(--foreground-muted)]">
              {site.phoneTel ? (
                <p className="leading-relaxed">
                  <span className="text-[var(--foreground-muted)]">
                    Telefon:{" "}
                  </span>
                  <a
                    href={`tel:${site.phoneTel}`}
                    className="font-medium tabular-nums text-[var(--foreground)] underline decoration-white/15 underline-offset-2 transition hover:text-[#fde68a] hover:decoration-[#fde68a]/40"
                  >
                    0 534 060 07 07
                  </a>
                </p>
              ) : null}
              <p className="leading-relaxed">{site.address}</p>
              <div>
                <span className="block text-[var(--foreground)]">
                  {site.hours.label}
                </span>
                <OpeningHoursList rows={site.hours.weekly} variant="footer" />
              </div>
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/[0.08] pt-10 text-xs leading-relaxed text-[var(--foreground-muted)] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {site.name}. Tüm hakları saklıdır.</p>
          <p className="text-[var(--foreground-muted)]/80">
            Geleneksel lezzet, sıcak karşılama.
          </p>
        </div>
      </Container>
    </footer>
  );
}
