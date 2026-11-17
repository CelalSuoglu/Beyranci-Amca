import { site, siteUrl } from "@/lib/site";

/** LocalBusiness / Restaurant schema for Google local search */
export function RestaurantJsonLd() {
  // Kapalı günler listeye girmez (schema.org: listede olmayan gün kapalı sayılır)
  const openingHoursSpecification = site.hours.weekly
    ?.filter((row) => row.hours.includes("–"))
    .map((row) => {
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
      opens: opens?.replace(".", ":") ?? "11:00",
      closes: closes?.replace(".", ":") ?? "22:00",
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
    geo: {
      "@type": "GeoCoordinates",
      latitude: 36.9818403,
      longitude: 30.6058462,
    },
    hasMap: site.googleMapsOpenUrl,
    sameAs: [site.instagramUrl.split("?")[0], site.googleMapsOpenUrl, site.appleMapsOpenUrl],
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
