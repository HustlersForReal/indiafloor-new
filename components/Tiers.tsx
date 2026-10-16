import type { ReactNode } from "react";
import { Check, Crown, Gem, Star } from "lucide-react";

const ACCENT: Record<string, string> = {
  gold: "text-[#dd9310]",
  silver: "text-[#4b5866]",
  diamond: "text-[#0f7ad0]",
};

function B({ c, children }: { c: "gold" | "silver" | "diamond"; children: ReactNode }) {
  return <strong className={`font-bold ${ACCENT[c]}`}>{children}</strong>;
}

const TIERS: { name: string; icon: typeof Crown; desc: ReactNode; points: string[]; card: string; badge: string; check: string }[] = [
  {
    name: "Gold Tier",
    icon: Crown,
    desc: (
      <>
        This tier deals with properties with an average value{" "}
        <B c="gold">between 2 crores and 10 crores</B> and an average monthly
        rent <B c="gold">between 2 lakhs &amp; 10 lakhs</B>. This tier is backed
        by <B c="gold">luxury property experts</B> who serve the{" "}
        <B c="gold">elite population</B> and possess an expertise to understand
        that the purpose here is not just a property deal but the real purpose
        is - <B c="gold">Legacy Building</B>.
      </>
    ),
    points: [],
    card: "border-[#f0dfae] bg-[#fdf6e3]",
    badge: "bg-gold-500 text-white",
    check: "text-gold-600",
  },
  {
    name: "Silver Tier",
    icon: Star,
    desc: (
      <>
        This tier deals with properties with an average value of{" "}
        <B c="silver">upto 2 Crores INR</B> and an average monthly rent of{" "}
        <B c="silver">upto 2 lakhs per month</B>. This tier is backed by experts
        who are <B c="silver">serving the masses</B> and have great knowledge of
        the <B c="silver">past, present property market</B> and a good{" "}
        <B c="silver">future predicting capacities</B>.
      </>
    ),
    points: [],
    card: "border-[#dde3e8] bg-[#eef1f4]",
    badge: "bg-[#9aa4ae] text-white",
    check: "text-[#7c8791]",
  },
  {
    name: "Diamond Tier",
    icon: Gem,
    desc: (
      <>
        This tier deals with properties with an average value{" "}
        <B c="diamond">above 10 crores</B> and that command an average monthly
        rent <B c="diamond">above 10 lakhs</B> with{" "}
        <B c="diamond">no upper limit</B> of property value and rental yields.
        This tier is backed by <B c="diamond">ultra luxury and hyper active experts</B>{" "}
        who are experienced and keen to serve the <B c="diamond">UHNI</B>. The
        purpose served here is to <B c="diamond">manage and grow the legacy</B>.
      </>
    ),
    points: [],
    card: "border-[#c2dcf2] bg-[#e9f3fd]",
    badge: "bg-[#1f8fe5] text-white",
    check: "text-[#1f8fe5]",
  },
];

export default function Tiers() {
  return (
    <section id="tiers" className="w-full scroll-mt-20 bg-mist px-4 py-14 sm:px-6 lg:px-10 lg:py-16">
      <div className="mx-auto w-full max-w-[1400px]">
        <h2 className="text-center text-[30px] font-extrabold tracking-tight text-ink sm:text-left">
          3 Tiers 1 Business Ethic
        </h2>
        <p className="mt-2 text-center text-[14.5px] leading-relaxed text-slate-500 sm:text-justify">
          We believe expertise doesn&apos;t just come with the number of years
          you spend in an industry or number of successful deals you can claim
          to have closed till date. Rather we believe that expertise is the
          result of your dedicated practical involvement, failures, diagnosing
          the reason for failures, fixing what needs to be fixed, being cautious
          of the mistakes and staying alert lifelong for any mishaps is what
          makes you an expert. This Expertise Is Something No Single Person Can
          Claim. So we have a team of experts from all segment in the industry.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <article
              key={tier.name}
              className={`rounded-xl border p-6 ${tier.card}`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-4 ring-white/70 ${tier.badge}`}
                >
                  <tier.icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <h3 className="text-[19px] font-extrabold text-ink">{tier.name}</h3>
              </div>
              <p className="mt-4 text-justify text-[13px] leading-relaxed text-slate-600">{tier.desc}</p>
              {tier.points.length > 0 && (
                <ul className="mt-5 space-y-2.5">
                  {tier.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-[13.5px] text-slate-700">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${tier.check}`} strokeWidth={3} />
                      {pt}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
