"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CircleCheck, Handshake, Home, IndianRupee, LineChart } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import PropertyWizard, { type PropValues } from "@/components/PropertyWizard";
import {
  CONFIGURATION_OPTS, PROPERTY_TYPE_OPTIONS, SELL_CONFIG, inputCls, labelCls,
  propertyFlags, toFirestoreKey,
} from "@/lib/property-config";
import { NAME_RE, PHONE_RE, sanitizeName, sanitizePhone } from "@/lib/validation";
import { getReferredBy, normalizeRefCode } from "@/lib/referral-storage";
import { saveSubmission } from "@/lib/firebase";
import { duplicateMessage } from "@/lib/dedupe";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918800505050";

const OWNER_POINTS = [
  {
    icon: Handshake,
    title: "Genuine Buyers Only",
    desc: "Your listing is matched against buyer requirements our team has vetted, not scrolled past by strangers.",
  },
  {
    icon: LineChart,
    title: "Honest Valuation",
    desc: "We work out a realistic number from comparable sales nearby, so you neither overprice nor undersell.",
  },
  {
    icon: Home,
    title: "Presented Properly",
    desc: "We help you put the property forward in a way that actually reads well to a serious buyer.",
  },
  {
    icon: IndianRupee,
    title: "Zero Listing Cost",
    desc: "Putting your property up costs you nothing. We only earn when your deal actually closes.",
  },
];

type Mode = "seller" | "builder";

export const SELLER_MODE_EVENT = "indiafloor:select-seller-mode";

/**
 * One fully independent listing form. SellerSection mounts one per tab, so the
 * two journeys never share values, steps, errors or submission state.
 */
