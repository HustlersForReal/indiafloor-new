# Referral Welcome - All Changes

File: `components/ReferralWelcome.tsx`
Logic: `lib/referral-storage.ts`
API: `app/api/referral/route.ts`
Template copy: `referral-popup-pack/files/`

## Quick Reference

| # | Change | Detail |
|---|--------|--------|
| 1 | Discount Line | Highlighted, centered, `{SiteName}` template |
| 2 | Referred By Label | `You Are Referred by` |
| 3 | Invite Validity | 365 days, **sliding refresh** (section 3) |
| 4 | Bottom Note | Non-highlighted disclaimer |
| 5 | Copy Icon | Clipboard copy with `Copied` feedback |
| **6** | **Code Format Compatibility** | **`BAAP48498A` + legacy `PB12345A` dono valid** |
| **7** | **Maximum Durability** | **5-layer persistence, cache-clear proof** |
| 8 | Lint Cleanup | Zero errors repo-wide |

### Code Compatibility (detail: section 6)

```
BAAP48498A   ← current format
PB12345A     ← legacy format, abhi bhi valid
```

Dono ek saath. `#`, casing, spaces sab normalize ho jate hain.
Full matrix + rules locations: **section 6**.

## 1. Discount Line

Old:
```
Get 5% Instant Discount On All Property Vivaad Services
```
- `PERKS` list me normal left-aligned item tha.

New (Template):
```
Use Your Code And Get 5% Instant Discount On All {SiteName} Services
```

Example (Property Vivaad):
```
Use Your Code And Get 5% Instant Discount On All Property Vivaad Services
```

Display:
- Beech me center-aligned, highlight box me.
- `PERKS` se nikal kar `DISCOUNT_TEXT` constant me rakha.
- JSX:
```tsx
const DISCOUNT_TEXT =
  'Use Your Code And Get 5% Instant Discount On All Property Vivaad Services';
```
```tsx
<div className="mt-4 rounded-xl border border-[#550000]/20 bg-[#550000]/5 px-4 py-3 text-center">
  <p className="text-[14px] md:text-[15px] font-bold leading-snug text-[#550000]">{DISCOUNT_TEXT}</p>
</div>
```
- `{SiteName}` ko actual brand name se replace karke reuse karo.

## 2. Referred By Label

Old:
```
Referred by
```

New:
```
You Are Referred by
```

File: `components/ReferralWelcome.tsx:103`

## 3. Invite Validity - 30 to 365 Days + Sliding Refresh

TTL: `lib/referral-storage.ts`
```ts
export const REF_TTL_MS = 365 * 24 * 60 * 60 * 1000; // 365 days
```
- History: 30 → 90 → **365** days.
- Template copy `referral-popup-pack/files/referral-storage.ts` me bhi sync hai.

### 3.1 Sliding Window (fixed nahi)

**Ye fixed 365-din window nahi hai.** Har successful read pe timestamp refresh hota hai:

```ts
// Slide the window forward so returning visitors are never dropped.
if (Date.now() - winner.ts > REF_TTL_MS / 2) {
  const refreshed: RefRecord = { code: winner.code, ts: Date.now() };
  writeSyncStorage(refreshed);
  void writeIndexedDb(refreshed);
  void writeCacheStorage(refreshed);
  return winner.code;
}
```

Matlab:

| Situation | Result |
|---|---|
| Visitor regularly aata hai | **Kabhi expire nahi hoga** — har visit pe window aage badh jaati hai |
| Visitor 200 din baad aata hai | Valid (200 < 365) |
| Visitor 400 din baad aata hai | **Expired** — kyunki 400 din ki *inactivity* |
| Saare layers gone + cookie bhi gayi | Expired, koi recovery nahi |

- Refresh sirf tab hota hai jab `REF_TTL_MS / 2` (182 din) se zyada guzar chuke ho — isse har read pe disk write nahi hota.
- Sirf **poora inactivity gap** `REF_TTL_MS` se lamba hone pe expire karta hai.

> Note: UI pe ab koi validity text nahi dikhata (section 4 me woh line hata di gayi). 365 din sirf backend storage window hai.

## 4. Bottom Note - Non-highlighted

Old:
```
Your invite is saved for 365 days.
```
- Pehle dashed outline pill badge me tha.

New:
```
Your referral details are used to process your request.
```
- Plain non-highlighted centered text.
- JSX:
```tsx
<p className="mt-3 text-center text-[11px] text-[#5f4f4b]/60">Your referral details are used to process your request.</p>
```

## 5. Copy Icon With Referral Code

Example code: `#BAAP48498A`

