export type PrestasiScope = "Kabupaten" | "Provinsi" | "Nasional";

import { formatTanggalID, todayISO } from "./berita-schema";

/** Tingkat lomba yang dikenali — dipakai select di form admin + validasi. */
export const PRESTASI_SCOPES: PrestasiScope[] = [
  "Kabupaten",
  "Provinsi",
  "Nasional",
];

/** Satu orang peraih + kelasnya. Kelas opsional (mis. tim lintas kelas). */
export type PrestasiPeraih = { nama: string; kelas: string };

export type PrestasiDoc = {
  id: string;
  /** 4 digit, mis. "2024". Dipakai orderBy desc. */
  year: string;
  scope: PrestasiScope;
  title: string;
  /** Tanggal lomba/diraih, format "YYYY-MM-DD". Kosong = hanya tahun. */
  dateISO: string;
  /** "12 Agustus 2026" — dihitung dari dateISO. Kosong bila dateISO kosong. */
  dateLabel: string;
  /** Satu atau lebih peraih — tiap orang bisa beda kelas. */
  peraih: PrestasiPeraih[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export function isPrestasiScope(v: unknown): v is PrestasiScope {
  return typeof v === "string" && (PRESTASI_SCOPES as string[]).includes(v);
}

/** Konversi kolom lama `who` + `kelas` (satu string) ke bentuk peraih array. */
export function legacyToPeraih(who: string, kelas: string): PrestasiPeraih[] {
  const nama = who.trim();
  return nama ? [{ nama, kelas: kelas.trim() }] : [];
}

/**
 * Parse nilai Firestore/JSON apa pun jadi PrestasiPeraih[] — trim semua
 * field, buang baris dengan nama kosong.
 */
export function toPeraihList(raw: unknown): PrestasiPeraih[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => {
      const o = (r ?? {}) as Record<string, unknown>;
      return { nama: String(o.nama ?? "").trim(), kelas: String(o.kelas ?? "").trim() };
    })
    .filter((p) => p.nama.length > 0);
}

export function validatePrestasi(
  input: Record<string, unknown>,
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const str = (k: string) => String(input[k] ?? "").trim();
  if (!/^\d{4}$/.test(str("year"))) errors.push("Tahun harus 4 digit angka.");
  const dateISO = str("dateISO");
  if (dateISO && isNaN(new Date(dateISO).getTime()))
    errors.push("Tanggal tidak valid.");
  if (!isPrestasiScope(str("scope")))
    errors.push("Tingkat harus Kabupaten, Provinsi, atau Nasional.");
  if (str("title").length < 8) errors.push("Nama prestasi minimal 8 karakter.");
  if (str("title").length > 160)
    errors.push("Nama prestasi maksimal 160 karakter.");
  const peraih = toPeraihList(input.peraih);
  if (peraih.length === 0) errors.push("Isi minimal 1 nama peraih.");
  if (peraih.length > 20) errors.push("Maksimal 20 peraih dalam satu prestasi.");
  for (const p of peraih) {
    if (p.nama.length < 3) errors.push(`Nama peraih "${p.nama}" minimal 3 karakter.`);
    else if (p.nama.length > 160) errors.push(`Nama peraih "${p.nama}" maksimal 160 karakter.`);
    if (p.kelas && p.kelas.length < 2) errors.push(`Kelas "${p.kelas}" minimal 2 karakter.`);
    else if (p.kelas.length > 30) errors.push(`Kelas "${p.kelas}" maksimal 30 karakter.`);
  }
  const allText = str("title") + peraih.map((p) => `${p.nama}${p.kelas}`).join("");
  if (/[<>]/.test(allText))
    errors.push("Nama prestasi dan peraih tidak boleh mengandung karakter < atau >.");
  return { ok: errors.length === 0, errors };
}

export function normalizePrestasiInput(
  input: Record<string, unknown>,
  existing?: Partial<PrestasiDoc>,
): Omit<PrestasiDoc, "id" | "createdAt" | "updatedAt"> {
  const scopeRaw = String(input.scope ?? existing?.scope ?? "Kabupaten").trim();
  // Tanggal diraih opsional: dokumen lama tanpa dateISO → string kosong
  // (UI hanya menampilkan tahun). Input create baru tanpa tanggal → hari ini.
  const rawDate = String(input.dateISO ?? existing?.dateISO ?? "").trim();
  const isNewDoc = !existing;
  const normalizedDate = rawDate
    ? rawDate.slice(0, 10)
    : isNewDoc
      ? todayISO()
      : "";
  let peraih: PrestasiPeraih[];
  if (input.peraih !== undefined) {
    peraih = toPeraihList(input.peraih);
  } else if (existing?.peraih?.length) {
    peraih = existing.peraih;
  } else {
    // Dokumen lama: kolom who + kelas tunggal → dikonversi ke satu entri.
    const legacy = existing as { who?: unknown; kelas?: unknown } | undefined;
    peraih = legacyToPeraih(
      String(input.who ?? legacy?.who ?? ""),
      String(input.kelas ?? legacy?.kelas ?? ""),
    );
  }
  return {
    year: String(input.year ?? existing?.year ?? "").trim().slice(0, 4),
    scope: isPrestasiScope(scopeRaw) ? scopeRaw : "Kabupaten",
    title: String(input.title ?? existing?.title ?? "").trim(),
    dateISO: normalizedDate,
    dateLabel: normalizedDate ? formatTanggalID(normalizedDate) : "",
    peraih,
    published:
      input.published === undefined
        ? (existing?.published ?? true)
        : Boolean(input.published),
  };
}
