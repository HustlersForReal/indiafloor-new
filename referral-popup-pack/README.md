# Referral Welcome Popup + Code Storage — Implementation Pack

> Ye pack kisi bhi site (Next.js App Router + Tailwind + Firebase) par **referral welcome popup + referral-code storage mechanism** lagane ke liye hai.
> Ise seedha apne OpenCode agent ko de do — neeche **Steps** order me follow karne hain. Koi alag backend/hosting nahi chahiye.

---

## 1. Ye system karta kya hai

1. Visitor link kholta hai: `https://yoursite.com/?ref=BAAP48498A`
2. Code validate hota hai (format + Firestore lookup).
3. Code **robust temporary storage** me save hota hai (reload survive karta hai, 365 din me expire).
4. Full-screen **welcome popup** khulta hai: *"Welcome, you have been referred by {Name}"* + code + site perks + **Explore Site** button.
5. Explore Site dabane pe popup dismiss (is session me dobara nahi aayega; code storage me bana rehta hai).
6. (Optional) Site se bahar jaane wale partner links ke saath code `?ref=` me forward hota rehta hai.

## 2. Architecture (data flow)

```
Landing URL (?ref=CODE)
   │ normalizeRefCode() — format check: BAAP/PB + 5 digits + A-Z
   ▼
setReferredBy() → localStorage `pb_referred_by` { code, ts }  [365-day TTL]
   │
   ▼
getDoc(referral_codes/{CODE}) → referrer ka { phone, name }
   │
   ▼
Popup: "Referred by {Name}" + code chip + perks + [Explore Site]
   │  dismiss → sessionStorage `pb_ref_welcomed = 1` (sirf is tab-session ke liye)
   ▼
(Optional) withReferral(url, code) → outbound links `?ref=CODE` ke saath
```

## 3. Prerequisites (target site par)

- Next.js **App Router** project (pages router ho to `useSearchParams` + Suspense pattern adapt karna — Step 6 dekho).
- Tailwind CSS (classes arbitrary values use karte hain).
- Firebase project bana hua ho + **Firestore Database created** (production mode).
- Terminal access: `npm i firebase`.

## 4. Files in this pack (`files/` folder)

| File | Kya hai | Kahan lagana hai |
|---|---|---|
| `ReferralWelcome.tsx` | Popup component (exact copy, production-tested) | `components/` me copy karo |
| `referral-storage.ts` | Storage + code helpers + link hook (self-contained) | `lib/` me copy karo |
| `firebase.ts` | Firebase Web SDK init (lazy, build-safe) | `lib/` me copy karo (agar pehle se hai to skip) |
| `firestore.rules` | Locked security rules (poori file) | Firebase Console > Firestore > Rules me paste + Publish |
| `env.example.snippet` | Firebase env keys | `.env.local` me values bharo |
| `globals.css.snippet` | Popup entry-animation keyframes | `globals.css` me append karo |

## 5. Implementation steps (isi order me)

### Step 1 — Dependencies
```bash
npm i firebase
```

### Step 2 — Env keys
`files/env.example.snippet` wali 6 keys `.env.local` me add karo aur **Firebase Console > Project Settings > Your apps > Web app** se values bharo:
`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`.
> Ye keys public-by-design hain (browser SDK). Security **rules file** se aati hai, keys chhupane se nahi.

### Step 3 — Files copy karo
- `files/firebase.ts` → `lib/firebase.ts`
- `files/referral-storage.ts` → `lib/referral-storage.ts`
- `files/ReferralWelcome.tsx` → `components/ReferralWelcome.tsx`
- `files/globals.css.snippet` ka content → `globals.css` me append karo.

### Step 4 — Popup globally mount karo (root layout)
`app/layout.tsx` me:
```tsx
import { Suspense } from 'react';
import { ReferralWelcome } from '@/components/ReferralWelcome';

// <body> ke andar, {children} se PEHLE:
<Suspense fallback={null}>
  <ReferralWelcome />
</Suspense>
{children}
```
> `useSearchParams` ke liye `Suspense` **mandatory** hai — warna Next.js build fail hoga.

### Step 5 — Firestore rules publish karo
`files/firestore.rules` ki **poori content** copy karke **Firebase Console > Firestore Database > Rules** me paste + **Publish** karo.
- Popup ke naam-lookup ke liye sirf `referral_codes/{code}` block chahiye (`allow get` single-doc, no list).
- Baaki blocks (`referrals`, `counters`, `referral_emails`) registration system ke hain — popup-only setup me optional hain, rakhne me koi nuksaan nahi.

