import { useState, useEffect } from 'react';

const REF_KEY = 'pb_referred_by';
const REF_TTL_MS = 365 * 24 * 60 * 60 * 1000; // 365 days

// Save the attribution code. Call this as soon as a valid ?ref= is seen.
export function setReferredBy(code: string) {
  try {
    localStorage.setItem(REF_KEY, JSON.stringify({ code, ts: Date.now() }));
  } catch {
    // storage unavailable: attribution simply won't persist
  }
  try {
    window.dispatchEvent(new CustomEvent('pb-ref-updated'));
  } catch {
    // ignore
  }
}

// Read the stored code (null if missing/expired/corrupt). Expiry auto-cleans.
export function getReferredBy(): string | null {
  try {
    const raw = localStorage.getItem(REF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { code?: unknown; ts?: unknown };
    if (typeof parsed.code !== 'string' || !parsed.code || typeof parsed.ts !== 'number') {
      localStorage.removeItem(REF_KEY);
      return null;
    }
    if (Date.now() - parsed.ts > REF_TTL_MS) {
      localStorage.removeItem(REF_KEY);
      return null;
    }
    return parsed.code;
  } catch {
    return null;
  }
}

/**
 * Two generations of referral codes are accepted at once:
 *   BAAP48498A  — current format
 *   PB12345A    — legacy format, still live in old links
 * Drop LEGACY_CODE_RE once no PB links remain in circulation.
 */
const CURRENT_CODE_RE = /^BAAP[0-9]{5}[A-Z]$/;
const LEGACY_CODE_RE = /^PB[0-9]{5}[A-Z]$/;
const CODE_RES = [CURRENT_CODE_RE, LEGACY_CODE_RE];

/**
 * Validate + canonicalize a raw ?ref= value.
 * CHANGE THIS if your codes look different — and keep firestore.rules in sync.
 */
export function normalizeRefCode(raw: string): string | null {
  const cleaned = raw.trim().toUpperCase().replace(/^#/, '');
  if (!CODE_RES.some((re) => re.test(cleaned))) return null;
  return `#${cleaned}`;
}

/**
 * Firestore document IDs to try for a code, in priority order.
 * Tries the hashed ('#BAAP48498A') key then the bare one, because existing
 * documents may be stored either way.
 */
export function refCodeDocIdCandidates(code: string): string[] {
  const bare = code.trim().toUpperCase().replace(/^#/, '');
  if (!CODE_RES.some((re) => re.test(bare))) return [];
  return [`#${bare}`, bare];
}

// Hydration-safe hook: reads storage only after mount, so SSR HTML always matches.
export function useReferredByCode(): string | null {
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => {
    // Deferred so the state update does not run synchronously inside the effect.
    const timer = window.setTimeout(() => setCode(getReferredBy()), 0);
    const onUpdate = () => setCode(getReferredBy());
    window.addEventListener('pb-ref-updated', onUpdate);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pb-ref-updated', onUpdate);
    };
  }, []);
  return code;
}

// Append ?ref=CODE to any outbound URL (keeps existing query params intact).
export function withReferral(url: string, code: string | null): string {
  if (!code) return url;
  const short = code.startsWith('#') ? code.slice(1) : code;
  try {
    const u = new URL(url);
    u.searchParams.set('ref', short);
    return u.toString();
  } catch {
    return url.includes('?') ? `${url}&ref=${short}` : `${url}?ref=${short}`;
  }
}
