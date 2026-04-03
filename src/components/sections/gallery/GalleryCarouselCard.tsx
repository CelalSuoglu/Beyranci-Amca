import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  caption: string;
  imageFit: "cover" | "contain";
  objectPositionClass?: string;
  /** Tıklanınca lightbox aç (yalnızca Galeri şeridi) */
  onOpen?: () => void;
};

/**
 * Galeri carousel kartı — kompakt yükseklik, tam görsel (contain), yatay snap ile uyumlu.
 */
export function GalleryCarouselCard({
  src,
  alt,
  caption,
  imageFit,
  objectPositionClass = "object-center",
  onOpen,
}: Props) {
  const isContain = imageFit === "contain";
  const interactive = Boolean(onOpen);

  const figure = (
    <figure
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a0807] text-left",
        "shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] ring-1 ring-[#d4af37]/10",
        "transition duration-300",
        interactive &&
          "cursor-pointer hover:border-[#d4af37]/28 hover:shadow-[0_18px_40px_-14px_rgba(0,0,0,0.58)]",
        !interactive &&
          "hover:border-[#d4af37]/24 hover:shadow-[0_18px_40px_-14px_rgba(0,0,0,0.58)]",
      )}
    >
      <div
        className={cn(
          "relative w-full shrink-0 overflow-hidden bg-[#0a0807]",
          "h-[148px] max-h-[168px] sm:h-[160px] sm:max-h-[176px]",
          interactive &&
            "ring-0 ring-[#d4af37]/0 transition-[box-shadow] duration-300 group-hover:shadow-[inset_0_0_0_1px_rgba(212,175,55,0.22)]",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#0a0807]/0 via-transparent to-transparent opacity-0 transition duration-300 group-hover:from-[#0a0807]/25 group-hover:opacity-100"
          aria-hidden
        />
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width:640px) min(240px,80vw), 256px"
          className={cn(
            "transition duration-500 ease-out will-change-transform",
            interactive &&
              "group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
            !interactive &&
              "group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
            imageFit === "cover" && "object-cover",
            imageFit === "contain" && "object-contain p-3 sm:p-3.5",
            !isContain && objectPositionClass,
            isContain && "object-center",
          )}
        />
        {!isContain ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[28%] bg-gradient-to-t from-[#0c0a09]/45 to-transparent opacity-90 transition duration-500 group-hover:from-[#0c0a09]/55"
            aria-hidden
          />
        ) : null}
      </div>
      <figcaption
        className={cn(
          "border-t border-white/[0.08] bg-[#0e0c0b] px-2.5 py-2 sm:px-3 sm:py-2.5",
        )}
      >
        <p className="font-[family-name:var(--font-display)] text-[0.875rem] font-semibold leading-snug tracking-tight text-[#faf6ef] sm:text-[0.9375rem]">
          {caption}
        </p>
        <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[#d4af37]/85 sm:text-[10px]">
          Beyrancı Amca
        </p>
      </figcaption>
    </figure>
  );

  return (
    <li
      className={cn(
        "gallery-carousel-card snap-start snap-always shrink-0",
        "w-[min(100%,min(240px,calc(100vw-3.25rem)))] sm:w-[248px] lg:w-[256px]",
      )}
    >
      {interactive ? (
        <button
          type="button"
          onClick={onOpen}
          className="block w-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141110]"
          aria-label={`${caption} — büyütmek için tıklayın`}
        >
          {figure}
        </button>
      ) : (
        figure
      )}
    </li>
  );
}
