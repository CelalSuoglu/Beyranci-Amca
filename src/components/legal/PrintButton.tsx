"use client";

export function PrintButton({ label = "Yazdır / PDF olarak kaydet" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex min-h-10 items-center rounded-full border border-white/15 px-4 text-sm font-medium hover:border-[#d4af37]/45 print:hidden"
    >
      {label}
    </button>
  );
}
