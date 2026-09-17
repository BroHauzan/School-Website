import { NextResponse } from "next/server";
import { requireAdmin, assertSameOrigin } from "@/lib/auth-server";
import { errMsg } from "@/lib/api-error";
import { createPreviewToken } from "@/lib/halaman-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Ctx) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { id } = await params;
    const body = (await request.json().catch(() => null)) as { draftBlocks?: unknown } | null;
    const draftBlocks = Array.isArray(body?.draftBlocks) ? body.draftBlocks : [];
    const result = await createPreviewToken(id, draftBlocks as []);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (e) {
    const { message, status } = errMsg(e);
    return NextResponse.json({ error: message }, { status });
  }
}
