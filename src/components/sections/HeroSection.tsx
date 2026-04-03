import Image from "next/image";
import { brand } from "@/lib/brand";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const heroFoodImage =
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2000&q=80";

export function HeroSection() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pt-[4.25rem] pb-14 sm:pb-16"
    >
      <div className="absolute inset-0">
        <Image
          src={heroFoodImage}
          alt="Sıcak mutfakta pişen yemekler ve restoran atmosferi"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#1a0c08] via-[#2a120c]/92 to-[#3d1810]/55"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/85 via-[#3d1810]/65 to-[#2a120c]/40"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(212,175,55,0.08),transparent_50%)]"
          aria-hidden
        />
      </div>

      <Container className="relative z-10 flex w-full max-w-3xl flex-col items-center py-10 text-center sm:py-14 lg:py-16">
        <div className="mb-7 shrink-0 sm:mb-9">
          <div
            className={cn(
              "relative mx-auto w-[120px] max-w-[min(100%,180px)] sm:w-[140px] lg:w-[160px]",
              "rounded-2xl border border-[#d4af37]/25 bg-[#0c0a09]/75 p-2.5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.08] backdrop-blur-sm sm:p-3",
            )}
          >
            <Image
              src="/beyranci-amca.png"
              alt={brand.logoAlt}
              width={180}
              height={180}
              className="h-auto w-full object-contain object-center"
              priority
              sizes="(max-width:640px) 120px, 160px"
            />
          </div>
        </div>

        <p className="mb-5 inline-flex rounded-full border border-[#d4af37]/35 bg-black/40 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#f0d78c] backdrop-blur-sm sm:mb-6 sm:text-xs">
          Döşemealtı · Antalya
        </p>

        <h1
          id="hero-heading"
          className="font-[family-name:var(--font-display)] text-[1.95rem] font-semibold leading-[1.12] tracking-tight text-[#faf6ef] drop-shadow-[0_4px_28px_rgba(0,0,0,0.55)] sm:text-4xl sm:leading-[1.1] md:text-[2.5rem] md:leading-[1.08] lg:text-[2.85rem] lg:leading-[1.06]"
        >
          Ateşin ve lezzetin buluştuğu sofra: {site.name}
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-[1.7] text-[#ede6dc]/95 sm:mt-7 sm:text-lg sm:leading-[1.75]">
          Gaziantep sokak lezzetlerini siz değerli misafirlerimizin ayağına
          getirdik. Bu eşsiz lezzeti deneyimlemenizden büyük mutluluk duyarız.
        </p>

        <p className="mt-5 text-sm font-semibold tracking-wide text-[#d4af37] sm:mt-6 sm:text-base">
          {brand.slogan}
        </p>

        <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:mt-11 sm:flex-row sm:justify-center sm:gap-4">
          <Button
            href="#menu"
            variant="primary"
            className="min-h-[3rem] w-full justify-center sm:w-auto sm:min-w-[12rem]"
          >
            Menüyü Gör
          </Button>
          <Button
            href={site.googleMapsOpenUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            className={cn(
              "min-h-[3rem] w-full justify-center border-[#d4af37]/40 bg-black/35 text-[#faf6ef] backdrop-blur-sm sm:w-auto sm:min-w-[12rem]",
              "hover:border-[#f59e0b]/80 hover:bg-black/45 hover:text-[#fde68a]",
            )}
          >
            Beni Beyrancı Amca&apos;ya Götür
          </Button>
        </div>
      </Container>
    </section>
  );
}
