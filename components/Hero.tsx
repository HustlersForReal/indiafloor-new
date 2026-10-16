import Image from "next/image";
import { Building2, Handshake, Home, KeyRound } from "lucide-react";
import LeadForm from "./LeadForm";

const ROLES = [
  { icon: Home, label: "Buyer", sub: "Find Your Dream Floor" },
  { icon: KeyRound, label: "Tenant", sub: "Hassle-Free Leasing" },
  { icon: Handshake, label: "Property Owner", sub: "Sell At The Right Value" },
  { icon: Building2, label: "Builder", sub: "Showcase Your Inventory" },
];

export default function Hero() {
  return (
    <section id="top" className="relative min-h-[50svh] overflow-hidden bg-navy-950">
      {/* real backdrop photo + navy legibility overlays */}
      <Image
        src="/bg.png"
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
          <h1 className="mt-1 text-center text-[48px] leading-[1.08] font-extrabold tracking-tight text-white sm:mt-4 sm:text-left sm:text-[46px]">
            Your Floor. Our Expertise.
            <br />
            <span className="text-gold-500">Your Next Step.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-[520px] text-center text-[14.5px] leading-relaxed font-medium text-white/85 sm:mx-0 sm:text-left">
            <span className="font-bold text-white">A White Glove</span> for Buying,
            Selling, Renting With End-To-End Property Services &amp; Liaisoning
            Assistance.
            <br />
            <span className="mt-1.5 block text-[15px] font-semibold text-gold-500">
              Reach Us To Find A Floor, That You Will Adore.
            </span>
          </p>

          <div
            id="services"
            className="mt-7 grid max-w-[760px] scroll-mt-28 grid-cols-2 gap-6 sm:flex sm:flex-wrap sm:items-stretch sm:justify-start sm:gap-y-5 sm:divide-x sm:divide-white/20 lg:flex-nowrap"
          >
            {ROLES.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="text-center sm:pr-5 sm:pl-5 sm:text-left sm:first:pl-0 sm:last:pr-0">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/40 sm:mx-0">
                  <Icon className="h-5 w-5 text-white" strokeWidth={1.6} />
                </span>
                <p className="mt-2.5 text-[15px] font-bold text-white">{label}</p>
                <p className="mt-0.5 text-[11px] whitespace-nowrap text-white/70">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        <LeadForm />
      </div>
    </section>
  );
}
