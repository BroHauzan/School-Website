import "server-only";
import { randomBytes } from "crypto";
import { type DocumentSnapshot, type Query } from "firebase-admin/firestore";
import { getAdminDb, adminConfigured } from "./firebase-admin";
import {
  HALAMAN_COLLECTION,
  MAX_RIWAYAT,
  VIDEO_URL_RE,
  normalizeHalamanInput,
  sanitizeBlok,
  validateHalaman,
  BLOK_LABEL,
  type Blok,
  type BlokTipe,
  type HalamanDoc,
  type HalamanVersi,
  type NavGroupsDoc,
} from "./halaman-schema";
import { MANAGED_SYSTEM_PAGES, isReservedSlug, systemPageBySlug } from "./page-registry";
import { getNavGroups } from "./nav-groups-server";
import {
  alamatPublik,
  dampakMenu,
  halamanYangMenaut,
  type PeringatanHalaman,
} from "./dampak-navigasi";
import { isValidImageUrl } from "./image-url";
import { clampStr, fallbackStr } from "./sanitize";

export { HALAMAN_COLLECTION, type HalamanDoc };

/**
 * Sumber data SATU-SATUNYA untuk halaman builder + tambahan konten halaman
 * bawaan (koleksi Firestore `halaman`). Halaman bawaan tanpa dokumen tetap
 * tampil dari registry (`lib/page-registry.ts`) — koleksi ini hanya lapisan
 * konten yang bisa diedit admin, bukan sumber daftar rute.
 */

const MAX_LIST = 300;

/** Judul & deskripsi hero bawaan tiap halaman sistem — seed tidak boleh mengubah desain. */
const HERO_SEED: Record<string, { title: string; description: string }> = {
  beranda: { title: "", description: "" },
  sejarah: {
    title: "Jejak Panjang",
    description: "Perjalanan SMAN 1 Lumajang dalam membentuk generasi unggul sejak awal berdiri.",
  },
  "visi-misi": {
    title: "Visi & Misi",
    description: "Landasan pendidikan yang membentuk karakter unggul dan berwawasan global.",
  },
  struktur: {
    title: "Struktur Organisasi",
    description: "Kepemimpinan dan organisasi sekolah yang jelas dan terstruktur.",
  },
  alumni: { title: "Alumni", description: "Jejak lulusan SMAN 1 Lumajang sejak 1960." },
  "komite-sekolah": {
    title: "Komite Sekolah",
    description: "Kemitraan orang tua dan masyarakat dalam mendukung pendidikan.",
  },
  "kalender-pendidikan": {
    title: "Kalender Pendidikan",
    description: "Jadwal kegiatan akademik dan non-akademik sepanjang tahun ajaran.",
  },
  "jurnal-absensi": {
    title: "Jurnal & Absensi",
    description: "Sistem pencatatan jurnal pembelajaran dan absensi siswa SMAN 1 Lumajang.",
  },
  "data-lulusan": {
    title: "Data Lulusan",
    description: "Statistik dan informasi lulusan SMAN 1 Lumajang.",
  },
  "snbp-snbt": {
    title: "SNBP & SNBT",
    description: "Data siswa SMAN 1 Lumajang yang diterima di perguruan tinggi negeri.",
  },
  bk: { title: "Bimbingan Konseling", description: "Layanan pendampingan siswa SMAN 1 Lumajang." },
  berita: {
    title: "Kabar Terkini",
    description:
      "Aktivitas, capaian, dan pengumuman terbaru dari lingkungan SMA Negeri 1 Lumajang — klik untuk membaca selengkapnya.",
  },
  prestasi: {
    title: "Pencapaian Nyata",
    description:
      "Kumpulan prestasi siswa SMAN 1 Lumajang — dari tingkat kabupaten hingga internasional, dikelola dan diverifikasi pihak sekolah.",
  },
  fasilitas: {
    title: "Fasilitas SMAN 1 Lumajang",
    description:
      "Dari laboratorium hingga lapangan olahraga — tur singkat 21 fasilitas kampus SMAN 1 Lumajang.",
  },
  eskul: { title: "Ekstrakurikuler", description: "Daftar ekstrakurikuler SMAN 1 Lumajang." },
  ppdb: { title: "PPDB", description: "Jalur masuk Penerimaan Peserta Didik Baru SMAN 1 Lumajang." },
};

