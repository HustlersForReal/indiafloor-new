"use client";

/**
 * Referral welcome popup.
 *
 * Reads ?ref=CODE from the URL, validates it, stores attribution across all
 * five persistence layers for 365 days (see lib/referral-storage), then looks
 * up the referrer's name from Firestore `referral_codes/{CODE}` and greets the
 * visitor. The name lookup is best-effort: if the mirror doc is missing (or
 * Firebase is unconfigured) the popup still shows a code-only greeting instead
 * of crashing.
 *
 * Dismiss is session-only (sessionStorage) so it does not nag on every reload,
 * while the attribution itself persists across reloads.
 */
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import {
  normalizeRefCode,
  refCodeDocIdCandidates,
  setReferredBy,
} from "@/lib/referral-storage";

const SITE_NAME = "IndiaFloor";

const PERKS = [
  "Every floor is verified by local area experts",
  "Buyers and tenants pay nothing, ever",
  "End-to-end help — discovery to registration",
];

const DISCOUNT_TEXT = `Use Your Code And Get 5% Instant Discount On All ${SITE_NAME} Services`;

export function ReferralWelcome() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = searchParams.get("ref");
    if (!raw) return;
    const parsed = normalizeRefCode(raw);
    if (!parsed) return;

    // Mirrors the code across all five persistence layers (365-day window).
    setReferredBy(parsed);

    try {
      if (sessionStorage.getItem("pb_ref_welcomed") === "1") return;
    } catch {
      // storage unavailable: show the popup
    }

    let cancelled = false;

    (async () => {
      // Docs may exist under either the hashed ('#BAAP48498A') or bare
      // ('BAAP48498A') key depending on when they were created — try both.
      if (isFirebaseConfigured) {
        for (const docId of refCodeDocIdCandidates(parsed)) {
          try {
            const snap = await getDoc(doc(db(), "referral_codes", docId));
            if (cancelled) return;
            if (snap.exists()) {
              const n = (snap.data() as { name?: string }).name;
              if (n) {
                setName(n);
                break;
              }
            }
          } catch {
            // code-only fallback below
          }
        }
      }
      if (!cancelled) setCode(parsed);
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (!code) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem("pb_ref_welcomed", "1");
    } catch {
      // ignore
    }
    setCode(null);
  };

  const copyCode = async () => {
    const text = code;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers without the async clipboard API.
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        /* ignore */
      }
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const initial = (name ?? "I").charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="ref-pop-in w-full max-w-md overflow-hidden rounded-2xl border border-[#314367]/40 bg-[#0a1f45] shadow-[0_0_60px_rgba(49,67,103,0.35)]">
        <div className="border-b border-[#314367] px-6 pt-6 pb-5 text-center">
          <p className="text-[11px] font-bold tracking-[0.25em] text-[#F0A41C] uppercase">
            You&apos;re Invited
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">
            Welcome to IndiaFloor.com
          </h2>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center gap-4 rounded-xl border border-[#314367] bg-[#0e2c60] p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F0A41C] text-lg font-black text-[#0a1f45]">
              {initial}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[11px] tracking-[0.18em] text-white/60 uppercase">
                You Are Referred by
              </p>
              <p className="truncate text-[15px] font-bold text-white">
                {name ?? "An IndiaFloor partner"}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <p className="inline-block rounded-md bg-[#F0A41C]/10 px-2 py-0.5 text-[12px] font-black tracking-[0.15em] text-[#F0A41C]">
                  {code}
                </p>
                <button
                  type="button"
                  onClick={copyCode}
                  title={copied ? "Copied" : "Copy code"}
                  aria-label="Copy referral code"
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[#F0A41C]/30 bg-[#F0A41C]/10 text-[#F0A41C] transition-colors hover:bg-[#F0A41C] hover:text-[#0a1f45]"
                >
                  {copied ? (
                    <Check size={13} strokeWidth={2.5} />
                  ) : (
                    <Copy size={13} strokeWidth={2.5} />
                  )}
                </button>
                {copied && (
                  <span className="text-[11px] font-semibold text-[#F0A41C]">
                    Copied
                  </span>
                )}
              </div>
            </div>
          </div>

          <ul className="mt-5 space-y-2.5">
            {PERKS.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-3 text-[13px] font-light text-white/80 md:text-[14px]"
              >
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#F0A41C]" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          {/* Discount highlight — centered, its own box (not a perk item). */}
          <div className="mt-4 rounded-xl border border-[#F0A41C]/30 bg-[#F0A41C]/10 px-4 py-3 text-center">
            <p className="text-[14px] font-bold leading-snug text-[#F0A41C] md:text-[15px]">
              {DISCOUNT_TEXT}
            </p>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="mt-6 w-full cursor-pointer rounded-xl bg-[#314367] px-8 py-3.5 text-[13px] font-bold tracking-widest text-white uppercase transition-colors hover:bg-[#233054]"
          >
            Explore Site
          </button>
          <p className="mt-3 text-center text-[11px] text-white/40">
            Your referral details are used to process your request.
          </p>
        </div>
      </div>
    </div>
  );
}
