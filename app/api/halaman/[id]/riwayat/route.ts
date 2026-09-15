import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, assertSameOrigin } from "@/lib/auth-server";
import { errMsg } from "@/lib/api-error";
import { getHalamanById, restoreHalaman } from "@/lib/halaman-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const item = await getHalamanById(id);
    if (!item) return NextResponse.json({ error: "Halaman tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ data: item.riwayat });
  } catch (e) {
    const { message, status } = errMsg(e);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request, { params }: Ctx) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { id } = await params;
    const body = (await request.json().catch(() => null)) as { savedAt?: unknown } | null;
    if (!body) return NextResponse.json({ error: "Body JSON tidak valid." }, { status: 400 });
    const savedAt = typeof body.savedAt === "string" ? body.savedAt.trim() : "";
    if (!savedAt) {
      return NextResponse.json({ error: "Versi yang ingin dipulihkan tidak dipilih." }, { status: 400 });
    }
    const restored = await restoreHalaman(id, savedAt);
    revalidatePath("/", "layout");
    return NextResponse.json({ data: restored });
  } catch (e) {
    const { message, status } = errMsg(e);
    return NextResponse.json({ error: message }, { status });
  }
}
