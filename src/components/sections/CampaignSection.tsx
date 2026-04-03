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

        <div className="campaign-card-grid mx-auto mt-8 grid max-w-[42rem] gap-4 sm:mt-10 md:grid-cols-2 md:gap-5">
          {campaigns.map((c) => (
            <article
              key={c.id}
              data-campaign-card
              className={cn(
                "campaign-card group relative isolate overflow-hidden rounded-3xl border border-white/[0.09] bg-gradient-to-br shadow-[0_18px_36px_-10px_rgba(0,0,0,0.5)] ring-1 ring-inset transition duration-500 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-10px_rgba(0,0,0,0.6)]",
                c.gradient,
                c.glow,
                "after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:opacity-100",
              )}
            >
              <div className="campaign-card__inner relative z-10 flex flex-col items-center px-4 py-5 text-center sm:px-5 sm:py-6">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-inner sm:h-[4.5rem] sm:w-[4.5rem]">
                  <Image
                    src="/beyranci-amca.png"
                    alt=""
                    fill
                    className="object-contain object-center p-1.5"
                    sizes="72px"
                  />
                </div>
                <p className="mt-2.5 text-[9px] font-semibold uppercase tracking-[0.32em] text-[#c4a574]/85 sm:text-[10px]">
                  Kampanya
                </p>
                <h3 className="mt-1.5 max-w-[13.5rem] font-[family-name:var(--font-display)] text-lg font-semibold leading-snug tracking-tight text-[#faf6ef] transition group-hover:text-white sm:max-w-[15rem] sm:text-xl sm:leading-tight">
                  {c.title}
                </h3>
                <div
                  className="mt-5 flex w-full max-w-[15rem] flex-wrap items-end justify-center gap-x-1.5 gap-y-0.5 border-t border-white/12 pt-5 sm:mt-5 sm:pt-5"
                  aria-label={`Fiyat: ${c.price} ${c.currency}`}
                >
                  <span
                    className={cn(
                      "font-[family-name:var(--font-display)] text-4xl font-semibold tabular-nums leading-none tracking-tight sm:text-5xl",
                      c.accent,
                    )}
                  >
                    {c.price}
                  </span>
                  <span className="pb-0.5 text-lg font-medium text-[#e8dcc8]/95 sm:pb-1 sm:text-xl">
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
