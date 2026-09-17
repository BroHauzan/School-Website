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
  // Preview fields
  draftBlocks?: Blok[] | null;        // snapshot draft yang belum dipublish
  draftUpdatedAt?: string | null;     // kapan draft terakhir disimpan di server
  previewToken?: string | null;       // token akses preview yang masih berlaku
  previewTokenExpiresAt?: string | null; // batas waktu token
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
      return { id, tipe: "tombol", teks: "", href: "", varian: "primary" };
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

/**
 * Buang karakter angle bracket dari teks bebas supaya tidak bisa dipakai
 * menyusun markup. Renderer memang meng-escape teks, ini lapisan tambahan
 * untuk data mentah yang masuk lewat API.
 */
export function bersihkanTeks(input: string): string {
  return input.replace(/[<>]/g, "");
}

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

    // Hanya simpan field yang relevan per tipe — field tak relevan dibuang
    // supaya tidak jadi sampah dan tidak memicu error XSS palsu.
    switch (tipe) {
      case "paragraf":
      case "kutipan":
        if (typeof b.teks === "string") {
          clean.teks = bersihkanTeks(b.teks.slice(0, MAX_TEKS_BLOK));
        }
        break;
      case "heading":
        if (typeof b.teks === "string") {
          clean.teks = bersihkanTeks(b.teks.slice(0, MAX_TEKS_BLOK));
        }
        {
          const lvl = Number(b.level);
          clean.level = lvl === 3 || lvl === 4 ? lvl : 2;
        }
        break;
      case "gambar":
        if (typeof b.src === "string") {
          clean.src = b.src.trim().slice(0, 2048);
        }
        if (typeof b.alt === "string") {
          clean.alt = bersihkanTeks(b.alt.trim().slice(0, 300));
        }
        if (typeof b.caption === "string") {
          clean.caption = bersihkanTeks(b.caption.trim().slice(0, 500));
        }
        if (typeof b.varian === "string" && b.varian.trim()) {
          clean.varian = b.varian.trim().slice(0, 50);
        }
        break;
      case "galeri":
        if (Array.isArray(b.items)) {
          clean.items = b.items
            .map((x) => (typeof x === "string" ? x.trim().slice(0, 2048) : ""))
            .filter(Boolean)
            .slice(0, MAX_ITEM_BLOK);
        }
        if (typeof b.varian === "string" && b.varian.trim()) {
          clean.varian = b.varian.trim().slice(0, 50);
        }
        break;
      case "tombol":
        if (typeof b.teks === "string") {
          clean.teks = bersihkanTeks(b.teks.slice(0, MAX_TEKS_BLOK));
        }
        if (typeof b.href === "string") {
          // Hanya tautan internal ("/...", bukan "//...") atau https:// yang
          // diterima; skema berbahaya (javascript:, data:, vbscript:) dibuang
          // agar tidak pernah menjadi atribut href di halaman publik.
          const href = b.href.trim().slice(0, 2048);
          if ((href.startsWith("/") && !href.startsWith("//")) || /^https:\/\//i.test(href)) {
            clean.href = href;
          }
        }
        if (typeof b.varian === "string" && b.varian.trim()) {
          clean.varian = b.varian.trim().slice(0, 50);
        }
        break;
      case "video":
        if (typeof b.src === "string") {
          clean.src = b.src.trim().slice(0, 2048);
        }
        if (typeof b.caption === "string") {
          clean.caption = bersihkanTeks(b.caption.trim().slice(0, 500));
        }
        break;
      case "spacer": {
        const t = b.tinggi;
        clean.tinggi = t === "kecil" || t === "besar" ? t : "sedang";
        break;
      }
      case "divider":
        break;
      case "daftar":
        if (Array.isArray(b.items)) {
          clean.items = b.items
            .map((x) => (typeof x === "string" ? bersihkanTeks(x.trim().slice(0, MAX_TEKS_BLOK)) : ""))
            .filter(Boolean)
            .slice(0, MAX_ITEM_BLOK);
        }
        break;
    }

    result.push(clean);
    if (result.length >= MAX_BLOK) break;
  }

  return result;
}

/**
 * URL video yang diterima — selaras dengan `keEmbedVideo` di renderer:
 * youtube.com (www./m.) watch/embed/shorts/live, youtu.be, youtube-nocookie
 * embed, vimeo.com/<angka>, player.vimeo.com/video/.
 */
