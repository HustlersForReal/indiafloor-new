"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "What is IndiaFloor?",
    a: "IndiaFloor is a floor-property discovery platform that combines inventory discovery with personalised assistance to help customers find suitable properties for buying or renting.",
  },
  {
    q: "Which property categories are covered?",
    a: "Depending on available inventory, IndiaFloor may cover residential floors, farmhouse floors, penthouses, commercial floors, industrial floors, institutional floors and other eligible floor-based properties.",
  },
  {
    q: "Are duplexes and triplexes separate property categories?",
    a: "They are configurations. A suitable property may be single-level, duplex, triplex or another configuration, depending on its structure and permitted use.",
  },
  {
    q: "How do Silver, Gold and Diamond work?",
    a: "They classify properties according to asking sale price or monthly rental value, not service quality.\n\nSale:\nSilver: Below ₹2 crore.\nGold: ₹2 crore to below ₹10 crore.\nDiamond: ₹10 crore and above.\n\nRent:\nSilver: Below ₹2 lakh per month.\nGold: ₹2 lakh to below ₹10 lakh per month.\nDiamond: ₹10 lakh per month and above.",
  },
  {
    q: "Do all tiers receive the same service?",
    a: "Yes. Silver, Gold and Diamond are value classifications, not service packages.",
  },
  {
    q: "Do buyers pay IndiaFloor anything?",
    a: "No. Buyers pay IndiaFloor nothing for its defined services. IndiaFloor does not charge buyers brokerage, service charges or a success fee.",
  },
  {
    q: "Do tenants pay IndiaFloor anything?",
    a: "No. Tenants pay IndiaFloor nothing for its defined services. IndiaFloor does not charge tenants brokerage, service charges or a success fee.",
  },
  {
    q: "How does IndiaFloor earn revenue?",
    a: "IndiaFloor earns through agreed commercial arrangements with participating property providers. These may include commissions on qualifying transactions or other separately agreed services.",
  },
  {
    q: "Is the proposed 1% sale commission fixed for everyone?",
    a: "No. It is a proposed arrangement for participating builders and sellers. The commission basis, payment trigger and other conditions must be agreed in writing.",
  },
  {
    q: "How are rental commissions decided?",
    a: "Rental commercial terms are agreed separately in writing before engagement.",
  },
  {
    q: "What happens after I submit a requirement?",
    a: "IndiaFloor reviews the information provided and helps identify relevant options from available inventory. If a suitable property is available, the team may coordinate a viewing or meeting, subject to confirmation.",
  },
  {
    q: "Does IndiaFloor guarantee that I will find a property?",
    a: "No. Availability and transaction completion depend on inventory, customer requirements and the decisions of the parties involved.",
  },
  {
    q: "Are properties legally verified by IndiaFloor?",
    a: "Do not assume that every property has undergone comprehensive legal verification. Customers should independently verify ownership, title, approvals, permitted use and transaction documents as appropriate before committing.",
  },
  {
    q: "Can I list my property?",
    a: "Builders, sellers, owners and landlords can submit eligible property details for consideration. Marketing is subject to appropriate authorisation and agreed terms.",
  },
  {
    q: "Does IndiaFloor list every property in India?",
    a: "No. IndiaFloor works with inventory onboarded through its process. Availability depends on location, budget and current inventory.",
  },
  {
    q: "Is IndiaFloor available nationwide?",
    a: "IndiaFloor has a national vision, with inventory and local coordination introduced city by city. Please confirm availability in your preferred location.",
  },
  {
    q: "Does the zero-fee promise cover government or third-party charges?",
    a: "No. The promise covers IndiaFloor's own defined services. Government duties, registration expenses and separately payable third-party costs remain subject to applicable law and the relevant service arrangements.",
  },
  {
    q: "Can I contact IndiaFloor for another property requirement?",
    a: "You may contact us to discuss your requirement. Assistance depends on the nature of the request, available inventory, service scope and any applicable agreement.",
  },
];

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