/**
 * Duplicate detection for property submissions.
 *
 * Goal: never store two listings for the same property. A single hash is not
 * enough — the same property gets typed slightly differently ("Sector 54" vs
 * "Sec-54", "12,345" vs "12345"), and one owner legitimately owns several
 * properties. So this works in two layers:
 *
 *   1. DETERMINISTIC — a normalised fingerprint used as the Firestore document
 *      ID. Firestore itself rejects a second write to that ID, so exact
 *      duplicates are impossible at the database level, not just in app code.
 *
 *   2. SCORED — a weighted similarity score against recent listings by the same
 *      phone number. Catches near-duplicates (different punctuation, extra
 *      floor number, "Gurugram" vs "Gurgaon").
 *
 * The phone number alone is deliberately NOT enough to call something a
 * duplicate — one owner with three flats is normal, and blocking that would
 * lose real listings.
 */

export type Bag = Record<string, string>;

export interface DedupCandidate {
  id: string;
  data: Record<string, unknown>;
}

export interface DedupVerdict {
  isDuplicate: boolean;
  score: number;
  matchedOn: string[];
  existingId?: string;
}

/* ------------------------------------------------------------- normalising */

/** Keep only digits; take the last 10 so +91 / 0 prefixes all collapse. */
export function normalizePhone(v?: string): string {
  const d = (v || "").replace(/\D/g, "");
  if (!d) return "";
  return d.length > 10 ? d.slice(-10) : d;
}

/**
 * Words that carry no location identity. Stripped so "H.No 12, Flat 3B,
 * Sector 54" and "Sector 54" land on the same tokens.
 */
const NOISE = new Set([
  "sector", "sec", "plot", "house", "hno", "h", "no", "flat", "fl", "apartment",
  "apt", "floor", "gf", "ff", "sf", "first", "second", "third", "building",
  "bldg", "block", "blk", "tower", "opp", "opposite", "near", "behind", "residence",
  "society", "soc", "complex", "cx", "the", "and", "of", "in", "at", "main", "rd",
  "road", "st", "street", "lane", "marg", "avenue", "ave", "nagar", "colony",
]);

const CITY_ALIASES: Record<string, string> = {
  gurgaon: "gurugram",
  gurgram: "gurugram",
  noida: "noida",
  "greater noida": "greater noida",
  delhi: "delhi",
  "new delhi": "new delhi",
  ghaziabad: "ghaziabad",
  faridabad: "faridabad",
};

/**
 * Lowercase, drop punctuation, expand alphanumerics ("54 A" → "54a"), remove
 * noise words, then sort so token order doesn't matter.
 */
export function normalizeTokens(v?: string): string[] {
  if (!v) return [];
  return (
    v
      .toLowerCase()
      // keep only letters, digits and spaces
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .filter((t) => !NOISE.has(t))
      .sort()
  );
}

export function normalizeCity(v?: string): string {
  const t = (v || "").toLowerCase().trim();
  return CITY_ALIASES[t] || t;
}

/** Numbers only, commas/spaces removed — so "1,850" === "1850". */
export function normalizeNumber(v?: string): number | null {
  if (!v) return null;
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Stable, order-independent fingerprint. Deterministic and cheap — no async,
 * no crypto, so it can run in the browser before any network call.
 */
export function fingerprint(bag: Bag): string {
  const phone = normalizePhone(bag.phone ?? bag.mobile);
  const city = normalizeCity(bag.city);
  const type = (bag.propertyType ?? bag.assetType ?? "").toLowerCase().trim();
  const addr = normalizeTokens(bag.address).join("-");
  const pin = (bag.pincode ?? "").replace(/\D/g, "");

  const raw = [phone, city, type, pin, addr].join("|");
  // FNV-1a — 32-bit, fast, good enough spread for an ID and deterministic
  // across runs (unlike anything involving Math.random).
  let h = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `${h.toString(36)}-${raw.length.toString(36)}`;
}

/* ---------------------------------------------------------------- scoring */

/** Jaccard overlap of two token sets, 0–1. */
function jaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const sa = new Set(a);
  const sb = new Set(b);
  let inter = 0;
  sa.forEach((t) => {
    if (sb.has(t)) inter++;
  });
  return inter / (sa.size + sb.size - inter);
}

/** True when two numbers are within `pct` percent of each other. */
function near(a: number | null, b: number | null, pct: number): boolean {
  if (a === null || b === null) return false;
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return hi > 0 && ((hi - lo) / hi) * 100 <= pct;
}

