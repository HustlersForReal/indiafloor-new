"use client";

import { useState } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";
import Logo from "./Logo";

const NAV_LINKS = [
  { label: "Home", href: "#top", active: true },
  { label: "Our Services", href: "#services", active: false },
  { label: "Our Tiers", href: "#tiers", active: false },
  { label: "Why Us", href: "#why", active: false },
  { label: "FAQs", href: "#tiers", active: false },
  { label: "Contact", href: "#contact", active: false },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-30 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-10">
        <Logo />

        <nav className="hidden items-center gap-10 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`relative pb-1 text-[15px] font-medium transition-colors ${
                link.active ? "text-navy-900" : "text-[#2b3a55] hover:text-navy-900"
              }`}
            >
              {link.label}
              {link.active && (
                <span className="absolute -bottom-1.5 left-0 h-[3px] w-full rounded-full bg-gold-500" />
              )}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
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
          className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-900 lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav
          className="absolute inset-x-0 top-full border-t border-slate-100 bg-white px-6 py-3 shadow-lg lg:hidden"
          aria-label="Mobile"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block border-b border-slate-100 py-3 text-[15px] font-medium text-[#2b3a55] last:border-none"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
