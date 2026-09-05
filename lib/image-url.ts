/**
 * Validasi URL gambar yang boleh disimpan ke Firestore.
 * Mencegah admin (atau bug) menyimpan URL ke host arbitrer yang nanti
 * dimuat browser pengunjung (vektor tracking/phishing).
 */
const ALLOWED_IMAGE_HOSTS = [
  "res.cloudinary.com",
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
];

export function isValidImageUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v.startsWith("/")) return !v.startsWith("//");
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  return ALLOWED_IMAGE_HOSTS.includes(url.hostname);
}

export const IMAGE_URL_HINT =
  "URL gambar harus path lokal (/...) atau https dari res.cloudinary.com / Firebase Storage.";