/** Buang blok yang sumbernya tidak lolos allowlist host (defensif untuk snapToDoc). */
function buangBlokTidakValid(blok: Blok[]): Blok[] {
  return blok
    .map((b) => {
      if (b.tipe === "galeri") {
        // Simpan foto yang valid saja — satu URL buruk tidak membuang seluruh galeri.
        const baik = (b.items ?? []).filter((s) => isValidImageUrl(s));
        return baik.length > 0 ? { ...b, items: baik } : null;
      }
      if (b.tipe === "gambar") return Boolean(b.src) && isValidImageUrl(b.src!) ? b : null;
      if (b.tipe === "video") return Boolean(b.src) && VIDEO_URL_RE.test(b.src!) ? b : null;
      return b;
    })
    .filter((b): b is Blok => b !== null);
}

/** Validasi sumber gambar/video blok di jalur API (schema dipakai klien, jadi bebas host). */
function validateBlokSumber(blok: Blok[]): string | null {
  for (let i = 0; i < blok.length; i++) {
    const b = blok[i];
    const label = BLOK_LABEL[b.tipe as BlokTipe] ?? b.tipe;
    const nomor = `blok #${i + 1} (${label})`;
    if (b.tipe === "gambar" && b.src && !isValidImageUrl(b.src)) {
      return `URL gambar pada ${nomor} tidak diizinkan. Gunakan hasil upload atau path lokal.`;
    }
    if (b.tipe === "galeri") {
      for (const src of b.items ?? []) {
        if (!isValidImageUrl(src)) {
          return `URL gambar pada galeri ${nomor} tidak diizinkan. Gunakan hasil upload atau path lokal.`;
        }
      }
    }
    if (b.tipe === "video" && b.src && !VIDEO_URL_RE.test(b.src)) {
      return `Video pada ${nomor} hanya bisa disematkan dari YouTube atau Vimeo.`;
    }
  }
  return null;
}

function snapToVersi(raw: unknown): HalamanVersi[] {
  if (!Array.isArray(raw)) return [];
  const out: HalamanVersi[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const v = entry as Record<string, unknown>;
    const savedAt = String(v.savedAt ?? "").trim();
    if (!savedAt) continue;
    out.push({
      savedAt,
      judul: fallbackStr(clampStr(String(v.judul ?? "").trim(), 160), "Tanpa judul"),
      blok: buangBlokTidakValid(sanitizeBlok(v.blok)),
      metaTitle: clampStr(String(v.metaTitle ?? "").trim(), 70),
      metaDescription: clampStr(String(v.metaDescription ?? "").trim(), 160),
    });
    if (out.length >= MAX_RIWAYAT) break;
  }
  return out;
}

function snapToDoc(snap: DocumentSnapshot): HalamanDoc {
  const d = snap.data() as Record<string, unknown>;
  const norm = normalizeHalamanInput(d, undefined);
  // Defensive: dokumen bisa masuk via console/migrasi tanpa validasi API.
  norm.judul = fallbackStr(clampStr(norm.judul, 160), "Tanpa judul");
  norm.navLabel = fallbackStr(clampStr(norm.navLabel, 160), norm.judul);
  norm.slug = clampStr(norm.slug, 80);
  norm.heroTitle = clampStr(norm.heroTitle, 200);
  norm.heroDescription = clampStr(norm.heroDescription, 400);
  norm.metaTitle = clampStr(norm.metaTitle, 70);
  norm.metaDescription = clampStr(norm.metaDescription, 160);
  norm.blok = buangBlokTidakValid(norm.blok);
  // Dokumen lama bisa belum punya systemPath: pulihkan dari registry.
  if (norm.systemPath === null) {
    const def = systemPageBySlug(norm.slug);
    if (def) norm.systemPath = def.path;
  }
  return {
    id: snap.id,
    ...norm,
    riwayat: snapToVersi(d.riwayat),
    createdAt: String(d.createdAt ?? new Date().toISOString()),
    updatedAt: String(d.updatedAt ?? new Date().toISOString()),
  };
}

function versiDari(doc: HalamanDoc, savedAt: string): HalamanVersi {
  return {
    savedAt,
    judul: doc.judul,
    blok: doc.blok,
    metaTitle: doc.metaTitle,
    metaDescription: doc.metaDescription,
  };
}

/** Terbaru di depan, tanpa duplikat `savedAt`, maksimum `MAX_RIWAYAT`. */
function pushVersi(riwayat: HalamanVersi[], versi: HalamanVersi): HalamanVersi[] {
  return [versi, ...riwayat.filter((v) => v.savedAt !== versi.savedAt)].slice(0, MAX_RIWAYAT);
}

