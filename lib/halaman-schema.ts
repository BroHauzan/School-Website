/**
 * Schema, tipe, konstanta, dan helper validasi untuk Halaman & Navigasi.
 * Modul ini TIDAK mengimpor "server-only" karena digunakan oleh komponen klien & server.
 */

export type BlokTipe =
  | "paragraf"
  | "heading"
  | "gambar"
  | "galeri"
  | "tombol"
  | "video"
  | "divider"
  | "spacer"
  | "kutipan"
  | "daftar";

export type Blok = {
  id: string;
  tipe: BlokTipe;
  teks?: string;
  level?: 2 | 3 | 4;
  src?: string;
  alt?: string;
  caption?: string;
  href?: string;
  items?: string[];
  varian?: string;
  tinggi?: "kecil" | "sedang" | "besar";
};

export type HalamanVersi = {
  savedAt: string;
  judul: string;
  blok: Blok[];
  metaTitle: string;
  metaDescription: string;
};

export type HalamanDoc = {
  id: string;
  slug: string;              // "" untuk beranda, selain itu "sejarah" (tanpa slash)
  judul: string;             // h1 halaman
  navLabel: string;          // label di navbar (fallback = judul)
  groupKey: string | null;   // id grup menu; null = independen
  urutan: number;            // urutan antar-sibling (kecil dulu)
  showInNav: boolean;        // tampil di navbar publik?
  collapsible: boolean;      // grup dapat dibuka-tutup (dropdown) di navbar
  published: boolean;        // false = draft (404 publik)
  systemPath: string | null; // path halaman bawaan, mis. "/visi-misi"; null = halaman builder
  heroTitle: string;         // judul besar di PageHero
  heroDescription: string;
  blok: Blok[];              // konten tambahan
  metaTitle: string;
  metaDescription: string;
  riwayat: HalamanVersi[];   // maks MAX_RIWAYAT, terbaru di depan
  createdAt: string;
  updatedAt: string;
};

export type NavGroupsItem = {
  groupKey: string;
  label: string;
  urutan: number;
};

export type NavGroupsDoc = {
  items: NavGroupsItem[];
  updatedAt: string;
};

export type NavItemPublic =
  | { href: string; label: string }
  | { label: string; children: { href: string; label: string }[] };

export const HALAMAN_COLLECTION = "halaman";
export const NAV_GROUPS_COLLECTION = "nav_groups";
export const NAV_GROUPS_DOC_ID = "navigasi";

export const MAX_BLOK = 80;
export const MAX_RIWAYAT = 10;
export const MAX_ITEM_BLOK = 40;
export const MAX_TEKS_BLOK = 5000;

export const BLOK_LABEL: Record<BlokTipe, string> = {
  paragraf: "Paragraf",
  heading: "Judul Bagian",
  gambar: "Gambar",
  galeri: "Galeri Foto",
  tombol: "Tombol Tautan",
  video: "Video Sematan",
  divider: "Garis Pemisah",
  spacer: "Jarak Kosong",
  kutipan: "Kutipan",
  daftar: "Daftar Poin",
};

export const BLOK_TIPE_ORDER: BlokTipe[] = [
  "paragraf",
  "heading",
  "gambar",
  "galeri",
  "tombol",
  "video",
  "divider",
  "spacer",
  "kutipan",
  "daftar",
];

export const emptyHalamanForm = {
  judul: "",
  slug: "",
  navLabel: "",
  groupKey: null as string | null,
  urutan: 0,
  showInNav: true,
  collapsible: false,
  published: true,
  heroTitle: "",
  heroDescription: "",
  metaTitle: "",
  metaDescription: "",
  blok: [] as Blok[],
};

