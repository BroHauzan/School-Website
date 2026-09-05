import { NextResponse } from "next/server";
import { requireAdmin, assertSameOrigin } from "@/lib/auth-server";
import { errMsg } from "@/lib/api-error";
import { validateImageFile, UPLOAD_MAX_BYTES } from "@/lib/upload-validate";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Field 'file' wajib diisi." }, { status: 400 });
    }
    if (file.size > UPLOAD_MAX_BYTES) {
      return NextResponse.json({ error: "Ukuran gambar maksimal 5MB." }, { status: 400 });
    }
    // Validasi MIME + magic bytes (tolak GIF & file spoof).
    const invalid = await validateImageFile(file);
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }
    const { secure_url, public_id } = await uploadToCloudinary(file, "galeri");
    return NextResponse.json({ url: secure_url, public_id }, { status: 201 });
  } catch (e) {
    const { message, status } = errMsg(e, "Upload gagal.");
    return NextResponse.json({ error: message }, { status });
  }
}
