/**
 * Firestore writes for all three India Floor forms.
 *
 * Collections:
 *   form_submissions/submissions/indiaFloor-BuyerRequirements
 *   form_submissions/submissions/indiaFloor-ListYourProperty
 *   form_submissions/submissions/indiaFloor-DealerRegistrations
 *
 * Duplicate protection is two-layer:
 *   1. the submission is written to a document ID derived from its fingerprint,
 *      so an identical repeat submission fails at the database itself;
 *   2. near-duplicates are caught by scoring recent listings (see lib/dedupe).
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  type Firestore,
} from "firebase/firestore";
import {
  fingerprint, findDuplicate, normalizePhone, type Bag, type DedupCandidate,
} from "@/lib/dedupe";

/* --------------------------------------------------------------- config */

export type FormName =
  | "BuyerRequirements"
  | "ListYourProperty"
  | "DealerRegistrations";

export const SUBMISSION_PATHS: Record<FormName, string> = {
  BuyerRequirements: "form_submissions/submissions/indiaFloor-BuyerRequirements",
  ListYourProperty: "form_submissions/submissions/indiaFloor-ListYourProperty",
  DealerRegistrations: "form_submissions/submissions/indiaFloor-DealerRegistrations",
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let _app: FirebaseApp | null = null;

export function getApp_(): FirebaseApp {
  // getApps()[0] reuse keeps hot-reload from double-initialising
  if (_app) return _app;
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

let _db: Firestore | null = null;

export function db(): Firestore {
  if (!_db) _db = getFirestore(getApp_());
  return _db;
}

/* --------------------------------------------------------------- types */

export interface SaveResult {
  ok: boolean;
  duplicate: boolean;
  message?: string;
  existingId?: string;
  /** true when the backend is not configured yet — the form should not block */
  skipped?: boolean;
}

/* ---------------------------------------------------------------- write */

/**
 * Persists a submission, refusing duplicates.
 *
 * @param form    which collection to write to
 * @param bag     the values used for de-duplication (phone/address/city/…)
 * @param payload the stored document — schema-specific keys
 */
export async function saveSubmission(
  form: FormName,
  bag: Bag,
  payload: Record<string, unknown>,
): Promise<SaveResult> {
  if (!isFirebaseConfigured) {
    console.warn(
      "[firebase] not configured — submission not saved. Add NEXT_PUBLIC_FIREBASE_* env vars.",
    );
    return { ok: false, duplicate: false, skipped: true };
  }

  const path = SUBMISSION_PATHS[form];
  const store = db();
  const phone = normalizePhone(bag.phone ?? bag.mobile);

  try {
    // Layer 1 — deterministic ID. A byte-identical repeat submission hits an
    // existing document, which Firestore reports as ALREADY_EXISTS.
    const fp = fingerprint(bag);

    if (phone) {
      // Layer 2 — score the owner's recent listings against this one.
      const recent = await getDocs(
        query(
          collection(store, path),
          where("phone_normalized", "==", phone),
          orderBy("createdAtTs", "desc"),
          limit(25),
        ),
      );

      const candidates: DedupCandidate[] = recent.docs.map((d) => ({
        id: d.id,
        data: d.data() as Record<string, unknown>,
      }));

      const dup = findDuplicate(bag, candidates);
      if (dup) {
        return {
          ok: false,
          duplicate: true,
          message: dup.matchedOn.join(","),
          existingId: dup.existingId,
        };
      }
    }

    const docRef = doc(store, path, `${form}-${fp}`);

    try {
      await setDoc(docRef, {
        ...payload,
        phone_normalized: phone,
        fingerprint: fp,
        createdAt: serverTimestamp(),
        // plain sortable twin — Firestore cannot order by serverTimestamp()
        createdAtTs: Date.now(),
      });
      return { ok: true, duplicate: false };
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "already-exists") {
        return { ok: false, duplicate: true, message: "exact" };
      }
      throw err;
    }
  } catch (err) {
    console.error("[firebase] submission failed", err);
    // A failed write must not trap the user — the WhatsApp hand-off still runs.
    return { ok: false, duplicate: false };
  }
}

/** Distinct write used where a repeat should update rather than duplicate. */
export async function addSubmission(
  form: FormName,
  payload: Record<string, unknown>,
  phone?: string,
) {
  return addDoc(collection(db(), SUBMISSION_PATHS[form]), {
    ...payload,
    phone_normalized: normalizePhone(phone ?? ""),
    createdAt: serverTimestamp(),
    createdAtTs: Date.now(),
  });
}

/** Reads one stored submission — used by the "already listed" lookup. */
export async function getSubmission(form: FormName, id: string) {
  return getDoc(doc(db(), SUBMISSION_PATHS[form], id));
}