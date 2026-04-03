import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  caption: string;
  className?: string;
  imageClassName?: string;
  /** poster: tam afiş; logo: marka görseli */
  variant?: "poster" | "logo";
};

export function GalleryFigure({
  src,
  alt,
  caption,
  className,
  imageClassName,
  variant = "poster",
}: Props) {
  const isLogo = variant === "logo";
  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a0807]",
        "shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] ring-1 ring-[#d4af37]/12 transition duration-300",
        "hover:border-[#d4af37]/22 hover:shadow-[0_28px_56px_-20px_rgba(0,0,0,0.65)]",
        className,
      )}
    >
      <div className="relative h-full min-h-[220px] w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 45vw"
          className={cn(
            "transition duration-700 ease-out will-change-transform group-hover:scale-[1.03] group-hover:brightness-[1.06]",
            isLogo
              ? "object-contain object-center p-8 sm:p-10"
              : "object-contain object-center p-3 sm:p-4",
            imageClassName,
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-0 transition duration-500",
            isLogo
              ? "bg-gradient-to-t from-[#1a0c08]/85 via-transparent to-transparent"
              : "bg-gradient-to-t from-[#1a0c08]/88 via-[#1a0c08]/15 to-transparent opacity-95 group-hover:opacity-100",
          )}
          aria-hidden
        />
        <figcaption className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 pt-10 sm:px-5 sm:pb-5 sm:pt-12">
          <p className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-[#faf6ef] drop-shadow-md sm:text-lg">
            {caption}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-[#d4af37]/85">
            Beyrancı Amca
          </p>
        </figcaption>
      </div>
    </figure>
  );
}
