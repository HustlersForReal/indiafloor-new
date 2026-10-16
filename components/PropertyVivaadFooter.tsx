"use client";

/**
 * PropertyVivaadFooter — Single self-contained footer.
 *
 * No child components, no local imports. Drop-in ready for any Next.js (App Router)
 * + Tailwind project. Only peer deps: `react` and `lucide-react`.
 *
 * Everything is themed with literal hex values (no Tailwind @theme tokens needed),
 * so it renders identically on a site that defines its own palette.
 *
 * Usage:
 *   import PropertyVivaadFooter from "./PropertyVivaadFooter";
 *   <PropertyVivaadFooter />
 */

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FilePen,
  FileText,
  PhoneCall,
  Scale,
  Search,
  Shield,
  X,
} from "lucide-react";

export interface FooterBrand {
  name: string;
  url: string;
  desc: string;
  icon: ReactNode;
}

export interface QuickLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface PropertyVivaadFooterProps {
  /** Your site / brand name. */
  siteName?: string;
  /** Parent ecosystem brand. */
  parentBrand?: string;
  /** Small line under the brand, e.g. "A 31 Son Venture". */
  ventureLine?: string;
  /** Digits only, with country code and no "+", e.g. "918800505050". */
  whatsappNumber?: string;
  signupUrl?: string;
  loginUrl?: string;
  copyrightHolder?: string;
  benefits?: string[];
  brands?: FooterBrand[];
  quickLinks?: QuickLink[];
}

const DEFAULT_BENEFITS = [
  "Zero Cost Sale Deed Registration",
  "Zero Cost Property Mutation",
  "Zero Cost Electricity Mutation",
  "Zero Cost Water Mutation",
  "Zero Cost Property Valuation",
  "Zero Cost Rent Agreement",
  "Instant 10% Rent Payback",
  "Instant Referral Bonus",
  "One Stop Property Solution",
];

const DEFAULT_BRANDS: FooterBrand[] = [
  {
    name: "TitleWala",
    url: "https://titlewala.com",
    icon: <Search className="h-6 w-6" />,
    desc: "Property Title Experts",
  },
  {
    name: "DeedWala",
    url: "https://deedwala.com",
    icon: <FileText className="h-6 w-6" />,
    desc: "Property Deed Experts",
  },
  {
    name: "MutationWala",
    url: "https://mutationwala.com",
    icon: <FilePen className="h-6 w-6" />,
    desc: "Property Mutation Experts",
  },
  {
    name: "FreeholdWala",
    url: "https://freeholdwala.com",
    icon: <Shield className="h-6 w-6" />,
    desc: "Property Freehold Experts",
  },
  {
    name: "ValuationWala",
    url: "https://valuationwala.com",
    icon: <Scale className="h-6 w-6" />,
    desc: "Property Valuation Experts",
  },
];

const DEFAULT_QUICK_LINKS: QuickLink[] = [
  { label: "Submit Requirement", href: "#registration-section" },
  { label: "List Your Property", href: "#seller-section" },
  { label: "FAQs", href: "#faq" },
  { label: "PropertyBaap", href: "https://propertybaap.com", external: true },
];

const PARTNER_TYPES = [
  "Deed Writers",
  "Property Dealers",
  "Lawyers & Advocates",
  "Ex-Govt Employees",
  "Builders",
  "Architects & Engineers",
  "Real Estate Consultants",
  "Notary Public",
  "Financial Advisors",
  "Others",
];

