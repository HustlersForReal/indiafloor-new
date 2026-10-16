"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  ChevronDown,
  Lock,
  Phone,
  User,
} from "lucide-react";

const IAM_OPTIONS = ["Buyer", "Seller", "Tenant", "Channel Partner"];

const fieldWrap =
  "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] transition-colors focus-within:border-navy-700";

export default function LeadForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center gap-3 rounded-2xl bg-white p-8 text-center shadow-2xl">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-600">
          ✓
        </span>
        <p className="text-xl font-bold text-navy-900">Requirement Received</p>
        <p className="max-w-[280px] text-sm text-slate-500">
          Thanks for reaching out. Our team will call you back with the right
          guidance and next steps.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-2xl">
      <h2 className="text-[22px] font-extrabold tracking-tight text-navy-900">
        Let&apos;s Get Started
      </h2>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-500">
        Tell us what you need. We&apos;ll get back to you with the right guidance
        and next steps.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-2.5">
        <label className={fieldWrap}>
          <User className="h-[18px] w-[18px] shrink-0 text-slate-400" />
          <input
            required
            type="text"
            placeholder="Name"
            className="w-full bg-transparent outline-none placeholder:text-slate-400"
          />
        </label>

        <label className={fieldWrap}>
          <Phone className="h-[18px] w-[18px] shrink-0 text-slate-400" />
          <input
            required
            type="tel"
            inputMode="numeric"
            placeholder="Mobile Number"
            className="w-full bg-transparent outline-none placeholder:text-slate-400"
          />
        </label>

        <label className={fieldWrap}>
          <User className="h-[18px] w-[18px] shrink-0 text-slate-400" />
          <span className="text-slate-500">I am a</span>
          <span className="relative ml-auto flex items-center">
            <select
              required
              defaultValue=""
              className="cursor-pointer appearance-none bg-transparent pr-6 text-[13px] font-semibold text-navy-900 outline-none"
            >
              <option value="" disabled>
                Select
              </option>
              {IAM_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-navy-900" />
          </span>
        </label>

        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-navy-800 py-3 text-[14px] font-bold text-white transition-colors hover:bg-navy-700"
        >
          Submit Now
          <ArrowRight className="h-[18px] w-[18px]" />
        </button>
      </form>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <Lock className="h-3.5 w-3.5" />
        Your information is safe with us.
      </p>
    </div>
  );
}