export const VIDEO_URL_RE =
  /^https:\/\/(?:(?:www\.|m\.)?youtube\.com\/(?:watch(?:[?/#]|$)|embed\/|shorts\/|live\/)|(?:www\.)?youtu\.be\/|(?:www\.)?youtube-nocookie\.com\/embed\/|vimeo\.com\/\d+(?:[/?#]|$)|player\.vimeo\.com\/video\/)/;

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

      // Validasi XSS: hanya field yang relevan per tipe yang dicek, supaya
      // field tak terrender (mis. alt pada divider) tidak memicu error palsu.
      const labelBlok = BLOK_LABEL[tipe as BlokTipe] ?? tipe;
      const nomorBlok = `#${i + 1}`;
      const teksRelevan: (string | undefined)[] = [];
      if (tipe === "paragraf" || tipe === "heading" || tipe === "kutipan" || tipe === "tombol") {
        if (typeof bObj.teks === "string") teksRelevan.push(bObj.teks);
      }
      if (tipe === "gambar") {
        if (typeof bObj.alt === "string") teksRelevan.push(bObj.alt);
        if (typeof bObj.caption === "string") teksRelevan.push(bObj.caption);
      }
      if (tipe === "video") {
        if (typeof bObj.caption === "string") teksRelevan.push(bObj.caption);
      }
      if (tipe === "daftar" && Array.isArray(bObj.items)) {
        for (const it of bObj.items) {
          if (typeof it === "string") teksRelevan.push(it);
        }
      }

      for (const t of teksRelevan) {
        if (t && /[<>]/.test(t)) {
          errors.push(`Teks pada blok ${nomorBlok} (${labelBlok}) tidak boleh mengandung karakter < atau >.`);
          break;
        }
      }

      // Validasi panjang: pesan selalu memuat nomor blok.
      const teksPanjang = typeof bObj.teks === "string" ? bObj.teks : "";
      if (
        (tipe === "paragraf" || tipe === "heading" || tipe === "kutipan" || tipe === "tombol") &&
        teksPanjang.length > MAX_TEKS_BLOK
      ) {
        errors.push(`Tulisan pada blok ${nomorBlok} (${labelBlok}) terlalu panjang (maksimal ${MAX_TEKS_BLOK} karakter).`);
      }
      if (tipe === "gambar" && typeof bObj.alt === "string" && bObj.alt.length > 300) {
        errors.push(`Teks alternatif gambar pada blok ${nomorBlok} terlalu panjang (maksimal 300 karakter).`);
      }
      if (
        (tipe === "gambar" || tipe === "video") &&
        typeof bObj.caption === "string" &&
        bObj.caption.length > 500
      ) {
        errors.push(`Keterangan pada blok ${nomorBlok} (${labelBlok}) terlalu panjang (maksimal 500 karakter).`);
      }
      if (
        (tipe === "gambar" || tipe === "video") &&
        typeof bObj.src === "string" &&
        bObj.src.trim().length > 2048
      ) {
        errors.push(`Alamat sumber pada blok ${nomorBlok} (${labelBlok}) terlalu panjang (maksimal 2048 karakter).`);
      }
      if (tipe === "tombol" && typeof bObj.href === "string" && bObj.href.trim().length > 2048) {
        errors.push(`Tautan tombol pada blok ${nomorBlok} terlalu panjang (maksimal 2048 karakter).`);
      }
      if (
        (tipe === "galeri" || tipe === "daftar") &&
        Array.isArray(bObj.items) &&
        bObj.items.length > MAX_ITEM_BLOK
      ) {
        errors.push(`Jumlah item pada blok ${nomorBlok} (${labelBlok}) terlalu panjang (maksimal ${MAX_ITEM_BLOK} item).`);
      }
      if (tipe === "daftar" && Array.isArray(bObj.items)) {
        for (const it of bObj.items) {
          if (typeof it === "string" && it.length > MAX_TEKS_BLOK) {
            errors.push(`Salah satu poin pada blok ${nomorBlok} terlalu panjang (maksimal ${MAX_TEKS_BLOK} karakter).`);
            break;
          }
        }
      }
      if (tipe === "galeri" && Array.isArray(bObj.items)) {
        for (const it of bObj.items) {
          if (typeof it === "string" && it.trim().length > 2048) {
            errors.push(`Salah satu alamat foto pada blok ${nomorBlok} terlalu panjang (maksimal 2048 karakter).`);
            break;
          }
        }
      }

      // Validasi level heading, tinggi spacer, dan varian.
      if (tipe === "heading" && bObj.level !== undefined) {
        const lvl = Number(bObj.level);
        if (lvl !== 2 && lvl !== 3 && lvl !== 4) {
          errors.push(`Ukuran judul pada blok ${nomorBlok} harus 2, 3, atau 4.`);
        }
      }
      if (tipe === "spacer" && bObj.tinggi !== undefined) {
        if (bObj.tinggi !== "kecil" && bObj.tinggi !== "sedang" && bObj.tinggi !== "besar") {
          errors.push(`Tinggi jarak pada blok ${nomorBlok} harus kecil, sedang, atau besar.`);
        }
      }
      if (tipe === "gambar" && typeof bObj.varian === "string" && bObj.varian.trim()) {
        const v = bObj.varian.trim();
        if (v !== "normal" && v !== "wide" && v !== "full") {
          errors.push(`Varian gambar pada blok ${nomorBlok} harus normal, wide, atau full.`);
        }
      }
      if (tipe === "galeri" && typeof bObj.varian === "string" && bObj.varian.trim()) {
        const v = bObj.varian.trim();
        if (v !== "grid3" && v !== "grid2" && v !== "carousel") {
          errors.push(`Varian galeri pada blok ${nomorBlok} harus grid3, grid2, atau carousel.`);
        }
      }
      if (tipe === "tombol" && typeof bObj.varian === "string" && bObj.varian.trim()) {
        const v = bObj.varian.trim();
        if (v !== "primary" && v !== "outline" && v !== "soft") {
          errors.push(`Varian tombol pada blok ${nomorBlok} harus primary, outline, atau soft.`);
        }
      }

      // Validasi href tombol: hanya /... atau https://...
      if (tipe === "tombol") {
        const href = String(bObj.href ?? "").trim();
        const teksTombol = String(bObj.teks ?? "").trim();
        if (!teksTombol) {
          errors.push(`Tulisan tombol pada blok #${i + 1} wajib diisi.`);
        }
        if (!href) {
          errors.push(`Tujuan tautan tombol pada blok #${i + 1} wajib diisi (contoh: /ppdb atau https://…).`);
        } else if ((href.startsWith("/") && !href.startsWith("//")) || /^https:\/\//i.test(href)) {
          // valid — sama dengan sanitizeBlok & renderer
        } else {
          errors.push(`Tautan tombol pada blok #${i + 1} harus diawali "/" atau "https://".`);
        }
      }

      // Blok teks kosong lolos publish lalu hilang diam-diam di renderer —
      // tolak sejak validasi supaya admin tahu bloknya tidak akan tampil.
      if ((tipe === "paragraf" || tipe === "heading" || tipe === "kutipan") && !String(bObj.teks ?? "").trim()) {
        errors.push(`${BLOK_LABEL[tipe as BlokTipe] ?? tipe} pada blok #${i + 1} masih kosong. Isi tulisannya atau hapus bloknya.`);
      }
      if (tipe === "daftar") {
        const isiDaftar = Array.isArray(bObj.items)
          ? (bObj.items as unknown[]).filter((x) => typeof x === "string" && x.trim())
          : [];
        if (isiDaftar.length === 0) {
          errors.push(`Daftar pada blok #${i + 1} masih kosong. Tambahkan minimal 1 poin atau hapus bloknya.`);
        }
      }

      // Blok gambar tanpa sumber tidak ada gunanya dirender — tolak sejak validasi.
      // Aturannya longgar soal host karena skema klien boleh bebas host,
      // tapi `validateBlokSumber()` di server tetap mengunci ke host allowlist.
      if (tipe === "gambar" && !String(bObj.src ?? "").trim()) {
        errors.push(`Gambar pada blok #${i + 1} belum punya sumber. Unggah gambar atau hapus bloknya.`);
      }
      if (tipe === "galeri") {
        const itemsGaleri = Array.isArray(bObj.items)
          ? (bObj.items as unknown[]).filter((x) => typeof x === "string" && x.trim())
          : [];
        if (itemsGaleri.length === 0) {
          errors.push(`Galeri pada blok #${i + 1} belum punya foto. Tambahkan foto atau hapus bloknya.`);
        }
      }

      // Validasi video URL: selaras dengan keEmbedVideo di renderer.
      if (tipe === "video") {
        const src = String(bObj.src ?? "").trim();
        if (!src) {
          errors.push(`Video pada blok #${i + 1} belum punya alamat. Tempel tautan YouTube/Vimeo atau hapus bloknya.`);
        } else {
          const isValidVideo = VIDEO_URL_RE.test(src);
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
  // Halaman bawaan: alamatnya terikat `systemPath` dan TIDAK boleh berubah
  // (menu & tautan lain menunjuk ke sana) — nilai lama menang atas input.
  const isSystemDoc = typeof existing?.systemPath === "string" && existing.systemPath !== "";
  const slug = isSystemDoc ? String(existing!.slug ?? "") : beranda ? "" : slugifyHalaman(rawSlug || judul);

  const groupKeyRaw = input.groupKey !== undefined ? input.groupKey : existing?.groupKey;
  const groupKey = typeof groupKeyRaw === "string" && groupKeyRaw.trim() ? groupKeyRaw.trim() : null;

  const urutanRaw = Number(input.urutan ?? existing?.urutan ?? 0);
  const urutan = Number.isFinite(urutanRaw) && urutanRaw >= 0 ? Math.min(Math.trunc(urutanRaw), 9999) : 0;

  const showInNav = input.showInNav !== undefined ? Boolean(input.showInNav) : (existing?.showInNav ?? true);
  const collapsible = input.collapsible !== undefined ? Boolean(input.collapsible) : (existing?.collapsible ?? false);
  const published = input.published !== undefined ? Boolean(input.published) : (existing?.published ?? true);

  // `systemPath` read-only setelah dokumen dibuat (PLAN §2): nilai lama menang.
  const systemPathRaw = isSystemDoc ? existing!.systemPath : input.systemPath;
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
