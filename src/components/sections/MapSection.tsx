import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { section } from "@/lib/site-styles";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { MapPinIcon } from "@/components/icons/SocialIcons";

export function MapSection() {
  return (
    <section
      id="konum"
      aria-labelledby="konum-heading"
      className={cn(
        section.scroll,
        section.padY,
        section.divider,
        "bg-gradient-to-b from-[var(--background)] via-[var(--surface)] to-[#0f0c0b]",
      )}
    >
      <Container>
        <SectionHeading
          titleId="konum-heading"
          title="Konumumuz"
          subtitle="Yeşilbayır, Döşemealtı — haritadan yol tarifi alabilir veya Google Maps üzerinden detaylı konumu açabilirsiniz."
        />

        <div className="mt-10 grid items-stretch gap-8 sm:mt-12 lg:mt-14 lg:grid-cols-12 lg:gap-10">
          <div className="order-2 flex flex-col justify-center lg:order-1 lg:col-span-4">
            <SurfaceCard className="h-full">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c2410c]/15 text-[#fdba74]">
                  <MapPinIcon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]/90">
                    Adres
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#e8e0d8]">
                    {site.address}
                  </p>
                </div>
              </div>
              <Button
                href={site.googleMapsOpenUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                className="mt-8 w-full justify-center shadow-lg shadow-[#9a3412]/25 sm:w-auto"
              >
                Google Maps&apos;te Aç
              </Button>
            </SurfaceCard>
          </div>

          <div className="order-1 min-h-0 lg:order-2 lg:col-span-8">
            <div
              className={cn(
                "overflow-hidden rounded-2xl border border-white/[0.08]",
                "shadow-[0_24px_56px_-16px_rgba(0,0,0,0.55)] ring-1 ring-[#d4af37]/12",
              )}
            >
              <iframe
                title="Beyrancı Amca — Google Haritalar"
                src={site.mapsEmbedSrc}
                className="aspect-[4/3] min-h-[260px] w-full border-0 sm:aspect-[16/10] sm:min-h-[320px] lg:min-h-[380px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