### Step 6 — `referral_codes` docs likhna (IMPORTANT)
Popup naam tabhi dikhata hai jab Firestore me ye doc ho:
```
referral_codes/{CODE}  →  { phone: "9876543210", name: "Referrer Name" }
```
- `{CODE}` bilkul wahi format jo link me hai (e.g. `BAAP48498A`). `refCodeDocIdCandidates()` dono keys try karta hai — `#BAAP48498A` aur `BAAP48498A` — to purane docs bhi chalte rahenge.
- Tumhare registration flow ko har naye code pe ye doc banana **hoga** (best-effort `setDoc(..., { merge: true })`).
- Doc nahi mila to popup **code-only fallback** dikhata hai (crash nahi hota).

### Step 7 — Customize (brand ke hisaab se)
`ReferralWelcome.tsx` me ye lines badlo, **logic mat chhedo**:
- Heading brand name (current: `Welcome to Property Baap`).
- `PERKS` array (current: 3 brand lines) — apne site ke 3 short trust-points likho.
- Fallback text `A Property Baap partner` → apne brand ka naam.
- Colors: `#E1BE56` (gold) → apna accent color (pure file me find-replace), `#0B0B0C`/`#121212` dark surfaces apne theme se match karo.
- `z-[80]` — apne navbar/modals se upar hona chahiye, stack check karo.
- Code format alag hai to `normalizeRefCode` ka regex + rules ka `matches(...)` pattern dono jagah same rakho.

### Step 8 (Optional) — Outbound links me code forward karna
Agar partner sites par bhi `?ref=` bhejna hai to `useReferredByCode()` + `withReferral(url, code)` use karo (dono `referral-storage.ts` me ready hain). Hydration-safe hai (SSR se match, mount ke baad storage read).

### Step 9 — Verify
```bash
npx tsc --noEmit
```
Phir browser test (Testing section dekho).

## 6. Data model (Firestore)

```
referral_codes/{CODE}        { phone: string, name: string }   # popup name lookup
pb_referred_by (localStorage) { code, ts }                     # 365-day attribution
pb_ref_welcomed (sessionStorage) = '1'                         # dismiss flag, tab-session only
```
- Code format: `BAAP` + last-5 phone digits + series letter (`#BAAP48498A`, `#BAAP48498B`...). Legacy `PB` codes bhi valid hain.
- Attribution storage **temporary (365 din)** lekin **robust** (reload/tab-close survive).

## 7. Testing checklist

1. `/?ref=BAAP48498A` (mirror doc ke saath) → popup + sahi naam + code chip. Legacy `/?ref=PB12345A` bhi test karo.
2. `/?ref=INVALID` → koi popup nahi, koi error nahi.
3. Bina `?ref=` → koi popup nahi.
4. Explore Site → dismiss; reload → dobara nahi (same tab); naya tab → phir se aata hai (storage bana rehta hai).
5. Reload ke baad bhi code stored hai (attribution intact).
6. Mirror doc missing ho → code-only popup (fallback), crash nahi.
7. Mobile: popup readable, button tappable.

## 8. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Naam ki jagah fallback text | `referral_codes/{CODE}` doc missing, ya rules publish nahi hue | Doc banao / rules Publish karo, 1–2 min ruko (propagation) |
| Popup aata hi nahi | Galat code format, ya build me Suspense missing | `normalizeRefCode` regex check karo; layout me `<Suspense>` confirm karo |
| Firestore permission-denied (console) | Rules publish nahi hue / purane hain | `firestore.rules` paste + Publish, phir retry |
| `Firebase is not configured` | Env keys missing | `.env.local` values + dev server restart |
| T&C: popup har reload pe | Normal hai — dismiss flag session-only hai; storage 365 din rehta hai | Expected behavior |

## 9. Design decisions (kyun aise banaya)

- **No backend:** sab browser Web SDK se — alag hosting nahi chahiye.
- **Public keys + locked rules:** security rules se aati hai; `list`/`delete` har jagah blocked, reads single-doc targeted only.
- **Graceful fallbacks:** mirror missing ho to bhi popup (code-only) — kabhi crash nahi.
- **Session dismiss, persistent attribution:** UX (tang na kare) aur marketing (365-din attribution) alag-alag rakhe hain.
