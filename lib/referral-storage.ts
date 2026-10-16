/**
 * Referral code storage — maximum-durability edition.
 *
 * The attribution code is mirrored across FIVE independent browser facilities
 * so a single cache-clear cannot kill it:
 *
 *   1. cookie (client-side document.cookie; a server-set httpOnly cookie needs
 *      a server, which the static export does not have) — survives JS cache clear
 *   2. IndexedDB      — survives normal cache clears
 *   3. Cache Storage  — separate from the HTTP cache
 *   4. localStorage   — sync reads (forms read this on mount)
 *   5. sessionStorage — partial (tab-session only)
 *
 * Writes go to all layers. Reads reconcile every layer and rewrite whichever
 * came back empty/stale (self-heal). The cookie is a recovery anchor: it is
 * the layer least likely to be wiped by a browser cache clear, so `hydrate`
 * pulls the code back from it when every client layer is gone.
 *
 * Canonical form is `#BAAP48498A` (current) or `#PB12345A` (legacy) — a `#`
 * followed by the code. Two generations are accepted at once so old links,
 * flyers and WhatsApp messages with PB codes keep working. Drop
 * LEGACY_CODE_RE once no PB links remain in circulation.
 */
import { useState, useEffect } from "react";

/* ------------------------------------------------------------- constants */

const SYNC_KEY = "pb_referred_by"; // localStorage
const SESSION_KEY = "pb_ref_session"; // sessionStorage
const IDB_NAME = "pb-ref-db";
const IDB_STORE = "refs";
const IDB_KEY = "current";
const CACHE_NAME = "pb-ref-cache-v1";
const CACHE_PATH = "/__pb_ref__";

/** Attribution window. Exported so the popup/API can reference one source. */
export const REF_TTL_MS = 365 * 24 * 60 * 60 * 1000; // 365 days
// Only slide the window forward once half of it has elapsed, so a routine
// read never triggers a disk write.
const REFRESH_AFTER_MS = REF_TTL_MS / 2;

const CURRENT_CODE_RE = /^BAAP[0-9]{5}[A-Z]$/;
const LEGACY_CODE_RE = /^PB[0-9]{5}[A-Z]$/;
const CODE_RES = [CURRENT_CODE_RE, LEGACY_CODE_RE];

/* ---------------------------------------------------------------- types */

interface RefRecord {
  code: string;
  ts: number;
}

/* -------------------------------------------------------- code helpers */

/** Validate + canonicalize a raw ?ref= value (returns `#CODE` or null). */
export function normalizeRefCode(raw: string): string | null {
  const norm = raw.trim().toUpperCase().replace(/^#/, "").trim();
  return CODE_RES.some((re) => re.test(norm)) ? `#${norm}` : null;
}

/** Boolean form of the format check (BAAP + legacy PB both valid). */
export function isSupportedRefCode(raw: string): boolean {
  return normalizeRefCode(raw) !== null;
}

/**
 * Firestore document IDs to try for a code, in priority order.
 * Tries the hashed ('#BAAP48498A') key then the bare one, because existing
 * documents may be stored either way.
 */
export function refCodeDocIdCandidates(code: string): string[] {
  const bare = code.trim().toUpperCase().replace(/^#/, "");
  if (!CODE_RES.some((re) => re.test(bare))) return [];
  return [`#${bare}`, bare];
}

/** Append ?ref=CODE to any outbound URL (keeps existing query params intact). */
export function withReferral(url: string, code: string | null): string {
  if (!code) return url;
  const short = code.startsWith("#") ? code.slice(1) : code;
  try {
    const u = new URL(url);
    u.searchParams.set("ref", short);
    return u.toString();
  } catch {
    return url.includes("?") ? `${url}&ref=${short}` : `${url}?ref=${short}`;
  }
}

/* -------------------------------------------------------- record checks */

function isValidRecord(v: unknown): v is RefRecord {
  if (!v || typeof v !== "object") return false;
  const { code, ts } = v as RefRecord;
  if (typeof code !== "string" || !code || typeof ts !== "number") return false;
  if (Date.now() - ts > REF_TTL_MS) return false;
  return normalizeRefCode(code) !== null;
}

/* --------------------------------------------------- layer 4: localStorage */

function readSyncStorage(): RefRecord | null {
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidRecord(parsed)) {
      pruneSyncStorage();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeSyncStorage(r: RefRecord): void {
  try {
    localStorage.setItem(SYNC_KEY, JSON.stringify(r));
  } catch {
    /* storage unavailable — attribution is optional */
  }
}

function pruneSyncStorage(): void {
  try {
    localStorage.removeItem(SYNC_KEY);
  } catch {
    /* ignore */
  }
}

/* -------------------------------------------------- layer 5: sessionStorage */

function readSessionStorage(): RefRecord | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeSessionStorage(r: RefRecord): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(r));
  } catch {
    /* ignore */
  }
}

/* --------------------------------------------------------- layer 2: IDB */

