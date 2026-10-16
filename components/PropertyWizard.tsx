"use client";

/**
 * The multi-step property wizard shared by the seller form and the dealer's
 * optional "submit a property too" flow.
 *
 * The original site duplicated ~90% of this as `dp*`-prefixed functions. The
 * duplication is collapsed here: both callers own their own values bag, and the
 * step that precedes the wizard (`Basic Details` / `Property Type`) is passed
 * in as `firstStep`.
 */
import { useMemo, type ReactNode } from "react";
import dynamic from "next/dynamic";
import CustomSelect from "@/components/CustomSelect";
import {
  AGE_OPTS, CITY_OPTIONS, DOCS_OPTS, FLOORING_OPTS, LOAN_OPTS,
  NEGOTIABILITY_OPTS, OCCUPANCY_OPTS, OWNERSHIP_OPTS, POSSESSION_STATUS_OPTS,
  TRANSACTION_OPTS, WATER_OPTS, buildSteps, inputCls, labelCls, propertyFlags,
  sanitizePropertyField, type SellFieldDef,
} from "@/lib/property-config";
import { PIN_RE, isNumericPos, isPriceValid, sanitizeDigits } from "@/lib/validation";

const LocationMap = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
});

export type PropValues = Record<string, string>;

const cellCls = (fd: SellFieldDef) => (fd.span === 2 ? "sm:col-span-2" : "");

const chipCls = (active: boolean) =>
  `flex-1 min-w-fit px-3 py-2 rounded-lg border text-[12px] font-semibold transition-all whitespace-nowrap ${
    active
      ? "border-primary bg-primary/8 text-primary"
      : "border-border bg-white text-off-white hover:border-primary/40"
  }`;

const toggleCls = (active: boolean) =>
  `px-3.5 py-2 rounded-full border text-[11.5px] font-semibold transition-all ${
    active
      ? "border-primary bg-primary text-white"
      : "border-border bg-white text-muted hover:border-primary/40"
  }`;

