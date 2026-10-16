import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { ReferralWelcome } from "@/components/ReferralWelcome";
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
  title: "IndiaFloor.com: The Door to Every Indian Floor",
  description:
    "IndiaFloor.com is your single destination for all floor-related needs, from buying, selling and renting to approvals, liaisoning and legal support.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* useSearchParams needs Suspense or the build fails */}
        <Suspense fallback={null}>
          <ReferralWelcome />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
