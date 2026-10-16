"use client";

import { useState } from "react";
import { FAQS } from "@/lib/faq-data";

// FAQ copy lives in lib/faq-data.ts so the FAQPage JSON-LD in app/layout.tsx
// stays in sync with what this accordion renders.

export default function FAQSection() {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set([0]));

  const toggle = (i: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <section
      id="faq"
      className="w-full scroll-mt-24 bg-[#F5F7FA] px-4 py-14 sm:px-10 sm:py-16 lg:px-12 lg:py-20"
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-[30px] font-black tracking-tight text-navy sm:text-[40px]">
          Frequently Asked Questions
        </h2>

        <div className="mt-10 divide-y divide-border border-y border-border">
          {FAQS.map((item, i) => {
            const open = openSet.has(i);
            return (
              <div key={item.q} className="py-5">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between gap-4 text-left text-[15px] font-bold text-navy"
                >
                  <span>{item.q}</span>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold text-gold transition-transform duration-300 ${
                      open ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pt-3 text-[14px] leading-relaxed text-muted whitespace-pre-line">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}