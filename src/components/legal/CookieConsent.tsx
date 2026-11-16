"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

const STORAGE_KEY = "beyranci:cookie-consent:v1";
export const OPEN_COOKIE_SETTINGS_EVENT = "beyranci:open-cookie-settings";

type Consent = "granted" | "denied";

function readConsent(): Consent | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/** Google Analytics çerezlerini siler (onay geri alındığında) */
function clearAnalyticsCookies() {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`];
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0]?.trim();
    if (!name || !/^_ga/.test(name)) continue;
    for (const d of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ""}`;
    }
  }
}

/**
 * KVKK çerez onayı: Google Analytics yalnızca "Kabul et" sonrası yüklenir.
 * "Reddet" ve "Kabul et" eşit ağırlıkta; tercih alt bilgideki bağlantıdan değiştirilebilir.
 */
export function CookieConsent({ gaId }: { gaId: string }) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = readConsent();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tarayıcı deposundan bir kez okunur
    setConsent(c);
    setOpen(c === null);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  function decide(value: Consent) {
    const previous = consent;
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // depolanamazsa bu oturum için geçerli
    }
    setConsent(value);
    setOpen(false);
    if (value === "denied" && previous === "granted") {
      clearAnalyticsCookies();
      // Yüklenmiş analiz kodunu durdurmak için sayfayı yenile
      window.location.reload();
    }
  }

  return (
    <>
      {consent === "granted" ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-title"
          className="no-print fixed inset-x-0 bottom-0 z-[90] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6"
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/12 bg-[#141110]/97 p-4 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7)] backdrop-blur-md sm:p-5">
            <p id="cookie-title" className="font-semibold">
              Çerez tercihiniz
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--foreground-muted)]">
              Sitenin çalışması için zorunlu çerezleri kullanıyoruz. İzin verirseniz, siteyi geliştirmek için
              Google Analytics ile anonim kullanım istatistikleri de toplarız. Ayrıntılar:{" "}
              <Link href="/cerez-politikasi" className="text-[#fdba74] underline underline-offset-2">
                Çerez Politikası
              </Link>
              .
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => decide("denied")}
                className="min-h-11 rounded-full border border-white/20 px-5 text-sm font-semibold hover:border-white/35"
              >
                Reddet
              </button>
              <button
                type="button"
                onClick={() => decide("granted")}
                className="min-h-11 rounded-full border border-white/20 px-5 text-sm font-semibold hover:border-white/35"
              >
                Kabul et
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Alt bilgideki "Çerez tercihleri" bağlantısı */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}
    >
      Çerez tercihleri
    </button>
  );
}