/** `published == true` + `orderBy urutan` butuh composite index (firestore.indexes.json). */
function needsIndexError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /FAILED_PRECONDITION|requires an index/i.test(msg);
}

function randomSlugSuffix(): string {
  return (Math.random().toString(36).slice(2, 6) || "x1y2").toLowerCase();
}

/**
 * `updatedAt` wajib naik monotonik per dokumen: `expectedUpdatedAt` dipakai
 * sebagai kunci optimistic lock dan `savedAt` riwayat sebagai kunci versi, dua
 * penyimpanan berturut-turut dalam milidetik yang sama tidak boleh menghasilkan
 * nilai identik (bentrok tak terdeteksi & versi saling menimpa).
 */
function nextIso(prevIso?: string): string {
  const now = Date.now();
  const prev = prevIso ? Date.parse(prevIso) : Number.NaN;
  return new Date(Number.isFinite(prev) && now <= prev ? prev + 1 : now).toISOString();
}

/** Alamat halaman builder: wajib unik, tidak boleh menabrak rute bawaan. */
function cekAlamat(slug: string, systemPath: string | null): void {
  if (systemPath !== null) return; // halaman bawaan: alamat dikunci registry
  if (slug.length < 2) {
    throw Object.assign(new Error("Alamat halaman minimal 2 karakter."), { status: 400 });
  }
  if (isReservedSlug(slug)) {
    throw Object.assign(
      new Error(`Alamat “${slug}” sudah dipakai halaman bawaan website. Ubah judul atau alamat halaman.`),
      { status: 400 },
    );
  }
}

export async function listHalaman(opts?: { includeDraft?: boolean }): Promise<HalamanDoc[]> {
  if (!adminConfigured()) return [];
  const publishedOnly = !opts?.includeDraft;
  const db = getAdminDb();
  try {
    let q: Query = db.collection(HALAMAN_COLLECTION).orderBy("urutan", "asc");
    if (publishedOnly) q = q.where("published", "==", true);
    const snap = await q.limit(MAX_LIST).get();
    return snap.docs.map(snapToDoc);
  } catch (err) {
    if (!needsIndexError(err)) {
      console.error("[halaman] listHalaman gagal:", err);
      return [];
    }
    // Composite index belum dibuat di project ini: ambil tanpa orderBy lalu
    // urutkan di memori. Deploy firestore.indexes.json supaya jalur ini tidak terpakai.
    console.warn("[halaman] composite index missing — using slow in-memory fallback. Deploy firestore.indexes.json.");
    try {
      let q2: Query = db.collection(HALAMAN_COLLECTION);
      if (publishedOnly) q2 = q2.where("published", "==", true);
      const snap2 = await q2.limit(500).get();
      return snap2.docs.map(snapToDoc).sort((a, b) => a.urutan - b.urutan).slice(0, MAX_LIST);
    } catch (err2) {
      console.error("[halaman] listHalaman gagal:", err2);
      return [];
    }
  }
}

