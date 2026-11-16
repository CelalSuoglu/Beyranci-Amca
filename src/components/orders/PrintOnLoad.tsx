"use client";

import { useEffect } from "react";

/** Fiş sayfası açılınca yazdırma penceresini açar */
export function PrintOnLoad() {
  useEffect(() => {
    const t = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-full bg-black px-4 py-2 font-semibold text-white"
      >
        Yazdır
      </button>
      <button
        type="button"
        onClick={() => window.close()}
        className="rounded-full border border-neutral-300 px-4 py-2"
      >
        Kapat
      </button>
    </>
  );
}
