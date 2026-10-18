import { cloudinaryEnv } from "./env-server";

export async function uploadToCloudinary(
  file: File,
  folder = "berita",
): Promise<{ secure_url: string; public_id: string }> {
  const cloudName = cloudinaryEnv.cloudName;
  const uploadPreset = cloudinaryEnv.uploadPreset;
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary belum dikonfigurasi. Isi NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME dan NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
  }
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);
  form.append("folder", folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const json = (await res.json().catch(() => null)) as {
    secure_url?: string;
    public_id?: string;
    error?: { message?: string } | string;
  } | null;
  if (!res.ok) {
    const msg =
      typeof json?.error === "string"
        ? json.error
        : json?.error?.message ?? "Upload ke Cloudinary gagal.";
    throw new Error(msg);
  }
  if (!json?.secure_url) throw new Error("Upload ke Cloudinary gagal: secure_url kosong.");
  return { secure_url: json.secure_url, public_id: json.public_id ?? "" };
}

/**
 * Unggah gambar dari URL publik ke Cloudinary (misal untuk sinkronisasi webhook/CMS).
 * Menerapkan fallback buffer download jika Cloudinary scraper dibatasi oleh host sumber.
 */
export async function uploadUrlToCloudinary(
  imageUrl: string,
  folder = "smasa/berita",
): Promise<{ secure_url: string; public_id: string }> {
  const cloudName = cloudinaryEnv.cloudName;
  const uploadPreset = cloudinaryEnv.uploadPreset;
  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary belum dikonfigurasi. Isi NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME dan NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  // 1. Coba upload langsung via string URL ke endpoint upload Cloudinary
  try {
    const form = new FormData();
    form.append("file", imageUrl);
    form.append("upload_preset", uploadPreset);
    form.append("folder", folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: form,
    });
    const json = (await res.json().catch(() => null)) as {
      secure_url?: string;
      public_id?: string;
      error?: { message?: string } | string;
    } | null;

    if (res.ok && json?.secure_url) {
      return { secure_url: json.secure_url, public_id: json.public_id ?? "" };
    }
  } catch {
    // Lanjut ke fallback fetch buffer jika remote fetch Cloudinary gagal/diblokir
  }

  // 2. Fallback: Unduh gambar terlebih dahulu lalu upload sebagai Blob
  const imgRes = await fetch(imageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!imgRes.ok) {
    throw new Error(`Gagal mengunduh gambar sumber (HTTP ${imgRes.status}).`);
  }

  const contentType = imgRes.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await imgRes.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: contentType });

  const form = new FormData();
  form.append("file", blob, "image.jpg");
  form.append("upload_preset", uploadPreset);
  form.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  const json = (await res.json().catch(() => null)) as {
    secure_url?: string;
    public_id?: string;
    error?: { message?: string } | string;
  } | null;

  if (!res.ok) {
    const msg =
      typeof json?.error === "string"
        ? json.error
        : json?.error?.message ?? "Upload ke Cloudinary gagal.";
    throw new Error(msg);
  }

  if (!json?.secure_url) {
    throw new Error("Upload ke Cloudinary gagal: secure_url kosong.");
  }

  return { secure_url: json.secure_url, public_id: json.public_id ?? "" };
}

export const uploadFromUrl = uploadUrlToCloudinary;
export const uploadImageFromUrl = uploadUrlToCloudinary;

