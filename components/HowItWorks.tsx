import { Calculator, ClipboardList, MessagesSquare, Rocket } from "lucide-react";

const STEPS = [
  {
    no: "01",
    icon: ClipboardList,
    title: "You Share Your Requirement",
    desc: "Tell us what you need: buying, selling, renting or building.",
  },
  {
    no: "02",
    icon: MessagesSquare,
    title: "We Understand",
    desc: "We understand your need before we estimate anything.",
  },
  {
    no: "03",
    icon: Calculator,
    title: "We Estimate",
    desc: "We estimate the right options matched to your requirement.",
  },
  {
    no: "04",
    icon: Rocket,
    title: "We Initiate",
    desc: "And initiate the process to get it done for you.",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full bg-white px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
      <div className="mx-auto w-full max-w-[1400px] text-center">
        <h2 className="text-[26px] font-extrabold tracking-tight text-navy-900 sm:text-[32px]">
          How It Works
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.no} className="flex flex-col items-center text-center">
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-navy-900">
                <s.icon className="h-7 w-7 text-white" strokeWidth={1.6} />
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#F0A41C] text-[11px] font-extrabold text-navy-900">
                  {s.no}
                </span>
              </span>
              <h3 className="mt-4 text-[15px] font-bold text-navy-900">{s.title}</h3>
              <p className="mt-1.5 max-w-[240px] text-[13px] leading-relaxed text-slate-500">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-[720px] text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
          We work together to get you what you need and want not what we have
          to offer by default.
        </p>
        <a
          href="#top"
          className="mt-7 inline-flex items-center justify-center rounded-lg bg-navy-800 px-8 py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-navy-700"
        >
          Reach Us Today
        </a>
      </div>
    </section>
  );
}
