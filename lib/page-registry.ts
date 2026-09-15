/**
 * Registry halaman bawaan website sekolah (17 halaman sistem).
 * Modul ini TIDAK mengimpor "server-only" karena digunakan oleh komponen klien & server.
 */

import type { NavItemPublic } from "./halaman-schema";

export type SystemPageDef = {
  path: string;         // "/visi-misi" (beranda = "/")
  slug: string;         // "" untuk beranda, "visi-misi" untuk sisanya
  label: string;
  description: string;
  groupKey: string | null;
  urutan: number;
  hero: boolean;        // render PageHero? (beranda = false)
  solidHeader: boolean; // SiteHeader solidOnTop? (beranda = false)
  managed: boolean;     // konten dapat diedit admin? (berita/[slug] = false)
  systemKey: string;    // kunci unik, mis. "visi-misi", "beranda"
};

/**
 * 17 entri halaman bawaan website SMAN 1 Lumajang.
 * Dikelompokkan sesuai NAV pada SiteHeader:
 * - groupKey "profil" (urutan 0..4)
 * - groupKey "akademik" (urutan 0..3)
 * - groupKey "layanan" (urutan 0)
 * - groupKey null (independen)
 *
 * Catatan managed flag:
 * - 16 halaman dengan managed: true dapat diedit konten tambahannya oleh admin
 * - 1 halaman ("/berita/[slug]") dengan managed: false (artikel dinamis dari koleksi berita)
 */
export const SYSTEM_PAGES: SystemPageDef[] = [
  // Beranda
  {
    path: "/",
    slug: "",
    label: "Beranda",
    description: "Halaman utama website resmi SMAN 1 Lumajang.",
    groupKey: null,
    urutan: 0,
    hero: false,
    solidHeader: false,
    managed: true,
    systemKey: "beranda",
  },
  // Profil group
  {
    path: "/sejarah",
    slug: "sejarah",
    label: "Sejarah",
    description: "Sejarah SMA Negeri 1 Lumajang sejak 1960 — empat periode dari perintis hingga restrukturisasi.",
    groupKey: "profil",
    urutan: 0,
    hero: true,
    solidHeader: true,
    managed: true,
    systemKey: "sejarah",
  },
  {
    path: "/visi-misi",
    slug: "visi-misi",
    label: "Visi Misi",
    description: "Visi dan misi SMAN 1 Lumajang dalam membentuk generasi unggul.",
    groupKey: "profil",
    urutan: 1,
    hero: true,
    solidHeader: true,
    managed: true,
    systemKey: "visi-misi",
  },
  {
    path: "/struktur",
    slug: "struktur",
    label: "Struktur",
    description: "Jajaran pimpinan SMAN 1 Lumajang — kepala sekolah dan tim kerja.",
    groupKey: "profil",
    urutan: 2,
    hero: true,
    solidHeader: true,
    managed: true,
    systemKey: "struktur",
  },
  {
    path: "/alumni",
    slug: "alumni",
    label: "Alumni",
    description: "Jejak lulusan SMAN 1 Lumajang sejak 1960.",
    groupKey: "profil",
    urutan: 3,
    hero: false,
    solidHeader: true,
    managed: true,
    systemKey: "alumni",
  },
  {
    path: "/komite-sekolah",
    slug: "komite-sekolah",
    label: "Komite",
    description: "Komite Sekolah SMAN 1 Lumajang — kemitraan orang tua dan masyarakat.",
    groupKey: "profil",
    urutan: 4,
    hero: false,
    solidHeader: true,
    managed: true,
    systemKey: "komite-sekolah",
  },
  // Akademik group
  {
    path: "/kalender-pendidikan",
    slug: "kalender-pendidikan",
    label: "Kalender",
    description: "Jadwal kegiatan akademik dan non-akademik sepanjang tahun ajaran.",
    groupKey: "akademik",
    urutan: 0,
    hero: true,
    solidHeader: true,
    managed: true,
    systemKey: "kalender-pendidikan",
  },
  {
    path: "/jurnal-absensi",
    slug: "jurnal-absensi",
    label: "Jurnal",
    description: "Sistem pencatatan jurnal pembelajaran dan absensi siswa SMAN 1 Lumajang.",
    groupKey: "akademik",
    urutan: 1,
    hero: false,
    solidHeader: true,
    managed: true,
    systemKey: "jurnal-absensi",
  },
  {
    path: "/data-lulusan",
    slug: "data-lulusan",
    label: "Lulusan",
    description: "Statistik dan informasi lulusan SMAN 1 Lumajang yang melanjutkan ke perguruan tinggi.",
    groupKey: "akademik",
    urutan: 2,
    hero: false,
    solidHeader: true,
    managed: true,
    systemKey: "data-lulusan",
  },
  {
    path: "/snbp-snbt",
    slug: "snbp-snbt",
    label: "SNBP/SNBT",
    description: "Data penerimaan siswa SMAN 1 Lumajang melalui jalur SNBP dan SNBT.",
    groupKey: "akademik",
    urutan: 3,
    hero: false,
    solidHeader: true,
    managed: true,
    systemKey: "snbp-snbt",
  },
  // Layanan group
  {
    path: "/bk",
    slug: "bk",
    label: "BK",
    description: "Layanan Bimbingan Konseling SMAN 1 Lumajang.",
    groupKey: "layanan",
    urutan: 0,
    hero: false,
    solidHeader: true,
    managed: true,
    systemKey: "bk",
  },
  // Independen
  {
    path: "/berita",
    slug: "berita",
    label: "Berita",
    description: "Kabar dan pengumuman terbaru dari kampus SMAN 1 Lumajang.",
    groupKey: null,
    urutan: 1,
    hero: true,
    solidHeader: true,
    managed: true,
    systemKey: "berita",
  },
  {
    path: "/prestasi",
    slug: "prestasi",
    label: "Prestasi",
    description: "Kumpulan prestasi siswa SMAN 1 Lumajang dari tingkat kabupaten hingga internasional.",
    groupKey: null,
    urutan: 2,
    hero: true,
    solidHeader: true,
    managed: true,
    systemKey: "prestasi",
  },
  {
    path: "/fasilitas",
    slug: "fasilitas",
    label: "Fasilitas",
    description: "21 fasilitas pendukung belajar SMAN 1 Lumajang — lab, perpustakaan, olahraga, dan layanan.",
    groupKey: null,
    urutan: 3,
    hero: true,
    solidHeader: true,
    managed: true,
    systemKey: "fasilitas",
  },
  {
    path: "/eskul",
    slug: "eskul",
    label: "Ekstrakurikuler",
    description: "Daftar kegiatan ekstrakurikuler SMAN 1 Lumajang.",
    groupKey: null,
    urutan: 4,
    hero: false,
    solidHeader: true,
    managed: true,
    systemKey: "eskul",
  },
  {
    path: "/ppdb",
    slug: "ppdb",
    label: "PPDB",
    description: "Informasi dan jalur pendaftaran Penerimaan Peserta Didik Baru SMAN 1 Lumajang.",
    groupKey: null,
    urutan: 5,
    hero: false,
    solidHeader: true,
    managed: true,
    systemKey: "ppdb",
  },
  // Detail berita (unmanaged, rute dinamis)
  {
    path: "/berita/[slug]",
    slug: "berita/[slug]",
    label: "Detail Berita",
    description: "Halaman dinamis membaca artikel berita.",
    groupKey: null,
    urutan: 99,
    hero: true,
    solidHeader: true,
    managed: false,
    systemKey: "berita-detail",
  },
];

