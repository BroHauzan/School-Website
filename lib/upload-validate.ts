/**
 * Validasi file gambar upload — dipakai kedua upload route (berita + galeri).
 * Mengecek ukuran, MIME, DAN magic bytes (anti-spoof: file .exe rename .jpg).
 * GIF ditolak: rawan GIF-bomb animasi + tidak dipakai design system.
 */
const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function magicOk(bytes: Uint8Array, mime: string): boolean {
  if (mime === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mime === "image/png") {
    return (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }
  if (mime === "image/webp") {
    // RIFF xxxx WEBP
    return (
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }
  return false;
}

export const UPLOAD_MAX_BYTES = MAX_BYTES;
export const UPLOAD_ALLOWED_TYPES = ALLOWED_TYPES;

/** Return string error bila invalid, null bila OK. */
export async function validateImageFile(file: File): Promise<string | null> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Format gambar harus JPG, PNG, atau WebP.";
  }
  if (file.size > MAX_BYTES) {
    return "Ukuran gambar maksimal 5MB.";
  }
  if (file.size === 0) {
    return "File gambar kosong.";
  }
  try {
    const buf = await file.slice(0, 12).arrayBuffer();
    if (!magicOk(new Uint8Array(buf), file.type)) {
      return "Isi file tidak cocok dengan format gambar (kemungkinan file palsu).";
    }
  } catch {
    return "Gagal membaca file gambar.";
  }
  return null;
}