export async function getHalamanById(id: string): Promise<HalamanDoc | null> {
  if (!adminConfigured()) return null;
  try {
    const doc = await getAdminDb().collection(HALAMAN_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return snapToDoc(doc);
  } catch (err) {
    console.error("[halaman] getHalamanById gagal:", err);
    return null;
  }
}

export async function getHalamanBySlug(slug: string): Promise<HalamanDoc | null> {
  if (!adminConfigured()) return null;
  try {
    const snap = await getAdminDb()
      .collection(HALAMAN_COLLECTION)
      .where("slug", "==", slug.trim())
      .limit(1)
      .get();
    if (snap.empty) return null;
    return snapToDoc(snap.docs[0]!);
  } catch (err) {
    console.error("[halaman] getHalamanBySlug gagal:", err);
    return null;
  }
}

/**
 * Ambil dokumen dari path publiknya: `/`, `/visi-misi` (halaman bawaan lewat
 * `systemPath`), atau `/halaman/slug` (halaman builder).
 */
export async function getHalamanByPath(path: string): Promise<HalamanDoc | null> {
  if (!adminConfigured()) return null;
  const clean = path.trim() || "/";
  const normalized = clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
  if (normalized.startsWith("/halaman/")) {
    return getHalamanBySlug(normalized.slice("/halaman/".length));
  }
  try {
    const snap = await getAdminDb()
      .collection(HALAMAN_COLLECTION)
      .where("systemPath", "==", normalized)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return snapToDoc(snap.docs[0]!);
  } catch (err) {
    console.error("[halaman] getHalamanByPath gagal:", err);
    return null;
  }
}

export async function createHalaman(input: Record<string, unknown>): Promise<HalamanDoc> {
  const check = validateHalaman(input);
  if (!check.ok) throw Object.assign(new Error(check.errors.join(" ")), { status: 400 });

  // Halaman baru dari admin selalu halaman builder: `systemPath` hanya diisi
  // oleh seedSystemPages(), jadi nilainya dari body request diabaikan.
  const norm = normalizeHalamanInput({ ...input, systemPath: null });
  cekAlamat(norm.slug, null);
  const blokError = validateBlokSumber(norm.blok);
  if (blokError) throw Object.assign(new Error(blokError), { status: 400 });

  const db = getAdminDb();
  const now = nextIso();
  const docRef = db.collection(HALAMAN_COLLECTION).doc();
  let finalSlug = norm.slug;
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(
      db.collection(HALAMAN_COLLECTION).where("slug", "==", finalSlug).limit(1),
    );
    if (!snap.empty) {
      finalSlug = `${finalSlug}-${randomSlugSuffix()}`;
      const retry = await tx.get(
        db.collection(HALAMAN_COLLECTION).where("slug", "==", finalSlug).limit(1),
      );
      if (!retry.empty) {
        throw Object.assign(new Error("Alamat halaman sudah dipakai, coba judul berbeda."), { status: 409 });
      }
    }
    tx.set(docRef, { ...norm, slug: finalSlug, createdAt: now, updatedAt: now });
  });
  return { id: docRef.id, ...norm, slug: finalSlug, createdAt: now, updatedAt: now };
}

export async function updateHalaman(id: string, input: Record<string, unknown>): Promise<HalamanDoc> {
  const prev = await getHalamanById(id);
  if (!prev) throw Object.assign(new Error("Halaman tidak ditemukan."), { status: 404 });

  const clientUpdatedAt = typeof input.expectedUpdatedAt === "string" ? input.expectedUpdatedAt : undefined;
  const merged: Record<string, unknown> = { ...prev, ...input };
  // `systemPath` read-only setelah dokumen dibuat; alamat halaman bawaan ikut terkunci.
  merged.systemPath = prev.systemPath;
  const check = validateHalaman(merged);
  if (!check.ok) throw Object.assign(new Error(check.errors.join(" ")), { status: 400 });

  const norm = normalizeHalamanInput(merged, prev);
  if (prev.systemPath !== null) norm.slug = prev.slug;
  cekAlamat(norm.slug, prev.systemPath);
  const blokError = validateBlokSumber(norm.blok);
  if (blokError) throw Object.assign(new Error(blokError), { status: 400 });

  const db = getAdminDb();
  const docRef = db.collection(HALAMAN_COLLECTION).doc(id);
  const now = nextIso(prev.updatedAt);
  let finalSlug = norm.slug;
  // Snapshot keadaan SEBELUM perubahan, supaya bisa dipulihkan dari Riwayat.
  let riwayat = pushVersi(prev.riwayat, versiDari(prev, prev.updatedAt));

  await db.runTransaction(async (tx) => {
    const storedSnap = await tx.get(docRef);
    if (!storedSnap.exists) {
      throw Object.assign(new Error("Halaman tidak ditemukan."), { status: 404 });
    }
    const stored = storedSnap.data() as Record<string, unknown>;
    if (clientUpdatedAt && String(stored.updatedAt ?? "") !== clientUpdatedAt) {
      throw Object.assign(new Error("Halaman sudah diubah pihak lain, muat ulang dulu."), { status: 409 });
    }
    // Riwayat dihitung ulang dari dokumen terbaru agar versi tidak hilang saat bentrok.
    riwayat = pushVersi(
      snapToVersi(stored.riwayat),
      versiDari(prev, String(stored.updatedAt ?? prev.updatedAt)),
    );

    if (prev.systemPath === null && finalSlug !== prev.slug) {
      const snap = await tx.get(
        db.collection(HALAMAN_COLLECTION).where("slug", "==", finalSlug).limit(2),
      );
      if (!snap.empty && snap.docs.some((d) => d.id !== id)) {
        finalSlug = `${finalSlug}-${randomSlugSuffix()}`;
        const retry = await tx.get(
          db.collection(HALAMAN_COLLECTION).where("slug", "==", finalSlug).limit(1),
        );
        if (!retry.empty) {
          throw Object.assign(new Error("Alamat halaman sudah dipakai, coba judul berbeda."), { status: 409 });
        }
      }
    }

    tx.set(
      docRef,
      { ...norm, slug: finalSlug, riwayat, createdAt: prev.createdAt, updatedAt: now },
      { merge: true },
    );
  });

  return { id, ...norm, slug: finalSlug, riwayat, createdAt: prev.createdAt, updatedAt: now };
}

