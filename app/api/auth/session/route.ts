import { NextResponse } from "next/server";
import {
  mintSessionCookie,
  sessionCookieOptions,
  SESSION_COOKIE,
  assertSameOrigin,
} from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
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

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
  } catch (e) {
    const status = (e as { status?: number }).status ?? 403;
    const msg = e instanceof Error ? e.message : "Origin tidak diizinkan.";
    return NextResponse.json({ error: msg }, { status });
  }
  // Revokasi refresh token agar sesi tidak bisa dipakai lagi.
  try {
    const { cookies } = await import("next/headers");
    const { getAdminAuth, adminConfigured } = await import("@/lib/firebase-admin");
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (token && adminConfigured()) {
      try {
        const decoded = await getAdminAuth().verifySessionCookie(token);
        await getAdminAuth().revokeRefreshTokens(decoded.uid);
      } catch {
        // Token sudah invalid/kedaluwarsa — tetap lanjut hapus cookie.
      }
    }
  } catch {
    // Jangan gagalkan logout bila Admin SDK belum dikonfigurasi.
  }
  const res = NextResponse.json({ ok: true });
  const opts = sessionCookieOptions();
  res.cookies.set(opts.name, "", {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: 0,
  });
  return res;
}
