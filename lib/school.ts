/**
 * SATU SUMBER KEBENARAN untuk data resmi sekolah.
 *
 * Semua field bertipe `string | null` yang masih bernilai `null`
 * BELUM diverifikasi pihak sekolah. Komponen wajib menampilkan label
 * `UNVERIFIED_LABEL` alih-alih mengarang angka.
 */

export const UNVERIFIED_LABEL = "Menunggu verifikasi sekolah";

/**
 * Domain resmi situs. SATU sumber untuk metadata, canonical, sitemap, robots,
 * dan JSON-LD. Ubah di sini saja saat pindah host / pakai domain Vercel.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sman1lumajang.sch.id";

export interface Accreditation {
  /** Peringkat, mis. "A" atau "Unggul". */
  grade: string | null;
  /** Nomor SK BAN-S/M, mis. "142/BAN-S/M.35/SK/XII/2018". */
  skNumber: string | null;
  /** Tahun terbit SK. */
  year: number | null;
}

export interface SchoolAddress {
  street: string;
  city: string;
  province: string;
}

export interface SchoolProfile {
  name: string;
  shortName: string;
  nickname: string;
  motto: string;
  established: number;
  /** "Kota, Provinsi" — dipakai di Hero & JSON-LD. */
  location: string;
  address: SchoolAddress;
  npsn: string | null;
  accreditation: Accreditation;
  /** Izin operasional sekolah — bukan SK akreditasi. */
  operationalPermit: { number: string; year: number | null };
  /** Nomor telepon resmi, format lokal tanpa prefiks internasional, mis. "0334881747". */
  phone: string | null;
  /** Nomor WhatsApp resmi, format lokal tanpa prefiks internasional, mis. "081217832817". */
  whatsapp: string | null;
  email: string;
  officeHours: string;
}

// Semua data di bawah sudah diverifikasi dari akun/kontak resmi sekolah.
export const SCHOOL: SchoolProfile = {
  name: "SMA Negeri 1 Lumajang",
  shortName: "SMAN 1 Lumajang",
  nickname: "SMASA",
  motto: "Berilmu, Berbudaya, Berkarakter",
  established: 1960,
  location: "Lumajang, Jawa Timur",
  address: {
    street: "Jl. Jend. A. Yani No. 7",
    city: "Lumajang",
    province: "Jawa Timur",
  },
  npsn: "20520821",
  accreditation: {
    /** Peringkat akreditasi resmi (BAN-S/M). `null` bila belum diverifikasi. */
    grade: "A",
    skNumber: null,
    year: null,
  },
  /** Izin operasional sekolah — bukan SK akreditasi. */
  operationalPermit: { number: "0507/0/1989", year: 1989 },
  phone: "0334881747",
  whatsapp: "081217832817",
  email: "smasalmj@yahoo.com",
  officeHours: "Senin–Jumat 07.00–15.00 WIB",
};

/* ------------------------------------------------------------------ */
/* Alamat peta & media sosial resmi                                    */
/* ------------------------------------------------------------------ */

export const MAPS = {
  /** Tautan pendek resmi yang dibagikan sekolah. */
  short: "https://maps.app.goo.gl/7emVZaFHe5EcGsAP6",
  /** Embed iframe (tanpa API key) — harus disertakan encoding yang benar. */
  embed:
    "https://www.google.com/maps?q=SMA+Negeri+1+Lumajang&z=16&output=embed",
  geo: { latitude: -8.119156, longitude: 113.228529 },
};

export interface SocialLink {
  label: string;
  handle: string;
  url: string;
}

export const SOCIALS: SocialLink[] = [
  {
    label: "Instagram",
    handle: "@liputan.sman1lmj",
    url: "https://www.instagram.com/liputan.sman1lmj/",
  },
  {
    label: "Facebook",
    handle: "SMASA Lumajang",
    url: "https://www.facebook.com/smasalumajang/?locale=id_ID",
  },
  {
    label: "YouTube",
    handle: "@albumsmasa3922",
    url: "https://www.youtube.com/@albumsmasa3922",
  },
  {
    label: "Threads",
    handle: "@liputan.sman1lmj",
    url: "https://www.threads.com/@liputan.sman1lmj",
  },
];