/**
 * Halaman builder dihapus permanen. Halaman bawaan tidak boleh hilang dari
 * website (alamatnya dipakai menu & tautan lain): yang dikosongkan hanya isi
 * tambahannya, dan keadaan sebelumnya masuk riwayat agar bisa dipulihkan.
 *
 * Sebelum menghapus, cek dulu halaman lain yang blok CTA-nya menunjuk ke sini.
 * Tanpa ini, tombol di halaman lain diam-diam jadi tautan mati (QA 2.1).
 *
 * @param paksa true = admin sudah membaca peringatan di dialog konfirmasi.
 */
export async function deleteHalaman(
  id: string,
  opts?: { paksa?: boolean },
): Promise<HalamanDoc | null> {
  const prev = await getHalamanById(id);
  if (!prev) return null;

  if (prev.systemPath === null) {
    if (!opts?.paksa) {
      const { ditautOleh } = await peringatanHalaman(id);
      if (ditautOleh.length > 0) {
        const daftar = [...new Set(ditautOleh.map((t) => `“${t.judul}”`))].join(", ");
        throw Object.assign(
          new Error(
            `Halaman ini masih ditaut oleh tombol di ${daftar}. Menghapusnya akan membuat ` +
              `tombol tersebut mengarah ke alamat kosong. Hapus dulu tombolnya, atau konfirmasi untuk lanjut.`,
          ),
          { status: 409, ditautOleh },
        );
      }
    }
    await getAdminDb().collection(HALAMAN_COLLECTION).doc(id).delete();
    return prev;
  }

  const now = nextIso(prev.updatedAt);
  const riwayat = pushVersi(prev.riwayat, versiDari(prev, prev.updatedAt));
  const kosong: Blok[] = [];
  await getAdminDb()
    .collection(HALAMAN_COLLECTION)
    .doc(id)
    .set({ blok: kosong, riwayat, createdAt: prev.createdAt, updatedAt: now }, { merge: true });
  return { ...prev, blok: kosong, riwayat, updatedAt: now };
}

/**
 * Pulihkan halaman ke salah satu versi riwayat. Keadaan sekarang ikut dijadikan
 * versi baru supaya pemulihan bisa dibatalkan (undo dua arah).
 */
export async function restoreHalaman(id: string, savedAt: string): Promise<HalamanDoc> {
  const prev = await getHalamanById(id);
  if (!prev) throw Object.assign(new Error("Halaman tidak ditemukan."), { status: 404 });
  const target = prev.riwayat.find((v) => v.savedAt === savedAt);
  if (!target) {
    throw Object.assign(new Error("Versi halaman tersebut tidak ditemukan."), { status: 404 });
  }

  const now = nextIso(prev.updatedAt);
  const restored = normalizeHalamanInput(
    {
      ...prev,
      judul: target.judul,
      blok: target.blok,
      metaTitle: target.metaTitle,
      metaDescription: target.metaDescription,
    },
    prev,
  );
  restored.systemPath = prev.systemPath;
  const riwayat = pushVersi(prev.riwayat, versiDari(prev, now));

  await getAdminDb()
    .collection(HALAMAN_COLLECTION)
    .doc(id)
    .set({ ...restored, riwayat, createdAt: prev.createdAt, updatedAt: now }, { merge: true });
  return { id, ...restored, riwayat, createdAt: prev.createdAt, updatedAt: now };
}

/**
 * Buat dokumen untuk 16 halaman bawaan yang `managed:true` (`/berita/[slug]`
 * dikecualikan). Idempotent: halaman yang sudah punya dokumen dilewati.
 */
