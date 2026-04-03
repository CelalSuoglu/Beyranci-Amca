import { galleryFoodAndBrand } from "@/lib/gallery-data";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { section, card } from "@/lib/site-styles";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InstagramIcon } from "@/components/icons/SocialIcons";
import { GalleryCarouselStrip } from "./GalleryCarouselStrip";

export function GallerySection() {
  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className={cn(
        section.scroll,
        section.padY,
        section.divider,
        "bg-gradient-to-b from-[var(--surface)] via-[#141110] to-[var(--background)]",
      )}
    >
      <Container>
        <SectionHeading
          titleId="gallery-heading"
          eyebrow="Soframızdan"
          title="Galeri"
        />

        <div
          className={cn(
            "mt-8 sm:mt-10",
            "-mx-5 sm:-mx-6 lg:-mx-8",
          )}
        >
          <GalleryCarouselStrip items={galleryFoodAndBrand} />
        </div>

        <a
          href={site.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            card.base,
            "group mt-7 flex flex-col items-stretch gap-4 p-6 sm:mt-9 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-8",
            "border-white/[0.09] bg-gradient-to-br from-[#2a1510]/92 via-[#1a0f0c] to-[#0c0a09]",
            "shadow-[0_20px_48px_-18px_rgba(0,0,0,0.55)] transition duration-500",
            "hover:-translate-y-0.5 hover:border-[#d4af37]/28 hover:shadow-[0_28px_56px_-16px_rgba(0,0,0,0.6)]",
          )}
        >
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white shadow-lg transition duration-500 group-hover:scale-[1.02]">
              <InstagramIcon className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]/90">
                SOSYAL MEDYA
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--foreground)] sm:text-2xl">
                Anlık paylaşımlar &amp; hikayeler
              </p>
            </div>
          </div>
          <span className="inline-flex min-h-[44px] shrink-0 items-center justify-center self-stretch rounded-full border border-[#d4af37]/35 bg-white/5 px-6 py-3 text-sm font-medium text-[#fde68a] transition duration-300 group-hover:border-[#fde68a]/45 group-hover:bg-white/10 sm:self-auto">
            {site.instagramHandle} →
          </span>
        </a>
      </Container>
    </section>
  );
}
