import { site, sitePlaceholders } from "@/lib/site";
import { cn } from "@/lib/utils";
import { section } from "@/lib/site-styles";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { OpeningHoursList } from "@/components/ui/OpeningHoursList";
import {
  InstagramIcon,
  WhatsAppIcon,
  PhoneIcon,
  MapPinIcon,
  GoogleGIcon,
} from "@/components/icons/SocialIcons";

export function ContactSection() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className={cn(
        section.scroll,
        section.padY,
        section.divider,
        "bg-[var(--background)]",
      )}
    >
      <Container>
        <SectionHeading
          titleId="contact-heading"
          title="İletişim"
          subtitle="Adresimiz, çalışma saatlerimiz ve dijital kanallarımız."
        />

        <p className="mx-auto mt-8 max-w-2xl text-center text-base leading-relaxed text-[var(--foreground-muted)] sm:mt-10 sm:text-lg">
          Sizi Döşemealtı Yeşilbayır&apos;daki mekânımızda ağırlamaktan mutluluk
          duyarız. Otantik Beyran lezzetini ve sıcak soframızı deneyimlemek için
          yolunuzu bekliyoruz; aileniz ve dostlarınızla birlikte gelmeye
          davetlisiniz.
        </p>

        <div className="mx-auto mt-12 grid max-w-6xl gap-5 sm:mt-14 lg:grid-cols-3 lg:gap-6">
          <SurfaceCard className="lg:col-span-1">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c2410c]/15 text-[#fdba74]">
                <MapPinIcon className="h-6 w-6" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]/90">
                  Adres
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#e8e0d8]">
                  {site.address}
                </p>
                <a
                  href={site.googleMapsOpenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex text-sm font-medium text-[#fde68a] underline-offset-4 transition hover:text-[#fef3c7] hover:underline"
                >
                  Haritada aç →
                </a>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="lg:col-span-1">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                <GoogleGIcon className="h-7 w-7" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]/90">
                  Google İşletme Profili
                </h3>
                <p className="mt-3 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--foreground)]">
                  {site.googleBusinessName}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">
                  Yorumları ve güncel bilgileri Google Haritalar üzerinden
                  görüntüleyebilirsiniz.
                </p>
                <a
                  href={site.googleMapsOpenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex text-sm font-medium text-[#fde68a] underline-offset-4 transition hover:text-[#fef3c7] hover:underline"
                >
                  Google’da görüntüle →
                </a>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="lg:col-span-1">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white shadow-md">
                <InstagramIcon className="h-6 w-6" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]/90">
                  Instagram
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--foreground-muted)]">
                  Fotoğraflar ve duyurular için hesabımızı takip edin.
                </p>
                <p className="mt-2 text-sm font-medium text-[#d4af37]/90">
                  {site.instagramHandle}
                </p>
                <Button
                  href={site.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  className="mt-5 w-full justify-center border-white/18 bg-white/[0.04] text-[var(--foreground)] hover:border-[#f58529]/45 hover:text-[#fde68a] sm:w-auto"
                >
                  <InstagramIcon className="h-4 w-4" aria-hidden />
                  Instagram&apos;da Takip Et
                </Button>
              </div>
            </div>
          </SurfaceCard>
        </div>

        <div className="mx-auto mt-5 grid max-w-6xl gap-5 sm:grid-cols-2 lg:mt-6">
          <SurfaceCard>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]/90">
              {site.hours.label}
            </h3>
            <OpeningHoursList rows={site.hours.weekly} variant="card" />
          </SurfaceCard>

          <SurfaceCard className="flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]/90">
              Telefon
            </h3>
            {site.phoneDisplay && site.phoneTel ? (
              <>
                <p className="mt-4 text-[15px] leading-relaxed text-[#e8e0d8]">
                  <span className="text-[var(--foreground-muted)]">
                    Telefon / WhatsApp:{" "}
                  </span>
                  <a
                    href={`tel:${site.phoneTel}`}
                    className="font-[family-name:var(--font-display)] text-lg font-semibold tabular-nums text-[var(--foreground)] underline decoration-white/15 underline-offset-4 transition hover:text-[#fde68a] hover:decoration-[#fde68a]/50 sm:text-xl"
                  >
                    {site.phoneDisplay}
                  </a>
                </p>
                <Button
                  href={`tel:${site.phoneTel}`}
                  variant="outline"
                  className="mt-5 min-h-[3rem] w-full justify-center border-white/15 bg-black/20 text-[var(--foreground)] hover:border-[#d4af37]/45 sm:w-auto sm:self-start"
                >
                  <PhoneIcon className="h-5 w-5" aria-hidden />
                  Hemen ara
                </Button>

                {site.whatsapp ? (
                  <div className="mt-6 border-t border-white/[0.08] pt-6">
                    <div className="flex items-start gap-3">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]/14 text-[#25D366] ring-1 ring-[#25D366]/25"
                        aria-hidden
                      >
                        <WhatsAppIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25D366]/90">
                          WhatsApp
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-[var(--foreground-muted)]">
                          Mesajınızı doğrudan WhatsApp üzerinden
                          iletebilirsiniz.
                        </p>
                      </div>
                    </div>
                    <Button
                      href={site.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 min-h-[3rem] w-full justify-center bg-[#25D366] !px-6 text-[0.9375rem] font-semibold text-white shadow-md shadow-emerald-950/35 hover:brightness-110 sm:max-w-md"
                    >
                      <WhatsAppIcon className="h-5 w-5" aria-hidden />
                      WhatsApp ile İletişime Geç
                    </Button>
                  </div>
                ) : (
                  <p className="mt-5 text-sm leading-relaxed text-[var(--foreground-muted)]">
                    {sitePlaceholders.whatsapp}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="mt-4 text-[15px] leading-relaxed text-[var(--foreground-muted)]">
                  {sitePlaceholders.phone}
                </p>
                <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                  {sitePlaceholders.phoneDetail}
                </p>
                {site.whatsapp ? (
                  <div className="mt-6 border-t border-white/[0.08] pt-6">
                    <div className="flex items-start gap-3">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]/14 text-[#25D366] ring-1 ring-[#25D366]/25"
                        aria-hidden
                      >
                        <WhatsAppIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25D366]/90">
                          WhatsApp
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-[var(--foreground-muted)]">
                          Mesajınızı doğrudan WhatsApp üzerinden
                          iletebilirsiniz.
                        </p>
                      </div>
                    </div>
                    <Button
                      href={site.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 min-h-[3rem] w-full justify-center bg-[#25D366] !px-6 text-[0.9375rem] font-semibold text-white shadow-md shadow-emerald-950/35 hover:brightness-110 sm:max-w-md"
                    >
                      <WhatsAppIcon className="h-5 w-5" aria-hidden />
                      WhatsApp ile İletişime Geç
                    </Button>
                  </div>
                ) : (
                  <p className="mt-5 text-sm leading-relaxed text-[var(--foreground-muted)]">
                    {sitePlaceholders.whatsapp}
                  </p>
                )}
              </>
            )}
          </SurfaceCard>
        </div>
      </Container>
    </section>
  );
}
