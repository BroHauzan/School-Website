/**
 * Analisis dampak perubahan halaman terhadap navbar publik & tautan CTA.
 *
 * Modul ini TIDAK mengimpor "server-only" karena dipakai komponen klien
 * (dialog konfirmasi admin) maupun server (blokir hapus). Dua lubang QA yang
 * ditutup:
 *
 * - QA 2.1: blok Tombol/CTA di halaman lain menunjuk halaman yang akan
 *   dihapus → tautan mati tanpa peringatan.
 * - QA 2.3: halaman yang berhenti tayang ternyata satu-satunya isi sebuah menu
 *   induk → menunya hilang diam-diam dari navbar publik.
 */

import type { Blok, HalamanDoc, NavGroupsDoc } from "./halaman-schema";

/** Normalisasi href internal untuk perbandingan: buang query/hash, trailing slash, spasi. */
export function normalisasiHref(href: string): string {
  const t = (href ?? "").trim();
  if (!t.startsWith("/") || t.startsWith("//")) return t;
  const tanpaQuery = t.split(/[?#]/)[0] ?? t;
  if (tanpaQuery.length > 1) return tanpaQuery.replace(/\/+$/, "") || "/";
  return tanpaQuery || "/";
}

/** Href publik sebuah halaman — cermin `hrefOf()` di `nav-public.ts`.
 * Halaman bawaan → systemPath aslinya; halaman builder → `/halaman/<slug>`. */
export function alamatPublik(h: Pick<HalamanDoc, "slug"> & Partial<Pick<HalamanDoc, "systemPath">>): string {
  const sys = typeof h.systemPath === "string" ? h.systemPath.trim() : "";
  if (sys) return normalisasiHref(sys);
  const slug = (h.slug ?? "").trim().replace(/^\/+/, "");
  if (!slug) return "/";
  return `/halaman/${slug}`;
}

/** Blok Tombol dengan href internal (diawali "/", bukan "//"). */
function tombolInternal(blok: unknown): { href: string; label: string } | null {
  const b = blok as Blok | null;
  if (!b || b.tipe !== "tombol") return null;
  const href = typeof b.href === "string" ? b.href.trim() : "";
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  return { href, label: (b.teks ?? "").trim() || "(tombol tanpa teks)" };
}

export type Penaut = { id: string; judul: string; label: string };

/**
 * Halaman (selain `kecualiId`) yang blok Tombol-nya menunjuk `href`.
 * Hanya tautan internal yang bisa diperiksa; tautan `https://` keluar dari
 * sistem ini jadi dilewati.
 */
export function halamanYangMenaut(
  href: string,
  semua: HalamanDoc[],
  kecualiId?: string,
): Penaut[] {
  const target = normalisasiHref(href.trim());
  if (!target.startsWith("/") || target.startsWith("//")) return [];

  const hasil: Penaut[] = [];
  for (const h of Array.isArray(semua) ? semua : []) {
    if (!h || h.id === kecualiId) continue;
    for (const b of Array.isArray(h.blok) ? h.blok : []) {
      const t = tombolInternal(b);
      if (t && normalisasiHref(t.href) === target) {
        hasil.push({ id: h.id, judul: h.judul, label: t.label });
      }
    }
  }
  return hasil;
}

export type DampakMenu = {
  groupKey: string;
  /** Label menu induk seperti yang tampil di navbar. */
  label: string;
  /** true = menu kehilangan seluruh isinya sehingga hilang dari navbar. */
  menuHilang: boolean;
  /** Jumlah halaman lain di menu yang tetap tampil setelah perubahan. */
  sisaAnggota: number;
  /** Menu dirender sebagai dropdown (dapat dibuka-tutup). */
  dropdown: boolean;
};

/**
 * Ringkasan dampak bila sebuah halaman berhenti tayang. Dipakai server
 * (`peringatanHalaman()`) maupun komponen admin lewat API `/dampak`.
 */
export type PeringatanHalaman = {
  /** Menu induk yang akan kehilangan isinya / hilang dari navbar. */
  menu: DampakMenu | null;
  /** Blok Tombol di halaman LAIN yang menunjuk alamat halaman ini. */
  ditautOleh: Penaut[];
};

/** Halaman yang benar-benar tampil di navbar publik. */
function tampilDiNavbar(h: HalamanDoc): boolean {
  return h.published !== false && h.showInNav !== false;
}

const urutanOf = (v: unknown): number =>
  typeof v === "number" && Number.isFinite(v) ? v : Number.MAX_SAFE_INTEGER;

/**
 * Apa yang terjadi pada navbar bila `dokId` berhenti tayang (di-unpublish,
 * "Tampil di menu" dimatikan, atau dihapus).
 *
 * Mengembalikan `null` bila tidak ada yang berubah: halaman sudah tidak tayang,
 * atau ia berdiri sendiri di luar menu.
 */
export function dampakMenu(
  semua: HalamanDoc[],
  groups: NavGroupsDoc,
  dokId: string,
): DampakMenu | null {
  const halaman = Array.isArray(semua) ? semua.filter(Boolean) : [];
  const dok = halaman.find((h) => h.id === dokId);
  if (!dok) return null;
  if (!tampilDiNavbar(dok)) return null;
  if (dok.groupKey === null || dok.groupKey === undefined) return null;

  const grupDef = Array.isArray(groups?.items)
    ? groups.items.find((g) => g?.groupKey === dok.groupKey)
    : undefined;
  // Grup yatim (halaman bergrup tanpa entri nav_groups) tetap dirender
  // `buildPublicNav()` memakai label turunan groupKey.
  const label = grupDef?.label?.trim() || labelWajar(dok.groupKey);

  // Urutan menentukan anggota mana yang jadi acuan `collapsible` — cermin
  // aturan di `nav-public.ts` (mode render diambil dari anggota pertama).
  const anggota = halaman
    .filter((h) => h.groupKey === dok.groupKey && tampilDiNavbar(h))
    .sort((a, b) => urutanOf(a.urutan) - urutanOf(b.urutan));

  const sisaAnggota = anggota.filter((h) => h.id !== dokId).length;

  return {
    groupKey: dok.groupKey,
    label,
    menuHilang: anggota.length > 0 && sisaAnggota === 0,
    sisaAnggota,
    dropdown: (anggota[0]?.collapsible ?? true) !== false,
  };
}

/**
 * Label "wajar" dari groupKey bila grup tidak terdaftar di nav_groups:
 * "profil-sekolah" → "Profil Sekolah", bukan "Profil-sekolah".
 */
export function labelWajar(groupKey: string): string {
  const kata = String(groupKey ?? "")
    .split(/[-_\s]+/)
    .filter(Boolean);
  if (kata.length === 0) return "Menu";
  return kata.map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(" ");
}
