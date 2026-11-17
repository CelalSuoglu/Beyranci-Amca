"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "beyranci:maps-consent:v1";

/**
 * Google Haritalar iframe'i üçüncü taraf çerezleri bırakır; bu yüzden
 * ziyaretçi "Haritayı göster" demeden yüklenmez (KVKK / çerez onayı).
 */
export function MapEmbed({ src, title }: { src: string; title: string }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- tarayıcı deposundan bir kez okunur
      if (window.localStorage.getItem(STORAGE_KEY) === "granted") setAllowed(true);
    } catch {
      // depolama yoksa her seferinde sorulur
    }
  }, []);

  function allow(remember: boolean) {
    if (remember) {
      try {
        window.localStorage.setItem(STORAGE_KEY, "granted");
      } catch {
        // yoksay
      }
    }
    setAllowed(true);
  }

  const box = "aspect-[4/3] min-h-[260px] w-full border-0 sm:aspect-[16/10] sm:min-h-[320px] lg:min-h-[380px]";

  if (allowed) {
    return (
      <iframe
        title={title}
        src={src}
        className={box}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    );
  }

  return (
    <div className={`${box} flex flex-col items-center justify-center gap-4 bg-[#141110] p-6 text-center`}>
      <p className="max-w-md text-sm leading-relaxed text-[var(--foreground-muted)]">
        Harita Google tarafından sağlanır. Gösterildiğinde Google, cihazınıza çerez yerleştirebilir ve
        IP adresiniz gibi verileri işleyebilir. Ayrıntılar:{" "}
        <Link href="/cerez-politikasi" className="text-[#fdba74] underline underline-offset-2">
          Çerez Politikası
        </Link>
        .
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => allow(false)}
          className="min-h-11 rounded-full bg-[#c2410c] px-5 text-sm font-semibold text-white hover:bg-[#9a3412]"
        >
          Haritayı göster
        </button>
        <button
          type="button"
          onClick={() => allow(true)}
          className="min-h-11 rounded-full border border-white/20 px-5 text-sm font-semibold hover:border-white/35"
        >
          Her zaman göster
        </button>
      </div>
    </div>
  );
}
