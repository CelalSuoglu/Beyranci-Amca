import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { SkipLink } from "@/components/layout/SkipLink";
import { RestaurantJsonLd } from "@/components/seo/RestaurantJsonLd";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-3X4EZ5DTFX";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const sans = DM_Sans({
  variable: "--font-sans-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/icon.png",
  },
  title: {
    default: "Beyrancı Amca | Geleneksel Beyran · Antalya Döşemealtı",
    template: "%s | Beyrancı Amca",
  },
  description:
    "Antalya Döşemealtı’nda otantik Beyran ve Anadolu lezzetleri. Beyrancı Amca — ateşten sofraya premium restoran deneyimi.",
  keywords: [
    "Beyrancı Amca",
    "beyran",
    "Beyran Antalya",
    "Döşemealtı restoran",
    "Gaziantep beyran",
    "Yeşilbayır",
    "paket sipariş",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Beyrancı Amca | Geleneksel Beyran",
    description:
      "Geleneksel Türk Beyran restoranı — Yeşilbayır, Döşemealtı / Antalya.",
    url: siteUrl,
    siteName: "Beyrancı Amca",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beyrancı Amca | Geleneksel Beyran",
    description:
      "Antalya Döşemealtı’nda otantik Beyran — Yeşilbayır.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${display.variable} ${sans.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <RestaurantJsonLd />
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
