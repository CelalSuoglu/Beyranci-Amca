import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { LEGAL_DOCS } from "@/lib/legal/documents";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/siparis`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/qr-menu`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/yasal`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...LEGAL_DOCS.map((d) => ({
      url: `${siteUrl}/${d.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
  ];
}
