/**
 * Single source of truth for the site's SEO identity.
 *
 * Canonical domain comes from NEXT_PUBLIC_SITE_URL so a staging/preview
 * deployment can override it without a code edit. Fallback is the production
 * domain the brand uses in its own copy (IndiaFloor.com).
 */
import { FAQS } from "@/lib/faq-data";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://indiafloor.com";

export const SITE_NAME = "IndiaFloor";
export const SITE_TITLE = "IndiaFloor.com: Builder Floors, Apartments, Penthouses";
export const SITE_DESCRIPTION =
  "IndiaFloor.com is your single destination for all floor-related needs, from buying, selling and renting to approvals, liaisoning and legal support.";

/**
 * Primary service area. This is the market the site actually serves (the
 * forms' city list + the hero's "Delhi NCR Active" chip), so it is the only
 * geo signal we assert. No street address is invented.
 */
export const SERVICE_AREAS = [
  "Noida",
  "Delhi",
  "Greater Noida",
  "Faridabad",
  "Greater Faridabad",
  "Gurugram",
  "Ghaziabad",
];

/* ------------------------------------------------------- JSON-LD builders */

/** The organization behind the site. No address/phone asserted — the site
 *  publishes none, and fabricating them would be a rich-result violation. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: "IndiaFloor.com",
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/icon-512.png`,
    description: SITE_DESCRIPTION,
    areaServed: SERVICE_AREAS.map((name) => ({ "@type": "City", name })),
    knowsLanguage: "en",
  };
}

/** Site-level search action + publisher link. */
export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** The single indexable page. */
export function webPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: `${SITE_URL}/`,
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
  };
}

/**
 * FAQ rich result. Built from the same FAQS array the visible accordion
 * renders (lib/faq-data), so markup and on-page copy cannot diverge.
 * Answers keep their real line breaks — the accordion renders them too.
 */
export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        // schema.org expects plain text; collapse the deliberate blank lines
        text: item.a.replace(/\n{2,}/g, "\n").trim(),
      },
    })),
  };
}

/** Every JSON-LD block the page injects, in one array. */
export function allJsonLd() {
  return [
    organizationJsonLd(),
    webSiteJsonLd(),
    webPageJsonLd(),
    faqJsonLd(),
  ];
}
