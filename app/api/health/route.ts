import { NextResponse } from "next/server";

// Penentu: tidak import apa pun selain next/server.
// Kalau rute ini 200 tapi rute lain 500 → masalah spesifik dependency server (mis. firebase-admin).
// Kalau rute ini ikut 500 → semua route handler rusak di level platform.
export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() });
}
