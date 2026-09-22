import { site, siteUrl } from "@/lib/site";

/** LocalBusiness / Restaurant schema for Google local search */
export function RestaurantJsonLd() {
  const openingHoursSpecification = site.hours.weekly?.map((row) => {
    const [opens, closes] = row.hours.split("–").map((s) => s.trim());
    const dayMap: Record<string, string> = {
      Pazartesi: "Monday",
      Salı: "Tuesday",
      Çarşamba: "Wednesday",
      Perşembe: "Thursday",
      Cuma: "Friday",
      Cumartesi: "Saturday",
      Pazar: "Sunday",
    };
    return {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dayMap[row.day] ?? row.day,
      opens: opens?.replace(".", ":") ?? "08:30",
      closes: closes?.replace(".", ":") ?? "01:00",
    };
  });

  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${siteUrl}/#restaurant`,
    name: site.name,
    alternateName: "Beyranci Amca",
    description: site.description,
    url: siteUrl,
    telephone: site.phoneTel,
    image: `${siteUrl}/icon.png`,
    servesCuisine: ["Turkish", "Gaziantep", "Beyran"],
    priceRange: "₺₺",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Yeşilbayır, Atatürk Cd. No:72",
      addressLocality: "Döşemealtı",
      addressRegion: "Antalya",
      postalCode: "07190",
      addressCountry: "TR",
    },
    sameAs: [site.instagramUrl.split("?")[0]],
    ...(openingHoursSpecification
      ? { openingHoursSpecification }
      : {}),
    ...(site.whatsapp
      ? {
          potentialAction: {
            "@type": "OrderAction",
            target: `${siteUrl}/siparis`,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
