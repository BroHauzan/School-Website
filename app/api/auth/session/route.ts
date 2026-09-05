import { NextResponse } from "next/server";
import { mintSessionCookie, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { idToken?: string } | null;
    const idToken = body?.idToken;
    if (!idToken) {
      return NextResponse.json({ error: "idToken wajib diisi." }, { status: 400 });
    }
    const sessionCookie = await mintSessionCookie(idToken);
    const opts = sessionCookieOptions();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(opts.name, sessionCookie, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      path: opts.path,
      maxAge: opts.maxAge,
    });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Login gagal.";
    const status = (e as { status?: number }).status ?? 401;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
