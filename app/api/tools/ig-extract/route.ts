import { NextResponse } from "next/server";
import {
  isInstagramPostUrl,
  extractInstagramThumbnail,
  uploadUrlToCloudinary,
  cleanCloudinaryUrl,
} from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { url?: string } | null;
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json(
        { success: false, message: "URL Instagram wajib diisi." },
        { status: 400 }
      );
    }

    if (!isInstagramPostUrl(url)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Format URL tidak valid. Masukkan URL postingan Instagram (contoh: https://www.instagram.com/p/...).",
        },
        { status: 400 }
      );
    }

    const ogImageUrl = await extractInstagramThumbnail(url);
    if (!ogImageUrl) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gagal mengekstrak thumbnail dari postingan Instagram tersebut. Pastikan postingan bersifat publik.",
        },
        { status: 422 }
      );
    }

    const uploadRes = await uploadUrlToCloudinary(ogImageUrl, "smasa/berita");
    if (!uploadRes?.secure_url) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengunggah thumbnail ke Cloudinary.",
        },
        { status: 500 }
      );
    }

    // Pastikan URL yang dikembalikan adalah URL asli hasil upload tanpa URL-transformation crop (c_fill, dll)
    const cleanUrl = cleanCloudinaryUrl(uploadRes.secure_url);

    return NextResponse.json({
      success: true,
      imageUrl: cleanUrl,
    });
  } catch (error) {
    console.error("[tools/ig-extract] Error:", error);
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan internal server.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