export default function PropertyWizard({
  values, onChange, onTransactionChange, onConstructionToggle,
  onSubmit, submitting, errors, onStepErrors, step, setStep, firstStep,
  firstStepTitle, onFirstStepNext, submitLabel, onBackToFirst,
  showBackOnFirstStep = false, headingClass = "mt-5",
  hideTransaction = false, hidePossession = false, hideOwnership = false,
  showConsentNote = false,
}: {
  values: PropValues;
  onChange: (id: string, value: string) => void;
  onTransactionChange: (t: string) => void;
  onConstructionToggle: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  errors: Record<string, string>;
  onStepErrors: (e: Record<string, string>) => void;
  step: number;
  setStep: (n: number) => void;
  firstStep: ReactNode;
  firstStepTitle: string;
  firstStepError?: (key: string) => ReactNode;
  onFirstStepNext: () => void;
  submitLabel: string;
  onBackToFirst?: () => void;
  showBackOnFirstStep?: boolean;
  headingClass?: string;
  hideTransaction?: boolean;
  hidePossession?: boolean;
  hideOwnership?: boolean;
  showConsentNote?: boolean;
}) {
  const flags = useMemo(() => propertyFlags(values), [values]);
  const {
    propType, typeConfig, configKeys, isResale, showCoveredArea,
    showPossessionStatus, amenities,
  } = flags;

  const steps = useMemo(
    () => buildSteps(flags, { hideTransaction, hideOwnership, hidePossession }),
    [flags, hideTransaction, hideOwnership, hidePossession],
  );
  const total = Math.max(steps.length + 1, 1);
  const idx = Math.min(step, total - 1);
  const currentKey = idx === 0 ? "first" : (steps[idx - 1]?.key ?? "");
  const stepTitle = idx === 0 ? firstStepTitle : (steps[idx - 1]?.title ?? "");

  const err = (k: string) =>
    errors[k] ? (
      <span className="mt-0.5 block text-[10px] text-red-400">{errors[k]}</span>
    ) : null;

  const toggleMulti = (id: string, opt: string) => {
    const cur = (values[id] || "").split(", ").filter(Boolean);
    const next = cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt];
    onChange(id, next.join(", "));
  };

  const renderChips = (key: string, options: string[], onPick?: (o: string) => void) => (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => (onPick ? onPick(opt) : onChange(key, opt))}
          className={chipCls(values[key] === opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  const renderToggleChips = (key: string, options: string[]) => {
    const sel = (values[key] || "").split(", ").filter(Boolean);
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggleMulti(key, opt)}
            className={toggleCls(sel.includes(opt))}
          >
            {sel.includes(opt) ? "✓ " : ""}
            {opt}
          </button>
        ))}
      </div>
    );
  };

  const renderField = (fd: SellFieldDef) => {
    if (fd.kind === "chips") return renderChips(fd.key, fd.options || []);
    if (fd.kind === "toggle") return renderToggleChips(fd.key, fd.options || []);
    if (fd.kind === "select")
      return (
        <CustomSelect
          compact
          value={values[fd.key] || ""}
          onChange={(v) => onChange(fd.key, v)}
          options={fd.options || []}
          placeholder="Select"
        />
      );
    const numeric = [
      "carpetArea", "builtupArea", "coveredArea", "plotArea", "roadWidth",
      "totalFloors", "numFloors", "totalFloorsAllowed",
    ].includes(fd.key);
    return (
      <input
        type="text"
        inputMode={numeric ? "decimal" : undefined}
        placeholder={fd.placeholder}
        value={values[fd.key] || ""}
        onChange={(e) => onChange(fd.key, sanitizePropertyField(fd.key, e.target.value))}
        className={inputCls}
      />
    );
  };

  /**
   * Per-step gate. `amenities`, `extra` and `ownership` have no branch — Next
   * always passes on those, matching the original form.
   */
  const validateStep = (key: string): boolean => {
    const e: Record<string, string> = {};
    const req = (k: string) => {
      if (!values[k]?.trim()) e[k] = "Required";
    };

    if (key === "location") {
      req("city");
      if (!values.locality?.trim()) e.locality = "Required";
      else if (values.locality.trim().length < 2)
        e.locality = "Too short (min 2 characters)";
      if (!values.address?.trim()) e.address = "Required";
      else if (values.address.trim().length < 5)
        e.address = "Enter a valid address (min 5 characters)";
      if (values.pincode?.trim() && !PIN_RE.test(values.pincode.trim()))
        e.pincode = "Enter a valid 6-digit pincode";
    } else if (key === "specs") {
      typeConfig.forEach((fd) => {
        if (fd.required && !values[fd.key]?.trim() &&
            !(fd.key === "coveredArea" && !showCoveredArea))
          e[fd.key] = "Required";
      });
      if (configKeys.has("coveredArea") && values.existingConstruction === "Yes" &&
          !values.coveredArea?.trim())
        e.coveredArea = "Required";

      ["carpetArea", "builtupArea", "coveredArea", "plotArea"].forEach((k) => {
        if (configKeys.has(k) && values[k]?.trim() && !isNumericPos(values[k]))
          e[k] = "Enter a valid value greater than 0";
      });
      ["totalFloors", "numFloors", "totalFloorsAllowed"].forEach((k) => {
        if (configKeys.has(k) && values[k]?.trim()) {
          const t = values[k].trim();
          if (!/^\d{1,3}$/.test(t) || Number(t) <= 0) e[k] = "Enter a valid number";
        }
      });
      if (configKeys.has("roadWidth") && values.roadWidth?.trim()) {
        const t = values.roadWidth.trim();
        if (!/^\d+(\.\d+)?$/.test(t) || Number(t) <= 0)
          e.roadWidth = "Enter a valid width";
      }
      ["parkingAvailability", "powerBackup", "vehicleAccessibility",
       "suitableIndustrialUse", "suitableAgriculturalUse"].forEach((k) => {
        if (configKeys.has(k) && values[k]?.trim() && values[k].trim().length < 3)
          e[k] = "Too short (min 3 characters)";
      });
    } else if (key === "transaction") {
      req("transactionType");
      if (showPossessionStatus) req("possessionStatus");
      if (isResale) req("occupancyStatus");
    } else if (key === "price") {
      if (!values.expectedValue?.trim()) e.expectedValue = "Required";
      else if (!isPriceValid(values.expectedValue))
        e.expectedValue = "Enter a valid amount (min ₹1,000)";
    }

    // the caller owns the errors bag
    onStepErrors(e);
    return Object.keys(e).length === 0;
  };

  /* --------------------------------------------------------------- render */

  return (
    <div>
      {total > 1 && (
        <>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.12em] text-primary uppercase">
              Step {idx + 1} of {total}
            </span>
            <span className="text-[10px] font-bold tracking-[0.12em] text-muted uppercase">
              {stepTitle}
            </span>
          </div>
          <div className="mb-5 h-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${((idx + 1) / total) * 100}%` }}
            />
          </div>
        </>
      )}

      {currentKey === "first" && firstStep}

      {currentKey === "location" && (
        <>
          <div className={`mb-2 font-extrabold text-off-white ${headingClass}`}>
            Property Location
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
            <div>
              <label className={labelCls}>City *</label>
              <CustomSelect
                compact
                value={values.city || ""}
                onChange={(v) => onChange("city", v)}
                options={CITY_OPTIONS}
                placeholder="Select city"
              />
              {err("city")}
            </div>
            <div>
              <label className={labelCls}>Locality / Area *</label>
              <input
                type="text"
                placeholder="Locality / Area"
                value={values.locality || ""}
                onChange={(e) => onChange("locality", e.target.value)}
                className={inputCls}
              />
              {err("locality")}
            </div>
            <div>
              <label className={labelCls}>Address *</label>
              <input
                type="text"
                placeholder="Full property address"
                value={values.address || ""}
                onChange={(e) => onChange("address", e.target.value)}
                className={inputCls}
              />
              {err("address")}
            </div>
            <div>
              <label className={labelCls}>Pincode</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="6-digit pincode"
                value={values.pincode || ""}
                onChange={(e) => onChange("pincode", sanitizeDigits(e.target.value, 6))}
                className={inputCls}
              />
              {err("pincode")}
            </div>
            <div className="sm:col-span-2">
              <LocationMap
                onLocationSelect={(addr) => onChange("mapLocation", addr)}
                initialLocation={values.locality || values.city}
              />
              {values.mapLocation && (
                <span className="mt-1.5 block text-[10px] text-muted">
                  📍 Pinned:{" "}
                  <span className="font-semibold text-primary">{values.mapLocation}</span>
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {currentKey === "specs" && (
        <>
          <div className={`mb-2 font-extrabold text-off-white ${headingClass}`}>
            Property Specifications
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
            {typeConfig.map((fd) => {
              if (fd.key === "coveredArea" && configKeys.has("existingConstruction") &&
                  !showCoveredArea) return null;
              return (
                <div key={fd.key} className={cellCls(fd)}>
                  <label className={labelCls}>{fd.label}</label>
                  {fd.key === "existingConstruction"
                    ? renderChips(fd.key, ["Yes", "No"], onConstructionToggle)
                    : renderField(fd)}
                  {err(fd.key)}
                </div>
              );
            })}
          </div>
        </>
      )}

      {currentKey === "transaction" && !hideTransaction && (
        <>
          <div className={`mb-2 font-extrabold text-off-white ${headingClass}`}>
            Transaction Details
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Transaction Type *</label>
              <div className="flex flex-wrap gap-2">
                {TRANSACTION_OPTS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onTransactionChange(opt)}
                    className={chipCls(values.transactionType === opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {err("transactionType")}
            </div>
            {showPossessionStatus && !hidePossession && (
              <div className="sm:col-span-2">
                <label className={labelCls}>Possession Status *</label>
                {renderChips("possessionStatus", POSSESSION_STATUS_OPTS)}
                {err("possessionStatus")}
              </div>
            )}
            {isResale && (
              <div className="sm:col-span-2">
                <label className={labelCls}>Occupancy Status *</label>
                {renderChips("occupancyStatus", OCCUPANCY_OPTS)}
                {err("occupancyStatus")}
              </div>
            )}
          </div>
        </>
      )}

      {currentKey === "price" && (
        <>
          <div className={`mb-2 font-extrabold text-off-white ${headingClass}`}>
            Price Details
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Expected Price (₹) *</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="₹"
                value={values.expectedValue || ""}
                onChange={(e) =>
                  onChange("expectedValue", sanitizePropertyField("roadWidth", e.target.value))
                }
                className={inputCls}
              />
              {err("expectedValue")}
            </div>
            <div>
              <label className={labelCls}>Price Negotiability</label>
              {renderChips("negotiability", NEGOTIABILITY_OPTS)}
              {err("negotiability")}
            </div>
          </div>
        </>
      )}

      {currentKey === "amenities" && (
        <>
          <div className={`mb-2 font-extrabold text-off-white ${headingClass}`}>
            Amenities &amp; Facilities
          </div>
          {renderToggleChips("amenities", amenities)}
          {err("amenities")}
        </>
      )}

      {currentKey === "extra" && (
        <>
          <div className={`mb-2 font-extrabold text-off-white ${headingClass}`}>
            Additional Details
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Property Age</label>
              <CustomSelect compact value={values.propertyAge || ""}
                onChange={(v) => onChange("propertyAge", v)}
                options={AGE_OPTS} placeholder="Select" />
            </div>
            <div>
              <label className={labelCls}>Flooring</label>
              <CustomSelect compact value={values.flooring || ""}
                onChange={(v) => onChange("flooring", v)}
                options={FLOORING_OPTS} placeholder="Select" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Water Supply</label>
              {renderChips("waterSupply", WATER_OPTS)}
            </div>
          </div>
        </>
      )}

      {currentKey === "ownership" && !hideOwnership && (
        <>
          <div className={`mb-2 font-extrabold text-off-white ${headingClass}`}>
            Ownership &amp; Docs
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Ownership Type *</label>
              {renderChips("ownershipType", OWNERSHIP_OPTS)}
              {err("ownershipType")}
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Existing Loan *</label>
              {renderChips("existingLoan", LOAN_OPTS)}
              {err("existingLoan")}
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Dispute / Litigation *</label>
              {renderChips("legalDispute", ["Yes", "No"])}
              {err("legalDispute")}
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Documents Available</label>
              {renderToggleChips("documentsAvailable", DOCS_OPTS)}
            </div>
          </div>
        </>
      )}

      <div className="mt-6 flex gap-3">
        {(idx > 0 || showBackOnFirstStep) && (
          <button
            type="button"
            onClick={() => { if (idx === 0) onBackToFirst?.(); else setStep(idx - 1); }}
            className="flex-1 cursor-pointer rounded-lg border border-border bg-white py-3 font-sans text-[13px] font-bold tracking-wide text-muted transition-all hover:border-primary/40 hover:text-primary"
          >
            Back
          </button>
        )}

        {propType && idx === total - 1 ? (
          <button
            type="button"
            onClick={() => { if (!submitting) onSubmit(); }}
            disabled={submitting}
            className="flex-[2] cursor-pointer rounded-lg border-none bg-primary py-3 font-sans text-[13px] font-bold tracking-wide text-white transition-all hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? "SUBMITTING..." : submitLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (idx === 0) onFirstStepNext();
              else if (validateStep(currentKey)) setStep(idx + 1);
            }}
            className="flex-[2] cursor-pointer rounded-lg border-none bg-primary py-3 font-sans text-[13px] font-bold tracking-wide text-white transition-all hover:bg-primary-dark"
          >
            Next
          </button>
        )}
      </div>

      {showConsentNote && (
        <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
          By filling this form, you agree to receive notifications through
          WhatsApp, call, SMS or email. You can opt out anytime by messaging us.
        </p>
      )}
    </div>
  );
}