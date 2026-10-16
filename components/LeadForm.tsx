"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Lock, Phone, User } from "lucide-react";
import CustomSelect from "./CustomSelect";
import { REQUEST_TAB_EVENT } from "./BuyerPreferencesSection";
import { SELLER_MODE_EVENT } from "./SellerSection";
import { sanitizeName, sanitizePhone } from "@/lib/validation";

const ROLE_OPTIONS = ["Buyer", "Tenant", "Property Owner", "Builder"];

const fieldWrap =
  "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] transition-colors focus-within:border-navy-700";

export default function LeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [roleError, setRoleError] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!role) {
      setRoleError("Please select who you are.");
      return;
    }
    setSending(true);

    const cleanName = sanitizeName(name);
    const cleanPhone = sanitizePhone(phone);

    if (role === "Buyer" || role === "Tenant") {
      window.dispatchEvent(
        new CustomEvent(REQUEST_TAB_EVENT, {
          detail: {
            tab: role === "Tenant" ? "rent" : "buy",
            name: cleanName,
            phone: cleanPhone,
          },
        }),
      );
      document
        .querySelector("#registration-section")
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.dispatchEvent(
        new CustomEvent(SELLER_MODE_EVENT, {
          detail: {
            tab: role === "Builder" ? "builder" : "seller",
            name: cleanName,
            phone: cleanPhone,
          },
        }),
      );
      document
        .querySelector("#seller-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }

    setSending(false);
  };

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
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-transparent outline-none placeholder:text-slate-400"
          />
        </label>

        <div>
          <div className={`${fieldWrap} gap-0 !px-0`}>
            <User className="ml-3 h-[18px] w-[18px] shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1">
              <CustomSelect
                bare
                value={role}
                onChange={(v) => {
                  setRole(v);
                  setRoleError("");
                }}
                options={ROLE_OPTIONS}
                placeholder="I am a"
              />
            </div>
          </div>
          {roleError && (
            <span className="mt-0.5 block text-[10px] text-red-400">{roleError}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={sending}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-navy-800 py-3 text-[14px] font-bold text-white transition-colors hover:bg-navy-700 disabled:opacity-50"
        >
          {sending ? "Please wait..." : "Next"}
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
