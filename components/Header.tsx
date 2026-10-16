"use client";

import { useState } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";
import Logo from "./Logo";
import { REQUEST_TAB_EVENT } from "./BuyerPreferencesSection";
import { SELLER_MODE_EVENT } from "./SellerSection";

/**
 * Same nav the old site ships: Buyer / Tenant / Property Owner / Builder plus a
 * hover "Partner" dropdown. Each link scrolls to its form and switches the
 * right tab/mode before landing. (This site has no dedicated partner section
 * yet, so both partner links land on the footer contact block.)
 */
const NAV_LINKS = [
  {
    label: "Buyer",
    href: "#registration-section",
    go: () =>
      window.dispatchEvent(
        new CustomEvent(REQUEST_TAB_EVENT, { detail: { tab: "buy" } }),
      ),
  },
  {
    label: "Tenant",
    href: "#registration-section",
    go: () =>
      window.dispatchEvent(
        new CustomEvent(REQUEST_TAB_EVENT, { detail: { tab: "rent" } }),
      ),
  },
  {
    label: "Property Owner",
    href: "#seller-section",
    go: () =>
      window.dispatchEvent(
        new CustomEvent(SELLER_MODE_EVENT, { detail: { tab: "seller" } }),
      ),
  },
  {
    label: "Builder",
    href: "#seller-section",
    go: () =>
      window.dispatchEvent(
        new CustomEvent(SELLER_MODE_EVENT, { detail: { tab: "builder" } }),
      ),
  },
];

const PARTNER_LINKS = [
  { label: "Professional Partner", href: "#contact" },
  { label: "Referral Partner", href: "#contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-30 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-10">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={link.go}
              className="text-[15px] font-medium text-[#2b3a55] transition-colors hover:text-navy-900"
            >
              {link.label}
            </a>
          ))}

          {/* Partner — hover dropdown (mirrors the old site) */}
          <div className="group relative">
            <button
              type="button"
              aria-haspopup="true"
              className="flex cursor-pointer items-center gap-1 text-[15px] font-medium text-[#2b3a55] transition-colors group-hover:text-navy-900"
            >
              Partner
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3 transition-transform group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* pt-1 bridges the gap so the menu stays open while moving
                the cursor from the trigger down into it */}
            <div className="invisible absolute top-full left-0 z-[70] pt-1 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              <div className="w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-[0_12px_36px_rgba(10,26,51,0.18)]">
                {PARTNER_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block px-4 py-2.5 text-[13px] font-medium text-[#2b3a55] transition-colors hover:bg-slate-50 hover:text-navy-900"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="hidden shrink-0 items-center gap-2.5 md:flex">
          <ShieldCheck className="h-9 w-9 text-navy-900" strokeWidth={1.5} />
          <span className="leading-tight">
            <span className="block text-[14px] font-bold text-navy-900">100% Private</span>
            <span className="block text-[14px] text-navy-900">100% Confidential</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-navy-900 lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav
          className="absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-100 bg-white px-6 py-3 shadow-lg lg:hidden"
          aria-label="Mobile"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => {
                link.go();
                setOpen(false);
              }}
              className="block border-b border-slate-100 py-3 text-[15px] font-medium text-[#2b3a55]"
            >
              {link.label}
            </a>
          ))}

          <span className="block pt-4 pb-1 text-[11px] font-bold tracking-[0.12em] text-slate-400 uppercase">
            Partner
          </span>
          {PARTNER_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block border-b border-slate-100 py-3 pl-3 text-[14px] font-medium text-[#2b3a55]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}

      {/* Indian tricolour strip — 8px saffron + 28px association row + 8px green.
          Layers pinned to z-0 so the Partner dropdown (z-[70]) stays above. */}
      <div className="relative z-0 bg-white">
        <div className="relative z-0 h-[8px] w-full bg-[#FF9933]" />
        <div className="relative z-0 mx-auto flex h-[28px] w-full max-w-[1400px] items-center justify-center gap-2 px-4 text-[12px] text-slate-500 sm:px-10">
          In Association With
          <strong className="text-[13px] font-bold text-navy-900">TheBuyer.in</strong>
        </div>
        <div className="relative z-0 h-[8px] w-full bg-[#138808]" />
      </div>
    </header>
  );
}
