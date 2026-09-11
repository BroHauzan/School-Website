/**
 * Validasi file gambar upload — dipakai kedua upload route (berita + galeri).
 * Mengecek ukuran, MIME, DAN magic bytes (anti-spoof: file .exe rename .jpg).
 * GIF ditolak: rawan GIF-bomb animasi + tidak dipakai design system.
 */
const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function matchAt(b: Uint8Array, offset: number, ...sig: number[]): boolean {
  return sig.every((v, i) => b[offset + i] === v);
}

const MAGIC: Record<string, (b: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b.length >= 3 && matchAt(b, 0, 0xff, 0xd8, 0xff),
  "image/png":  (b) => b.length >= 8 && matchAt(b, 0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a),
  "image/webp": (b) => b.length >= 12 && matchAt(b, 0, 0x52, 0x49, 0x46, 0x46) && matchAt(b, 8, 0x57, 0x45, 0x42, 0x50),
};

function magicOk(bytes: Uint8Array, mime: string): boolean {
  return MAGIC[mime]?.(bytes) ?? false;
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