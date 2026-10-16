"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import dynamic from "next/dynamic";
import {
  CircleCheck,
  IndianRupee,
  ShieldCheck,
  Clock,
  Users,
  MapPin,
  Ruler,
} from "lucide-react";
import { NAME_RE, PHONE_RE, sanitizeName, sanitizePhone } from "@/lib/validation";
import { getReferredBy, normalizeRefCode } from "@/lib/referral-storage";
import CustomSelect from "@/components/CustomSelect";
import RentRequirementForm from "@/components/RentRequirementForm";
import { TIER_NAMES, TIER_RANGES, type TierName } from "@/lib/property-config";
import { saveSubmission } from "@/lib/firebase";

const LocationMap = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
});

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918800505050";

/** Emitted by the tiers table and the navbar; handled by BuyerPreferencesSection. */
export const TIER_PICK_EVENT = "indiafloor:select-tier";
export const REQUEST_TAB_EVENT = "indiafloor:select-request-tab";

/* ---------------------------------------------------------------- constants */

const AREAS = [
  "Central Delhi",
  "New Delhi",
  "North Delhi",
  "North East Delhi",
  "North West Delhi",
  "South Delhi",
  "South East Delhi",
  "South West Delhi",
  "West Delhi",
  "East Delhi",
  "Gurugram",
  "Ghaziabad",
  "Faridabad",
  "Greater Faridabad",
  "Noida",
  "Greater Noida",
];

const PROPERTY_TYPES = [
  "Residential Floors",
  "Farmhouse Floors",
  "Penthouses",
  "Commercial Floors",
  "Industrial Floors",
  "Institutional Floors",
];

const STUDIO_CONFIG = ["Studio", "1 RK"];

