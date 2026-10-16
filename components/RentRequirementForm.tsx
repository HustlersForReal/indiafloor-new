"use client";

/**
 * Rent Requirement — written for this project, not ported from the FORM-LOGICS
 * docs. Same field shapes as the buyer form where it makes sense (name, phone,
 * city, locality + map) and rent-specific ladders/pricing where it does not.
 */
import {
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import dynamic from "next/dynamic";
import { CircleCheck } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import { NAME_RE, PHONE_RE, sanitizeName, sanitizePhone } from "@/lib/validation";
import { getReferredBy, normalizeRefCode } from "@/lib/referral-storage";
import { saveSubmission } from "@/lib/firebase";
import { TIER_NAMES, TIER_RANGES, type TierName } from "@/lib/property-config";

const LocationMap = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
});

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918800505050";

/* -------------------------------------------------------------- constants */

const AREAS = [
  "Noida",
  "Delhi",
  "Greater Noida",
  "Faridabad",
  "Greater Faridabad",
  "Gurugram",
  "Ghaziabad",
];

const RENTAL_TYPES = [
  "Residential Floors",
  "Farmhouse Floors",
  "Penthouses",
  "Commercial Floors",
  "Industrial Floors",
  "Institutional Floors",
  "Other",
];

const BEDROOMS = ["1 RK / 1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];

const CONFIGURATION_OPTIONS = ["Single-level", "Duplex", "Triplex", "Other"];
const FURNISHING = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];

const CONSTRUCTION_STATUS = ["Ready to Move", "Under Construction", "New Launch"];

const AVAILABILITY: Record<string, string[]> = {
  "Ready to Move": ["Immediately", "Within 1–3 Months", "Flexible"],
  "Under Construction": ["Within 6 Months", "Within 1 Year", "1–2 Years", "Flexible"],
  "New Launch": ["Within 1 Year", "1–2 Years", "2–3 Years", "Flexible"],
};

const TENURE = ["11 Months", "Monthly", "6 Months", "Quarterly"];