/* ------------------------------------------------------------------ */
/* Helper format nomor / tautan                                        */
/* ------------------------------------------------------------------ */

/** Local phone "0334881747" → "(0334) 881747". Empty bila null. */
export function displayPhone(phone: string | null = SCHOOL.phone): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0")
    ? `(${digits.slice(0, 4)}) ${digits.slice(4)}`
    : digits;
}

/** Local phone → tel: URL internasional, mis. "+62334881747". */
export function telHref(phone: string | null = SCHOOL.phone): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return `tel:+62${digits.replace(/^0/, "")}`;
}

/** "Jl. Jend. A. Yani No. 7, Lumajang, Jawa Timur" */
export function fullAddress(a: SchoolAddress = SCHOOL.address): string {
  return [a.street, a.city, a.province].filter(Boolean).join(", ");
}

/** Local WA number → wa.me URL. `message` optional, di-encode. */
export function waHref(
  wa: string | null = SCHOOL.whatsapp,
  message?: string
): string {
  if (!wa) return "";
  const digits = wa.replace(/\D/g, "");
  const base = `https://wa.me/62${digits.replace(/^0/, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/* ------------------------------------------------------------------ */
/* PPDB — jadwal & status hitung mundur                                */
/* ------------------------------------------------------------------ */

/** Tanggal kalender murni, format "YYYY-MM-DD" (waktu setempat WIB). */
export type IsoDay = string;

export interface PpdbPhase {
  label: string;
  start: IsoDay | null;
  end: IsoDay | null;
}

export const PPDB_SCHOOL_YEAR = "2026/2027";

/**
 * // PLACEHOLDER: jadwal resmi selalu diumumkan Dinas Pendidikan Provinsi
 * // Jawa Timur. Isi `start`/`end` setelah SK keluar; `null` = belum ada.
 */
export const PPDB_PHASES: PpdbPhase[] = [
  { label: "Jalur Zonasi", start: null, end: null },
  { label: "Jalur Prestasi", start: null, end: null },
  { label: "Jalur Afirmasi", start: null, end: null },
];

export type PpdbStatus =
  | { state: "unverified" }
  | { state: "upcoming"; label: string; days: number; date: IsoDay }
  | { state: "open"; label: string; days: number; date: IsoDay }
  | { state: "closed" };

const MS_PER_DAY = 86_400_000;
/** WIB = UTC+7. */
const WIB_OFFSET_MINUTES = 7 * 60;

/**
 * Menggeser `now` supaya field lokal-nya (getDate/getMonth/…) membaca
 * jam dinding WIB, tanpa peduli zona waktu mesin yang merender.
 */
function nowInWib(now: Date): Date {
  const shift = WIB_OFFSET_MINUTES + now.getTimezoneOffset();
  return new Date(now.getTime() + shift * 60_000);
}

/** "2026-06-22" → Date lokal 22 Juni 2026 00:00. `null` bila tak valid. */
export function parseIsoDay(iso: IsoDay | null): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDay(date: Date): IsoDay {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

/** true bila minimal satu fase PPDB sudah punya tanggal terverifikasi. */

/** true bila minimal satu fase PPDB sudah punya tanggal terverifikasi. */
export const PPDB_HAS_DATES: boolean = PPDB_PHASES.some(
  (p) => parseIsoDay(p.start) !== null
);

/**
 * Status PPDB relatif terhadap hari ini (WIB).
 * Dipanggil di klien setiap menit supaya hitung mundur tetap hidup.
 */
export function getPpdbStatus(now: Date = new Date()): PpdbStatus {
  type DatedPhase = { label: string; start: Date; end: Date | null };
  const dated = PPDB_PHASES.map((p) => ({
    label: p.label,
    start: parseIsoDay(p.start),
    end: parseIsoDay(p.end),
  }))
    .filter((p): p is DatedPhase => p.start !== null)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (dated.length === 0) return { state: "unverified" };

  const wib = nowInWib(now);
  // Tengah malam "hari ini" (dalam jam dinding WIB). Semua selisih dihitung
  // sebagai hari kalender penuh, lalu dibulatkan supaya aman terhadap DST
  // pada zona waktu mesin.
  const today = new Date(wib);
  today.setHours(0, 0, 0, 0);

  const active = dated.find(
    (p) => (p.end ?? p.start).getTime() >= today.getTime()
  );
  if (!active) return { state: "closed" };

  if (active.start.getTime() > today.getTime()) {
    return {
      state: "upcoming",
      label: active.label,
      days: Math.round((active.start.getTime() - today.getTime()) / MS_PER_DAY),
      date: toIsoDay(active.start),
    };
  }

  const end = active.end ?? active.start;
  return {
    state: "open",
    label: active.label,
    days: Math.round((end.getTime() - today.getTime()) / MS_PER_DAY),
    date: toIsoDay(end),
  };
}

/** "2026-06-22" → "22 Juni 2026". Fallback string mentah bila tak valid. */
export function formatIsoDay(iso: IsoDay | null): string {
  const date = parseIsoDay(iso);
  if (!date) return iso ?? "";
  // Dibangun ulang dalam UTC agar label tidak bergeser oleh zona waktu lokal.
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(utc));
}

/** "Terakreditasi A" — `null` bila peringkat belum diverifikasi. */
export function accreditationLabel(
  a: Accreditation = SCHOOL.accreditation
): string | null {
  return a.grade ? `Terakreditasi ${a.grade}` : null;
}

/** "SK Izin Operasional No. 0507/0/1989" — izin operasional, bukan SK akreditasi. */
export function operationalPermitLabel(): string {
  const { number } = SCHOOL.operationalPermit;
  return `SK Izin Operasional No. ${number}`;
}

/** "SK No. 1427/BAN-SM/SK/2022" — fallback label verifikasi. */
export function accreditationSkLabel(
  a: Accreditation = SCHOOL.accreditation
): string {
  if (!a.skNumber) return "Nomor SK belum diverifikasi";
  // Tahun tidak diulang bila sudah tercantum di dalam nomor SK.
  const yearInSk = a.year !== null && a.skNumber.includes(String(a.year));
  if (a.year && !yearInSk) return `SK No. ${a.skNumber} · ${a.year}`;
  return `SK No. ${a.skNumber}`;
}

/** "NPSN 20520655" — fallback label verifikasi. */
export function npsnLabel(npsn: string | null = SCHOOL.npsn): string {
  return npsn ? `NPSN ${npsn}` : UNVERIFIED_LABEL;
}

/** Umur sekolah dalam tahun, relatif terhadap tahun kalender berjalan (WIB). */
export function yearsSince(year: number, now: Date = new Date()): number {
  return nowInWib(now).getFullYear() - year;
}

/* ------------------------------------------------------------------ */
/* Jajaran pimpinan & struktur organisasi                              */
/* ------------------------------------------------------------------ */

/**
 * Data resmi jajaran sekolah, diterima langsung dari pihak sekolah.
 * Nama ditulis PERSIS termasuk gelar — jangan disederhanakan/diurut ulang.
 */
export interface StaffMember {
  /** Nama lengkap beserta gelar. */
  nama: string;
  /** Peran di dalam tim, mis. "Waka Kurikulum". */
  jabatan: string;
}

export interface StaffTeam {
  /** Anchor / kunci React, mis. "kurikulum". */
  id: string;
  /** Nama tim apa adanya, mis. "Tim Kurikulum". */
  nama: string;
  /** Satu kalimat tugas tim. */
  tugas: string;
  /** Urutan: koordinator/waka lebih dulu, lalu staf. */
  anggota: StaffMember[];
}

export const KEPALA_SEKOLAH: StaffMember = {
  nama: "Moh. Agus Wibisono, M.Pd.",
  jabatan: "Kepala Sekolah",
};

export const STAFF_TEAMS: StaffTeam[] = [
  {
    id: "kurikulum",
    nama: "Tim Kurikulum",
    tugas: "Menyusun jadwal, kalender akademik, dan mutu pembelajaran.",
    anggota: [
      { nama: "Abd. Adim, S.Pd. Gr.", jabatan: "Waka Kurikulum" },
      { nama: "Maria Ervina, S.Si", jabatan: "Staf Kurikulum" },
      { nama: "Ayu Andhira K, S.Pd. Gr.", jabatan: "Staf Kurikulum" },
      { nama: "Anas Mahfud, S.Kom. Gr.", jabatan: "Staf Kurikulum" },
    ],
  },
  {
    id: "humas",
    nama: "Tim Humas & Media Center",
    tugas: "Menjalin hubungan sekolah dengan masyarakat, media, dan mitra.",
    anggota: [
      { nama: "Deasy Ariyati, S.Pd.", jabatan: "Waka Humas" },
      { nama: "Amanda Rakhmi K., M.Pd.", jabatan: "Media Center" },
      { nama: "Lukman Misbahul M, S.Pd.", jabatan: "Media Center" },
      { nama: "Eka Meilinda F., S.Pd. Gr.", jabatan: "Media Center" },
      { nama: "Nur Fadilah, S.Pd.", jabatan: "Media Center" },
      { nama: "Ni\'matul Chasanah Nur R, S.Pd.", jabatan: "Media Center" },
    ],
  },
  {
    id: "kesiswaan",
    nama: "Tim Kesiswaan",
    tugas: "Membina kedisiplinan, OSIS, dan pengembangan karakter siswa.",
    anggota: [
      { nama: "Ariek Pujiana, S.Pd. M.M.", jabatan: "Waka Kesiswaan" },
      { nama: "Riastiti Saputri, S.Pd. M.Pd.", jabatan: "Staf Kesiswaan" },
      { nama: "Giovandi Eki Melvianto, S.Pd.", jabatan: "Staf Kesiswaan" },
      { nama: "Wahyu Widayanti, S.Pd.", jabatan: "Staf Kesiswaan" },
      { nama: "Suliswantoro Bangkit, S.Pd. Gr.", jabatan: "Staf Kesiswaan" },
      { nama: "Agung Dwi Eka P, S.Pd.", jabatan: "Staf Kesiswaan" },
    ],
  },
  {
    id: "sarpras",
    nama: "Tim Sarana & Prasarana",
    tugas: "Mengelola fasilitas, ruang belajar, dan perawatan lingkungan sekolah.",
    anggota: [
      { nama: "Suryaning Anggraeni, S.Pd.", jabatan: "Waka Sarpras" },
      { nama: "Azimah Laily, S.Pd.", jabatan: "Staf Sarpras" },
    ],
  },
  {
    id: "tata-usaha",
    nama: "Kepala Unit & Bendahara",
    tugas: "Administrasi sekolah, perpustakaan, laboratorium, dan keuangan.",
    anggota: [
      { nama: "Haris Indra Susanto, S.Pd.", jabatan: "Kepala Tata Usaha" },
      { nama: "Eka Meilinda F., S.Pd. Gr.", jabatan: "Kepala Perpustakaan" },
      { nama: "Indinah Dwi Wahyu P, S.Pd.", jabatan: "Kepala Laboratorium" },
      { nama: "Moh. Adi Indarto, S.Pd.", jabatan: "Bendahara BOS" },
      { nama: "Devi Amaliyah H, S.Pd. Gr.", jabatan: "Bendahara BOPP" },
    ],
  },
  {
    id: "tatib",
    nama: "Tim Tata Tertib",
    tugas: "Menegakkan tata tertib dan membangun budaya disiplin antar kelas.",
    anggota: [
      { nama: "Drs. Sumartono", jabatan: "Koordinator Tim Tatib" },
      { nama: "Henri Rusmawan, S.Pd. Gr.", jabatan: "Wakil Ketua Tim Tatib" },
      { nama: "Bety Wulansari, S.Pd. Gr.", jabatan: "Sekretaris Tim Tatib" },
      { nama: "Retno Aridaryati, S.Pd.", jabatan: "Tatib Kelas X" },
      { nama: "Anang Maksum, S.Pd.", jabatan: "Tatib Kelas X" },
      { nama: "Amik Indarawati, S.Pd. Gr.", jabatan: "Tatib Kelas XI" },
      { nama: "Kurniawan Budi Utomo, S.Pd.", jabatan: "Tatib Kelas XI" },
      { nama: "Heru Hadi Santoso, S.Pd.", jabatan: "Tatib Kelas XII" },
      { nama: "Wahyu Suryaningrum, S.Pd. Gr.", jabatan: "Tatib Kelas XII" },
    ],
  },
];

/**
 * Jumlah PERAN (bukan orang unik) — satu guru bisa memegang dua peran,
 * mis. Eka Meilinda F. di Media Center sekaligus Kepala Perpustakaan.
 */
export const STAFF_PERAN_TOTAL =
  1 + STAFF_TEAMS.reduce((total, tim) => total + tim.anggota.length, 0);

/**
 * Inisial untuk monogram avatar: "Moh. Agus Wibisono, M.Pd." → "MA".
 * Gelar di depan (Drs., Dra., Prof., H., Hj., Apt., Dr., Drs., Ir.) dan
 * partikel nama keturunan (ul, al, bin, binti, van, der) dibuang agar
 * inisial mewakili nama orang, bukan gelar atau partikel.
 */
const DEGREE_PREFIX = /^(drs|dra|prof|dr|apt|drh|drg|ir|h|hj|msi|m\.si)\.?$/i;
/** Partikel nama non-baku yang di-skip: ul, al, bin, binti, van, der, i. */
const PARTICLE = /\b(ul|al|bin|binti|van|der|i)\b/i;

export function initials(nama: string): string {
  const kata = nama
    .split(",")[0]
    .trim()
    .split(/\s+/)
    .filter((w) => !DEGREE_PREFIX.test(w) && !PARTICLE.test(w));
  // Untuk nama tunggal (mononim) tanpa partikel — contoh: "Sudjatmiko" → "SS"
  if (kata.length === 1) return kata[0].charAt(0).toUpperCase().repeat(2);
  return kata
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

/* ------------------------------------------------------------------ */
/* Komite Sekolah                                                      */
/* ------------------------------------------------------------------ */

export interface KomiteBidang {
  /** Anchor / kunci React, mis. "perencanaan". */
  id: string;
  /** Nama bidang, tanpa prefiks "Bidang" — dipakai sebagai judul kartu. */
  nama: string;
  anggota: StaffMember[];
}

/** Penanggung jawab eks officio (biasanya kepala sekolah). */
export const KOMITE_PENANGGUNG_JAWAB: StaffMember = {
  nama: KEPALA_SEKOLAH.nama,
  jabatan: "Kepala Sekolah (Penanggung Jawab)",
};

/** Susunan pimpinan inti sesuai SK komite terbaru. */
export const KOMITE_PIMPINAN: StaffMember[] = [
  { nama: "Dr. Mokh. Hariyadi Eko Romadon, S.Sos, M.Si", jabatan: "Ketua" },
  { nama: "H. Slamet Tinggal Siyono", jabatan: "Wakil Ketua" },
  { nama: "Arief Budi Setiawan, S.T", jabatan: "Sekretaris" },
  { nama: "Arri Indriana, SE", jabatan: "Bendahara" },
];

/** Bidang-bidang kerja + anggotanya. */
export const KOMITE_BIDANG: KomiteBidang[] = [
  {
    id: "perencanaan",
    nama: "Perencanaan dan Evaluasi Pendidikan",
    anggota: [
      { nama: "dr. Nurul Yudhi Prihastuty, Sp. A", jabatan: "Anggota Bidang" },
      { nama: "Basuki Rahmat, S.H., M.Kn.", jabatan: "Anggota Bidang" },
    ],
  },
  {
    id: "sarpras",
    nama: "Sarana dan Prasarana Pendidikan",
    anggota: [
      { nama: "Ziau ul Khasannul Khuluk I, S.H, M.H", jabatan: "Anggota Bidang" },
      { nama: "Apt. Sri Any Sulistyowati S.Si., M.Farm.klin.", jabatan: "Anggota Bidang" },
    ],
  },
  {
    id: "kerja-sama",
    nama: "Kerja Sama",
    anggota: [
      { nama: "Dr. Sudjatmiko, S.H, M.H", jabatan: "Anggota Bidang" },
    ],
  },
  {
    id: "partisipasi-masyarakat",
    nama: "Partisipasi dan Aspirasi Masyarakat",
    anggota: [
      { nama: "Eni Kusmayana", jabatan: "Anggota Bidang" },
      { nama: "Wahyu Hidayatullah, S.H, M.H", jabatan: "Anggota Bidang" },
    ],
  },
];

/** Total orang unik di komite (bukan peran ganda). */
export const KOMITE_TOTAL_ANGGOTA =
  1 + KOMITE_PIMPINAN.length + KOMITE_BIDANG.reduce((s, b) => s + b.anggota.length, 0);

/* ------------------------------------------------------------------ */
/* Program Akademik                                                    */
/* ------------------------------------------------------------------ */

export interface ProgramAkademik {
  code: string;
  name: string;
  subjects: string[];
}

/** Daftar jurusan yang diverifikasi pihak sekolah. */
export const PROGRAM_AKADEMIK: ProgramAkademik[] = [
  {
    code: "SOSHUM",
    name: "Sosial dan Hukum",
    subjects: ["Ekonomi", "Sosiologi", "Geografi", "Bahasa Inggris Lanjut", "Mapel Wajib"],
  },
  {
    code: "TEKNIK",
    name: "Teknik",
    subjects: [
      "Fisika",
      "Kimia",
      "Matematika Lanjut",
      "Bahasa Inggris Lanjut",
      "Mapel Wajib",
    ],
  },
  {
    code: "KES",
    name: "Kesehatan",
    subjects: [
      "Biologi",
      "Kimia",
      "Matematika Lanjut",
      "Bahasa Inggris Lanjut",
      "Mapel Wajib",
    ],
  },
  {
    code: "PRESTASI",
    name: "Kelas Prestasi",
    subjects: ["Coding", "Mapel Pilihan", "Mapel Wajib"],
  },
];

/* ------------------------------------------------------------------ */
/* Ekstrakurikuler                                                     */
/* ------------------------------------------------------------------ */

export interface Ekstrakurikuler {
  name: string;
}

/**
 * Daftar ekstrakurikuler resmi SMA Negeri 1 Lumajang.
 * Dipakai di halaman eskul — nomor urutan dipertahankan sesuai sumber.
 */
export const EKSTRAKURIKULER: Ekstrakurikuler[] = [
  { name: "Taekwondo" },
  { name: "Bola Voli" },
  { name: "Gate Ball" },
  { name: "Futsal dan Sepak Bola" },
  { name: "Pecinta Alam" },
  { name: "Basket" },
  { name: "PMR" },
  { name: "English Club" },
  { name: "Pencak Silat" },
  { name: "Remas" },
  { name: "Tari & Karawitan" },
  { name: "Media Center" },
  { name: "Teater" },
  { name: "Musik & Paduan Suara" },
  { name: "PASSMASA (Paskibra)" },
];

/** Total jumlah ekstrakurikuler yang terdata. */
export const EKSKUL_TOTAL = EKSTRAKURIKULER.length;
