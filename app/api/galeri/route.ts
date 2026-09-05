import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-server";
import { listGaleri, createGaleri } from "@/lib/galeri-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errMsg(e: unknown): { message: string; status: number } {
  const status = (e as { status?: number }).status ?? 500;
  const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
  return { message, status };
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const data = await listGaleri({ includeDraft: searchParams.get("includeDraft") === "1" });
    return NextResponse.json({ data });
  } catch (e) {
    const { message, status } = errMsg(e);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const input = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!input) return NextResponse.json({ error: "Body JSON tidak valid." }, { status: 400 });
    const created = await createGaleri(input);
    revalidatePath("/", "layout");
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e) {
    const { message, status } = errMsg(e);
    return NextResponse.json({ error: message }, { status });
  }
}
