import "server-only";
import { getAdminAuth, adminConfigured } from "./firebase-admin";
import { adminAllowlist } from "./env";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "./auth-cookie";

export { SESSION_COOKIE };
const EXPIRES_IN = SESSION_MAX_AGE * 1000;

export type AdminSession = { uid: string; email: string | null };

export async function mintSessionCookie(idToken: string): Promise<string> {
  const auth = getAdminAuth();
  const decoded = await auth.verifyIdToken(idToken, true);
  const email = (decoded.email ?? "").toLowerCase();
  const allow = adminAllowlist();
  if (allow.length > 0 && !allow.includes(email)) {
    throw new Error("Email tidak terdaftar sebagai admin.");
  }
  return auth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN });
}

export async function readSessionCookie(): Promise<string | undefined> {
  // Dynamic import: next/headers hanya dibutuhkan di sini. Kalau diimpor di level
  // modul, seluruh route yang memakai auth-server ikut mati saat next/headers
  // bermasalah di runtime (mintSessionCookie sendiri tidak butuh cookies).
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value;
}

export async function verifyAdminSession(): Promise<AdminSession | null> {
  if (!adminConfigured()) return null;
  const token = await readSessionCookie();
  if (!token) return null;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(token, true);
    const email = (decoded.email ?? "").toLowerCase();
    const allow = adminAllowlist();
    if (allow.length > 0 && !allow.includes(email)) return null;
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const s = await verifyAdminSession();
  if (!s) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  return s;
}

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: EXPIRES_IN / 1000,
  };
}