export async function seedSystemPages(): Promise<{ created: string[]; skipped: string[] }> {
  if (!adminConfigured()) {
    throw Object.assign(new Error("Firebase Admin belum dikonfigurasi."), { status: 500 });
  }
  const db = getAdminDb();
  const now = nextIso();
  const created: string[] = [];
  const skipped: string[] = [];

  for (const def of MANAGED_SYSTEM_PAGES) {
    const ada = await db
      .collection(HALAMAN_COLLECTION)
      .where("systemPath", "==", def.path)
      .limit(1)
      .get();
    if (!ada.empty) {
      skipped.push(def.systemKey);
      continue;
    }
    const hero = HERO_SEED[def.systemKey] ?? { title: def.label, description: def.description };
    const doc: Omit<HalamanDoc, "id"> = {
      slug: def.slug,
      judul: def.label,
      navLabel: def.label,
      groupKey: def.groupKey,
      urutan: def.urutan,
      showInNav: true,
      collapsible: true,
      published: true,
      systemPath: def.path,
      heroTitle: hero.title,
      heroDescription: hero.description,
      blok: [],
      metaTitle: "",
      metaDescription: "",
      riwayat: [],
      createdAt: now,
      updatedAt: now,
    };
    await db.collection(HALAMAN_COLLECTION).add(doc);
    created.push(def.systemKey);
  }

  return { created, skipped };
}

/** Sumber navigasi publik: halaman tayang + daftar kelompok menu. */
export async function getNavSource(): Promise<{ halaman: HalamanDoc[]; groups: NavGroupsDoc }> {
  const [halaman, groups] = await Promise.all([
    listHalaman({ includeDraft: false }),
    getNavGroups(),
  ]);
  return { halaman, groups };
}

// ── Preview token ────────────────────────────────────────────────────────────
// Token bersifat short-lived dan satu halaman bisa punya satu token aktif saja.
// Setiap permintaan preview baru mengganti token sebelumnya.

const PREVIEW_TTL_MS = 30 * 60 * 1000;

export type PreviewTokenResult = {
  token: string;
  expiresAt: string;
};

export async function createPreviewToken(
  halamanId: string,
  draftBlocks: Blok[],
): Promise<PreviewTokenResult> {
  if (!adminConfigured()) {
    throw Object.assign(new Error("Firebase Admin belum dikonfigurasi."), { status: 500 });
  }
  const now = Date.now();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(now + PREVIEW_TTL_MS).toISOString();

  const docRef = getAdminDb().collection(HALAMAN_COLLECTION).doc(halamanId);
  await docRef.update({
    draftBlocks: sanitizeBlok(draftBlocks),
    draftUpdatedAt: new Date(now).toISOString(),
    previewToken: token,
    previewTokenExpiresAt: expiresAt,
  });

  return { token, expiresAt };
}

export async function getHalamanForPreview(
  slug: string,
  token: string,
): Promise<HalamanDoc | null> {
  if (!adminConfigured()) return null;
  const doc = await getHalamanBySlug(slug);
  if (!doc) return null;
  if (!doc.previewToken || doc.previewToken !== token) return null;
  if (!doc.previewTokenExpiresAt || Date.now() > Date.parse(doc.previewTokenExpiresAt)) {
    return null;
  }
  return {
    ...doc,
    blok: Array.isArray(doc.draftBlocks) && doc.draftBlocks.length > 0
      ? doc.draftBlocks
      : doc.blok,
  };
}

// ── Peringatan dampak (QA 2.1 & 2.3) ────────────────────────────────────────
// Sebelum admin menghapus/meng-unpublish halaman, cek apa yang rusak di
// navbar publik atau tautan CTA halaman lain. Fungsi ini dipakai server
// (blokir hapus) dan route GET dampak (dialog konfirmasi di admin).

export type { PeringatanHalaman };

/** Kerangka default supaya pembacaan di UI selalu konsisten. */
const PERINGATAN_KOSONG: PeringatanHalaman = { menu: null, ditautOleh: [] };

/**
 * Ringkas dampak membuat halaman `id` tidak lagi tayang (hapus atau draft),
 * supaya admin bisa dikonfirmasi sebelum navbar/tautan publik rusak.
 */
export async function peringatanHalaman(id: string): Promise<PeringatanHalaman> {
  if (!adminConfigured()) return PERINGATAN_KOSONG;
  const [semua, groups] = await Promise.all([
    listHalaman({ includeDraft: true }),
    getNavGroups(),
  ]);
  const dok = semua.find((h) => h.id === id);
  if (!dok) return PERINGATAN_KOSONG;

  const alamat = alamatPublik(dok);
  const ditautOleh = halamanYangMenaut(alamat, semua, id);

  return { menu: dampakMenu(semua, groups, id), ditautOleh };
}
