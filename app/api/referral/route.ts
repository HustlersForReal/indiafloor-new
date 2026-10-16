import { NextRequest, NextResponse } from "next/server";

/**
 * Referral cookie anchor — the one persistence layer a browser cache clear
 * cannot reach (it is httpOnly, so page JS can neither read nor delete it).
 *
 * The client (lib/referral-storage) mirrors the code across 5 layers; this
 * route is both the write path (set the cookie) and the recovery source
 * (read it back when every client layer died).
 *
 *   GET    /api/referral?code=BAAP48498A   → validate + set cookie, echo code
 *   GET    /api/referral?clear=1           → delete cookie (server-side use)
 *   GET    /api/referral                   → read current cookie value
 *   DELETE /api/referral                   → delete cookie
 */

const COOKIE = "pb_ref";
// Browsers cap cookie lifetime ~400 days; stay under it.
const MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

/** Same dual-format validation as lib/referral-storage — keep in sync. */
const CURRENT_CODE_RE = /^BAAP[0-9]{5}[A-Z]$/;
const LEGACY_CODE_RE = /^PB[0-9]{5}[A-Z]$/;
const CODE_RES = [CURRENT_CODE_RE, LEGACY_CODE_RE];

function normalize(raw: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().toUpperCase().replace(/^#/, "");
  return CODE_RES.some((re) => re.test(cleaned)) ? `#${cleaned}` : null;
}

function clearCookie() {
  const res = NextResponse.json({ code: null });
  res.cookies.delete(COOKIE);
  return res;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  if (params.get("clear") === "1") return clearCookie();

  // A ?code= is an explicit write; otherwise read what is already stored.
  const codeParam = normalize(params.get("code"));
  if (codeParam) {
    const res = NextResponse.json({ code: codeParam });
    res.cookies.set(COOKIE, codeParam, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    });
    return res;
  }

  const existing = normalize(request.cookies.get(COOKIE)?.value ?? null);
  return NextResponse.json({ code: existing });
}

export async function DELETE() {
  return clearCookie();
}
