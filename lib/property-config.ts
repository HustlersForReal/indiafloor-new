import type { OptionItem } from "@/components/CustomSelect";

/* ------------------------------------------------------------------ tiers */

export const TIER_NAMES = ["Silver", "Gold", "Diamond"] as const;
export type TierName = (typeof TIER_NAMES)[number];

/** The value range each tier represents, per listing type. */
export const TIER_RANGES: Record<"sale" | "rent", Record<TierName, string>> = {
  sale: {
    Silver: "Under ₹2 Crore",
    Gold: "₹2 Crore – ₹10 Crore",
    Diamond: "Above ₹10 Crore",
  },
  rent: {
    Silver: "Under ₹2 Lakh",
    Gold: "₹2 Lakh – ₹10 Lakh",
    Diamond: "Above ₹10 Lakh",
  },
};

/* ------------------------------------------------------------------ options */

export const CITY_OPTIONS = [
  "Noida", "Delhi", "Greater Noida", "Faridabad",
  "Greater Faridabad", "Gurugram", "Ghaziabad",
];

export const PROPERTY_TYPE_OPTIONS: string[] = [
  "Residential Floors",
  "Farmhouse Floors",
  "Penthouses",
  "Commercial Floors",
  "Industrial Floors",
  "Institutional Floors",
  "Other",
];

export const BEDROOM_OPTS = ["1 RK / 1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];
export const BATHROOM_OPTS = ["1", "2", "3", "3+"];
export const BALCONY_OPTS = ["0", "1", "2", "3", "3+"];
export const FURNISHING_OPTS = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];
export const AREA_UNIT_OPTS = ["sq. ft.", "sq. yd.", "sq. m.", "acre", "bigha"];
export const AGRI_AREA_UNIT_OPTS = ["sq. ft.", "sq. yd.", "sq. m.", "acre", "bigha", "hectare"];
export const OPEN_SIDES_OPTS = ["1", "2", "3", "4"];
export const YES_NO_OPTS = ["Yes", "No"];
export const STUDIO_CFG_OPTS = ["Studio", "1 RK"];
export const CONFIGURATION_OPTS = ["Single-level", "Duplex", "Triplex", "Other"];
export const TRANSACTION_OPTS = ["New Property", "Resale Property"];
export const POSSESSION_STATUS_OPTS = ["Under Construction", "Ready to Move"];
export const OCCUPANCY_OPTS = ["Vacant", "Currently Occupied"];
export const NEGOTIABILITY_OPTS = ["Negotiable", "Non-Negotiable"];
export const AGE_OPTS = ["New", "0–1 Year", "1–5 Years", "5–10 Years", "10+ Years"];
export const FLOORING_OPTS = ["Marble", "Granite", "Tiles", "Wooden", "Cement", "Other"];
export const WATER_OPTS = ["24×7", "Limited Hours", "Municipal", "Borewell", "Other"];
export const OWNERSHIP_OPTS = ["Freehold", "Leasehold", "Power of Attorney"];
export const LOAN_OPTS = ["No Loan", "Loan Exists"];
export const DOCS_OPTS = [
  "Sale Deed", "Registry", "Property Tax Receipt", "Possession Letter",
  "Other relevant documents",
];

export const RESIDENTIAL_AMENITIES = [
  "Reserved Parking", "Visitor Parking", "Lift", "Power Backup", "Security / CCTV",
  "Swimming Pool", "Gym", "Club House", "Garden / Park", "Children's Play Area",
  "Intercom", "Water Supply", "Internet / Wi-Fi", "Fire Safety",
];

export const COMMERCIAL_AMENITIES = [
  "Reserved Parking", "Visitor Parking", "Lift", "Power Backup", "Security / CCTV",
  "Fire Safety", "Internet / Connectivity", "Water Supply",
  "Loading / Unloading Facility",
];

export const LAND_TYPES = [
  "Residential Land / Plot", "Commercial Land", "Industrial Land",
  "Agricultural Land",
];

export const AMENITY_RES_TYPES = [
  "Flat", "Apartment", "Builder Floor Apartment", "Residential House", "Villa",
  "Penthouse", "Studio Apartment", "Farmhouse",
];

export const AMENITY_COMM_TYPES = [
  "Commercial Office Space", "Office / IT Park", "Commercial Shop",
  "Commercial Showroom", "Warehouse", "Godown", "Industrial Building",
  "Industrial Shed",
];

/* -------------------------------------------------------------- field model */

