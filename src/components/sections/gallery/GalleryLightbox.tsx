"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { GalleryTile } from "@/lib/gallery-data";

type Props = {
  items: readonly GalleryTile[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
};

export function GalleryLightbox({
  items,
  index,
  onClose,
  onIndexChange,
}: Props) {
  const [entered, setEntered] = useState(false);
  const open = index !== null && index >= 0 && index < items.length;
  const current = open ? items[index] : null;
  const n = items.length;
  const canNav = n > 1;

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const goPrev = useCallback(() => {
    if (index === null || n < 2) return;
    onIndexChange((index - 1 + n) % n);
  }, [index, n, onIndexChange]);

  const goNext = useCallback(() => {
    if (index === null || n < 2) return;
    onIndexChange((index + 1) % n);
  }, [index, n, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, goPrev, goNext]);

  if (!open || !current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Galeri görseli — büyük önizleme"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6",
        "transition-opacity duration-300 ease-out",
        entered ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div
        className="absolute inset-0 bg-[#050403]/93 backdrop-blur-[3px] transition-opacity duration-300"
        aria-hidden
        onClick={onClose}
      />

      <div
        className={cn(
          "relative z-[1] w-full max-w-[min(96vw,1200px)]",
          "transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
          entered ? "scale-100 opacity-100" : "scale-[0.97] opacity-0",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Kapat"
          onClick={onClose}
          className={cn(
            "absolute -right-1 -top-2 z-[3] flex h-11 w-11 items-center justify-center rounded-full sm:-right-2 sm:-top-2",
            "border border-white/15 bg-black/60 text-[#faf6ef] shadow-lg backdrop-blur-sm",
            "transition hover:border-[#d4af37]/35 hover:bg-black/75 hover:text-[#fde68a]",
            "sm:h-12 sm:w-12",
          )}
        >
          <span className="sr-only">Kapat</span>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {canNav ? (
          <>
            <button
              type="button"
              aria-label="Önceki görsel"
              onClick={goPrev}
              className={cn(
                "absolute left-0 top-1/2 z-[3] flex h-11 w-11 -translate-x-1 -translate-y-1/2 items-center justify-center rounded-full sm:h-12 sm:w-12 sm:-translate-x-2",
                "border border-white/12 bg-black/50 text-[#faf6ef] shadow-md backdrop-blur-sm",
                "transition hover:border-[#d4af37]/30 hover:bg-black/70 hover:text-[#fde68a]",
              )}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Sonraki görsel"
              onClick={goNext}
              className={cn(
                "absolute right-0 top-1/2 z-[3] flex h-11 w-11 translate-x-1 -translate-y-1/2 items-center justify-center rounded-full sm:h-12 sm:w-12 sm:translate-x-2",
                "border border-white/12 bg-black/50 text-[#faf6ef] shadow-md backdrop-blur-sm",
                "transition hover:border-[#d4af37]/30 hover:bg-black/70 hover:text-[#fde68a]",
              )}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#0a0807]/95 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.75)] ring-1 ring-[#d4af37]/15">
          <div className="flex max-h-[min(78vh,85dvh)] w-full items-center justify-center p-3 sm:p-5">
            <Image
              key={current.id}
              src={current.src}
              alt={current.alt}
              width={2000}
              height={1500}
              sizes="(max-width:768px) 96vw, min(1200px, 96vw)"
              className="h-auto max-h-[min(78vh,85dvh)] w-auto max-w-full object-contain"
              priority
            />
          </div>
          <p className="border-t border-white/[0.08] px-4 py-3 text-center font-[family-name:var(--font-display)] text-sm font-semibold text-[#faf6ef] sm:text-base">
            {current.caption}
          </p>
        </div>
      </div>
    </div>
  );
}
