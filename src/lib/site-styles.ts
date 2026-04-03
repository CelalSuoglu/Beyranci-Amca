/**
 * Tüm sayfa bölümlerinde tutarlı boşluk, kaydırma ve kenarlık.
 */
export const section = {
  scroll: "scroll-mt-[4.75rem] sm:scroll-mt-[5rem]",
  padY: "py-16 sm:py-20 lg:py-28",
  divider: "border-t border-white/[0.06]",
} as const;

export const card = {
  base: "rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[var(--surface)] to-[#14100e] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.04] transition-[border-color,box-shadow] duration-300 hover:border-[#d4af37]/22 hover:shadow-[0_20px_48px_-16px_rgba(0,0,0,0.55)]",
  pad: "p-6 sm:p-7",
} as const;