export interface SellFieldDef {
  key: string;
  /** Doubles as the UI label AND the Firestore key source. */
  label: string;
  kind: "chips" | "text" | "select" | "toggle";
  options?: string[];
  span?: 1 | 2;
  placeholder?: string;
  required?: boolean;
}

const f = (
  key: string,
  label: string,
  kind: SellFieldDef["kind"],
  opts?: Partial<SellFieldDef>,
): SellFieldDef => ({ key, label, kind, ...opts });

const chips = (key: string, label: string, options: string[], extra?: Partial<SellFieldDef>) =>
  f(key, label, "chips", { options, ...extra });
const text = (key: string, label: string, placeholder?: string, extra?: Partial<SellFieldDef>) =>
  f(key, label, "text", { placeholder, ...extra });
const sel = (key: string, label: string, options: string[], extra?: Partial<SellFieldDef>) =>
  f(key, label, "select", { options, ...extra });

/* ------------------------------------------------------ composite builders */

const apartmentLike = (): SellFieldDef[] => [
  chips("bedrooms", "Bedrooms *", BEDROOM_OPTS, { span: 2 }),
  chips("bathrooms", "Bathrooms *", BATHROOM_OPTS),
  chips("balconies", "Balconies", BALCONY_OPTS),
  text("propertyFloor", "Property Floor *", "e.g. Ground, 1st, 5th"),
  text("totalFloors", "Total Floors in Building *", "Number"),
  text("carpetArea", "Carpet Area (sq. ft.)", "Sq. ft."),
  text("builtupArea", "Built-up Area (sq. ft.)", "Sq. ft."),
  chips("furnishing", "Furnishing Status", FURNISHING_OPTS, { span: 2 }),
];

const houseLike = (): SellFieldDef[] => [
  chips("bedrooms", "Bedrooms *", BEDROOM_OPTS, { span: 2 }),
  chips("bathrooms", "Bathrooms *", BATHROOM_OPTS),
  chips("balconies", "Balconies", BALCONY_OPTS),
  text("numFloors", "Number of Floors *", "Number"),
  text("plotArea", "Plot Area (sq. ft.) *", "Sq. ft."),
  text("builtupArea", "Built-up Area (sq. ft.) *", "Sq. ft."),
  text("coveredArea", "Covered Area (sq. ft.)", "Sq. ft."),
  chips("openSides", "Number of Open Sides", OPEN_SIDES_OPTS),
  text("roadWidth", "Road Width Facing Property (ft)", "e.g. 30"),
  chips("furnishing", "Furnishing Status", FURNISHING_OPTS, { span: 2 }),
];

const landLike = (unitOpts: string[], reqRoad = true): SellFieldDef[] => [
  text("plotArea", "Plot Area *", "Area"),
  sel("areaUnit", "Area Unit *", unitOpts),
  text("totalFloorsAllowed", "Total Floors Allowed for Construction", "Number"),
  chips("openSides", "Number of Open Sides", OPEN_SIDES_OPTS),
  text("roadWidth", `Road Width Facing Plot${reqRoad ? " *" : ""}`, "e.g. 30 ft"),
];

const industrialLike = (): SellFieldDef[] => [
  text("plotArea", "Plot Area (sq. ft.)", "Sq. ft."),
  text("builtupArea", "Built-up Area (sq. ft.)", "Sq. ft."),
  text("coveredArea", "Covered Area (sq. ft.)", "Sq. ft."),
  text("numFloors", "Number of Floors", "Number"),
  text("roadWidth", "Road Width (ft)", "e.g. 30"),
  text("vehicleAccessibility", "Vehicle Accessibility", "e.g. Truck / Trailer access"),
  text("suitableIndustrialUse", "Suitable Industrial Use", "e.g. Manufacturing, Storage"),
];

const COMMERCIAL_SHARED = (): SellFieldDef[] => [
  text("carpetArea", "Carpet Area (sq. ft.)", "Sq. ft."),
  text("builtupArea", "Built-up Area (sq. ft.)", "Sq. ft."),
  text("propertyFloor", "Property Floor", "e.g. Ground, 1st, 5th"),
  text("totalFloors", "Total Floors", "Number"),
  chips("furnishing", "Furnishing Status", FURNISHING_OPTS, { span: 2 }),
  text("parkingAvailability", "Parking Availability", "e.g. Covered / Open / Slots"),
  text("powerBackup", "Power Backup", "e.g. Full / Partial / None"),
];

/* ------------------------------------------------------------ SELL_CONFIG */