- Code chip ke saath copy button lagaya.
- `lucide-react` ke `Copy` / `Check` icons use hote hain.
- Click par `navigator.clipboard.writeText(code)` hota hai, fallback me hidden `textarea` + `execCommand('copy')`.
- Copy hone par icon `Check` me badalta hai aur `Copied` text dikhta hai (1.5s).
- JSX:
```tsx
<div className="mt-0.5 flex items-center gap-1.5">
  <p className="inline-block rounded-md bg-[#550000]/10 px-2 py-0.5 text-[12px] font-black tracking-[0.15em] text-[#550000]">{code}</p>
  <button
    type="button"
    onClick={copyCode}
    title={copied ? 'Copied' : 'Copy code'}
    aria-label="Copy referral code"
    className="flex h-6 w-6 items-center justify-center rounded-md border border-[#550000]/20 bg-white/70 text-[#550000] hover:bg-[#550000] hover:text-white transition-colors"
  >
    {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2.5} />}
  </button>
  {copied && <span className="text-[11px] font-semibold text-[#550000]">Copied</span>}
</div>
```

## 6. Code Format - PB to BAAP (Backwards Compatible)

Dono generations ek saath supported hain — purane links, flyers aur WhatsApp messages me bache `PB` codes ab bhi chalenge.

### 6.0 Compatibility Matrix

**Dono prefix valid hain.** Input ka `#`, casing aur spaces normalize ho jate hain.

| Input (visitor kuch bhi bhej sakta hai) | Format | Canonical output |
|---|---|---|
| `BAAP48498A` | current | `#BAAP48498A` |
| `#BAAP48498A` | current | `#BAAP48498A` |
| `baap48498a` | current | `#BAAP48498A` |
| `  #Baap48498A  ` | current | `#BAAP48498A` |
| `BAAP12345B` | current | `#BAAP12345B` |
| `PB12345A` | **legacy** | `#PB12345A` |
| `#PB12345A` | **legacy** | `#PB12345A` |
| `pb12345a` | **legacy** | `#PB12345A` |
| `#PB98765Z` | **legacy** | `#PB98765Z` |
| `BAAP1234A` | invalid (4 digits) | `null` → popup nahi |
| `BAAP48498` | invalid (no series letter) | `null` → popup nahi |
| `BAAP48498AB` | invalid (too long) | `null` → popup nahi |
| `BAAP-48498-A` | invalid (dashes) | `null` → popup nahi |
| `XX48498A` | invalid (unknown prefix) | `null` → popup nahi |

**Structure (dono me same):** `PREFIX` + `5 digits` + `1 series letter`

- Current: `BAAP` + `48498` + `A` → `BAAP48498A`
- Legacy: `PB` + `12345` + `A` → `PB12345A`

Series letter `A–Z` tak ja sakta hai (max 26 codes per last-5-digits — `firestore.rules` me counter `<= 26` enforce karta hai).

### 6.1 Client Validation

`lib/referral-storage.ts`:
```ts
const CURRENT_CODE_RE = /^BAAP[0-9]{5}[A-Z]$/;
const LEGACY_CODE_RE = /^PB[0-9]{5}[A-Z]$/;
const CODE_RES = [CURRENT_CODE_RE, LEGACY_CODE_RE];
```

- `normalizeRefCode()` dono accept karta hai, `#` aur casing normalize karke `#BAAP48498A` / `#PB12345A` deta hai.
- `isSupportedRefCode()` — boolean check.
- `refCodeDocIdCandidates()` — Firestore doc IDs ki list, priority order me.

`app/api/referral/route.ts` me bhi same dual regex (cookie validation).

### 6.2 Firestore Lookup — Dono Key Styles

`components/ReferralWelcome.tsx`:
```tsx
// Docs may exist under either the hashed ('#BAAP48498A') or bare
// ('BAAP48498A') key depending on when they were created — try both.
for (const docId of refCodeDocIdCandidates(parsed)) {
  const snap = await getDoc(doc(db, 'referral_codes', docId));
  if (cancelled) return;
  if (snap.exists()) { /* setName */ break; }
}
```
- `#BAAP48498A` pehle, phir `BAAP48498A`.
- Ye zaroori hai kyunki security rules `'#'` maangte hain par setup notes bare likhte hain — dono style ke docs resolve honge, warna referrer ka naam kabhi show nahi hoga.

### 6.3 Firestore Rules — 4 Jagah

`referral-popup-pack/files/firestore.rules` — pattern `'#(BAAP[0-9]{5}|PB[0-9]{5})[A-Z]'` use karo **4** jagah:

| Line | Block |
|------|-------|
| 37 | `validReferral()` → `referralCode` |
| 43 | `validReferral()` → `referredBy` |
| 112 | `/referral_codes/{code}` → `allow get` |
| 113 | `/referral_codes/{code}` → `allow create, update` |

⚠️ **Ek jagah bhi reh gaya to signup fail hoga** — rules me koi bhi ek `PB`-only pattern rehne se naye `BAAP` codes reject ho jayenge.