export function slugifyHalaman(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

export function newBlokId(): string {
  const rnd = Math.random().toString(36).slice(2, 8) || "b1";
  const time = Date.now().toString(36).slice(-4);
  return `b_${rnd}_${time}`;
}

export function emptyBlok(tipe: BlokTipe): Blok {
  const id = newBlokId();
  switch (tipe) {
    case "paragraf":
      return { id, tipe: "paragraf", teks: "" };
    case "heading":
      return { id, tipe: "heading", teks: "", level: 2 };
    case "gambar":
      return { id, tipe: "gambar", src: "", alt: "", caption: "", varian: "normal" };
    case "galeri":
      return { id, tipe: "galeri", items: [], varian: "grid3" };
    case "tombol":
      return { id, tipe: "tombol", teks: "", href: "/", varian: "primary" };
    case "video":
      return { id, tipe: "video", src: "", caption: "" };
    case "divider":
      return { id, tipe: "divider" };
    case "spacer":
      return { id, tipe: "spacer", tinggi: "sedang" };
    case "kutipan":
      return { id, tipe: "kutipan", teks: "" };
    case "daftar":
      return { id, tipe: "daftar", items: [] };
  }
}

const VALID_BLOK_TIPES = new Set<BlokTipe>(BLOK_TIPE_ORDER);

export function sanitizeBlok(raw: unknown): Blok[] {
  if (!Array.isArray(raw)) return [];
  const result: Blok[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const b = item as Record<string, unknown>;
    const tipe = b.tipe as BlokTipe;
    if (!VALID_BLOK_TIPES.has(tipe)) continue;

    const id = typeof b.id === "string" && b.id.trim() ? b.id.trim() : newBlokId();
    const clean: Blok = { id, tipe };

    if (typeof b.teks === "string") {
      clean.teks = b.teks.slice(0, MAX_TEKS_BLOK);
    }

    if (tipe === "heading") {
      const lvl = Number(b.level);
      clean.level = lvl === 3 || lvl === 4 ? lvl : 2;
    }

    if (typeof b.src === "string") {
      clean.src = b.src.trim().slice(0, 2048);
    }

    if (typeof b.alt === "string") {
      clean.alt = b.alt.trim().slice(0, 300);
    }

    if (typeof b.caption === "string") {
      clean.caption = b.caption.trim().slice(0, 500);
    }

    if (typeof b.href === "string") {
      clean.href = b.href.trim().slice(0, 2048);
    }

    if (Array.isArray(b.items)) {
      clean.items = b.items
        .map((x) => (typeof x === "string" ? x.trim().slice(0, MAX_TEKS_BLOK) : ""))
        .filter(Boolean)
        .slice(0, MAX_ITEM_BLOK);
    }

    if (typeof b.varian === "string" && b.varian.trim()) {
      clean.varian = b.varian.trim().slice(0, 50);
    }

    if (tipe === "spacer") {
      const t = b.tinggi;
      clean.tinggi = t === "kecil" || t === "besar" ? t : "sedang";
    }

    result.push(clean);
    if (result.length >= MAX_BLOK) break;
  }

  return result;
}

export function validateHalaman(input: Record<string, unknown>): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const str = (k: string) => String(input[k] ?? "").trim();

  const judul = str("judul");
  if (judul.length < 3) errors.push("Judul halaman minimal 3 karakter.");
  if (judul.length > 160) errors.push("Judul halaman maksimal 160 karakter.");
  if (/[<>]/.test(judul)) errors.push("Judul tidak boleh mengandung karakter < atau >.");

  const navLabel = str("navLabel");
  if (navLabel.length > 160) errors.push("Label menu maksimal 160 karakter.");
  if (/[<>]/.test(navLabel)) errors.push("Label menu tidak boleh mengandung karakter < atau >.");

  const heroTitle = str("heroTitle");
  if (heroTitle.length > 200) errors.push("Judul hero maksimal 200 karakter.");
  if (/[<>]/.test(heroTitle)) errors.push("Judul hero tidak boleh mengandung karakter < atau >.");

  const heroDescription = str("heroDescription");
  if (heroDescription.length > 400) errors.push("Deskripsi hero maksimal 400 karakter.");
  if (/[<>]/.test(heroDescription)) errors.push("Deskripsi hero tidak boleh mengandung karakter < atau >.");

  const metaTitle = str("metaTitle");
  if (metaTitle.length > 70) errors.push("Meta title maksimal 70 karakter.");
  if (/[<>]/.test(metaTitle)) errors.push("Meta title tidak boleh mengandung karakter < atau >.");

  const metaDescription = str("metaDescription");
  if (metaDescription.length > 160) errors.push("Meta description maksimal 160 karakter.");
  if (/[<>]/.test(metaDescription)) errors.push("Meta description tidak boleh mengandung karakter < atau >.");

  if (input.urutan !== undefined) {
    const urutan = Number(input.urutan);
    if (!Number.isFinite(urutan) || urutan < 0 || urutan > 9999) {
      errors.push("Urutan harus berupa angka 0–9999.");
    }
  }

  const rawBlok = input.blok;
  if (rawBlok !== undefined && !Array.isArray(rawBlok)) {
    errors.push("Blok konten harus berupa array.");
  } else if (Array.isArray(rawBlok)) {
    if (rawBlok.length > MAX_BLOK) {
      errors.push(`Jumlah blok maksimal ${MAX_BLOK}.`);
    }

    for (let i = 0; i < rawBlok.length; i++) {
      const b = rawBlok[i];
      if (!b || typeof b !== "object") {
        errors.push(`Blok #${i + 1} tidak valid.`);
        continue;
      }
      const bObj = b as Record<string, unknown>;
      const tipe = String(bObj.tipe ?? "");
      if (!VALID_BLOK_TIPES.has(tipe as BlokTipe)) {
        errors.push(`Tipe blok "${tipe}" pada blok #${i + 1} tidak dikenal.`);
        continue;
      }

      // Validasi XSS: tolak < dan > pada field teks blok
      const teksFields: (string | undefined)[] = [
        typeof bObj.teks === "string" ? bObj.teks : undefined,
        typeof bObj.alt === "string" ? bObj.alt : undefined,
        typeof bObj.caption === "string" ? bObj.caption : undefined,
      ];
      if (Array.isArray(bObj.items)) {
        for (const it of bObj.items) {
          if (typeof it === "string") teksFields.push(it);
        }
      }

      for (const t of teksFields) {
        if (t && /[<>]/.test(t)) {
          errors.push(`Teks pada blok #${i + 1} (${BLOK_LABEL[tipe as BlokTipe] ?? tipe}) tidak boleh mengandung karakter < atau >.`);
          break;
        }
      }

      // Validasi href tombol: hanya /... atau https://...
      if (tipe === "tombol") {
        const href = String(bObj.href ?? "").trim();
        if (href && !href.startsWith("/") && !href.startsWith("https://")) {
          errors.push(`Tautan tombol pada blok #${i + 1} harus diawali "/" atau "https://".`);
        }
      }

      // Validasi video URL: host youtube atau vimeo
      if (tipe === "video") {
        const src = String(bObj.src ?? "").trim();
        if (src) {
          const isValidVideo =
            /^https:\/\/(www\.)?(youtube\.com|youtu\.be|player\.vimeo\.com|vimeo\.com)\//.test(src);
          if (!isValidVideo) {
            errors.push(`Video pada blok #${i + 1} hanya mendukung tautan dari YouTube atau Vimeo.`);
          }
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

export function normalizeHalamanInput(
  input: Record<string, unknown>,
  existing?: Partial<HalamanDoc>,
): Omit<HalamanDoc, "id" | "createdAt" | "updatedAt"> {
  const judul = String(input.judul ?? existing?.judul ?? "").trim();
  const navLabelRaw = String(input.navLabel ?? existing?.navLabel ?? "").trim();
  const navLabel = navLabelRaw || judul;

  const rawSlug = String(input.slug ?? existing?.slug ?? "").trim();
  // Judul yang belum punya alamat diturunkan dari judul. Kekecualian: alamat
  // kosong yang memang dikirim/dimiliki beranda ("" = halaman depan) dipertahankan.
  const beranda = rawSlug === "" && (input.slug !== undefined || (existing?.slug === "" && existing?.systemPath === "/"));
  const slug = beranda ? "" : slugifyHalaman(rawSlug || judul);

  const groupKeyRaw = input.groupKey !== undefined ? input.groupKey : existing?.groupKey;
  const groupKey = typeof groupKeyRaw === "string" && groupKeyRaw.trim() ? groupKeyRaw.trim() : null;

  const urutanRaw = Number(input.urutan ?? existing?.urutan ?? 0);
  const urutan = Number.isFinite(urutanRaw) && urutanRaw >= 0 ? Math.min(Math.trunc(urutanRaw), 9999) : 0;

  const showInNav = input.showInNav !== undefined ? Boolean(input.showInNav) : (existing?.showInNav ?? true);
  const collapsible = input.collapsible !== undefined ? Boolean(input.collapsible) : (existing?.collapsible ?? false);
  const published = input.published !== undefined ? Boolean(input.published) : (existing?.published ?? true);

  const systemPathRaw = input.systemPath !== undefined ? input.systemPath : existing?.systemPath;
  const systemPath = typeof systemPathRaw === "string" && systemPathRaw.trim() ? systemPathRaw.trim() : null;

  const heroTitle = String(input.heroTitle ?? existing?.heroTitle ?? "").trim();
  const heroDescription = String(input.heroDescription ?? existing?.heroDescription ?? "").trim();

  const blokRaw = input.blok !== undefined ? input.blok : existing?.blok;
  const blok = sanitizeBlok(blokRaw);

  const metaTitle = String(input.metaTitle ?? existing?.metaTitle ?? "").trim();
  const metaDescription = String(input.metaDescription ?? existing?.metaDescription ?? "").trim();

  const riwayatRaw = Array.isArray(existing?.riwayat) ? existing!.riwayat! : [];

  return {
    slug,
    judul,
    navLabel,
    groupKey,
    urutan,
    showInNav,
    collapsible,
    published,
    systemPath,
    heroTitle,
    heroDescription,
    blok,
    metaTitle,
    metaDescription,
    riwayat: riwayatRaw,
  };
}
