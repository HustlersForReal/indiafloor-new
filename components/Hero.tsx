"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Building2, Handshake, Home, KeyRound } from "lucide-react";
import LeadForm from "./LeadForm";
import { REQUEST_TAB_EVENT } from "./BuyerPreferencesSection";
import { SELLER_MODE_EVENT } from "./SellerSection";

const ROLES = [
  {
    icon: Home,
    label: "Buyer",
    sub: "Find Your Dream Floor",
    href: "#registration-section",
    go: () =>
      window.dispatchEvent(
        new CustomEvent(REQUEST_TAB_EVENT, { detail: { tab: "buy" } }),
      ),
  },
  {
    icon: KeyRound,
    label: "Tenant",
    sub: "Hassle-Free Leasing",
    href: "#registration-section",
    go: () =>
      window.dispatchEvent(
        new CustomEvent(REQUEST_TAB_EVENT, { detail: { tab: "rent" } }),
      ),
  },
  {
    icon: Handshake,
    label: "Property Owner",
    sub: "Sell At The Right Value",
    href: "#seller-section",
    go: () =>
      window.dispatchEvent(
        new CustomEvent(SELLER_MODE_EVENT, { detail: { tab: "seller" } }),
      ),
  },
  {
    icon: Building2,
    label: "Builder",
    sub: "Showcase Your Inventory",
    href: "#seller-section",
    go: () =>
      window.dispatchEvent(
        new CustomEvent(SELLER_MODE_EVENT, { detail: { tab: "builder" } }),
      ),
  },
];

export default function Hero() {
  const [refScale, setRefScale] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      // grow slightly as user scrolls, capped so it never gets absurd
      const next = Math.min(1 + y / 600, 1.6);
      setRefScale(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="top" className="relative min-h-[50svh] overflow-hidden bg-navy-950">
      {/* real backdrop photo + navy legibility overlays */}
      <Image
        src="/bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/55 to-navy-950/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-transparent"
      />

      <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-10 lg:py-10">
        <div>
          <span className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm sm:mx-0">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            DELHI-NCR ACTIVE
          </span>
          <h1 className="mt-4 text-center text-[48px] leading-[1.08] font-extrabold tracking-tight text-white sm:mt-4 sm:text-left sm:text-[46px]">
           Builder Floors, Apartments, Penthouses,
            <br />
            <span className="text-[#F0A41C]">Commercial Floors & More.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-[520px] text-center text-[14.5px] leading-relaxed font-medium text-white/85 sm:mx-0 sm:text-left">
            <span className="font-bold text-white">A White-Glove Service</span> For Buying, Selling, Renting Property Floors With End-to-End Property Services &amp; Liaisoning
            Assistance.
            <br />
            <span className="mt-1.5 block text-[15px] font-semibold text-[#F0A41C]">
              Reach Us To Find A Floor, That You Will Adore.
            </span>
          </p>

          <div
            id="services"
            className="mt-7 grid max-w-[760px] scroll-mt-28 grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-0"
          >
            {ROLES.map(({ icon: Icon, label, sub, href, go }, i) => (
              <a
                key={label}
                href={href}
                onClick={go}
                className={`group block rounded-xl p-2 text-center transition-colors hover:bg-white/10 sm:text-left sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-white/20 ${
                  i > 0 ? "sm:pl-5" : ""
                } ${i < ROLES.length - 1 ? "sm:pr-5" : ""}`}
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/40 transition-all group-hover:scale-110 group-hover:border-[#F0A41C] sm:mx-0">
                  <Icon className="h-5 w-5 text-white" strokeWidth={1.6} />
                </span>
                <p className="mt-2.5 text-[15px] font-bold text-white">{label}</p>
                <p className="mt-0.5 text-[11px] whitespace-nowrap text-white/70">{sub}</p>
              </a>
            ))}
          </div>
        </div>

        <div>
          <a
            href="#referral-section"
            style={{ transform: `scale(${refScale})`, transformOrigin: "center", transition: "transform 0.15s ease-out" }}
            className="mb-6 block text-center text-[20px] font-extrabold tracking-wide text-[#F0A41C] underline decoration-white decoration-2 underline-offset-4 sm:hidden"
            onClick={() => {
              const el = document.getElementById("referral-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Refer &amp; Earn
          </a>
          <LeadForm />
        </div>
      </div>

      <a
        href="#referral-section"
        onClick={() => {
          const el = document.getElementById("referral-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        style={{ transform: `translateX(-50%) scale(${refScale})`, transformOrigin: "bottom center", transition: "transform 0.15s ease-out" }}
        className="absolute bottom-4 left-1/2 z-20 hidden whitespace-nowrap text-[20px] font-extrabold tracking-wide text-[#F0A41C] underline decoration-white decoration-2 underline-offset-4 sm:block"
      >
        Refer &amp; Earn
      </a>
    </section>
  );
}
