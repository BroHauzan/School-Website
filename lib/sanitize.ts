/**
 * Defensive sanitization untuk dokumen Firestore mentah (console/migrasi
 * manual tanpa validasi API). Hanya dipakai di snapToDoc *-server.ts.
 * Jalur API (validate dan normalize) tidak diubah.
 */

/** Potong string bila melebihi max, tambah "..." (total <= max). */
export function clampStr(s: string, max: number): string {
  if (s.length <= max) return s;
  if (max <= 3) return s.slice(0, max);
  return s.slice(0, max - 3) + "...";
}

/** Kembalikan placeholder bila string kosong/setelah trim kosong. */
export function fallbackStr(s: string, placeholder: string): string {
  return s.trim().length > 0 ? s : placeholder;
}

/** Validasi ketat YYYY-MM-DD + round-trip tolak rollover (2026-02-30). */
export function isValidDateISO(iso: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return false;
  const dt = new Date(y, mo - 1, d);
  return (
    dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d
  );
}

/**
 * Kembalikan `label` bila `iso` valid ketat, kalau tidak "-".
 * Dipakai untuk dateLabel agar render tidak pernah menampilkan iso mentah.
 */
export function validDateOrDash(iso: string, label: string): string {
  return isValidDateISO(iso) ? label : "-";
}
