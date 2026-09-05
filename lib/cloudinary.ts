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