export const MANAGED_SYSTEM_PAGES: SystemPageDef[] = SYSTEM_PAGES.filter((p) => p.managed);

/**
 * Daftar slug yang tidak boleh dipakai oleh halaman builder custom
 * agar tidak bertabrakan dengan rute sistem/app/api.
 */
export const RESERVED_SLUGS: string[] = Array.from(
  new Set([
    "admin",
    "api",
    "berita",
    "halaman",
    "pratinjau",
    "login",
    ...SYSTEM_PAGES.map((p) => p.slug).filter((s) => s.length > 0 && !s.includes("/")),
  ]),
);

/** Salinan navigasi standar yang sama dengan NAV di SiteHeader */
export const DEFAULT_NAV_ITEMS: NavItemPublic[] = [
  {
    label: "Profil",
    children: [
      { href: "/sejarah", label: "Sejarah" },
      { href: "/visi-misi", label: "Visi Misi" },
      { href: "/struktur", label: "Struktur" },
      { href: "/alumni", label: "Alumni" },
      { href: "/komite-sekolah", label: "Komite" },
    ],
  },
  {
    label: "Akademik",
    children: [
      { href: "/kalender-pendidikan", label: "Kalender" },
      { href: "/jurnal-absensi", label: "Jurnal" },
      { href: "/data-lulusan", label: "Lulusan" },
      { href: "/snbp-snbt", label: "SNBP/SNBT" },
    ],
  },
  {
    label: "Layanan",
    children: [
      { href: "/bk", label: "BK" },
    ],
  },
  { href: "/berita", label: "Berita" },
  { href: "/prestasi", label: "Prestasi" },
  { href: "/fasilitas", label: "Fasilitas" },
  { href: "/#kontak", label: "Kontak" },
];

export function isReservedSlug(slug: string): boolean {
  const norm = slug.toLowerCase().trim();
  if (!norm) return true; // slug kosong hanya untuk beranda
  if (norm.startsWith("berita/")) return true;
  return RESERVED_SLUGS.includes(norm);
}

export function systemPageByPath(path: string): SystemPageDef | undefined {
  const clean = path.trim().replace(/\/$/, "") || "/";
  return SYSTEM_PAGES.find((p) => p.path === clean);
}

export function systemPageBySlug(slug: string): SystemPageDef | undefined {
  const clean = slug.toLowerCase().trim();
  return SYSTEM_PAGES.find((p) => p.slug.toLowerCase() === clean);
}

export function systemPageByKey(key: string): SystemPageDef | undefined {
  const clean = key.toLowerCase().trim();
  return SYSTEM_PAGES.find((p) => p.systemKey.toLowerCase() === clean);
}