function openIdb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null);
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const database = req.result;
        if (!database.objectStoreNames.contains(IDB_STORE)) {
          database.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function readIndexedDb(): Promise<RefRecord | null> {
  const database = await openIdb();
  if (!database) return null;
  return new Promise((resolve) => {
    try {
      const tx = database.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
      req.onsuccess = () => {
        const v: unknown = req.result;
        resolve(isValidRecord(v) ? v : null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function writeIndexedDb(r: RefRecord): Promise<void> {
  const database = await openIdb();
  if (!database) return;
  return new Promise((resolve) => {
    try {
      const tx = database.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(r, IDB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/* ------------------------------------------------- layer 3: Cache Storage */

async function readCacheStorage(): Promise<RefRecord | null> {
  try {
    if (typeof caches === "undefined") return null;
    const cache = await caches.open(CACHE_NAME);
    const res = await cache.match(CACHE_PATH);
    if (!res) return null;
    const v: unknown = await res.json();
    return isValidRecord(v) ? v : null;
  } catch {
    return null;
  }
}

async function writeCacheStorage(r: RefRecord): Promise<void> {
  try {
    if (typeof caches === "undefined") return;
    const cache = await caches.open(CACHE_NAME);
    await cache.put(CACHE_PATH, new Response(JSON.stringify(r)));
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------- layer 1: cookie (client-side) */

/**
 * A static export has no server, so the cookie is set/read here via
 * document.cookie rather than an httpOnly server cookie. document.cookie is
 * still a distinct layer from the other four: it is not part of the HTTP cache
 * and is not cleared by "clear site data → cached images", which is why it
 * remains a useful recovery anchor even without httpOnly.
 */
const COOKIE_KEY = "pb_ref";
const COOKIE_MAX_AGE = 400 * 24 * 60 * 60; // browsers cap ~400 days

function readServerCookie(): string | null {
  try {
    const match = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${COOKIE_KEY}=`));
    if (!match) return null;
    const value = decodeURIComponent(match.slice(COOKIE_KEY.length + 1));
    return normalizeRefCode(value);
  } catch {
    return null;
  }
}

function writeServerCookie(code: string): void {
  try {
    const short = code.replace(/^#/, "");
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(short)}; max-age=${COOKIE_MAX_AGE}; path=/; samesite=lax`;
  } catch {
    /* ignore */
  }
}

function clearServerCookie(): void {
  try {
    document.cookie = `${COOKIE_KEY}=; max-age=0; path=/`;
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------ public API */

/** Writes the attribution to every layer (best-effort) + notifies listeners. */
export function setReferredBy(code: string): void {
  const norm = normalizeRefCode(code);
  if (!norm) return;
  const record: RefRecord = { code: norm, ts: Date.now() };
  writeSyncStorage(record);
  writeSessionStorage(record);
  void writeIndexedDb(record);
  void writeCacheStorage(record);
  writeServerCookie(norm);
  try {
    window.dispatchEvent(new CustomEvent("pb-ref-updated"));
  } catch {
    /* ignore */
  }
}

/**
 * Sync read for the hot path (form mount). localStorage first, then the
 * tab-scoped sessionStorage fallback. Does not touch disk — that is hydrate's
 * job.
 */
export function getReferredBy(): string | null {
  const r = readSyncStorage() ?? readSessionStorage();
  return r ? r.code : null;
}

/**
 * Reconcile all five layers, self-heal whichever came back empty/stale, and
 * slide the window forward for returning visitors. This is the recovery path:
 * if every client layer is dead, the httpOnly cookie brings the code back.
 */
export async function hydrateReferredBy(): Promise<string | null> {
  const [idb, cache, sync, sess] = await Promise.all([
    readIndexedDb(),
    readCacheStorage(),
    Promise.resolve(readSyncStorage()),
    Promise.resolve(readSessionStorage()),
  ]);
  const serverCode = readServerCookie();

  const candidates = [sync, sess, idb, cache].filter(
    (r): r is RefRecord => r !== null,
  );

  // Newest client record wins the reconcile.
  let winner: RefRecord | null = candidates.length
    ? candidates.reduce((a, b) => (b.ts > a.ts ? b : a))
    : null;

  if (!winner) {
    // Every client layer is gone. The cookie is the only remaining anchor.
    if (!serverCode) {
      pruneSyncStorage();
      return null;
    }
    winner = { code: serverCode, ts: Date.now() };
  }

  // Slide the window forward so a returning visitor is never dropped. Only
  // past the halfway mark, so a routine read does not rewrite the disk.
  const record: RefRecord =
    Date.now() - winner.ts > REFRESH_AFTER_MS
      ? { code: winner.code, ts: Date.now() }
      : winner;

  // Self-heal every layer from the winner (fills any that were empty/stale).
  writeSyncStorage(record);
  writeSessionStorage(record);
  void writeIndexedDb(record);
  void writeCacheStorage(record);
  // Keep the server anchor in step too — it survives cache clears.
  writeServerCookie(record.code);

  return record.code;
}

/** Wipe the attribution from every layer (client + server cookie). */
export async function clearReferredBy(): Promise<void> {
  pruneSyncStorage();
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  try {
    const database = await openIdb();
    if (database) {
      const tx = database.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(IDB_KEY);
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof caches !== "undefined") {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(CACHE_PATH);
    }
  } catch {
    /* ignore */
  }
  try {
    clearServerCookie();
  } catch {
    /* ignore */
  }
}

/**
 * Hydration-safe hook: returns the sync value immediately, then reconciles
 * all layers after mount (so SSR HTML always matches) and pushes the repaired
 * value into state. A cache-cleared visitor gets their code back automatically.
 */
export function useReferredByCode(): string | null {
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => {
    // Deferred so the state update does not run synchronously inside the effect.
    const timer = window.setTimeout(() => {
      setCode(getReferredBy());
      void hydrateReferredBy().then(setCode);
    }, 0);
    const onUpdate = () => setCode(getReferredBy());
    window.addEventListener("pb-ref-updated", onUpdate);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pb-ref-updated", onUpdate);
    };
  }, []);
  return code;
}
