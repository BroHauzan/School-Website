import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, assertSameOrigin } from "@/lib/auth-server";
import { errMsg } from "@/lib/api-error";
import { getNavGroups, saveNavGroups } from "@/lib/nav-groups-server";
import type { NavGroupsItem } from "@/lib/halaman-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const data = await getNavGroups();
    return NextResponse.json({ data });
  } catch (e) {
    const { message, status } = errMsg(e);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const body = (await request.json().catch(() => null)) as { items?: unknown } | null;
    if (!body || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "Field 'items' wajib berupa daftar menu." }, { status: 400 });
    }
    const data = await saveNavGroups(body.items as NavGroupsItem[]);
    revalidatePath("/", "layout");
    return NextResponse.json({ data });
  } catch (e) {
    const { message, status } = errMsg(e);
    return NextResponse.json({ error: message }, { status });
  }
}