export default function PropertyVivaadFooter({
  siteName = "India Floor",
  parentBrand = "PropertyBaap",
  ventureLine = "A 31 Son Venture",
  whatsappNumber = "918800505050",
  signupUrl = "https://propertybaap.com/referral-signup",
  loginUrl = "https://propertybaap.com/referral-login",
  copyrightHolder = "IndiaFloor.com",
  benefits = DEFAULT_BENEFITS,
  brands = DEFAULT_BRANDS,
  quickLinks = DEFAULT_QUICK_LINKS,
}: PropertyVivaadFooterProps) {
  /* ------------------------------ state ------------------------------ */
  const [selectedBrand, setSelectedBrand] = useState<FooterBrand | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    message: "",
  });
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    name: "",
    phone: "",
    type: "",
    message: "",
  });
  const [partnerTypeOpen, setPartnerTypeOpen] = useState(false);
  const partnerTypeRef = useRef<HTMLDivElement>(null);

  /* ------------------------------ effects ------------------------------ */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const syncYear = () => setYear(new Date().getFullYear());
    syncYear();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        partnerTypeRef.current &&
        !partnerTypeRef.current.contains(event.target as Node)
      ) {
        setPartnerTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  /* ------------------------------ helpers ------------------------------ */
  const openWhatsApp = (message: string) => {
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    const cleanedPhone = contactForm.phone.replace(/[\s\-()]/g, "");

    if (!contactForm.name.trim()) errors.name = "Name is required";
    else if (contactForm.name.trim().length < 2)
      errors.name = "Enter a valid name";

    if (!contactForm.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(cleanedPhone))
      errors.phone = "Enter a valid Indian phone number";

    if (!contactForm.message.trim()) errors.message = "Message is required";
    else if (contactForm.message.trim().length < 10)
      errors.message = "Please provide at least 10 characters";

    setContactErrors(errors);
    if (Object.keys(errors).length > 0) return;

    openWhatsApp(
      `Hello ${siteName}, I want to get in touch.\n\nName: ${contactForm.name}\nPhone: ${contactForm.phone}\nMessage: ${contactForm.message}`,
    );
  };

  const handlePartnerSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanedPhone = partnerForm.phone.replace(/[\s\-()]/g, "");
    if (!partnerForm.type || !/^(\+91|91|0)?[6-9]\d{9}$/.test(cleanedPhone))
      return;

    openWhatsApp(
      `Hello ${siteName}, I want to register as a partner.\n\nName: ${partnerForm.name}\nPhone: ${partnerForm.phone}\nPartner Type: ${partnerForm.type}\nDetails: ${partnerForm.message}`,
    );
    setShowPartnerModal(false);
  };

  const watermarkCols = isMobile ? 4 : 12;
  const watermarkCount = isMobile ? 80 : 360;

  /* ------------------------------ sections ------------------------------ */

  const watermark = (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      style={{ opacity: 0.12 }}
    >
      {Array.from({ length: watermarkCount }).map((_, i) => (
        <span
          key={i}
          className={`absolute font-black whitespace-nowrap ${
            isMobile ? "text-[13px]" : "text-[18px]"
          }`}
          style={{
            color: "rgba(255,255,255,0.15)",
            top: `${Math.floor(i / watermarkCols) * (isMobile ? 5.5 : 5)}%`,
            left: `${(i % watermarkCols) * (isMobile ? 25 : 8.5)}%`,
          }}
        >
          {parentBrand}
        </span>
      ))}
    </div>
  );

  const brandStory = (
    <section
      id="brand-story"
      className="scroll-mt-20 border-b border-[#314367]/10 bg-white py-12 sm:py-20"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-14">
          <h2 className="font-serif text-3xl font-black text-[#0e2a5c] sm:text-5xl">
            Our Brand Story
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#314367]/30" />
        </div>

        <div className="space-y-6 text-[15px] leading-relaxed text-[#5b6472] sm:text-[17px]">
          <p className="text-center">
            <span className="font-bold text-[#0e2a5c]">Property Baap</span> is
            not another quirky brand name chosen to create a periodic buzz in
            the real estate market. It is a well-thought-out name, carrying a
            deliberate meaning and an immense opportunity within itself.
          </p>
          <p className="text-center font-bold tracking-[0.12em] text-[#0a1f45] uppercase">
            Spare Two Minutes To Know — How?
          </p>

          <button
            type="button"
            onClick={() => setStoryExpanded(!storyExpanded)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#314367]/20 bg-white px-6 py-3 text-[15px] font-bold text-[#0a1f45] transition-colors hover:bg-[#0a1f45] hover:text-white sm:text-[17px]"
          >
            {storyExpanded ? "Hide Story" : "View Full Story"}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${storyExpanded ? "rotate-180" : ""}`}
            />
          </button>

          <div
            className={`grid transition-all duration-500 ease-in-out ${storyExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
          >
            <div className="overflow-hidden">
              <div className="space-y-6 pt-2">
                <h3 className="pt-4 text-center font-sans text-[17px] font-black tracking-[0.08em] text-[#0e2a5c] uppercase sm:text-[19px]">
                  Do Or Die
                </h3>
                <p>
                  With a life exposed to many situations where the only way out
                  was{" "}
                  <span className="font-bold text-[#0e2a5c]">
                    Do or Die
                  </span>
                  , the only option was survival and sustenance, routed through
                  one belief:{" "}
                  <span className="font-bold text-[#0a1f45]">
                    MUST FIGHT. MUST WIN.
                  </span>
                </p>
                <p>
                  What was initially scary gradually became thrilling. That
                  experience became a daily routine - and eventually started
                  reflecting everywhere, personally as well as professionally.
                </p>

                <h3 className="pt-4 text-center font-sans text-[17px] font-black tracking-[0.08em] text-[#0e2a5c] uppercase sm:text-[19px]">
                  Professional Pinch &amp; Punch
                </h3>
                <p>
                  The profession never welcomed me in the way I expected it to.
                  Denials. Disapprovals. Disappointments. They all led to one
                  thing: <span className="font-bold text-[#0a1f45]">DARE.</span>
                </p>
                <p>
                  The one who wholeheartedly dares literally does not care. That{" "}
                  <span className="font-bold text-[#0e2a5c]">
                    Dare Without Care
                  </span>{" "}
                  created an attitude that became{" "}
                  <span className="font-bold text-[#0e2a5c]">Rare</span>.
                </p>

                <h3 className="pt-4 text-center font-sans text-[17px] font-black tracking-[0.08em] text-[#0e2a5c] uppercase sm:text-[19px]">
                  Find Or Be Found
                </h3>
                <p>
                  When you get nothing, you are obliged to find something. And
                  that something, if done right, can get you everything. Whether
                  you find the luck or the luck finds you,{" "}
                  <span className="font-bold text-[#0e2a5c]">
                    SUCCESS IS ALL THAT MATTERS.
                  </span>
                </p>

                <h3 className="pt-4 text-center font-sans text-[17px] font-black tracking-[0.08em] text-[#0e2a5c] uppercase sm:text-[19px]">
                  Done Hain
                </h3>
                <p>
                  When a query comes to us, we are psychologically prepared and
                  trained to believe we will be able to handle, execute &amp;
                  accomplish it and never discard it because it is small,
                  irrelevant or seemingly less profitable.
                </p>
                <p className="flex items-center justify-center gap-2 text-center font-bold text-[#0a1f45]">
                  In our Mind It Is Already — Done Hain{" "}
                  <CheckCircle2 className="h-5 w-5 text-[#0a1f45]" />
                </p>
                <p>
                  We see it as:{" "}
                  <span className="font-bold text-[#0a1f45]">
                    An opportunity to learn. An opportunity to solve. An
                    opportunity to start a new journey,
                  </span>{" "}
                  with someone we already know or someone we have just met.
                </p>
                <p>
                  We don&apos;t claim to do wonders. But we do assure you of{" "}
                  <span className="font-bold text-[#0a1f45]">
                    saving you from blunders.
                  </span>
                </p>

                <h3 className="pt-6 text-center font-serif text-xl font-black text-[#0e2a5c] sm:text-2xl">
                  Property Baap — The Meaning
                </h3>
                <p>
                  A father is not merely someone who commands the utmost
                  respect. A father inherently carries the utmost
                  responsibility. He provides an answer to your every question,
                  no matter how silly it may seem, and searches for a solution to
                  your every problem. Sometimes he gives you exactly what you
                  want. Sometimes he tells you what is right and practical. A
                  father is, in many ways, our one-stop solution provider in any
                  given situation.
                </p>
                <p className="text-center font-bold text-[#0a1f45]">
                  That is what Property Baap means to us.
                </p>
                <p>
                  We at Property Baap are built on the same principle:{" "}
                  <span className="font-bold text-[#0e2a5c]">
                    Providing righteous guidance and dependable service across
                    everything related to property.
                  </span>
                </p>

                <h3 className="pt-6 text-center font-serif text-xl font-black text-[#0e2a5c] sm:text-2xl">
                  Property Baap — The Opportunity
                </h3>
                <p>
                  Property Baap is constituted on the principle of serving the
                  masses, in association with people from every section of
                  society. We work with everyone, from an industrialist to a
                  delivery partner.{" "}
                  <span className="font-bold text-[#0a1f45]">
                    Because property affects everyone.
                  </span>{" "}
                  We take the pain together. We gain together. And that is where
                  our opportunity becomes everyone&apos;s opportunity.
                </p>
                <p>
                  If you relate to our story, reach out to us — as a client, as
                  a professional partner, or simply by joining our{" "}
                  <span className="font-bold text-[#0a1f45]">
                    #HarGharDealer
                  </span>{" "}
                  movement. Because the opportunity should not depend on who you
                  are or what you do.{" "}
                  <span className="font-bold text-[#0e2a5c]">
                    It should depend on what you can bring to the table.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const partnership = (
    <>
      <section
        id="partner-section"
        className="scroll-mt-20 border-t border-[#dde3ea] bg-[#f5f7fa] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-10 font-mono text-base font-black tracking-[0.15em] text-[#0a1f45] sm:mb-8">
            Property Baap Professional Network
          </p>
          <h2 className="mb-6 font-serif text-3xl text-[#0e2a5c] md:text-4xl">
            Grow With Us, Partner With Property Baap Professional Network
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-[#5b6472] md:text-xl">
            Are you a deed writer, property dealer, lawyer, architect, or an
            ex-government employee? Join Delhi&apos;s most trusted property
            network to get maximum rewards for your expertise &amp; years of
            hard work.
          </p>
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            {PARTNER_TYPES.map((type) => (
              <span
                key={type}
                className="rounded-full border-2 border-[#314367]/30 bg-white px-4 py-2 text-sm font-medium text-[#0a1f45]"
              >
                {type}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowPartnerModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#314367] px-10 py-5 text-xl font-black tracking-wide text-white transition-colors hover:bg-[#0a1f45] sm:text-2xl"
          >
            Partner With Us
          </button>
        </div>
      </section>

      <section
        id="referral-section"
        className="scroll-mt-20 border-y border-[#F0A41C] bg-[#314367] py-10 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-col items-center gap-2 border-b border-white/20 pb-6 text-center sm:mb-10">
            <p className="mb-10 font-mono text-base font-black tracking-[0.15em] text-[#F0A41C] sm:mb-8">
              Property Baap Referral Network
            </p>
            <h2 className="font-sans text-4xl font-black tracking-[0.03em] text-white sm:text-6xl">
              #HarGharDealer
            </h2>
            <p className="mt-2 font-sans text-xl font-black tracking-[0.06em] text-white sm:text-2xl">
              Deal Lao - Paisa Kamao
            </p>
          </div>

          <p className="mx-auto mt-1 max-w-3xl text-center text-base font-semibold leading-relaxed text-[#F0A41C] sm:text-xl">
            You Refer <span className="mx-1">•</span> We Execute{" "}
            <span className="mx-1">•</span> You Earn
          </p>
          <p className="mx-auto mb-6 mt-4 max-w-3xl text-center font-serif text-lg font-bold tracking-wide text-[#F0A41C] sm:text-2xl">
            Property Baap Proudly Welcomes You To Its Referral Network.
          </p>

          <div className="grid gap-7 text-center md:text-left lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            <div>
              <p className="mx-auto max-w-2xl text-lg font-extrabold leading-tight text-white sm:text-3xl md:mx-0">
                Earn a flat{" "}
                <span className="text-[#F0A41C]">25% of the profit</span> we make
                from your successful reference.
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base md:mx-0">
                Whether you are a student, homemaker, business owner, working
                professional, delivery partner, senior citizen, person with a
                disability, unemployed, or simply looking for an additional
                source of passive income - you can become a part of our network.
              </p>
              <p className="mx-auto mt-4 text-base font-extrabold leading-snug text-[#F0A41C] sm:text-xl md:mx-0">
                Just Refer Someone About Any Of Our Property Services And
                You&apos;re Done.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-bold tracking-[0.1em] text-white uppercase sm:mt-6 sm:tracking-[0.14em] md:justify-start">
                {["Zero Liability", "Zero Joining Fee", "Zero Conditions"].map(
                  (benefit) => (
                    <span
                      key={benefit}
                      className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs backdrop-blur-sm"
                    >
                      {benefit}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="border-t-2 border-white/30 pt-6 md:border-t-0 md:border-l-2 md:pl-8 md:pt-0">
              <p className="mx-auto mb-5 max-w-md text-sm font-semibold leading-relaxed text-white/80 md:mx-0">
                Join the reference giver network or access your reference status.
              </p>
              <div className="flex w-full flex-col items-center gap-3 sm:flex-row lg:flex-col lg:items-stretch">
                <a
                  href={signupUrl}
                  className="inline-flex w-[85%] items-center justify-center gap-2 rounded-lg bg-white px-4 py-4 text-lg font-black tracking-wide text-[#F0A41C] transition-colors hover:bg-[#f5f7fa] sm:w-full sm:py-3 sm:text-sm"
                >
                  Join As A Referral Partner
                </a>
                <a
                  href={loginUrl}
                  className="inline-flex w-[85%] items-center justify-center gap-2 rounded-lg border-2 border-white/40 bg-transparent px-4 py-4 text-lg font-black tracking-wide text-white transition-colors hover:bg-white/10 sm:w-full sm:py-3 sm:text-sm"
                >
                  Already A Referral Partner
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/20 pt-8 text-center">
            <p className="mb-2 text-base font-semibold tracking-[0.2em] text-white/70 uppercase sm:text-lg">
              Ab hoga
            </p>
            <p className="mt-1 font-sans text-3xl font-black tracking-[0.08em] text-white sm:text-4xl">
              Har Ghar Dealer
            </p>
          </div>
        </div>
      </section>
    </>
  );

  /* ------------------------------ render ------------------------------ */
  return (
    <>
      <footer
        className="border-t-[6px] border-[#314367] bg-white text-white notranslate"
        translate="no"
      >
        {/* Get Private Consultation */}
        <section
          id="contact"
          className="scroll-mt-24 border-b border-[#314367]/10 bg-[#f5f7fa] py-10 sm:py-16"
        >
          <div className="mx-auto grid max-w-6xl gap-8 px-4 text-center sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:gap-16 lg:text-left">
            <div>
              <h2 className="mb-4 text-4xl font-extrabold tracking-[-0.03em] text-[#0e2a5c] sm:text-6xl">
                Get <span className="text-[#0a1f45]">Private Consultation</span>
              </h2>
              <p className="mx-auto max-w-md font-sans text-sm leading-relaxed text-[#5b6472] sm:text-base lg:mx-0">
                Need discreet, one-on-one guidance on your property matter? Share
                your details and a senior {siteName} consultant will reach out to
                you directly and confidentially.
              </p>
            </div>

            <form
              onSubmit={handleContactSubmit}
              className="grid gap-3 rounded-xl border border-[#dde3ea] bg-white p-4 sm:grid-cols-2 sm:p-6"
              noValidate
            >
              <div className="sm:col-span-2">
                <label htmlFor="pvf-name" className="sr-only">
                  Your name
                </label>
                <input
                  id="pvf-name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={(e) => {
                    setContactForm({ ...contactForm, name: e.target.value });
                    if (contactErrors.name)
                      setContactErrors({ ...contactErrors, name: "" });
                  }}
                  aria-invalid={Boolean(contactErrors.name)}
                  className={`min-h-12 w-full rounded-lg border bg-white px-4 text-sm text-[#0e2a5c] outline-none transition-colors placeholder:text-[#9aa3b0] focus:border-[#314367] ${contactErrors.name ? "border-red-500" : "border-[#dde3ea]"}`}
                />
                {contactErrors.name && (
                  <p className="mt-1 text-left text-xs text-red-500">
                    {contactErrors.name}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="pvf-phone" className="sr-only">
                  Phone number
                </label>
                <input
                  id="pvf-phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone number"
                  value={contactForm.phone}
                  onChange={(e) => {
                    setContactForm({ ...contactForm, phone: e.target.value });
                    if (contactErrors.phone)
                      setContactErrors({ ...contactErrors, phone: "" });
                  }}
                  aria-invalid={Boolean(contactErrors.phone)}
                  className={`min-h-12 w-full rounded-lg border bg-white px-4 text-sm text-[#0e2a5c] outline-none transition-colors placeholder:text-[#9aa3b0] focus:border-[#314367] ${contactErrors.phone ? "border-red-500" : "border-[#dde3ea]"}`}
                />
                {contactErrors.phone && (
                  <p className="mt-1 text-left text-xs text-red-500">
                    {contactErrors.phone}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="pvf-message" className="sr-only">
                  How can we help?
                </label>
                <textarea
                  id="pvf-message"
                  name="message"
                  rows={3}
                  placeholder="How can we help?"
                  value={contactForm.message}
                  onChange={(e) => {
                    setContactForm({ ...contactForm, message: e.target.value });
                    if (contactErrors.message)
                      setContactErrors({ ...contactErrors, message: "" });
                  }}
                  aria-invalid={Boolean(contactErrors.message)}
                  className={`w-full resize-none rounded-lg border bg-white px-4 py-3 text-sm text-[#0e2a5c] outline-none transition-colors placeholder:text-[#9aa3b0] focus:border-[#314367] ${contactErrors.message ? "border-red-500" : "border-[#dde3ea]"}`}
                />
                {contactErrors.message && (
                  <p className="mt-1 text-left text-xs text-red-500">
                    {contactErrors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="rounded-lg bg-[#314367] px-6 py-3 font-bold text-white transition-colors hover:bg-[#0a1f45] sm:col-span-2 sm:justify-self-start"
              >
                Send Enquiry
              </button>
            </form>
          </div>
        </section>

        {/* 1 Call Challenge */}
        <div id="one-call-challenge" className="relative scroll-mt-24 overflow-hidden border-b border-[#314367]/10 bg-white py-8 text-center sm:py-12">
          <div className="mx-auto max-w-4xl px-4">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#314367]/10 sm:mb-6 sm:h-16 sm:w-16">
              <PhoneCall className="h-6 w-6 text-[#0a1f45] sm:h-8 sm:w-8" />
            </div>
            <h2 className="mb-4 text-3xl font-extrabold tracking-[-0.02em] text-[#0e2a5c] sm:mb-6 sm:text-4xl md:text-6xl">
              <span className="text-[#0a1f45]">1 Call</span> Challenge
            </h2>
            <p className="mx-auto mb-2 max-w-2xl font-sans text-base text-[#0e2a5c] sm:text-xl">
              Pick up the phone.{" "}
              <span className="font-bold text-[#0a1f45]">Reach Us Once</span>.
            </p>
            <p className="mx-auto mb-6 max-w-xl font-sans text-sm text-[#5b6472] sm:mb-10 sm:text-lg">
              We boldly present our one call challenge to prove that we are the
              best people to deal with when it comes to one of your most
              valuable possessions -{" "}
              <span className="font-bold text-[#0a1f45]">Your Property</span>
            </p>
            <button
              type="button"
              onClick={() =>
                openWhatsApp(
                  `*Hello ${siteName}, I Accept Your 1 Call Challenge.*`,
                )
              }
              className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#314367] px-6 py-3 font-sans text-base font-bold text-white shadow-lg shadow-[#314367]/20 transition-all hover:bg-[#0a1f45] sm:px-10 sm:py-5 sm:text-lg"
            >
              Accept The Challenge
            </button>
          </div>
        </div>

        {/* Need More Services */}
        <div
          id="property-baap"
          className="relative scroll-mt-6 overflow-hidden border-b border-[#314367]/10 bg-[#f5f7fa] py-10 sm:py-16"
        >
          {watermark}
          <div className="relative z-10 mx-auto max-w-5xl px-4">
            <div className="mb-10 text-center sm:mb-14">
              <h2 className="mx-auto mb-5 w-fit rounded-full border border-[#314367]/20 bg-[#314367] px-6 py-2.5 text-2xl font-extrabold text-white shadow-[0_8px_20px_rgba(201,162,39,0.14)] tracking-[-0.02em] sm:text-3xl">
                Need More Services?
              </h2>
              <div className="flex flex-col items-center justify-center gap-2">
                <h3 className="font-sans text-4xl font-black tracking-[0.06em] text-[#0e2a5c] uppercase sm:text-6xl">
                  Property <span className="text-[#0a1f45]">Baap</span>
                </h3>
                <p className="mb-2 text-xl font-extrabold tracking-[-0.02em] text-[#0a1f45] sm:text-2xl">
                  Think Property, Think Baap
                </p>
              </div>
              <p className="mx-auto mt-4 max-w-2xl font-sans text-sm text-[#5b6472] sm:text-base">
                A Complete Ecosystem Offering End-to-End Property Services
              </p>
            </div>

            <div className="mb-5 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#314367]/20" />
              <p className="text-base font-extrabold tracking-[-0.02em] text-[#0e2a5c] sm:text-lg">
                Some Unmatched Benefits
              </p>
              <div className="h-px flex-1 bg-[#314367]/20" />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-3 sm:mb-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {benefits.map((service) => (
                <div
                  key={service}
                  className="flex items-center gap-3 rounded-xl border border-[#314367]/10 bg-white px-4 py-3 shadow-sm transition-all hover:border-[#0a1f45]/40 hover:shadow-md sm:px-5 sm:py-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#314367]/10 sm:h-9 sm:w-9">
                    <CheckCircle2 className="h-4 w-4 text-[#0a1f45] sm:h-5 sm:w-5" />
                  </div>
                  <span className="font-sans text-xs font-semibold text-[#0e2a5c] sm:text-sm">
                    {service}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() =>
                  setSelectedBrand({
                    name: parentBrand,
                    url: `https://${parentBrand.toLowerCase()}.com`,
                    desc: "",
                    icon: null,
                  })
                }
                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#314367] bg-[#314367] px-8 py-3.5 font-sans text-base font-black tracking-[0.14em] text-white uppercase shadow-[0_0_15px_rgba(201,162,39,0.15)] transition-all duration-200 hover:bg-[#0a1f45] hover:shadow-[0_0_25px_rgba(201,162,39,0.25)] active:scale-[0.98] sm:px-12 sm:py-4 sm:text-lg"
              >
                <span className="font-black text-white [text-shadow:0_-1px_0_rgba(255,255,255,0.35),0_2px_1px_rgba(35,0,0,0.72)]">
                  {parentBrand}
                </span>
              </button>
            </div>
          </div>
        </div>

        {brandStory}

        {/* Our Legal Ecosystem */}
        <section className="border-y border-[#314367]/10 bg-gradient-to-b from-[#f5f7fa] to-white py-10 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-8 text-center sm:mb-14">
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#0e2a5c] sm:text-4xl">
                Our Legal Ecosystem
              </h2>
            </div>

            <div className="relative mb-8 flex justify-center lg:mb-0">
              <button
                type="button"
                onClick={() =>
                  setSelectedBrand({
                    name: "SaleDeed.com",
                    url: "https://saledeed.com",
                    desc: "",
                    icon: null,
                  })
                }
                className="relative z-10 cursor-pointer rounded-2xl border border-[#314367] bg-white px-10 py-6 text-left transition-shadow hover:shadow-lg hover:shadow-[#314367]/10"
              >
                <h3 className="text-center text-3xl font-extrabold tracking-[-0.02em]">
                  <span className="text-[#0e2a5c]">SaleDeed</span>
                  <span className="text-[#0a1f45]">.com</span>
                </h3>
                <p className="mt-2 text-center font-sans text-xs tracking-wide text-[#5b6472] sm:text-sm">
                  Property Deeds &bull; Government Approvals
                </p>
              </button>
            </div>

            {/* Connector SVG — large screens */}
            <div className="relative hidden h-16 lg:block">
              <svg
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 64"
              >
                <line
                  x1="50"
                  y1="0"
                  x2="50"
                  y2="32"
                  stroke="#314367"
                  strokeWidth="0.3"
                />
                <line
                  x1="9.85"
                  y1="32"
                  x2="90.15"
                  y2="32"
                  stroke="#314367"
                  strokeWidth="4"
                />
                {[10, 30, 50, 70, 90].map((x) => (
                  <line
                    key={x}
                    x1={x}
                    y1="32"
                    x2={x}
                    y2="64"
                    stroke="#314367"
                    strokeWidth="0.3"
                  />
                ))}
              </svg>
            </div>

            {/* Children */}
            <div className="relative">
              {/* Mobile connectors */}
              <svg
                className="pointer-events-none absolute -top-8 left-0 z-0 h-[calc(100%+2rem)] w-full lg:hidden"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M 24 0 L 24 100"
                  fill="none"
                  stroke="#314367"
                  strokeWidth="4"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="butt"
                />
                <path
                  d="M 76 0 L 76 100"
                  fill="none"
                  stroke="#314367"
                  strokeWidth="4"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="butt"
                />
              </svg>

              <div className="relative z-10 grid max-sm:[&>*:last-child]:col-span-2 max-sm:[&>*:last-child]:max-w-64 max-sm:[&>*:last-child]:justify-self-center max-sm:[&>*:last-child]:w-full grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
                {brands.map((brand) => (
                  <button
                    key={brand.name}
                    type="button"
                    onClick={() => setSelectedBrand(brand)}
                    className="group rounded-2xl border border-[#314367]/10 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#0a1f45] hover:shadow-xl hover:shadow-[#314367]/5"
                  >
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#314367]/10 text-[#0a1f45]">
                      {brand.icon}
                    </div>
                    <h4 className="text-lg font-bold font-extrabold tracking-[-0.02em] text-[#0e2a5c] transition-colors group-hover:text-[#0a1f45]">
                      {brand.name}
                    </h4>
                    {brand.desc && (
                      <p className="mt-2 font-sans text-sm text-[#5b6472]">
                        {brand.desc}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {partnership}

        <div className="border-t border-[#314367]/10" />

        {/* Footer body */}
        <div className="relative overflow-hidden bg-[#f5f7fa] px-4 pt-16 pb-10 sm:px-6 sm:pt-20 sm:pb-12">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-[200px] w-[600px] -translate-x-1/2 rounded-full bg-[#314367]/[0.07] blur-[100px]" />

          <div className="relative z-10 mx-auto max-w-5xl">
            <div className="mb-10 flex flex-col items-center text-center sm:mb-12">
              <div className="mb-5 font-sans text-[19px] font-extrabold leading-none sm:text-[38px]">
                <span className="text-[#0a1f45]">{siteName}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 font-sans text-[12px] leading-relaxed sm:text-[14px]">
                <span className="text-[#5b6472]">A Unit of</span>
                <span className="font-extrabold text-[#0a1f45]">{parentBrand}</span>
                <span className="text-[#5b6472]">Ecosystem</span>
                <span className="mx-1 text-[#0a1f45]/40">&bull;</span>
                <span className="text-[#5b6472]">{ventureLine}</span>
              </div>
              <p className="mt-2 font-sans text-[10px] font-semibold tracking-[0.25em] uppercase sm:text-[12px]">
                <span className="text-[#0a1f45]">Redefining</span>
                <span className="text-[#0e2a5c]"> The Defined</span>
              </p>
            </div>

            <div className="mb-8 h-[1px] w-full bg-gradient-to-r from-transparent via-[#314367]/30 to-transparent" />

            <nav
              aria-label="Footer Navigation"
              className="mb-8 flex flex-wrap justify-center gap-x-7 gap-y-3 sm:gap-x-10"
            >
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="font-sans text-xs font-medium text-[#5b6472] transition-colors hover:text-[#0a1f45] sm:text-sm"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex w-full flex-col items-center justify-between gap-3 border-t border-white/10 bg-[#0a1f45] px-4 py-5 sm:flex-row sm:px-6">
          <p className="order-2 font-sans text-[10px] tracking-wide text-white sm:order-1 sm:text-xs">
            &copy; {year ?? ""} {copyrightHolder} &middot; All Rights Reserved
          </p>
          <p className="order-1 font-sans text-xs font-medium text-white sm:order-2 sm:text-sm">
            <span className="mr-2 text-white">Incredible</span>
            <span style={{ color: "#FF9933" }}>In</span>
            <span className="text-white">d</span>
            <span style={{ color: "#138808" }}>ia</span>
          </p>
        </div>
      </footer>

      {/* Brand leave-modal */}
      {selectedBrand && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-white/80 backdrop-blur-md"
            onClick={() => setSelectedBrand(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-[#314367]/20 bg-[#f5f7fa] p-8 text-center shadow-2xl shadow-[#314367]/5">
            <button
              type="button"
              onClick={() => setSelectedBrand(null)}
              aria-label="Close"
              className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#314367]/10 text-[#5b6472] transition-colors hover:bg-[#0a1f45]/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#314367]/10">
              <ExternalLink className="h-7 w-7 text-[#0a1f45]" />
            </div>
            <h3 className="mb-2 text-xl font-extrabold tracking-[-0.02em] text-[#0e2a5c]">
              You are about to leave{" "}
              <span className="text-[#0a1f45]">{siteName}</span>
            </h3>
            <p className="mb-6 text-sm text-[#5b6472]">
              You will be visiting {selectedBrand.name}.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedBrand(null)}
                className="flex-1 cursor-pointer rounded-xl bg-[#314367]/10 py-3 text-sm font-bold text-[#5b6472] transition-colors hover:bg-[#0a1f45]/20"
              >
                Stay Here
              </button>
              <a
                href={selectedBrand.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSelectedBrand(null)}
                className="flex-1 rounded-xl bg-[#314367] py-3 text-center text-sm font-bold text-white transition-colors hover:bg-[#0a1f45]"
              >
                Continue
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Partner registration modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close partner registration"
            className="absolute inset-0 cursor-default bg-[#0a1f45]/70 backdrop-blur-sm"
            onClick={() => setShowPartnerModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-[#dde3ea] bg-white p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setShowPartnerModal(false)}
              aria-label="Close"
              className="absolute top-4 right-4 text-2xl leading-none text-[#5b6472] hover:text-[#0a1f45]"
            >
              &times;
            </button>
            <p className="mb-2 text-xs font-bold tracking-[0.2em] text-[#0a1f45] uppercase">
              Partner Registration
            </p>
            <h2 className="mb-2 text-2xl font-extrabold text-[#0e2a5c] sm:text-3xl">
              Partner With Property Baap Ecosystem
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-[#5b6472]">
              Share your details and we&apos;ll continue the conversation on
              WhatsApp.
            </p>
            <form onSubmit={handlePartnerSubmit} className="grid gap-3">
              <input
                required
                type="text"
                placeholder="Your name"
                value={partnerForm.name}
                onChange={(e) =>
                  setPartnerForm({ ...partnerForm, name: e.target.value })
                }
                className="min-h-12 rounded-lg border border-[#dde3ea] bg-white px-4 text-sm text-[#0e2a5c] outline-none focus:border-[#314367]"
              />
              <input
                required
                type="tel"
                pattern="[+]?[0-9 ()-]{10,}"
                placeholder="Phone number"
                value={partnerForm.phone}
                onChange={(e) =>
                  setPartnerForm({ ...partnerForm, phone: e.target.value })
                }
                className="min-h-12 rounded-lg border border-[#dde3ea] bg-white px-4 text-sm text-[#0e2a5c] outline-none focus:border-[#314367]"
              />
              <div ref={partnerTypeRef} className="relative">
                <button
                  type="button"
                  onClick={() => setPartnerTypeOpen((open) => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={partnerTypeOpen}
                  className="flex min-h-12 w-full cursor-pointer items-center justify-between rounded-lg border border-[#dde3ea] bg-white px-4 text-left text-sm text-[#0e2a5c] outline-none transition-colors focus:border-[#314367]"
                >
                  <span className={partnerForm.type ? "text-[#0e2a5c]" : "text-[#9aa3b0]"}>
                    {partnerForm.type || "Select partner type"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#0a1f45] transition-transform ${partnerTypeOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {partnerTypeOpen && (
                  <div
                    role="listbox"
                    className="absolute top-full right-0 left-0 z-20 mt-1 max-h-52 overflow-y-auto rounded-lg border border-[#dde3ea] bg-white p-1 shadow-xl"
                  >
                    {PARTNER_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        role="option"
                        aria-selected={partnerForm.type === type}
                        onClick={() => {
                          setPartnerForm({ ...partnerForm, type });
                          setPartnerTypeOpen(false);
                        }}
                        className={`w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-colors ${partnerForm.type === type ? "bg-[#314367]/10 font-semibold text-[#0a1f45]" : "text-[#0e2a5c] hover:bg-[#f5f7fa] hover:text-[#0a1f45]"}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <textarea
                required
                rows={3}
                placeholder="Tell us briefly about your network or work"
                value={partnerForm.message}
                onChange={(e) =>
                  setPartnerForm({ ...partnerForm, message: e.target.value })
                }
                className="resize-none rounded-lg border border-[#dde3ea] bg-white px-4 py-3 text-sm text-[#0e2a5c] outline-none focus:border-[#314367]"
              />
              <button
                type="submit"
                className="mt-2 cursor-pointer rounded-lg bg-[#314367] px-5 py-3 font-bold text-white transition-colors hover:bg-[#0a1f45]"
              >
                Register Via WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}

      </>
  );
}