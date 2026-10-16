/**
 * Referral code storage.
 *
 * Canonical stored/displayed form is `#PB12345A` — a `#` followed by 7
 * alphanumerics. `getReferredBy()` returns that string (or null) and strips
 * expired/corrupt entries on read.
 */

const KEY = "pb_referred_by";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const REF_RE = /^PB[0-9]{5}[A-Z]$/;

export function normalizeRefCode(raw: string): string | null {
  const norm = raw
    .trim()
    .toUpperCase()
    .replace(/^#/, "")
    .trim();
  return REF_RE.test(norm) ? `#${norm}` : null;
}

export function setReferredBy(code: string): void {
  try {
    const norm = normalizeRefCode(code);
    if (!norm) return;
    localStorage.setItem(
      KEY,
      JSON.stringify({ code: norm, ts: Date.now() }),
    );
  } catch {
    /* storage unavailable — referral is optional */
  }
}

export function getReferredBy(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { code?: string; ts?: number };
    if (!parsed?.code || typeof parsed.ts !== "number") {
      localStorage.removeItem(KEY);
      return null;
    }
    if (Date.now() - parsed.ts > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    const norm = normalizeRefCode(parsed.code);
    if (!norm) {
      localStorage.removeItem(KEY);
      return null;
    }
    return norm;
  } catch {
    return null;
  }
}