export const SELL_CONFIG: Record<string, SellFieldDef[]> = {
  Flat: apartmentLike(),
  Apartment: apartmentLike(),
  "Builder Floor Apartment": apartmentLike(),
  Penthouse: apartmentLike(),

  "Residential House": houseLike(),
  Villa: houseLike(),

  "Studio Apartment": [
    chips("studioConfig", "Studio Configuration *", STUDIO_CFG_OPTS, { span: 2 }),
    chips("bathrooms", "Bathrooms *", BATHROOM_OPTS),
    chips("balconies", "Balconies", BALCONY_OPTS),
    text("propertyFloor", "Property Floor *", "e.g. Ground, 1st, 5th"),
    text("totalFloors", "Total Floors in Building", "Number"),
    text("carpetArea", "Carpet Area (sq. ft.)", "Sq. ft."),
    text("builtupArea", "Built-up Area (sq. ft.)", "Sq. ft."),
    chips("furnishing", "Furnishing Status", FURNISHING_OPTS, { span: 2 }),
  ],

  "Residential Land / Plot": [
    ...landLike(AREA_UNIT_OPTS),
    chips("cornerPlot", "Corner Plot", YES_NO_OPTS),
    chips("existingConstruction", "Existing Construction on Plot?", YES_NO_OPTS, { span: 2 }),
    text("coveredArea", "Covered Area (sq. ft.)", "Sq. ft."),
  ],

  "Commercial Office Space": COMMERCIAL_SHARED(),
  "Office / IT Park": COMMERCIAL_SHARED(),

  "Commercial Shop": [
    text("carpetArea", "Carpet Area (sq. ft.)", "Sq. ft."),
    text("builtupArea", "Built-up Area (sq. ft.)", "Sq. ft."),
    text("propertyFloor", "Property Floor", "e.g. Ground, 1st"),
    text("totalFloors", "Total Floors", "Number"),
    chips("position", "Position", ["Main Road Facing", "Inside Market / Complex"], { span: 2 }),
    chips("furnishing", "Furnishing Status", FURNISHING_OPTS, { span: 2 }),
    text("parkingAvailability", "Parking Availability", "e.g. Covered / Open / Slots"),
  ],

  "Commercial Showroom": [
    text("carpetArea", "Carpet Area (sq. ft.)", "Sq. ft."),
    text("builtupArea", "Built-up Area (sq. ft.)", "Sq. ft."),
    text("propertyFloor", "Property Floor", "e.g. Ground, 1st"),
    text("totalFloors", "Total Floors", "Number"),
    chips("position", "Position", ["Main Road Facing", "Inside Commercial Complex"], { span: 2 }),
    chips("furnishing", "Furnishing Status", FURNISHING_OPTS, { span: 2 }),
    text("parkingAvailability", "Parking Availability", "e.g. Covered / Open / Slots"),
  ],

  "Commercial Land": landLike(AREA_UNIT_OPTS),
  "Industrial Land": landLike(AREA_UNIT_OPTS),

  Warehouse: industrialLike()
    .filter((x) => x.key !== "suitableIndustrialUse")
    .concat([
      chips("powerAvailability", "Power Availability", YES_NO_OPTS),
      chips("loadingUnloading", "Loading / Unloading Facility", YES_NO_OPTS),
    ]),

  Godown: industrialLike()
    .filter((x) => x.key !== "suitableIndustrialUse")
    .concat([
      chips("powerAvailability", "Power Availability", YES_NO_OPTS),
      chips("loadingUnloading", "Loading / Unloading Facility", YES_NO_OPTS),
    ]),

  "Industrial Building": industrialLike(),
  "Industrial Shed": industrialLike(),

  "Agricultural Land": [
    text("plotArea", "Total Land Area *", "Area"),
    sel("areaUnit", "Area Unit *", AGRI_AREA_UNIT_OPTS),
    chips("openSides", "Number of Open Sides", OPEN_SIDES_OPTS),
    text("roadWidth", "Road Width Facing Land *", "e.g. 30 ft"),
    text("totalFloorsAllowed", "Total Floors Allowed for Construction", "Number"),
    text("suitableAgriculturalUse", "Suitable Agricultural Use", "e.g. Farming, Orchard"),
  ],

  Farmhouse: [
    chips("bedrooms", "Bedrooms *", BEDROOM_OPTS, { span: 2 }),
    chips("bathrooms", "Bathrooms *", BATHROOM_OPTS),
    chips("balconies", "Balconies", BALCONY_OPTS),
    text("numFloors", "Number of Floors", "Number"),
    text("builtupArea", "Built-up Area (sq. ft.)", "Sq. ft."),
    text("coveredArea", "Covered Area (sq. ft.)", "Sq. ft."),
    text("plotArea", "Plot / Land Area (sq. ft.)", "Sq. ft."),
    chips("furnishing", "Furnishing Status", FURNISHING_OPTS, { span: 2 }),
    chips("openSides", "Number of Open Sides", OPEN_SIDES_OPTS),
    text("roadWidth", "Road Width Facing Property (ft)", "e.g. 30"),
  ],
};

