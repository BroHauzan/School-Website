import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/auth-server";
import { getAdminBucket } from "@/lib/firebase-admin";
import { firebaseAdminEnv } from "@/lib/env";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Field 'file' wajib diisi." }, { status: 400 });
    }
    const ext = ALLOWED.get(file.type);
    if (!ext) {
      return NextResponse.json(
        { error: "Format gambar harus JPG, PNG, WebP, atau GIF." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Ukuran gambar maksimal 5MB." }, { status: 400 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const name = `berita/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${ext}`;
    const bucket = getAdminBucket();
    const f = bucket.file(name);
    await f.save(bytes, { metadata: { contentType: file.type }, resumable: false });
    await f.makePublic().catch(() => undefined);
    const bucketName = firebaseAdminEnv.storageBucket ?? bucket.name;
    const url = `https://storage.googleapis.com/${bucketName}/${encodeURI(name)}`;
    return NextResponse.json({ url }, { status: 201 });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    const message = e instanceof Error ? e.message : "Upload gagal.";
    return NextResponse.json({ error: message }, { status });
  }
}
