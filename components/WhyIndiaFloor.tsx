import { ChevronDown } from "lucide-react";

const POINTS = [
  {
    title: "Buyers/Tenants Pay Nothing",
    desc: "We don't charge the buyers and tenants anything we monetize through our inventory sources. So dear Buyers and Tenants congratulations in advance for your savings.",
  },
  {
    title: "End-To-End Service With Liaisoning Assistance",
    desc: "We don't just help you with your property floors but also assist you with end-to-end property assistance and liaisoning Services.",
  },
  {
    title: "Online Bluff",
    desc: "100% Online platforms charges don't possess the deep on ground knowledge and expertise. We provide you the combination of online discovery and offline execution making your deal 100% cheat proof.",
  },
  {
    title: "Outside Investments",
    desc: 'The biggest scam going on in real estate is the "Local Price Scam". Most of the properties are picked up by the locality investors. We introduce your property to a wider community thus providing you a multiple price and buyers options.',
  },
  {
    title: "One Dealer Trap",
    desc: "We Are Not A Single Person Property Dealing Firm Where You Put All Your Money With A Gain All Or Risk All With One Dealer boasting of 40-50 years of experience. We are backed by vetted property experts (Property Dealers, Property Valuers, Property Lawyers etc) in every area we serve. We know the ins and outs of every property floor we deal in.",
    note: "Note - We are not against property dealers and consider them as our backbone but we believe in individual and area wise expertise not monopoly.",
  },
  {
    title: "One Niche",
    desc: "We only deal in property floors and don't claim ourselves to be a jack of all trades.",
  },
];

export default function WhyIndiaFloor() {
  return (
    <section
      id="why-indiafloor"
      className="w-full scroll-mt-20 bg-white px-4 py-14 sm:px-6 lg:px-10 lg:py-20"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <h2 className="text-center text-[26px] font-extrabold tracking-tight text-navy-900 sm:text-left sm:text-[32px]">
          Why India Floor?
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:gap-px sm:border sm:border-slate-200 sm:bg-slate-200 lg:grid-cols-2">
          {POINTS.map((p, i) => (
            <div
              key={p.title}
              className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-none sm:border-0 sm:p-8"
            >
              <p className="text-[15px] font-extrabold tracking-[0.2em] text-gold-600 sm:text-[16px]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-[14px] leading-snug font-bold text-navy-900 sm:text-[17px]">
                {p.title}
              </h3>
              <p className="mt-2 text-justify text-[12px] leading-relaxed text-slate-500 sm:text-[13.5px]">
                {p.desc}
              </p>
              {p.note && (
                <p className="mt-2.5 border-l-2 border-gold-500 pl-3 text-[11.5px] leading-relaxed text-slate-500 italic sm:text-[12.5px]">
                  {p.note}
                </p>
              )}
            </div>
          ))}
        </div>

        <a
          href="#one-call-challenge"
          className="mt-3 block cursor-pointer rounded-xl border border-slate-200 bg-navy-900 p-5 text-center transition-colors hover:bg-navy-800 sm:p-8"
        >
          <h3 className="text-[22px] leading-tight font-extrabold tracking-tight text-white sm:text-[30px]">
            1 Call Challenge
          </h3>
          <p className="mx-auto mt-2 max-w-[720px] text-[12px] leading-relaxed text-white/70 sm:text-[13.5px]">
            We welcome you to schedule and accept our one challenge to prove you
            how we provide you the best value for your property floor.
          </p>
          <ChevronDown className="mx-auto mt-3 h-10 w-10 animate-bounce text-[#F0A41C]" />
        </a>
      </div>
    </section>
  );
}
