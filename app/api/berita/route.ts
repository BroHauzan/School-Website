import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, assertSameOrigin } from "@/lib/auth-server";
import { errMsg } from "@/lib/api-error";
import { listBerita, createBerita } from "@/lib/berita-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const data = await listBerita({ includeDraft: searchParams.get("includeDraft") === "1" });
    return NextResponse.json({ data });
  } catch (e) {
    const { message, status } = errMsg(e);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const input = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!input) return NextResponse.json({ error: "Body JSON tidak valid." }, { status: 400 });
    const created = await createBerita(input);
    revalidatePath("/berita");
    revalidatePath("/", "layout");
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e) {
    const { message, status } = errMsg(e);
    return NextResponse.json({ error: message }, { status });
  }
}
