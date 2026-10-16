import { NextResponse } from "next/server";

/**
 * Referral cookie endpoint — STATIC STUB for the static export build.
 *
 * With `output: "export"` there is no Node server, so this route cannot read
 * or write cookies. It is pinned `force-static` and returns a tiny JSON object
 * so that:
 *   - the client fetch in lib/referral-storage gets a valid response instead
 *     of a 404 (the result is ignored; the code comes from ?ref= / storage), and
 *   - the build produces a real /api/referral asset rather than failing.
 *
 * The real attribution anchor is written client-side via document.cookie in
 * lib/referral-storage (see readServerCookie/writeServerCookie), because an
 * httpOnly server cookie is impossible without a server. The remaining layers
 * (IndexedDB, Cache Storage, localStorage, sessionStorage) already survive an
 * HTTP cache clear.
 */
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ code: null });
}

export async function DELETE() {
  return NextResponse.json({ code: null });
}
