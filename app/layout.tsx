import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { ReferralWelcome } from "@/components/ReferralWelcome";
import Analytics from "@/components/Analytics";
import { allJsonLd, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    // Core formats (SEO.txt §9)
    "independent floor",
    "builder floor",
    "duplex floor",
    "triplex floor",
    "penthouse floor",
    // Transaction intent
    "buy floor",
    "sell floor",
    "rent floor",
    // Configurations
    "2 BHK floor",
    "3 BHK floor",
    "4 BHK floor",
    // Geo — Delhi-NCR markets served
    "floor property Delhi NCR",
    "floor for sale Noida",
    "rent floor Greater Noida",
    "builder floor Gurugram",
    "independent floor Faridabad",
    "floor Ghaziabad",
    "property discovery India",
    "liaisoning services Delhi",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/`,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_IN",
    alternateLocale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IndiaFloor.com — The Door to Every Indian Floor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1f45",
  width: "device-width",
  initialScale: 1,
};

const JSON_LD = allJsonLd();

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Structured data: RealEstateAgent / WebSite / WebPage / FAQPage.
            Serialised as one application/ld+json block; values come from
            lib/seo.ts which shares the FAQ copy with the visible accordion. */}
        <script
          type="application/ld+json"
          // JSON-LD must be raw JSON, not React-escaped text.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {/* useSearchParams needs Suspense or the build fails */}
        <Suspense fallback={null}>
          <ReferralWelcome />
        </Suspense>
        {children}
        {/* GA4 uses useSearchParams, which requires a Suspense boundary. */}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