/* ------------------------------------------------------- dealer sub-flow A */

export const DEALER_CITY_OPTIONS = [
  "Delhi", "Noida", "Gurgaon", "Ghaziabad", "Faridabad", "Greater Noida", "Other",
];

export const DEALER_EXPERIENCE_OPTIONS = [
  "3-5 years", "5-10 years", "10-20 years", "20-25 years", "25+ years",
];

/** Flat 21-item list — deliberately NOT PROPERTY_TYPE_OPTIONS, so new
 *  SELL_CONFIG types must be added here by hand too. */
export const DEALER_EXPERTISE_OPTIONS = [
  "Residential Floors", "Farmhouse Floors", "Penthouses",
  "Commercial Floors", "Industrial Floors", "Institutional Floors", "Other",
];

export const DEALER_INVENTORY_OPTIONS = ["Property Inventory", "Active Buyers", "Both"];

/* ------------------------------------------------------------------ shared */

export const inputCls =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 font-sans text-[13px] text-off-white outline-none transition-colors placeholder:text-[#A6AEBB] focus:border-primary focus:ring-1 focus:ring-primary/20";

export const labelCls = "mb-1 block text-[11px] font-bold tracking-[0.06em] text-muted";

/** `label` → Firestore key. `Built-up Area (sq. ft.) *` → `Builtup_Area_sq_ft` */
export const toFirestoreKey = (label: string) =>
  label.replace(/[^a-zA-Z ]/g, "").trim().replace(/\s+/g, "_");

export const WHATSAPP_NUMBER = "918800505050"; // TODO: real number pending

/** Derived flags shared by both wizards. */
export function propertyFlags(values: Record<string, string>) {
  const propType = values.assetType || "";
  const typeConfig = SELL_CONFIG[propType] || [];
  const configKeys = new Set(typeConfig.map((fd) => fd.key));

  const isLandType = LAND_TYPES.includes(propType);
  const isResale = values.transactionType === "Resale Property";
  const showAmenities =
    AMENITY_RES_TYPES.includes(propType) || AMENITY_COMM_TYPES.includes(propType);
  const showExtraDetails = !!propType && !isLandType;
  const showCoveredArea =
    values.existingConstruction === "Yes" && configKeys.has("coveredArea");
  const showPossessionStatus = !!propType && !isLandType;
  const amenities = AMENITY_RES_TYPES.includes(propType)
    ? RESIDENTIAL_AMENITIES
    : COMMERCIAL_AMENITIES;

  return {
    propType, typeConfig, configKeys, isLandType, isResale,
    showAmenities, showExtraDetails, showCoveredArea, showPossessionStatus, amenities,
  };
}

/** Step keys after the caller's own first step. */
export function buildSteps(flags: ReturnType<typeof propertyFlags>, opts?: { hideTransaction?: boolean; hideOwnership?: boolean; hidePossession?: boolean }) {
  const { propType, typeConfig, showAmenities, showExtraDetails } = flags;
  const { hideTransaction = false, hideOwnership = false } = opts ?? {};
  const steps: { key: string; title: string }[] = [];
  if (propType) steps.push({ key: "location", title: "Property Location" });
  if (propType && typeConfig.length > 0)
    steps.push({ key: "specs", title: "Property Specifications" });
  if (propType && !hideTransaction) steps.push({ key: "transaction", title: "Transaction Details" });
  if (propType) steps.push({ key: "price", title: "Price Details" });
  if (showAmenities) steps.push({ key: "amenities", title: "Amenities & Facilities" });
  if (propType && showExtraDetails)
    steps.push({ key: "extra", title: "Additional Details" });
  if (propType && !hideOwnership) steps.push({ key: "ownership", title: "Ownership & Docs" });
  return steps;
}

/** Numeric sanity checks shared by both wizards' spec validation. */
export function specFieldErrors(
  values: Record<string, string>,
  configKeys: Set<string>,
  isNumericPos: (v?: string) => boolean,
  isPriceValid: (v?: string) => boolean,
): Record<string, string> {
  const out: Record<string, string> = {};

  ["carpetArea", "builtupArea", "coveredArea", "plotArea"].forEach((k) => {
    if (configKeys.has(k) && values[k]?.trim() && !isNumericPos(values[k]))
      out[k] = "Enter a valid value greater than 0";
  });

  ["totalFloors", "numFloors", "totalFloorsAllowed"].forEach((k) => {
    if (configKeys.has(k) && values[k]?.trim()) {
      const t = values[k].trim();
      if (!/^\d{1,3}$/.test(t) || Number(t) <= 0) out[k] = "Enter a valid number";
    }
  });

  if (configKeys.has("roadWidth") && values.roadWidth?.trim()) {
    const t = values.roadWidth.trim();
    if (!/^\d+(\.\d+)?$/.test(t) || Number(t) <= 0)
      out.roadWidth = "Enter a valid width";
  }

  [
    "parkingAvailability", "powerBackup", "vehicleAccessibility",
    "suitableIndustrialUse", "suitableAgriculturalUse",
  ].forEach((k) => {
    if (configKeys.has(k) && values[k]?.trim() && values[k].trim().length < 3)
      out[k] = "Too short (min 3 characters)";
  });

  if (configKeys.has("expectedValue")) {
    if (!values.expectedValue?.trim()) out.expectedValue = "Required";
    else if (!isPriceValid(values.expectedValue))
      out.expectedValue = "Enter a valid amount (min ₹1,000)";
  }

  return out;
}

/** Per-field input sanitizer used by every config-driven text field. */
export function sanitizePropertyField(key: string, val: string): string {
  if (key === "pincode") return val.replace(/\D/g, "").slice(0, 6);
  if (
    ["carpetArea", "builtupArea", "coveredArea", "plotArea", "roadWidth"].includes(key)
  ) {
    const s = val.replace(/[^\d.]/g, "");
    const i = s.indexOf(".");
    if (i === -1) return s.slice(0, 12);
    return (s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, "")).slice(0, 12);
  }
  if (["totalFloors", "numFloors", "totalFloorsAllowed"].includes(key))
    return val.replace(/\D/g, "").slice(0, 3);
  if (key === "propertyFloor")
    return val.replace(/[^A-Za-z0-9\s\-'.]/g, "").slice(0, 15);
  return val;
}


// Floor-specific schemas for Seller/Builder listings.
// Requested removals: total floors/carpets for Residential; parking/position/total for
// Commercial; total floors for Industrial; number of floors, plot and built-up for Farmhouse.
SELL_CONFIG["Residential Floors"] = [
  chips("bedrooms", "Bedrooms *", BEDROOM_OPTS, { span: 2 }),
  chips("bathrooms", "Bathrooms *", BATHROOM_OPTS),
  chips("balconies", "Balconies", BALCONY_OPTS),
  text("propertyFloor", "Property Floor *", "e.g. Ground, 1st, 5th"),
  chips("furnishing", "Furnishing Status", FURNISHING_OPTS, { span: 2 }),
];

SELL_CONFIG["Commercial Floors"] = [
  text("carpetArea", "Carpet Area (sq. ft.)", "Sq. ft."),
  text("builtupArea", "Built-up Area (sq. ft.)", "Sq. ft."),
  text("propertyFloor", "Property Floor", "e.g. Ground, 1st"),
  chips("furnishing", "Furnishing Status", FURNISHING_OPTS, { span: 2 }),
];

SELL_CONFIG["Industrial Floors"] =
  industrialLike().filter((fd) => fd.key !== "totalFloors");

SELL_CONFIG["Farmhouse Floors"] = [
  chips("bedrooms", "Bedrooms *", BEDROOM_OPTS, { span: 2 }),
  chips("bathrooms", "Bathrooms *", BATHROOM_OPTS),
  chips("balconies", "Balconies", BALCONY_OPTS),
  text("coveredArea", "Covered Area (sq. ft.)", "Sq. ft."),
  chips("furnishing", "Furnishing Status", FURNISHING_OPTS, { span: 2 }),
  chips("openSides", "Number of Open Sides", OPEN_SIDES_OPTS),
  text("roadWidth", "Road Width Facing Property (ft)", "e.g. 30"),
];

// Penthouses and Institutional keep the most apt existing schemas, with the
// shared Configuration field prepended.
SELL_CONFIG["Penthouses"] = SELL_CONFIG["Penthouse"] ?? apartmentLike();
SELL_CONFIG["Institutional Floors"] = SELL_CONFIG["Commercial Floors"];
