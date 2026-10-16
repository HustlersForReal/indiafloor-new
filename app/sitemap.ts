import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * sitemap.xml via Next's native route handler (app/sitemap.ts).
 *
 * The site is currently a single indexable page (`/`). Anchor targets
 * (#contact, #seller-section, …) are same-page fragments, not routes, so they
 * are correctly excluded. The internal /api/referral endpoint is not a page
 * and is left out. When real route pages are added (e.g. per-city landing
 * pages), append entries here — no manual XML editing required.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: [`${SITE_URL}/bg.webp`, `${SITE_URL}/logo.webp`],
    },
  ];
}
