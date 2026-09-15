import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, assertSameOrigin } from "@/lib/auth-server";
import { errMsg } from "@/lib/api-error";
import { seedSystemPages } from "@/lib/halaman-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Isi dokumen halaman untuk 16 halaman bawaan yang `managed:true`.
 * Idempotent: halaman yang sudah punya dokumen dilaporkan sebagai `skipped`.
 */
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { created, skipped } = await seedSystemPages();
    revalidatePath("/", "layout");
    return NextResponse.json({ data: { created, skipped } });
  } catch (e) {
    const { message, status } = errMsg(e);
    return NextResponse.json({ error: message }, { status });
  }
}
