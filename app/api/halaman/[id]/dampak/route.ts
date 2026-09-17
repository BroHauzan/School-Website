import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { errMsg } from "@/lib/api-error";
import { peringatanHalaman } from "@/lib/halaman-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Dampak bila halaman ini berhenti tayang (dihapus/draft): menu induk yang
 * kehilangan isinya, dan tombol di halaman lain yang menunjuk ke sini.
 * Dipakai dialog konfirmasi admin sebelum aksi merusak (QA 2.1, 2.3).
 */
export async function GET(_req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const dampak = await peringatanHalaman(id);
    return NextResponse.json({ data: dampak });
  } catch (e) {
    const { message, status } = errMsg(e);
    return NextResponse.json({ error: message }, { status });
  }
}
