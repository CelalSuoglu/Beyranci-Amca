import Image from "next/image";
import { site } from "@/lib/site";
import { campaigns } from "@/lib/campaign-data";
import { cn } from "@/lib/utils";
import { section } from "@/lib/site-styles";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function CampaignSection() {
  return (
    <section
      id="campaign"
      aria-labelledby="campaign-heading"
      className={cn(
        section.scroll,
        section.padY,
        section.divider,
        "bg-gradient-to-b from-[#120a08] via-[var(--surface-elevated)] to-[var(--surface)]",
      )}
    >
      <Container>
        <SectionHeading
          titleId="campaign-heading"
          eyebrow="Özel Fırsatlar"
          title="Kampanyalar"
        />

        <div className="mx-auto mt-6 grid w-full grid-cols-1 gap-3 sm:mt-8 md:mt-10 md:grid-cols-2 md:gap-5 lg:gap-6">
          {campaigns.map((c) => (
            <article
              key={c.id}
              data-campaign-card
              className={cn(
                "campaign-card group relative isolate w-full min-w-0 overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br shadow-[0_12px_28px_-10px_rgba(0,0,0,0.55)] ring-1 ring-inset transition duration-300 md:rounded-3xl md:shadow-[0_18px_36px_-10px_rgba(0,0,0,0.5)] md:duration-500 md:hover:-translate-y-0.5 md:hover:shadow-[0_22px_44px_-10px_rgba(0,0,0,0.6)]",
                c.gradient,
                c.glow,
                "after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:opacity-100",
              )}
            >
              <div className="campaign-card__inner relative z-10 flex w-full flex-col items-center px-4 py-4 text-center sm:px-5 sm:py-5 md:py-6">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-inner sm:h-14 sm:w-14 md:h-16 md:w-16 md:rounded-xl">
                  <Image
                    src="/beyranci-amca.png"
                    alt=""
                    fill
                    className="object-contain object-center p-1.5"
                    sizes="(max-width: 768px) 56px, 72px"
                  />
                </div>
                <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c4a574]/85 sm:text-[10px]">
                  Kampanya
                </p>
                <h3 className="mt-1 w-full max-w-[18rem] px-1 font-[family-name:var(--font-display)] text-base font-semibold leading-snug tracking-tight text-[#faf6ef] sm:text-lg md:max-w-[19rem] md:text-xl md:leading-tight">
                  {c.title}
                </h3>
                <div
                  className="mt-3 flex w-full max-w-[14rem] flex-wrap items-end justify-center gap-x-1.5 gap-y-0.5 border-t border-white/12 pt-3 sm:max-w-[15rem] md:mt-5 md:pt-5"
                  aria-label={`Fiyat: ${c.price} ${c.currency}`}
                >
                  <span
                    className={cn(
                      "font-[family-name:var(--font-display)] text-2xl font-semibold tabular-nums leading-none tracking-tight sm:text-3xl md:text-4xl lg:text-5xl",
                      c.accent,
                    )}
                  >
                    {c.price}
                  </span>
                  <span className="pb-0.5 text-base font-medium text-[#e8dcc8]/95 sm:text-lg md:pb-1 md:text-xl">
                    {c.currency}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-lg text-center text-sm leading-relaxed text-[var(--foreground-muted)] sm:mt-12">
          {site.whatsapp ? (
            <>
              Sorularınız için{" "}
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#fde68a]/90 underline-offset-4 transition hover:text-[#fde68a] hover:underline"
              >
                WhatsApp
              </a>
              {" veya "}
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#fde68a]/90 underline-offset-4 transition hover:text-[#fde68a] hover:underline"
              >
                Instagram
              </a>{" "}
              üzerinden yazabilirsiniz.
            </>
          ) : (
            <>
              Sorularınız için{" "}
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#fde68a]/90 underline-offset-4 transition hover:text-[#fde68a] hover:underline"
              >
                Instagram
              </a>{" "}
              üzerinden yazabilirsiniz. WhatsApp bağlantısı numara netleştiğinde
              eklenecektir.
            </>
          )}
        </p>
      </Container>
    </section>
  );
}
