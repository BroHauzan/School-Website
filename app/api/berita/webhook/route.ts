import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { beritaInputSchema } from "@/lib/berita-schema";
import { tambahBerita } from "@/lib/berita-server";
import {
  uploadUrlToCloudinary,
  isInstagramPostUrl,
  extractInstagramThumbnail,
} from "@/lib/cloudinary";
import { isValidImageUrl } from "@/lib/image-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(headerSecret: string | null, expectedSecret: string | undefined): boolean {
  if (!headerSecret || !expectedSecret) return false;
  const headerBuf = Buffer.from(headerSecret);
  const expectedBuf = Buffer.from(expectedSecret);
  if (headerBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(headerBuf, expectedBuf);
}

export async function POST(request: Request) {
  try {
    // 1. Validasi secret header
    const secretHeader = request.headers.get("x-sync-secret");
    const syncSecretKey = process.env.SYNC_SECRET_KEY;

    if (!isAuthorized(secretHeader, syncSecretKey)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Baca body JSON request
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Format JSON tidak valid.",
          errors: ["Request body harus berupa JSON valid."],
        },
        { status: 400 }
      );
    }

    if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format JSON tidak valid.",
          errors: ["Request body harus berupa JSON object."],
        },
        { status: 400 }
      );
    }

    const bodyRecord = rawBody as Record<string, unknown>;

    // 3. Auto re-upload image ke Cloudinary / auto-extract thumbnail Instagram
    let finalImage =
      typeof bodyRecord.image === "string" ? bodyRecord.image.trim() : "";

    if (finalImage && isInstagramPostUrl(finalImage)) {
      // 3a. Deteksi link postingan Instagram -> ekstrak og:image lalu upload ke Cloudinary
      try {
        const ogImageUrl = await extractInstagramThumbnail(finalImage);
        if (ogImageUrl) {
          const uploadResult = await uploadUrlToCloudinary(ogImageUrl, "smasa/berita");
          if (uploadResult?.secure_url) {
            finalImage = uploadResult.secure_url;
          } else {
            finalImage = "/hero-school.webp";
          }
        } else {
          console.warn("[webhook/berita] Gagal mengekstrak thumbnail Instagram, fallback ke default hero");
          finalImage = "/hero-school.webp";
        }
      } catch (igError) {
        console.warn("[webhook/berita] Error proses Instagram thumbnail:", igError);
        finalImage = "/hero-school.webp";
      }
    } else if (finalImage && /^https?:\/\//i.test(finalImage)) {
      // 3b. Remote image umum -> upload langsung ke Cloudinary jika belum di smasa/berita
      const isAlreadySmasaCloudinary =
        finalImage.includes("res.cloudinary.com") &&
        finalImage.includes("smasa/berita");

      if (!isAlreadySmasaCloudinary) {
        try {
          const uploadResult = await uploadUrlToCloudinary(finalImage, "smasa/berita");
          if (uploadResult?.secure_url) {
            finalImage = uploadResult.secure_url;
          }
        } catch (uploadError) {
          console.warn(
            "[webhook/berita] Upload gambar ke Cloudinary gagal, mencoba fallback:",
            uploadError
          );
          // Fallback: gunakan URL aslinya jika lolos validasi, atau fallback ke default hero
          if (!isValidImageUrl(finalImage)) {
            finalImage = "/hero-school.webp";
          }
        }
      }
    } else if (!finalImage || !isValidImageUrl(finalImage)) {
      finalImage = "/hero-school.webp";
    }

    // 4. Set default status ke "draft" jika tidak disertakan dalam body payload
    const status =
      bodyRecord.status !== undefined
        ? String(bodyRecord.status)
        : bodyRecord.published !== undefined
        ? bodyRecord.published
          ? "published"
          : "draft"
        : "draft";

    const published =
      bodyRecord.published !== undefined
        ? Boolean(bodyRecord.published)
        : status.toLowerCase() === "published";

    const payload: Record<string, unknown> = {
      ...bodyRecord,
      image: finalImage,
      status,
      published,
    };

    // 4. Validasi skema input berita
    const validation = beritaInputSchema.safeParse(payload);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi skema gagal",
          errors: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // 5. Simpan artikel ke Firestore via helper tambahBerita
    const result = await tambahBerita(payload);

    // Revalidasi cache
    try {
      revalidatePath("/berita");
      revalidatePath("/admin");
    } catch {
      // Abaikan jika pemanggilan revalidatePath terjadi di luar konteks request Next.js
    }

    // 6. Response 201 Created
    return NextResponse.json(
      {
        success: true,
        message: "Berita draf berhasil dibuat",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[webhook/berita] Terjadi kesalahan:", error);
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan internal server.";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
