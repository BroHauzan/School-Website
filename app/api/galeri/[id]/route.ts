import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-server";
import { getGaleriById, updateGaleri, deleteGaleri } from "@/lib/galeri-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function errMsg(e: unknown): { message: string; status: number } {
  const status = (e as { status?: number }).status ?? 500;
  const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
  return { message, status };
}

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const item = await getGaleriById(id);
    if (!item) return NextResponse.json({ error: "Foto galeri tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ data: item });
  } catch (e) {
    const { message, status } = errMsg(e);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!input) return NextResponse.json({ error: "Body JSON tidak valid." }, { status: 400 });
    const updated = await updateGaleri(id, input);
    revalidatePath("/", "layout");
    return NextResponse.json({ data: updated });
  } catch (e) {
    const { message, status } = errMsg(e);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const prev = await deleteGaleri(id);
    if (!prev) return NextResponse.json({ error: "Foto galeri tidak ditemukan." }, { status: 404 });
    // Gambar Cloudinary (unsigned) tidak dihapus server — biarkan orphan, jangan gagalkan request.
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (e) {
    const { message, status } = errMsg(e);
    return NextResponse.json({ error: message }, { status });
  }
}