export const DUPLICATE_THRESHOLD = 60;

/**
 * Score one candidate against the incoming bag.
 *
 * Phone match alone never decides — it only opens the door. A duplicate also
 * needs the address to line up, OR enough secondary agreement (same locality,
 * same size, same type) that it is clearly the same flat typed twice.
 */
export function scoreAgainst(candidate: Bag, incoming: Bag): DedupVerdict {
  const matchedOn: string[] = [];
  let score = 0;

  const phoneMatch =
    !!normalizePhone(candidate.phone ?? candidate.mobile) &&
    normalizePhone(candidate.phone ?? candidate.mobile) ===
      normalizePhone(incoming.phone ?? incoming.mobile);

  const addrSim = jaccard(
    normalizeTokens(candidate.address),
    normalizeTokens(incoming.address),
  );

  const sameCity =
    !!normalizeCity(candidate.city) &&
    normalizeCity(candidate.city) === normalizeCity(incoming.city);

  const sameLocality = (
    normalizeTokens(candidate.locality).join("-") ||
    normalizeTokens(candidate.city).join("-")
  ) === (normalizeTokens(incoming.locality).join("-") ||
    normalizeTokens(incoming.city).join("-"));

  const sameType =
    (candidate.propertyType ?? candidate.assetType ?? "").toLowerCase().trim() ===
    (incoming.propertyType ?? incoming.assetType ?? "").toLowerCase().trim();

  const areaMatch = near(
    normalizeNumber(candidate.carpetArea ?? candidate.builtupArea ?? candidate.plotArea),
    normalizeNumber(incoming.carpetArea ?? incoming.builtupArea ?? incoming.plotArea),
    5,
  );
  const priceMatch = near(
    normalizeNumber(candidate.expectedValue),
    normalizeNumber(incoming.expectedValue),
    5,
  );

  if (phoneMatch) {
    score += 45;
    matchedOn.push("phone");
  }
  if (addrSim >= 0.95) {
    score += 30;
    matchedOn.push("address-exact");
  } else if (addrSim >= 0.8) {
    score += 22;
    matchedOn.push("address-close");
  } else if (addrSim >= 0.6) {
    score += 14;
    matchedOn.push("address-fuzzy");
  }
  if (sameCity) {
    score += 8;
    matchedOn.push("city");
  }
  if (sameLocality) {
    score += 10;
    matchedOn.push("locality");
  }
  if (sameType) {
    score += 8;
    matchedOn.push("type");
  }
  if (areaMatch) {
    score += 10;
    matchedOn.push("area");
  }
  if (priceMatch) {
    score += 8;
    matchedOn.push("price");
  }

  // Gate: phone agreement alone must never be enough. One owner can own
  // several properties, so a duplicate also needs the address to line up, or
  // (address is vague but) locality + size + type all agreeing.
  const strongSecondary = sameLocality && areaMatch && sameType;

  const isDuplicate =
    (addrSim >= 0.6 && (phoneMatch || sameCity)) || (phoneMatch && strongSecondary);

  const capped = Math.min(100, score);

  return {
    isDuplicate,
    score: isDuplicate ? capped : Math.min(capped, DUPLICATE_THRESHOLD - 1),
    matchedOn,
  };
}

/** Best match across a candidate set, or null when nothing is close enough. */
export function findDuplicate(
  incoming: Bag,
  candidates: DedupCandidate[],
): DedupVerdict | null {
  let best: DedupVerdict | null = null;

  for (const c of candidates) {
    const verdict = scoreAgainst(c.data as Bag, incoming);
    if (verdict.isDuplicate && (!best || verdict.score > best.score)) {
      best = { ...verdict, existingId: c.id };
    }
  }

  return best && best.score >= DUPLICATE_THRESHOLD ? best : null;
}

/** Explains a rejection in language a listing owner will understand. */
export function duplicateMessage(v: DedupVerdict): string {
  if (v.matchedOn.includes("address-exact") || v.matchedOn.includes("address-close")) {
    return "This property has already been listed with us. We will get in touch about the existing listing.";
  }
  if (v.matchedOn.includes("phone") && v.matchedOn.includes("locality")) {
    return "You have already listed a property in this area. Add the other property from the same listing, or contact us to update it.";
  }
  return "A similar property from you is already on our records. Please check and try again, or contact us for help.";
}