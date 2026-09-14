import type { PrestasiScope } from "@/lib/prestasi-schema";

/**
 * Ukuran kartu share — portrait 4:5 (1080x1350), aman untuk feed Instagram,
 * WhatsApp, dan Facebook. Ganti ke 1080x1920 kalau mau rasio Story.
 */
export const CARD_W = 1080;
export const CARD_H = 1350;

export type TierStyle = {
  /** Latar pill. */
  bg: string;
  /** Warna teks pill. */
  fg: string;
  /** Nilai CSS `border` — "none" untuk tingkat solid. */
  border: string;
};

/**
 * Warna badge per tingkat, mengikuti hierarki tabel prestasi: tingkat tinggi
 * solid, tingkat bawah outline.
 *
 * Nilai WAJIB literal hex/rgba — jangan pakai utility opacity Tailwind
 * (mis. `text-cream/70`). Tailwind v4 mengompilasinya jadi
 * `color-mix(in oklab, ...)`, dan html-to-image menyalin computed style ke
 * SVG `<foreignObject>` yang gagal dirender Safari.
 */
export const TIER_STYLE: Record<PrestasiScope, TierStyle> = {
  Internasional: { bg: "#f5c542", fg: "#09122b", border: "none" },
  Nasional: { bg: "#f9f9f8", fg: "#09122b", border: "none" },
  Provinsi: {
    bg: "rgba(249,249,248,0)",
    fg: "rgba(249,249,248,0.92)",
    border: "1px solid rgba(249,249,248,0.45)",
  },
  Kabupaten: {
    bg: "rgba(249,249,248,0)",
    fg: "rgba(249,249,248,0.72)",
    border: "1px solid rgba(249,249,248,0.24)",
  },
};

/** Palet kartu — literal, lihat catatan di TIER_STYLE. */
export const CARD_COLORS = {
  navy: "#09122b",
  navyLight: "#12274d",
  cream: "#f9f9f8",
  creamMuted: "rgba(249,249,248,0.62)",
  creamFaint: "rgba(249,249,248,0.42)",
  divider: "rgba(249,249,248,0.14)",
  watermark: "rgba(249,249,248,0.05)",
  /** Inti glow radial — titik terang tepat di pusat logo. */
  glowCore: "#2e4474",
  /** Warna dasar tergelap kartu — ujung gradient. */
  baseDeep: "#0a1428",
  /** Tepi vignette. */
  vignetteEdge: "rgba(2,5,14,0.62)",
  /** Stroke watermark mata owl. */
  eyeStroke: "rgba(245,197,66,0.9)",
  /** Stroke lengkung dekoratif kanan atas. */
  arcStroke: "rgba(245,197,66,0.85)",
} as const;

/**
 * Titik origin glow — pusat logo di dalam kartu, dalam px.
 * padding kartu 88 + separuh logo 96/2 = 136.
 */
export const GLOW_ORIGIN = { x: 136, y: 136 } as const;

/**
 * Radius glow dalam px. Sengaja terbatas supaya terbaca sebagai cahaya dari
 * satu titik, bukan gradasi menyeluruh: glow habis di
 * `GLOW_RADIUS * GLOW_CORE_STOP%` = 308px dari pusat logo (~28% lebar kartu).
 * Radius besar (mis. 820px = 76% lebar kartu) terbaca seperti wash linear.
 */
export const GLOW_RADIUS = 560;

/** Persentase radius tempat glow habis dan menyisakan `baseDeep` solid. */
export const GLOW_CORE_STOP = 55;

/** Ukuran tile grain (px, persegi) — di-repeat menutupi seluruh kartu. */
export const NOISE_TILE_SIZE = 200;

/** Seed tetap → tekstur grain identik tiap render, bukan acak tiap kali. */
export const NOISE_SEED = 20260914;

/**
 * Intensitas default layer background kartu. Ubah di sini untuk men-tweak
 * seluruh kartu sekaligus; `ShareCardBackground` menerima override per-layer.
 *
 * Catatan `noise`: ini MULTIPLIER kekuatan grain yang di-bake ke kanal alpha
 * tile PNG, bukan opacity CSS. Grain menyatu dengan gradient di satu elemen
 * `background-image`, jadi `opacity` tidak bisa dipakai per-layer.
 * `1` ≈ rata-rata |Δ luminance| ~5/255 — butiran halus, terlihat saat di-zoom.
 */
export const SHARE_BG_DEFAULTS = {
  glow: 1,
  watermark: 0.05,
  noise: 1,
  vignette: 1,
  /** Opacity lengkung dekoratif di ruang kosong kanan atas. */
  arc: 0.22,
} as const;
