/**
 * Metadata tampilan untuk tiap tipe blok: label, ikon, penjelasan ramah
 * non-coder, daftar varian, dan ringkasan singkat isi blok.
 *
 * Sumber label tunggal tetap `BLOK_LABEL` di `lib/halaman-schema.ts`
 * (dipakai bersama oleh validasi/seed) — di sini hanya di-re-export.
 *
 * Daftar varian WAJIB sama dengan matriks render `docs/PLAN-Admin-Page-Builder.md` §5.
 */
import type { Blok, BlokTipe } from "@/lib/halaman-schema";

export { BLOK_LABEL, BLOK_TIPE_ORDER, MAX_ITEM_BLOK, MAX_TEKS_BLOK } from "@/lib/halaman-schema";

export type OpsiVarian = { value: string; label: string };

export const BLOK_IKON: Record<BlokTipe, string> = {
  paragraf: "📄",
  heading: "🔖",
  gambar: "🖼️",
  galeri: "🗂️",
  tombol: "🔗",
  video: "🎬",
  divider: "➖",
  spacer: "⬜",
  kutipan: "❝",
  daftar: "•",
};

export const BLOK_DESKRIPSI: Record<BlokTipe, string> = {
  paragraf: "Tulisan biasa untuk mengisi halaman.",
  heading: "Judul bagian, ukurannya bisa dipilih.",
  gambar: "Satu foto, boleh diberi keterangan di bawahnya.",
  galeri: "Beberapa foto sekaligus.",
  tombol: "Tombol yang mengarah ke halaman lain atau situs luar.",
  video: "Sematkan video dari YouTube atau Vimeo.",
  divider: "Garis tipis sebagai pemisah antar bagian.",
  spacer: "Jarak kosong supaya halaman tidak terlalu padat.",
  kutipan: "Kata-kata penting, ditampilkan miring.",
  daftar: "Daftar poin dengan tanda titik.",
};

/** Varian per tipe (field `varian`). Kosong = tipe itu tidak punya pilihan varian. */
export const BLOK_VARIAN: Record<BlokTipe, OpsiVarian[]> = {
  paragraf: [],
  heading: [],
  gambar: [
    { value: "normal", label: "Normal (4:3)" },
    { value: "wide", label: "Lebar (16:9)" },
    { value: "full", label: "Sangat lebar (21:9)" },
  ],
  galeri: [
    { value: "grid3", label: "Tiga kolom" },
    { value: "grid2", label: "Dua kolom" },
    { value: "carousel", label: "Geser (carousel)" },
  ],
  tombol: [
    { value: "primary", label: "Utama (biru tua)" },
    { value: "outline", label: "Garis tepi" },
    { value: "soft", label: "Lembut (abu muda)" },
  ],
  video: [],
  divider: [],
  spacer: [],
  kutipan: [],
  daftar: [],
};

/** Opsi field `tinggi` khusus blok spacer. */
export const SPACER_TINGGI_OPTIONS: (OpsiVarian & { value: "kecil" | "sedang" | "besar" })[] = [
  { value: "kecil", label: "Kecil" },
  { value: "sedang", label: "Sedang" },
  { value: "besar", label: "Besar" },
];

/** Potong teks panjang agar tidak merusak layout header kartu blok. */
function ringkas(v: string, maks = 70): string {
  const t = v.trim().replace(/\s+/g, " ");
  return t.length > maks ? `${t.slice(0, maks - 1)}…` : t;
}

/** Ringkasan singkat isi blok — dipakai di header kartu editor. */
export function ringkasBlok(blok: Blok): string {
  const teks = (blok.teks ?? "").trim();
  const caption = (blok.caption ?? "").trim();
  const items = Array.isArray(blok.items) ? blok.items.filter((s) => String(s ?? "").trim()) : [];

  switch (blok.tipe) {
    case "paragraf":
    case "heading":
    case "kutipan":
      return ringkas(teks) || "Belum diisi";
    case "tombol":
      return ringkas(teks) || "Belum ada tulisan tombol";
    case "gambar":
      return ringkas(caption || (blok.src ?? "")) || "Belum ada foto";
    case "video":
      return ringkas(caption || (blok.src ?? "")) || "Belum ada video";
    case "galeri":
      return items.length === 0 ? "Belum ada foto" : `${items.length} foto`;
    case "daftar":
      return items.length === 0 ? "Belum ada isi" : `${items.length} poin`;
    case "spacer":
      return `Jarak ${blok.tinggi ?? "sedang"}`;
    case "divider":
      return "Garis pemisah";
    default:
      return "";
  }
}