const inputCls =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 font-sans text-[13px] text-off-white outline-none transition-colors placeholder:text-[#A6AEBB] focus:border-primary focus:ring-1 focus:ring-primary/20";

const labelCls = "mb-1 block text-[11px] font-bold tracking-[0.06em] text-muted";

const chipCls = (active: boolean) =>
  `flex-1 min-w-fit rounded-lg border px-3 py-2 text-[12px] font-semibold whitespace-nowrap transition-all ${
    active
      ? "border-primary bg-primary/8 text-primary"
      : "border-border bg-white text-off-white hover:border-primary/40"
  }`;

export default function RentRequirementForm({
  prefill,
}: {
  /** hero lead form hands over name/phone; `n` re-triggers repeat sends */
  prefill?: { name?: string; phone?: string; n: number } | null;
}) {
  const [v, setV] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locInput, setLocInput] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [duplicateNote, setDuplicateNote] = useState<string | null>(null);

  /* hero lead form pre-fills name/phone */
  useEffect(() => {
    if (!prefill) return;
    // Deferred so the state updates do not run synchronously inside the effect.
    const timer = window.setTimeout(() => {
      setV((prev) => ({
        ...prev,
        ...(prefill.name ? { name: prefill.name } : {}),
        ...(prefill.phone ? { phone: prefill.phone } : {}),
      }));
      setSubmitted(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [prefill]);

  useEffect(() => {
    const fill = () => {
      const stored = getReferredBy();
      if (stored) return setReferralCode(stored.replace(/^#/, ""));
      try {
        const raw = new URLSearchParams(window.location.search).get("ref");
        if (raw) {
          const norm = normalizeRefCode(raw);
          if (norm) setReferralCode(norm.replace(/^#/, ""));
        }
      } catch {
        /* no window */
      }
    };
    fill();
    const h = () => fill();
    window.addEventListener("pb-ref-updated", h);
    return () => window.removeEventListener("pb-ref-updated", h);
  }, []);

  /* derived gates */
  const showBedrooms =
    !!v.propertyType &&
    ["Residential Floors", "Farmhouse Floors", "Penthouses"].includes(v.propertyType);
  const showConstruction = !!v.propertyType;
  const showAvailability =
    showConstruction && !!v.constructionStatus && !!AVAILABILITY[v.constructionStatus];
  const showFurnishing = !!v.propertyType;
  const citySelected = !!v.city;
  const localities = v.localities ? v.localities.split(", ").filter(Boolean) : [];

  const handleChange = (id: string, value: string) => {
    setV((prev) => ({ ...prev, [id]: value }));
    setSubmitted(false);
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const n = { ...prev };
      delete n[id];
      return n;
    });
  };

  /** switching property type clears fields the new type cannot use */
  const handleTypeChange = (type: string) => {
    setV((prev) => {
      const next: Record<string, string> = { ...prev, propertyType: type };
      if (!["Residential Floors", "Farmhouse Floors", "Penthouses"].includes(type)) {
        delete next.bedrooms;
      }
      return next;
    });
    setSubmitted(false);
  };

  const handleConstructionChange = (status: string) => {
    setV((prev) => {
      const next: Record<string, string> = { ...prev, constructionStatus: status };
      const opts = AVAILABILITY[status];
      if (!opts || !opts.includes(next.possession || "")) delete next.possession;
      return next;
    });
    setSubmitted(false);
  };

  const addLocality = () => {
    // commas would break the comma-joined storage, so flatten them
    const val = locInput.replace(/,/g, " ").replace(/\s+/g, " ").trim();
    if (val.length < 2) {
      setErrors((prev) => ({
        ...prev,
        localities: "Enter a valid locality name (min 2 characters).",
      }));
      return;
    }
    if (!localities.includes(val)) {
      handleChange("localities", [...localities, val].join(", "));
    }
    setLocInput("");
  };

  const onLocalityKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addLocality();
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!v.name?.trim()) e.name = "Name is required.";
    else if (!NAME_RE.test(v.name.trim()))
      e.name = "Enter a valid name (min 3 letters).";

    if (!v.phone?.trim()) e.phone = "Phone number is required.";
    else if (!PHONE_RE.test(v.phone))
      e.phone = "Enter a valid 10-digit mobile number.";

    if (!v.city?.trim()) e.city = "Select at least one city.";
    if (!v.propertyType) e.propertyType = "Property type is required.";
    if (citySelected && localities.length === 0)
      e.localities = "Locality / Area is required.";

    if (!v.rentTier) e.rentTier = "Rent tier is required.";
    if (!v.configuration) e.configuration = "Configuration is required.";

    if (showBedrooms && !v.bedrooms)
      e.bedrooms = "Please select your preferred bedroom configuration.";
    if (showConstruction && !v.constructionStatus)
      e.constructionStatus = "Please select construction status.";
    if (showAvailability && !v.possession)
      e.possession = "Please select when you need it from.";
    if (showFurnishing && !v.furnishing)
      e.furnishing = "Please select furnishing status.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const now = new Date();
    const date = now.toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });
    const time = now.toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    });

    const msg = [
      "━━━━━━━━━━━━━━━━━━━━",
      "*INDIA FLOOR*",
      "New Rental Requirement",
      "━━━━━━━━━━━━━━━━━━━━",
      "",
      `*Name:* ${v.name || "-"}`,
      `*Phone:* ${v.phone || "-"}`,
      "",
      `*Cities:* ${v.city || "-"}`,
      localities.length > 0 ? `*Localities:* ${localities.join(", ")}` : "",
      v.mapLocation ? `*Pinned Location:* ${v.mapLocation}` : "",
      "",
      `*Property Type:* ${v.propertyType || "-"}`,
      `*Configuration:* ${v.configuration || "-"}`,
      `*Rent Tier:* ${v.rentTier || "-"}${
        v.rentTier ? ` (${TIER_RANGES.rent[v.rentTier as TierName]})` : ""
      }`,
      showBedrooms ? `*Bedrooms:* ${v.bedrooms || "-"}` : "",
      showConstruction ? `*Construction Status:* ${v.constructionStatus || "-"}` : "",
      showAvailability ? `*Available From:* ${v.possession || "-"}` : "",
      showFurnishing ? `*Furnishing:* ${v.furnishing || "-"}` : "",
      v.tenure ? `*Lease Tenure:* ${v.tenure}` : "",
      v.additionalNotes?.trim() ? `*Additional Notes:* ${v.additionalNotes.trim()}` : "",
      referralCode.trim() ? `*Referral Code:* ${referralCode.trim()}` : "",
      "",
      `*Date:* ${date}`,
      `*Time:* ${time}`,
      "━━━━━━━━━━━━━━━━━━━━",
    ]
      .filter(Boolean)
      .join("\n");

    const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

    const result = await saveSubmission(
      "RentRequirements",
      {
        phone: v.phone,
        city: v.city,
        propertyType: v.propertyType,
        budgetTier: v.rentTier,
        localities: v.localities,
      },
      {
        Name: v.name || "",
        Phone: v.phone || "",
        City: v.city || "",
        Localities: localities.join(", "),
        Map_Location: v.mapLocation || "",
        Property_Type: v.propertyType || "",
        Configuration: v.configuration || "",
        Rent_Tier: v.rentTier || "",
        ...(showBedrooms ? { Bedrooms: v.bedrooms || "" } : {}),
        ...(showConstruction ? { Construction_Status: v.constructionStatus || "" } : {}),
        ...(showAvailability ? { Available_From: v.possession || "" } : {}),
        ...(showFurnishing ? { Furnishing: v.furnishing || "" } : {}),
        ...(v.tenure ? { Lease_Tenure: v.tenure } : {}),
        ...(v.additionalNotes?.trim() ? { Additional_Notes: v.additionalNotes.trim() } : {}),
        ...(referralCode.trim() ? { Referral_Code: referralCode.trim() } : {}),
        datetime: `${date} ${time}`,
        type: "Rent",
      },
    );

    setSubmitting(false);

    if (result.duplicate) {
      setDuplicateNote(
        "You have already sent us this requirement. We will call you about the one you sent earlier.",
      );
    } else {
      setDuplicateNote(null);
    }

    setSubmitted(true);
    // exact repeats are acknowledged in-form; don't ping the office twice
    if (!result.duplicate && waURL) window.open(waURL, "_blank");
  };

  const reset = () => {
    setSubmitted(false);
    setV({});
    setErrors({});
    setLocInput("");
    setDuplicateNote(null);
    const r = getReferredBy();
    setReferralCode(r ? r.replace(/^#/, "") : "");
  };

  const err = (k: string) =>
    errors[k] ? (
      <span className="mt-0.5 block text-[10px] text-red-400">{errors[k]}</span>
    ) : null;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <CircleCheck className="h-12 w-12 text-primary" strokeWidth={1.5} />
        <span className="text-xl font-bold text-primary">Rental Requirement Received</span>
        <p className="max-w-[320px] text-center text-sm text-muted">
          {duplicateNote ??
            "Our team will review what you are looking for and call you with matching options."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-3 cursor-pointer border-none bg-none text-xs font-semibold tracking-[0.15em] text-primary uppercase"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div
        className="mb-1 text-center font-bold tracking-[0.1em] text-primary"
        style={{ fontSize: "clamp(0.9rem, 1.2vw, 1.1rem)" }}
      >
        Rental Preferences
      </div>
      <p
        className="mb-5 text-center text-muted sm:mb-6"
        style={{ fontSize: "clamp(0.75rem, 0.9vw, 0.9rem)" }}
      >
        Tell us the rent you have in mind.
      </p>

      <div className="grid grid-cols-1 gap-x-3 gap-y-2.5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="r-name">Name *</label>
          <input
            id="r-name"
            type="text"
            placeholder="Your full name"
            value={v.name || ""}
            onChange={(e) => handleChange("name", sanitizeName(e.target.value))}
            className={inputCls}
          />
          {err("name")}
        </div>

        <div>
          <label className={labelCls} htmlFor="r-phone">Phone Number *</label>
          <input
            id="r-phone"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            value={v.phone || ""}
            onChange={(e) => handleChange("phone", sanitizePhone(e.target.value))}
            className={inputCls}
          />
          {err("phone")}
        </div>

        <div>
          <label className={labelCls}>City / Cities *</label>
          <CustomSelect
            compact
            multiple
            value={v.city || ""}
            onChange={(val) => handleChange("city", val)}
            options={AREAS}
            placeholder="Select city"
          />
          {err("city")}
        </div>

        <div>
          <label className={labelCls}>Property Type *</label>
          <CustomSelect
            compact
            value={v.propertyType || ""}
            onChange={handleTypeChange}
            options={RENTAL_TYPES}
            placeholder="Select property type"
          />
          {err("propertyType")}
        </div>

        <div>
          <label className={labelCls}>Configuration *</label>
          <CustomSelect
            compact
            value={v.configuration || ""}
            onChange={(val) => handleChange("configuration", val)}
            options={CONFIGURATION_OPTIONS}
            placeholder="Select configuration"
          />
          {err("configuration")}
        </div>

        <div>
          <label className={labelCls}>Rent Tier *</label>
          <CustomSelect
            compact
            value={v.rentTier || ""}
            onChange={(val) => handleChange("rentTier", val)}
            options={[...TIER_NAMES]}
            placeholder="Select tier"
          />
          {v.rentTier && (
            <p className="mt-1 text-[11px] text-muted">
              {TIER_RANGES.rent[v.rentTier as TierName]}
            </p>
          )}
          {err("rentTier")}
        </div>

        {citySelected && (
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="r-locality">Locality / Area *</label>
            <div className="flex gap-2">
              <input
                id="r-locality"
                type="text"
                placeholder="Type locality and press Enter"
                value={locInput}
                onChange={(e) => setLocInput(e.target.value)}
                onKeyDown={onLocalityKey}
                className={inputCls}
              />
              <button
                type="button"
                onClick={addLocality}
                className="shrink-0 cursor-pointer rounded-lg border border-primary bg-white px-4 text-[12px] font-bold text-primary transition-colors hover:bg-primary/8"
              >
                Add
              </button>
            </div>
            {err("localities")}

            {localities.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {localities.map((loc) => (
                  <span
                    key={loc}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 py-1 pr-1.5 pl-2.5 text-[11px] font-semibold text-primary"
                  >
                    {loc}
                    <button
                      type="button"
                      onClick={() =>
                        handleChange(
                          "localities",
                          localities.filter((l) => l !== loc).join(", "),
                        )
                      }
                      aria-label={`Remove ${loc}`}
                      className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border-none bg-primary/15 leading-none text-primary hover:bg-primary/30"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="mt-2">
              <LocationMap
                key={`${v.city || ""}|${localities.join("|")}`}
                onLocationSelect={(addr) => handleChange("mapLocation", addr)}
                initialLocation={
                  localities.length > 0
                    ? localities[localities.length - 1]
                    : (v.city?.split(", ")[0] || "")
                }
              />
              {v.mapLocation && (
                <span className="mt-1.5 block text-[10px] text-muted">
                  📍 Pinned:{" "}
                  <span className="font-semibold text-primary">{v.mapLocation}</span>
                </span>
              )}
            </div>
          </div>
        )}


        {showBedrooms && (
          <div className="sm:col-span-2">
            <label className={labelCls}>Bedrooms *</label>
            <div className="flex flex-wrap gap-2">
              {BEDROOMS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleChange("bedrooms", b)}
                  className={chipCls(v.bedrooms === b)}
                >
                  {b}
                </button>
              ))}
            </div>
            {err("bedrooms")}
          </div>
        )}

        {showConstruction && (
          <div className="sm:col-span-2">
            <label className={labelCls}>Construction Status *</label>
            <div className="flex flex-wrap gap-2">
              {CONSTRUCTION_STATUS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleConstructionChange(c)}
                  className={chipCls(v.constructionStatus === c)}
                >
                  {c}
                </button>
              ))}
            </div>
            {err("constructionStatus")}
          </div>
        )}

        {showAvailability && (
          <div className="sm:col-span-2">
            <label className={labelCls}>Available From *</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY[v.constructionStatus || ""].map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => handleChange("possession", o)}
                  className={chipCls(v.possession === o)}
                >
                  {o}
                </button>
              ))}
            </div>
            {err("possession")}
          </div>
        )}

        {showFurnishing && (
          <div className="sm:col-span-2">
            <label className={labelCls}>Furnishing *</label>
            <div className="flex flex-wrap gap-2">
              {FURNISHING.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleChange("furnishing", f)}
                  className={chipCls(v.furnishing === f)}
                >
                  {f}
                </button>
              ))}
            </div>
            {err("furnishing")}
          </div>
        )}

        <div className="sm:col-span-2">
          <label className={labelCls}>Preferred Lease Tenure</label>
          <div className="flex flex-wrap gap-2">
            {TENURE.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleChange("tenure", t)}
                className={chipCls(v.tenure === t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="r-notes">Additional Notes</label>
          <textarea
            id="r-notes"
            rows={3}
            placeholder="Anything else you want us to know (optional)"
            value={v.additionalNotes || ""}
            onChange={(e) => handleChange("additionalNotes", e.target.value.slice(0, 500))}
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="r-ref">Referral Code</label>
          <input
            id="r-ref"
            type="text"
            placeholder="e.g. PB12345A (optional)"
            value={referralCode}
            onChange={(e) =>
              setReferralCode(
                e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10),
              )
            }
            className={inputCls}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full cursor-pointer rounded-lg border-none bg-primary py-3 font-sans text-[13px] font-bold tracking-wide text-white transition-all hover:bg-primary-dark disabled:opacity-50"
      >
        {submitting ? "SUBMITTING..." : "Find My Property"}
      </button>

      <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
  By filling this form, you agree to receive notifications through WhatsApp,
  call, SMS or email. You can opt out anytime by messaging us.
</p>
    </form>
  );
}