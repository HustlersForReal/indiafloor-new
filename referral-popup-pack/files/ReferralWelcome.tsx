'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { normalizeRefCode, refCodeDocIdCandidates, setReferredBy } from './referral-storage'; // <-- ADJUST: point to wherever you place referral-storage.ts (e.g. '@/lib/referral-storage')

const PERKS = [
  'Complete property ecosystem under one roof',
  'Baap Promise benefits on every deal',
  'Backed by 50 years of real-estate legacy',
];

export function ReferralWelcome() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const raw = searchParams.get('ref');
    if (!raw) return;
    const parsed = normalizeRefCode(raw);
    if (!parsed) return;
    // Robust temporary attribution store (365-day expiry, survives reloads).
    setReferredBy(parsed);
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem('pb_ref_welcomed') === '1';
    } catch {
      // storage unavailable: show the popup
    }
    if (dismissed) return;
    let cancelled = false;
    (async () => {
      // Docs may exist under either the hashed ('#BAAP48498A') or bare
      // ('BAAP48498A') key depending on when they were created — try both.
      for (const docId of refCodeDocIdCandidates(parsed)) {
        try {
          const db = getDb();
          const snap = await getDoc(doc(db, 'referral_codes', docId));
          if (cancelled) return;
          if (snap.exists()) {
            const n = (snap.data() as { name?: string }).name;
            if (n) setName(n);
            break;
          }
        } catch {
          // code-only fallback below
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
      sessionStorage.setItem('pb_ref_welcomed', '1');
    } catch {
      // ignore
    }
    setCode(null);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="ref-pop-in w-full max-w-md overflow-hidden rounded-2xl border border-[#E1BE56]/40 bg-[#0B0B0C] shadow-[0_0_60px_rgba(225,190,86,0.15)]">
        <div className="border-b border-[#E1BE5633] px-6 pt-6 pb-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#E1BE56]">You&apos;re invited</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-[#E8E8E8]">
            Welcome to Property Baap
          </h2>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center gap-4 rounded-xl border border-[#E1BE5633] bg-[#121212] p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E1BE56] text-lg font-black text-[#0B0B0C]">
              {(name ?? 'P').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#E8E8E8]/60">Referred by</p>
              <p className="truncate text-[15px] font-bold text-[#E8E8E8]">{name ?? 'A Property Baap partner'}</p>
              <p className="mt-0.5 inline-block rounded-md bg-[#E1BE56]/10 px-2 py-0.5 text-[12px] font-black tracking-[0.15em] text-[#E1BE56]">{code}</p>
            </div>
          </div>

          <ul className="mt-5 space-y-2.5">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-[13px] md:text-[14px] text-[#E8E8E8CC] font-light">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#E1BE56]" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={dismiss}
            className="mt-6 w-full rounded-xl bg-[#E1BE56] px-8 py-3.5 text-[13px] font-bold uppercase tracking-widest text-[#0B0B0C] hover:bg-[#ECC777] transition-colors"
          >
            Explore Site
          </button>
          <p className="mt-3 text-center text-[11px] text-[#E8E8E8]/40">Your referral details are used to process your request.</p>
        </div>
      </div>
    </div>
  );
}
