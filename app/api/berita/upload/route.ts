import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Field 'file' wajib diisi." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Format gambar harus JPG, PNG, WebP, atau GIF." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Ukuran gambar maksimal 5MB." }, { status: 400 });
    }
    const { secure_url, public_id } = await uploadToCloudinary(file);
    return NextResponse.json({ url: secure_url, public_id }, { status: 201 });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    const message = e instanceof Error ? e.message : "Upload gagal.";
    return NextResponse.json({ error: message }, { status });
  }
}