function useListingForm(formMode: Mode) {
  const [v, setV] = useState<PropValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [duplicateNote, setDuplicateNote] = useState<string | null>(null);

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

  const hideTransaction = formMode === "builder";
  const flags = propertyFlags(v);

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

  /* type change prunes orphaned config keys and always clears amenities */
  const handleAssetTypeChange = (newType: string) => {
    setV((prev) => {
      const next: Record<string, string> = { ...prev };
      const oldKeys = (SELL_CONFIG[prev.assetType || ""] || []).map((f) => f.key);
      const newKeys = new Set((SELL_CONFIG[newType] || []).map((f) => f.key));
      oldKeys.forEach((k) => {
        if (!newKeys.has(k)) delete next[k];
      });
      delete next.amenities;
      next.assetType = newType;
      return next;
    });
    setSubmitted(false);
  };

  const handleTransactionChange = (val: string) => {
    setV((prev) => {
      const next: Record<string, string> = { ...prev, transactionType: val };
      if (val === "New Property") delete next.occupancyStatus;
      return next;
    });
    setSubmitted(false);
  };

  const handleConstructionToggle = (val: string) => {
    setV((prev) => {
      const next: Record<string, string> = { ...prev, existingConstruction: val };
      if (val !== "Yes") delete next.coveredArea;
      return next;
    });
    setSubmitted(false);
  };

  const validateBasic = (): boolean => {
    const e: Record<string, string> = {};
    if (!v.sellerName?.trim()) e.sellerName = "Required";
    else if (!NAME_RE.test(v.sellerName.trim()))
      e.sellerName = "Enter a valid name (min 3 letters)";
    if (!v.mobile?.trim()) e.mobile = "Required";
    else if (!PHONE_RE.test(v.mobile)) e.mobile = "Enter a valid 10-digit mobile number";
    if (!v.assetType) e.assetType = "Required";
    if (!v.configuration) e.configuration = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();

    // Full re-validation, then jump to the earliest failing step.
    // NOTE: possession & ownership have no UI (always hidden), so they are
    // never required here — requiring them would block submission forever.
    const errs: Record<string, string> = {};
    if (!v.sellerName?.trim()) errs.sellerName = "Required";
    else if (!NAME_RE.test(v.sellerName.trim()))
      errs.sellerName = "Enter a valid name (min 3 letters)";
    if (!v.mobile?.trim()) errs.mobile = "Required";
    else if (!PHONE_RE.test(v.mobile)) errs.mobile = "Enter a valid 10-digit mobile number";
    if (!v.assetType) errs.assetType = "Required";
    if (!v.configuration) errs.configuration = "Required";
    if (!v.city?.trim()) errs.city = "Required";
    if (!v.locality?.trim()) errs.locality = "Required";
    else if (v.locality.trim().length < 2)
      errs.locality = "Too short (min 2 characters)";
    if (!v.address?.trim()) errs.address = "Required";
    else if (v.address.trim().length < 5)
      errs.address = "Enter a valid address (min 5 characters)";
    if (!hideTransaction && !v.transactionType) errs.transactionType = "Required";
    if (!v.expectedValue?.trim()) errs.expectedValue = "Required";

    flags.typeConfig.forEach((fd) => {
      if (fd.required && !v[fd.key]?.trim() &&
          !(fd.key === "coveredArea" && !flags.showCoveredArea))
        errs[fd.key] = "Required";
    });
    if (!hideTransaction && flags.isResale && !v.occupancyStatus?.trim())
      errs.occupancyStatus = "Required";

    // step index of Price Details shifts when Transaction Details is hidden
    const priceStep = hideTransaction ? 3 : 4;
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      if (errs.sellerName || errs.mobile || errs.assetType || errs.configuration) setStep(0);
      else if (errs.city || errs.locality || errs.address || errs.pincode) setStep(1);
      else if (Object.keys(errs).some((k) => flags.configKeys.has(k))) setStep(2);
      else if (errs.transactionType || errs.occupancyStatus) setStep(3);
      else if (errs.expectedValue) setStep(priceStep);
      return;
    }

    setSubmitting(true);

    const now = new Date();
    const date = now.toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });
    const time = now.toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    });

    const L: string[] = [
      "━━━━━━━━━━━━━━━━━━━━",
      "*INDIA FLOOR*",
      formMode === "seller" ? "New Property Submission" : "New Builder Inventory Submission",
      "━━━━━━━━━━━━━━━━━━━━",
      "",
      `*Name:* ${v.sellerName || "-"}`,
      `*Mobile:* ${v.mobile || "-"}`,
      "",
      `*Property Type:* ${flags.propType || "-"}`,
      `*Configuration:* ${v.configuration || "-"}`,
      "",
      `*City:* ${v.city || "-"}`,
      `*Locality / Area:* ${v.locality || "-"}`,
      `*Address:* ${v.address || "-"}`,
      v.pincode ? `*Pincode:* ${v.pincode}` : "",
      v.mapLocation ? `*Pinned Location:* ${v.mapLocation}` : "",
      "",
    ];

    flags.typeConfig.forEach((fd) => {
      if (fd.key === "coveredArea" && !flags.showCoveredArea) return;
      if (v[fd.key]) L.push(`*${fd.label.replace(/ \*$/, "")}:* ${v[fd.key]}`);
    });

    if (flags.showAmenities && v.amenities) L.push(`*Amenities:* ${v.amenities}`);
    if (!flags.isLandType && v.propertyAge) L.push(`*Property Age:* ${v.propertyAge}`);
    if (!flags.isLandType && v.flooring) L.push(`*Flooring:* ${v.flooring}`);
    if (!flags.isLandType && v.waterSupply) L.push(`*Water Supply:* ${v.waterSupply}`);

    if (!hideTransaction) {
      L.push("", `*Transaction Type:* ${v.transactionType || "-"}`);
      if (flags.isResale && v.occupancyStatus)
        L.push(`*Occupancy Status:* ${v.occupancyStatus}`);
    }

    L.push("", `*Expected Price:* ₹${v.expectedValue || "-"}`);
    if (v.negotiability) L.push(`*Negotiability:* ${v.negotiability}`);

    if (v.additionalNotes?.trim()) L.push(`*Additional Notes:* ${v.additionalNotes.trim()}`);
    if (referralCode.trim()) L.push(`*Referral Code:* ${referralCode.trim()}`);
    L.push("", `*Date:* ${date}`, `*Time:* ${time}`, "━━━━━━━━━━━━━━━━━━━━");

    const msg = L.filter(Boolean).join("\n");
    const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

    const payload: Record<string, unknown> = {
      Name: v.sellerName || "",
      Mobile_Number: v.mobile || "",
      Property_Type: flags.propType,
      Configuration: v.configuration || "",
      City: v.city || "",
      Locality_Area: v.locality || "",
      Address: v.address || "",
      Pin_Code: v.pincode || "",
      Map_Location: v.mapLocation || "",
      Expected_Price: v.expectedValue || "",
      Price_Negotiability: v.negotiability || "",
      ...(!hideTransaction
        ? {
            Transaction_Type: v.transactionType || "",
            ...(flags.isResale && v.occupancyStatus
              ? { Occupancy_Status: v.occupancyStatus }
              : {}),
          }
        : {}),
      ...(v.additionalNotes?.trim() ? { Additional_Notes: v.additionalNotes.trim() } : {}),
      ...(referralCode.trim() ? { Referral_Code: referralCode.trim() } : {}),
      datetime: `${date} ${time}`,
      type: formMode === "seller" ? "Property_Owner" : "Property_Builder",
    };

    // Spec-derived keys are written after the explicit ones, exactly as the
    // original form does.
    flags.typeConfig.forEach((fd) => {
      if (fd.key === "coveredArea" && !flags.showCoveredArea) return;
      if (v[fd.key]) payload[toFirestoreKey(fd.label)] = v[fd.key];
    });
    if (flags.showAmenities && v.amenities) payload.Amenities = v.amenities;
    if (!flags.isLandType && v.propertyAge) payload.Property_Age = v.propertyAge;
    if (!flags.isLandType && v.flooring) payload.Flooring = v.flooring;
    if (!flags.isLandType && v.waterSupply) payload.Water_Supply = v.waterSupply;

    // listingMode keeps the two journeys independent in dedupe fingerprints;
    // Seller and Builder each write to their own collection.
    const result = await saveSubmission(
      formMode === "builder" ? "BuilderListing" : "ListYourProperty",
      { ...v, listingMode: formMode },
      payload,
    );

    setSubmitting(false);
    setDuplicateNote(
      result.duplicate && result.existingId
        ? duplicateMessage({ isDuplicate: true, score: 0, matchedOn: [], existingId: result.existingId })
        : null,
    );
    setSubmitted(true);
    // exact repeats are acknowledged in-form; don't ping the office twice
    if (!result.duplicate && waURL) window.open(waURL, "_blank");
  };

  const resetForm = () => {
    setSubmitted(false);
    setV({});
    setErrors({});
    setStep(0);
    setDuplicateNote(null);
    const r = getReferredBy();
    setReferralCode(r ? r.replace(/^#/, "") : "");
  };

  const err = (k: string) =>
    errors[k] ? (
      <span className="mt-0.5 block text-[10px] text-red-400">{errors[k]}</span>
    ) : null;

  return {
    v, errors, setErrors, step, setStep, submitted, referralCode, setReferralCode,
    duplicateNote, submitting, flags, hideTransaction,
    handleChange, handleAssetTypeChange, handleTransactionChange,
    handleConstructionToggle, validateBasic, handleSubmit, resetForm, err,
  };
}

export default function SellerSection() {
  const [mode, setMode] = useState<Mode>("seller");
  const seller = useListingForm("seller");
  const builder = useListingForm("builder");
  const F = mode === "seller" ? seller : builder;

  useEffect(() => {
    const onMode = (e: Event) => {
      const detail = (e as CustomEvent<{ tab: "seller" | "builder"; name?: string; phone?: string }>).detail;
      const nextMode = detail.tab === "builder" ? "builder" : "seller";
      setMode(nextMode);
      if (detail.name || detail.phone) {
        const target = nextMode === "builder" ? builder : seller;
        if (detail.name) target.handleChange("sellerName", detail.name);
        if (detail.phone) target.handleChange("mobile", detail.phone);
      }
    };
    window.addEventListener(SELLER_MODE_EVENT, onMode);
    return () => window.removeEventListener(SELLER_MODE_EVENT, onMode);
  }, []);

  return (
    <section id="seller-section" className="w-full bg-white px-4 py-10 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 text-center sm:mb-10">
          <h2
            className="font-extrabold tracking-[-0.02em] text-off-white"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
          >
            List Your <span className="text-primary">Property</span>
          </h2>
          <p
            className="mx-auto mt-4 max-w-[520px] text-muted"
            style={{ fontSize: "clamp(0.875rem, 1.1vw, 1rem)" }}
          >
            Tell us about the property and we will connect you with serious buyers.
          </p>
        </div>


        {/* Seller / Builder tabs */}
        <div className="mb-8 flex justify-center gap-6 border-b border-border sm:mb-10 sm:gap-9">
          {([
            { key: "seller", label: "Seller Listing" },
            { key: "builder", label: "Builder Listing" },
          ] as const).map((t) => {
            const active = t.key === mode;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(t.key)}
                className={`-mb-px border-b-2 pb-3 text-[15px] font-semibold transition-colors sm:text-base ${
                  active
                    ? "border-gold text-navy"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="order-2 lg:order-1">
            <h3 className="text-lg font-bold text-off-white">Have a Floor to Sell, Rent or Lease?</h3>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              IndiaFloor helps connect eligible property inventory with relevant
              buyers and tenants through focused discovery and coordinated
              enquiries.
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              We welcome property submissions from builders, developers, sellers,
              owners and landlords.
            </p>

            <div className="mt-6">
              <h4 className="text-[12px] font-bold tracking-[0.14em] text-off-white uppercase">
                What You Can Submit
              </h4>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Residential floors | Farmhouse floors | Penthouses | Commercial
                floors | Industrial floors | Institutional floors | Other
                eligible floor-based properties
              </p>
            </div>

            <div className="mt-6">
              <h4 className="text-[12px] font-bold tracking-[0.14em] text-off-white uppercase">
                How It Works
              </h4>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-muted">
                <li>Select your property-provider journey.</li>
                <li>Select the property configuration.</li>
                <li>Complete the prefilled property submission form.</li>
                <li>Provide the property details and appropriate ownership or marketing authorisation.</li>
                <li>Discuss the commercial terms with IndiaFloor.</li>
              </ol>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                Once the required arrangements are agreed in writing, the
                property may be considered for onboarding and marketing.
              </p>
            </div>

          </div>

          <div className="order-1 rounded-[20px] border border-border bg-panel-bg p-5 sm:p-8 lg:order-2 lg:p-10">
            {F.submitted ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <CircleCheck className="h-12 w-12 text-primary" strokeWidth={1.5} />
                <span className="text-xl font-bold text-primary">Property Details Received</span>
                <p className="max-w-[320px] text-center text-sm text-muted">
                  {F.duplicateNote ??
                    "Your property details have been received. Our team will contact you for verification and next steps."}
                </p>
                <button
                  type="button"
                  onClick={F.resetForm}
                  className="mt-3 cursor-pointer border-none bg-none text-xs font-semibold tracking-[0.15em] text-primary uppercase"
                >
                  Submit Another
                </button>
              </div>
            ) : (
              /* the seller form swallows every Enter press */
              <form onSubmit={F.handleSubmit} noValidate onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}>
                <div
                  className="mb-1 text-center font-bold tracking-[0.1em] text-primary"
                  style={{ fontSize: "clamp(0.9rem, 1.2vw, 1.1rem)" }}
                >
                  Property Details
                </div>
                <p
                  className="mb-5 text-center text-muted sm:mb-6"
                  style={{ fontSize: "clamp(0.75rem, 0.9vw, 0.9rem)" }}
                >
                  Takes about three minutes.
                </p>

                <PropertyWizard
                  values={F.v}
                  onChange={F.handleChange}
                  onTransactionChange={F.handleTransactionChange}
                  onConstructionToggle={F.handleConstructionToggle}
                  onSubmit={() => F.handleSubmit()}
                  submitting={F.submitting}
                  errors={F.errors}
                  onStepErrors={F.setErrors}
                  step={F.step}
                  setStep={F.setStep}
                  firstStepTitle="Basic Details"
                  onFirstStepNext={() => { if (F.validateBasic()) F.setStep(1); }}
                  submitLabel="Submit Your Property"
                  hideTransaction={F.hideTransaction}
                  hidePossession={true}
                  hideOwnership={true}
                  showConsentNote
                  firstStep={
                    <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>Name *</label>
                        <input
                          type="text"
                          placeholder="Your full name"
                          value={F.v.sellerName || ""}
                          onChange={(e) => F.handleChange("sellerName", sanitizeName(e.target.value))}
                          className={inputCls}
                        />
                        {F.err("sellerName")}
                      </div>
                      <div>
                        <label className={labelCls}>Mobile Number *</label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          placeholder="10-digit mobile number"
                          value={F.v.mobile || ""}
                          onChange={(e) => F.handleChange("mobile", sanitizePhone(e.target.value))}
                          className={inputCls}
                        />
                        {F.err("mobile")}
                      </div>
                      <div>
                        <label className={labelCls}>Property Type *</label>
                        <CustomSelect
                          compact
                          value={F.v.assetType || ""}
                          onChange={F.handleAssetTypeChange}
                          options={PROPERTY_TYPE_OPTIONS}
                          placeholder="Select property type"
                        />
                        {F.err("assetType")}
                      </div>
                      <div>
                        <label className={labelCls}>Configuration *</label>
                        <CustomSelect
                          compact
                          value={F.v.configuration || ""}
                          onChange={(val) => F.handleChange("configuration", val)}
                          options={CONFIGURATION_OPTS}
                          placeholder="Select configuration"
                        />
                        {F.err("configuration")}
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Additional Notes</label>
                        <textarea
                          rows={3}
                          placeholder="Anything else you want us to know (optional)"
                          value={F.v.additionalNotes || ""}
                          onChange={(e) => F.handleChange("additionalNotes", e.target.value.slice(0, 500))}
                          className={inputCls}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Referral Code</label>
                        <input
                          type="text"
                          placeholder="e.g. PB12345A (optional)"
                          value={F.referralCode}
                          onChange={(e) =>
                            F.setReferralCode(
                              e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10),
                            )
                          }
                          className={inputCls}
                        />
                      </div>
                    </div>
                  }
                />
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