⚠️ **Syntax warning:** `validReferral()` me `;` ke baad koi `&&` nahi aana chahiye. Galat edit karne se rules publish nahi hote.

### 6.4 UI

Form placeholder (`app/page.tsx`): `#BAAP48498A`

### 6.5 Cleanup Note

Jab legacy PB links khatam ho jayein, `LEGACY_CODE_RE` hata sakte ho — 4 jagah:
1. `lib/referral-storage.ts`
2. `app/api/referral/route.ts`
3. `referral-popup-pack/files/referral-storage.ts`
4. `referral-popup-pack/files/firestore.rules` (saare 4 matches)

Fir regex single ho jayega: `'#BAAP[0-9]{5}[A-Z]'`

## 7. Maximum Durability — 5 Layer Persistence

Problem: pehle code sirf `localStorage` me tha. Ek cache clear = attribution gayab.

Solution: code ab **5 independent browser facilities** me mirror hota hai.

| # | Layer | Cache clear se bachta hai? |
|---|-------|---------------------------|
| 1 | httpOnly cookie (server-set) | ✅ JS clear + normal cache clear dono se |
| 2 | IndexedDB | ✅ Chrome/Edge/Firefox/Safari |
| 3 | Cache Storage | ✅ HTTP cache se alag |
| 4 | localStorage | ❌ sync reads ke liye |
| 5 | sessionStorage | partial |

Write → saari 5 me. Read → saari 5 reconcile karke **sabko wapas likh deta hai**, jo layer khaali/stale mili hai. Yahi self-heal hai.

Naya file — `app/api/referral/route.ts` (cookie anchor):
```ts
const COOKIE = 'pb_ref';
const MAX_AGE_SECONDS = 400 * 24 * 60 * 60; // browser cap 400 days

response.cookies.set(COOKIE, code, {
  httpOnly: true,   // JS padh/ delete nahi kar sakta
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE_SECONDS,
});
```
- `GET` — cookie padhta hai, `?code=` se set karta hai.
- `DELETE` — saaf karta hai (UI se wired nahi, sirf server-side use ke liye).

`lib/referral-storage.ts` me layers:
```ts
const IDB_NAME = 'pb-ref-db';
const CACHE_NAME = 'pb-ref-cache-v1';
const CACHE_PATH = '/__pb_ref__';
```

Public API:
```ts
export function setReferredBy(code: string)        // saari 5 layers me likhta hai
export function getReferredBy(): string | null     // sync read (localStorage + sessionStorage)
export async function hydrateReferredBy()          // saari layers reconcile + repair
export async function clearReferredBy()            // saaf karta hai
export function useReferredByCode(): string | null // hook, mount pe hydrate
```

`hydrateReferredBy()` sabse important hai:
```ts
// Always consult the server anchor — it is the only layer a cache clear
// cannot reach, so it is also the recovery source when everything else died.
const serverCode = await readServerCookie();

if (candidates.length === 0) {
  if (!serverCode) { pruneSyncStorage(); return null; }
  const recovered: RefRecord = { code: serverCode, ts: Date.now() };
  writeSyncStorage(recovered);
  void writeIndexedDb(recovered);
  void writeCacheStorage(recovered);
  return serverCode;
}
```
- Client storage sab khaali ho to bhi httpOnly cookie se code recover karke wapas likh deta hai.

**Behavior change:** ab `useReferredByCode()` mount pe async hydrate karta hai, isliye cache clear ke baad form ka referral code apne aap bhara aa jayega.

**API backward-compatible** — `getReferredBy`, `normalizeRefCode`, `useReferredByCode`, `withReferral` same signatures. `page.tsx` me sirf unused import hataya.

### 7.1 Known Limit

**"Clear cookies / Delete site data" se kuch nahi bacha sakta** — ye browser ka boundary hai, client code cross nahi kar sakta. Cookie tabhi jaati hai jab user explicitly site data maange, ya different browser/device aaye.

Iske upar sirf **server-side binding** kaam karegi — form submit pe phone number ke saath referral code DB me lock ho. Uske baad user chahe sab kuch mitaye, wahi phone se code wapas mil jayega. Yeh attribution ke liye sabse solid method hai (referrer ko late payout bhi mil jayega).

## 8. Lint Cleanup (referral autofill)

`app/page.tsx` me pre-existing `react-hooks/set-state-in-effect` error tha. Fix:
```tsx
useEffect(() => {
  if (!referredByCode) return;
  // Deferred so the state updates do not run synchronously inside the effect.
  const timer = window.setTimeout(() => {
    setReferralCodeA(referredByCode);
    setReferralCodeB(referredByCode);
  }, 0);
  return () => window.clearTimeout(timer);
}, [referredByCode]);
```
- Same fix `referral-popup-pack/files/referral-storage.ts` ke hook me bhi.
- Ab poore repo me zero lint errors.