const BEDROOMS = ["1 RK / 1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];

const CONFIGURATION_OPTIONS = ["Single-level", "Duplex", "Triplex", "Other"];

const BUILT_TYPES = [
  "Residential Floors",
  "Farmhouse Floors",
  "Penthouses",
  "Commercial Floors",
  "Industrial Floors",
  "Institutional Floors",
];

const CONSTRUCTION_STATUS = ["New Launch", "Under Construction", "Ready to Move"];

const POSSESSION_OPTIONS: Record<string, string[]> = {
  "Ready to Move": ["Immediately", "Within 1–3 Months", "Within 3–6 Months", "Flexible"],
  "Under Construction": ["Within 6 Months", "Within 1 Year", "1–2 Years", "2+ Years", "Flexible"],
  "New Launch": ["Within 1 Year", "1–2 Years", "2–3 Years", "3+ Years", "Flexible"],
};

const AREA_OPTIONS = ["0", "500", "1,000", "1,500", "2,000", "2,500", "3,000", "4,000+"];

const LAND_TYPES: string[] = [];

const inputCls =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 font-sans text-[13px] text-off-white outline-none transition-colors placeholder:text-[#A6AEBB] focus:border-primary focus:ring-1 focus:ring-primary/20";

const labelCls = "mb-1 block text-[11px] font-bold tracking-[0.06em] text-muted";

const chipCls = (active: boolean) =>
  `flex-1 min-w-fit rounded-lg border px-3 py-2 text-[12px] font-semibold whitespace-nowrap transition-all ${
    active
      ? "border-primary bg-primary/8 text-primary"
      : "border-border bg-white text-off-white hover:border-primary/40"
  }`;

/* --------------------------------------------------------- sidebar content */

const WHY_POINTS = [
  {
    icon: IndianRupee,
    title: "No Brokerage, No Cut",
    desc: "Talk directly to owners and verified dealers. The commission you would have paid a broker stays in your pocket.",
  },
  {
    icon: ShieldCheck,
    title: "Checked Before You See It",
    desc: "Title and ownership are verified before a listing reaches you, so you are not the one discovering surprises.",
  },
  {
    icon: Clock,
    title: "Shortlist in Days, Not Months",
    desc: "Send your requirement once. We match it against live listings instead of you refreshing portals every evening.",
  },
  {
    icon: Users,
    title: "Dealers Come To You",
    desc: "Register your requirement and interested dealers reach out with options that fit your budget and locality.",
  },
  {
    icon: MapPin,
    title: "Pin The Exact Spot",
    desc: "Drop a pin on the map instead of just typing a city. Dealers see the precise street, not an approximation.",
  },
  {
    icon: Ruler,
    title: "Budget In Your Range",
    desc: "Set the exact lower and upper limit. Listings outside your range never reach you, so nothing is wasted.",
  },
];

/* ---------------------------------------------------------------- component */

export default function BuyerPreferencesSection() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locInput, setLocInput] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [duplicateNote, setDuplicateNote] = useState<string | null>(null);
  const [mode, setMode] = useState<"buy" | "rent">("buy");
  const [pendingTier, setPendingTier] = useState("");
  const [pendingKey, setPendingKey] = useState(0);

  /* Tier-table buttons preselect a tier, the navbar preselects a tab. */
  useEffect(() => {
    const onPick = (e: Event) => {
      const detail = (e as CustomEvent<{ mode: string; tier: string }>).detail;
      if (detail.mode === "rent") {
        setMode("rent");
        setPendingTier(detail.tier);
        setPendingKey((k) => k + 1);
        // keep Buyer form preselected too when the user later switches to buy
        setValues((prev) => ({ ...prev, budgetTier: detail.tier }));
      } else {
        setMode("buy");
        setValues((prev) => ({ ...prev, budgetTier: detail.tier }));
        // keep Rent form preselected too when the user later switches to rent
        setPendingTier(detail.tier);
        setPendingKey((k) => k + 1);
      }
    };
    window.addEventListener(TIER_PICK_EVENT, onPick);
    return () => window.removeEventListener(TIER_PICK_EVENT, onPick);
  }, []);

  useEffect(() => {
    const onTab = (e: Event) => {
      const detail = (e as CustomEvent<{ tab: "buy" | "rent" }>).detail;
      if (detail.tab === "rent") {
        setMode("rent");
        // keep whatever the user typed; don't invent a tier either
      } else {
        setMode("buy");
      }
    };
    window.addEventListener(REQUEST_TAB_EVENT, onTab);
    return () => window.removeEventListener(REQUEST_TAB_EVENT, onTab);
  }, []);

  /* referral bootstrap */
  useEffect(() => {
    const fill = () => {
      const stored = getReferredBy();
      if (stored) {
        setReferralCode(stored.replace(/^#/, ""));
        return;
      }
      try {
        const raw = new URLSearchParams(window.location.search).get("ref");
        if (raw) {
          const norm = normalizeRefCode(raw);
          if (norm) setReferralCode(norm.replace(/^#/, ""));
        }
      } catch {
        /* no window / malformed URL */
      }
    };
    fill();
    const h = () => fill();
    window.addEventListener("pb-ref-updated", h);
    return () => window.removeEventListener("pb-ref-updated", h);
  }, []);

  /* derived gates */
  const isLand = LAND_TYPES.includes(values.propertyType);
  const isStudio = values.propertyType === "Studio Apartment";
  const isResidentialFloor = ["Residential Floors", "Farmhouse Floors", "Penthouses"].includes(
    values.propertyType || "",
  );
  const showBedrooms = !!values.propertyType && isResidentialFloor;
  const showStudioConfig = isStudio;
  const showConstruction = !!values.propertyType && !isLand;
  const showPossession =
    showConstruction &&
    !!values.constructionStatus &&
    !!POSSESSION_OPTIONS[values.constructionStatus];
  const showPlots = isLand;
  const citySelected = !!values.city;
  const localities = values.localities
    ? values.localities.split(", ").filter(Boolean)
    : [];

  /* handlers */
  const handleChange = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    setSubmitted(false);
    if (errors[id]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    }
  };

  const handleTypeChange = (v: string) => {
    setValues((prev) => {
      const next: Record<string, string> = { ...prev, propertyType: v };
      if (!LAND_TYPES.includes(v)) {
        delete next.plotAreaMin;
        delete next.plotAreaMax;
      }
      if (!["Residential Floors", "Farmhouse Floors", "Penthouses"].includes(v)) delete next.bedrooms;
      if (v !== "Studio Apartment") delete next.studioConfig;
      return next;
    });
    if (errors.propertyType) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n.propertyType;
        return n;
      });
    }
    setSubmitted(false);
  };

  const handleConstructionChange = (v: string) => {
    setValues((prev) => {
      const next: Record<string, string> = { ...prev, constructionStatus: v };
      const opts = POSSESSION_OPTIONS[v];
      if (!opts || !opts.includes(next.possession || "")) delete next.possession;
      return next;
    });
    setSubmitted(false);
  };

  const addLocality = () => {
    const v = locInput.trim();
    if (v.length < 2) {
      setErrors((prev) => ({
        ...prev,
        localities: "Enter a valid locality name (min 2 characters).",
      }));
      return;
    }
    if (!localities.includes(v)) handleChange("localities", [...localities, v].join(", "));
    setLocInput("");
  };

  const removeLocality = (loc: string) => {
    handleChange("localities", localities.filter((l) => l !== loc).join(", "));
  };

  const onLocalityKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addLocality();
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!values.name?.trim()) newErrors.name = "Name is required.";
    else if (!NAME_RE.test(values.name.trim()))
      newErrors.name = "Enter a valid name (min 3 letters).";

    if (!values.phone?.trim()) newErrors.phone = "Phone number is required.";
    else if (!PHONE_RE.test(values.phone))
      newErrors.phone = "Enter a valid 10-digit mobile number.";

    if (!values.city?.trim()) newErrors.city = "Select at least one city.";
    if (!values.propertyType) newErrors.propertyType = "Property type is required.";
    if (citySelected && localities.length === 0)
      newErrors.localities = "Locality / Area is required.";

    if (!values.budgetTier) newErrors.budgetTier = "Budget tier is required.";
    if (!values.configuration)
      newErrors.configuration = "Configuration is required.";

    if (showBedrooms && !values.bedrooms)
      newErrors.bedrooms = "Please select your preferred bedroom configuration.";
    if (showStudioConfig && !values.studioConfig)
      newErrors.studioConfig = "Please select studio configuration.";
    if (showConstruction && !values.constructionStatus)
      newErrors.constructionStatus = "Please select construction status.";
    if (showPossession && !values.possession)
      newErrors.possession = "Please select possession / availability preference.";

    if (showPlots && !values.plotAreaMin)
      newErrors.plotAreaMin = "Minimum plot area is required.";
    if (showPlots && !values.plotAreaMax)
      newErrors.plotAreaMax = "Maximum plot area is required.";
    if (
      showPlots &&
      values.plotAreaMin &&
      values.plotAreaMax &&
      AREA_OPTIONS.indexOf(values.plotAreaMin) > AREA_OPTIONS.indexOf(values.plotAreaMax)
    )
      newErrors.plotAreaRange = "Maximum plot area cannot be greater than maximum area.";

    setErrors(newErrors); // full replace, never merge
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const now = new Date();
    const date = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const time = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const msg = [
      "━━━━━━━━━━━━━━━━━━━━",
      "*INDIA FLOOR*",
      "New Buyer Requirement",
      "━━━━━━━━━━━━━━━━━━━━",
      "",
      `*Name:* ${values.name || "-"}`,
      `*Phone:* ${values.phone || "-"}`,
      "",
      `*Cities:* ${values.city || "-"}`,
      localities.length > 0 ? `*Localities:* ${localities.join(", ")}` : "",
      values.mapLocation ? `*Pinned Location:* ${values.mapLocation}` : "",
      "",
      `*Property Type:* ${values.propertyType || "-"}`,
      `*Configuration:* ${values.configuration || "-"}`,
      `*Budget Tier:* ${values.budgetTier || "-"}${
        values.budgetTier ? ` (${TIER_RANGES.sale[values.budgetTier as TierName]})` : ""
      }`,
      showBedrooms ? `*Bedrooms:* ${values.bedrooms || "-"}` : "",
      showStudioConfig ? `*Studio Configuration:* ${values.studioConfig || "-"}` : "",
      showConstruction ? `*Construction Status:* ${values.constructionStatus || "-"}` : "",
      showPossession ? `*Possession / Availability:* ${values.possession || "-"}` : "",
      showPlots
        ? `*Plot Area:* ${values.plotAreaMin || "-"} – ${values.plotAreaMax || "-"} sqft`
        : "",
      referralCode.trim() ? `*Referral Code:* ${referralCode.trim()}` : "",
      "",
      `*Date:* ${date}`,
      `*Time:* ${time}`,
      "━━━━━━━━━━━━━━━━━━━━",
      // .filter(Boolean) strips the deliberate "" separators, so the sent
      // message has no blank lines — this matches the original exactly.
    ]
      .filter(Boolean)
      .join("\n");

    const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

    const payload = {
      Name: values.name || "",
      Phone: values.phone || "",
      Area: values.city || "",
      Localities: localities.join(", "),
      Map_Location: values.mapLocation || "",
      Property_Type: values.propertyType || "",
      Configuration: values.configuration || "",
      Budget_Tier: values.budgetTier || "",
      ...(showBedrooms ? { Bedrooms: values.bedrooms || "" } : {}),
      ...(showStudioConfig ? { Studio_Configuration: values.studioConfig || "" } : {}),
      ...(showConstruction ? { Construction_Status: values.constructionStatus || "" } : {}),
      ...(showPossession ? { Possession_Availability: values.possession || "" } : {}),
      ...(showPlots
        ? { Plot_Area_Min: values.plotAreaMin || "", Plot_Area_Max: values.plotAreaMax || "" }
        : {}),
      ...(referralCode.trim() ? { Referral_Code: referralCode.trim() } : {}),
      datetime: `${date} ${time}`,
      type: "Buyer",
    };

    // Buyers legitimately send more than one requirement, so only an exact
    // repeat (same phone + city + type + budget + locality) is blocked, via the
    // deterministic fingerprint inside saveSubmission.
    const result = await saveSubmission("BuyerRequirements", values, payload);

    setSubmitting(false);

    if (result.duplicate) {
      setDuplicateNote(
        "You have already sent us this requirement. We will call you about the one you sent earlier.",
      );
    } else {
      setDuplicateNote(null);
    }

    setSubmitted(true);
    if (waURL) window.open(waURL, "_blank");
  };

  const resetForm = () => {
    setSubmitted(false);
    setValues({});
    setErrors({});
    setLocInput("");
    setDuplicateNote(null);
    const r = getReferredBy();
    setReferralCode(r ? r.replace(/^#/, "") : "");
  };

  /* ---------------------------------------------------------------- render */

  return (
    <section
      id="registration-section"
      className="w-full bg-[#F5F7FA] px-4 py-10 sm:px-8 sm:py-16 lg:px-12 lg:py-20"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 text-center sm:mb-10">
          <h2
            className="font-extrabold tracking-[-0.02em] text-off-white"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
          >
            Property <span className="text-primary">Requirements</span>
          </h2>
          <p
            className="mx-auto mt-4 max-w-[520px] text-muted"
            style={{ fontSize: "clamp(0.875rem, 1.1vw, 1rem)" }}
          >
            Tell us what you need and we will help you discover suitable options.
          </p>
        </div>

        {/* Buyer / Rent tabs */}
        <div className="mb-8 flex justify-center gap-6 border-b border-border sm:mb-10 sm:gap-9">
          {(["buy", "rent"] as const).map((t) => {
            const active = t === mode;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(t)}
                className={`-mb-px border-b-2 pb-3 text-[15px] font-semibold transition-colors sm:text-base ${
                  active
                    ? "border-gold text-navy"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {t === "buy" ? "Buyer Requirement" : "Rent Requirement"}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          {/* sidebar */}
          <div className="order-2 lg:order-1">
            <div className="space-y-5">
              {WHY_POINTS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-panel-bg">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-off-white">{title}</div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            </div>

          {/* form */}
          <div className="order-1 rounded-[20px] border border-border bg-panel-bg p-5 sm:p-8 lg:order-2 lg:p-10">
          {mode === "rent" ? (
            /* key remounts on tier change so the form starts clean with it set */
            <RentRequirementForm key={`rent-${pendingTier}-${pendingKey}`} initialTier={pendingTier} />
          ) : submitted ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <CircleCheck className="h-12 w-12 text-primary" strokeWidth={1.5} />
              <span className="text-xl font-bold text-primary">Requirement Received</span>
              <p className="max-w-[320px] text-center text-sm text-muted">
                {duplicateNote ??
                  "Our team will review your requirement and reach out within 24 hours."}
              </p>
              <button
                type="button"
                onClick={resetForm}
                className="mt-3 cursor-pointer border-none bg-none text-xs font-semibold tracking-[0.15em] text-primary uppercase"
              >
                Submit Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div
                className="mb-1 text-center font-bold tracking-[0.1em] text-primary"
                style={{ fontSize: "clamp(0.9rem, 1.2vw, 1.1rem)" }}
              >
                Buyer Preferences
              </div>
              <p
                className="mb-5 text-center text-muted sm:mb-6"
                style={{ fontSize: "clamp(0.75rem, 0.9vw, 0.9rem)" }}
              >
                Complete the form to get started.
              </p>

              <div className="grid grid-cols-1 gap-x-3 gap-y-2.5 sm:grid-cols-2">
                {/* 1 */}
                <div>
                  <label className={labelCls} htmlFor="b-name">
                    Name *
                  </label>
                  <input
                    id="b-name"
                    type="text"
                    placeholder="Your full name"
                    value={values.name || ""}
                    onChange={(e) => handleChange("name", sanitizeName(e.target.value))}
                    className={inputCls}
                  />
                  {errors.name && (
                    <span className="mt-0.5 block text-[10px] text-red-400">
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* 2 */}
                <div>
                  <label className={labelCls} htmlFor="b-phone">
                    Phone Number *
                  </label>
                  <input
                    id="b-phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    value={values.phone || ""}
                    onChange={(e) => handleChange("phone", sanitizePhone(e.target.value))}
                    className={inputCls}
                  />
                  {errors.phone && (
                    <span className="mt-0.5 block text-[10px] text-red-400">
                      {errors.phone}
                    </span>
                  )}
                </div>

                {/* 3 */}
                <div>
                  <label className={labelCls}>City / Cities *</label>
                  <CustomSelect
                    compact
                    multiple
                    value={values.city || ""}
                    onChange={(v) => handleChange("city", v)}
                    options={AREAS}
                    placeholder="Select city"
                  />
                  {errors.city && (
                    <span className="mt-0.5 block text-[10px] text-red-400">
                      {errors.city}
                    </span>
                  )}
                </div>

                {/* 4 */}
                <div>
                  <label className={labelCls}>Property Type *</label>
                  <CustomSelect
                    compact
                    value={values.propertyType || ""}
                    onChange={handleTypeChange}
                    options={PROPERTY_TYPES}
                    placeholder="Select property type"
                  />
                  {errors.propertyType && (
                    <span className="mt-0.5 block text-[10px] text-red-400">
                      {errors.propertyType}
                    </span>
                  )}
                </div>

                {/* 4b — configuration (single-level / duplex / triplex / other) */}
                <div>
                  <label className={labelCls}>Configuration *</label>
                  <CustomSelect
                    compact
                    value={values.configuration || ""}
                    onChange={(v) => handleChange("configuration", v)}
                    options={CONFIGURATION_OPTIONS}
                    placeholder="Select configuration"
                  />
                  {errors.configuration && (
                    <span className="mt-0.5 block text-[10px] text-red-400">
                      {errors.configuration}
                    </span>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Budget Tier *</label>
                  <CustomSelect
                    compact
                    value={values.budgetTier || ""}
                    onChange={(val) => handleChange("budgetTier", val)}
                    options={[...TIER_NAMES]}
                    placeholder="Select tier"
                  />
                  {values.budgetTier && (
                    <p className="mt-1 text-[11px] text-muted">
                      {TIER_RANGES.sale[values.budgetTier as TierName]}
                    </p>
                  )}
                  {errors.budgetTier && (
                    <span className="mt-0.5 block text-[10px] text-red-400">
                      {errors.budgetTier}
                    </span>
                  )}
                </div>

                {/* 5 — locality + map, hidden until a city is picked */}
                {citySelected && (
                  <div className="sm:col-span-2">
                    <label className={labelCls} htmlFor="b-locality">
                      Locality / Area *
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="b-locality"
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

                    {errors.localities && (
                      <span className="mt-0.5 block text-[10px] text-red-400">
                        {errors.localities}
                      </span>
                    )}

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
                              onClick={() => removeLocality(loc)}
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
                        onLocationSelect={(addr) => handleChange("mapLocation", addr)}
                        initialLocation={
                          localities.length > 0
                            ? localities[localities.length - 1]
                            : (values.city?.split(", ")[0] || "")
                        }
                      />
                      {values.mapLocation && (
                        <span className="mt-1.5 block text-[10px] text-muted">
                          📍 Pinned:{" "}
                          <span className="font-semibold text-primary">
                            {values.mapLocation}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                )}


                {/* 9 */}
                {showBedrooms && (
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Bedrooms *</label>
                    <div className="flex flex-wrap gap-2">
                      {BEDROOMS.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => handleChange("bedrooms", b)}
                          className={chipCls(values.bedrooms === b)}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                    {errors.bedrooms && (
                      <span className="mt-0.5 block text-[10px] text-red-400">
                        {errors.bedrooms}
                      </span>
                    )}
                  </div>
                )}

                {/* 10 */}
                {showStudioConfig && (
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Studio Configuration *</label>
                    <div className="flex flex-wrap gap-2">
                      {STUDIO_CONFIG.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleChange("studioConfig", c)}
                          className={chipCls(values.studioConfig === c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    {errors.studioConfig && (
                      <span className="mt-0.5 block text-[10px] text-red-400">
                        {errors.studioConfig}
                      </span>
                    )}
                  </div>
                )}

                {/* 11 */}
                {showConstruction && (
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Construction Status *</label>
                    <div className="flex flex-wrap gap-2">
                      {CONSTRUCTION_STATUS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleConstructionChange(c)}
                          className={chipCls(values.constructionStatus === c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    {errors.constructionStatus && (
                      <span className="mt-0.5 block text-[10px] text-red-400">
                        {errors.constructionStatus}
                      </span>
                    )}
                  </div>
                )}

                {/* 12 — sorted by length desc, then chunked 2 per row */}
                {showPossession && (
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Possession / Availability *</label>
                    {(() => {
                      const opts = POSSESSION_OPTIONS[values.constructionStatus || ""];
                      const sorted = [...opts].sort((a, b) => b.length - a.length);
                      const rows = [sorted.slice(0, 2), sorted.slice(2)];
                      return (
                        <div className="flex flex-col gap-2">
                          {rows.map((row, ri) =>
                            row.length > 0 ? (
                              <div key={ri} className="flex gap-2">
                                {row.map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleChange("possession", opt)}
                                    className={chipCls(values.possession === opt)}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            ) : null,
                          )}
                        </div>
                      );
                    })()}
                    {errors.possession && (
                      <span className="mt-0.5 block text-[10px] text-red-400">
                        {errors.possession}
                      </span>
                    )}
                  </div>
                )}

                {/* 13 */}
                {showPlots && (
                  <div>
                    <label className={labelCls}>Minimum Plot Area *</label>
                    <CustomSelect
                      compact
                      value={values.plotAreaMin || ""}
                      onChange={(v) => handleChange("plotAreaMin", v)}
                      options={AREA_OPTIONS}
                      placeholder="Min area"
                    />
                    {errors.plotAreaMin && (
                      <span className="mt-0.5 block text-[10px] text-red-400">
                        {errors.plotAreaMin}
                      </span>
                    )}
                  </div>
                )}

                {/* 14 */}
                {showPlots && (
                  <div>
                    <label className={labelCls}>Maximum Plot Area *</label>
                    <CustomSelect
                      compact
                      value={values.plotAreaMax || ""}
                      onChange={(v) => handleChange("plotAreaMax", v)}
                      options={AREA_OPTIONS}
                      placeholder="Max area"
                    />
                    {errors.plotAreaMax && (
                      <span className="mt-0.5 block text-[10px] text-red-400">
                        {errors.plotAreaMax}
                      </span>
                    )}
                  </div>
                )}

                {/* 15 */}
                {errors.plotAreaRange && (
                  <div className="-mt-1 sm:col-span-2">
                    <span className="text-[10px] text-red-400">
                      {errors.plotAreaRange}
                    </span>
                  </div>
                )}

                {/* 16 */}
                <div className="sm:col-span-2">
                  <label className={labelCls} htmlFor="b-ref">
                    Referral Code
                  </label>
                  <input
                    id="b-ref"
                    type="text"
                    placeholder="e.g. PB12345A (optional)"
                    value={referralCode}
                    onChange={(e) =>
                      setReferralCode(
                        e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8),
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
          )}
          </div>
        </div>
      </div>
    </section>
  );
}