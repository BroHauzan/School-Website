import { cache } from "react";
import { listBerita } from "@/lib/berita-server";
import { ID_MONTHS } from "@/lib/berita-schema";

/**
 * Cache per-request untuk daftar berita, dipakai bersama oleh hero
 * (`HalamanSistemPage`) dan isi halaman (`BeritaPageBody`) agar hanya satu
 * query Firestore per request.
 */
export const getBeritaList = cache(async () => listBerita());

/** Validasi `?bulan=YYYY-MM`; nilai lain → null (tanpa filter). */
export function normalizeBulan(raw?: string): string | null {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(raw ?? "") ? raw! : null;
}

/** "2026-03" → "Maret 2026" (ID_MONTHS dari lib/berita-schema). */
export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  return `${ID_MONTHS[Number(m) - 1]} ${y}`;
}
