import Image from "next/image";
import { cn } from "@/lib/utils";
import { section } from "@/lib/site-styles";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const aboutImageSrc = "/images/about-beyran.png";
const aboutImageAlt =
  "Geleneksel sahandaki sıcak Beyran çorbası — kaynayan yüzeyi, baharatlı suyu ve kıymık dokusu";

const aboutSubtitle =
  "Beyran, Gaziantep mutfağının en özel lezzetlerinden biridir. Uzun saatler boyunca pişirilen kuzu eti, ilikli kemik suyu, pirinç, sarımsak ve özel baharatlarla hazırlanır. Kendine has acısı, yoğun aroması ve doyurucu yapısıyla beyran, geleneksel sofraların vazgeçilmez tatlarından biridir. Bol aroması ve sıcak sofra kültürüyle unutulmaz bir lezzet sunar.";

export function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className={cn(
        section.scroll,
        section.padY,
        section.divider,
        "bg-[var(--surface)]",
      )}
    >
      <Container>
        <div
          className={cn(
            "grid gap-8 sm:gap-9",
            "lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-10 xl:gap-12",
          )}
        >
          <SectionHeading
            titleId="about-heading"
            align="left"
            className="min-w-0 max-w-none text-left"
            eyebrow="Hakkımızda"
            title="Beyran nedir?"
            subtitle={aboutSubtitle}
            subtitleClassName={cn(
              "mt-5 max-w-none leading-[1.72] tracking-normal sm:mt-6",
              "text-[0.9375rem] sm:text-[1.02rem] sm:leading-[1.78] lg:text-[1.035rem] lg:leading-[1.76]",
            )}
          />

          <figure
            className={cn(
              "flex w-full justify-center lg:justify-end lg:pt-1",
            )}
          >
            <div
              className={cn(
                "inline-block overflow-hidden rounded-2xl",
                "bg-[#141110] p-1 sm:p-1.5",
                "shadow-[0_14px_36px_-14px_rgba(0,0,0,0.52)] ring-1 ring-white/[0.08]",
              )}
            >
              <Image
                src={aboutImageSrc}
                alt={aboutImageAlt}
                width={800}
                height={1000}
                sizes="(max-width:640px) 296px, (max-width:1024px) 312px, 352px"
                className={cn(
                  "block h-auto w-[min(100%,296px)] rounded-xl sm:w-[312px] lg:w-[328px] xl:w-[352px]",
                  "object-contain object-center",
                )}
                priority={false}
              />
            </div>
          </figure>
        </div>
      </Container>
    </section>
  );
}
