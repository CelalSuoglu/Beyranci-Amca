"use client";

import { useState } from "react";
import type { GalleryTile } from "@/lib/gallery-data";
import { cn } from "@/lib/utils";
import { GalleryCarouselCard } from "./GalleryCarouselCard";
import { GalleryLightbox } from "./GalleryLightbox";

type Props = {
  items: readonly GalleryTile[];
};

export function GalleryCarouselStrip({ items }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div
        role="region"
        aria-label="Galeri — yatay kaydırın; görsele tıklayarak büyütebilirsiniz"
        className={cn(
          "gallery-carousel-scroll overflow-x-auto overflow-y-hidden scroll-smooth overscroll-x-contain",
          "touch-pan-x pb-2 sm:pb-3",
          "snap-x snap-mandatory",
          "scroll-pl-5 scroll-pr-[clamp(2.5rem,12vw,5rem)] sm:scroll-pl-6 sm:scroll-pr-[clamp(3rem,11vw,5.5rem)]",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          "motion-reduce:snap-none motion-reduce:scroll-auto",
        )}
        tabIndex={0}
      >
        <ul
          className={cn(
            "flex w-max gap-3.5 px-5 sm:gap-4 sm:px-6 lg:gap-4 lg:pl-8 lg:pr-14",
            "motion-reduce:snap-none",
          )}
        >
          {items.map((item, i) => (
            <GalleryCarouselCard
              key={item.id}
              src={item.src}
              alt={item.alt}
              caption={item.caption}
              imageFit={item.imageFit}
              objectPositionClass={item.objectPositionClass}
              onOpen={() => setLightboxIndex(i)}
            />
          ))}
        </ul>
      </div>

      <GalleryLightbox
        items={items}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
