import "server-only";
import {
  type DocumentSnapshot,
  type Query,
} from "firebase-admin/firestore";
import { getAdminDb, adminConfigured } from "./firebase-admin";
import { normalizeBeritaInput, validateBerita, slugify, type BeritaDoc } from "./berita-schema";
import { isValidImageUrl } from "./image-url";

export const BERITA_COLLECTION = "berita";
export { type BeritaDoc };

/**
 * Sumber data berita SATU-SATUNYA koleksi Firestore `berita`.
 * Tidak ada artikel bawaan/dummy — array kosong berarti benar-benar belum ada berita.
 */

function snapToDoc(snap: DocumentSnapshot): BeritaDoc {
  const d = snap.data() as Record<string, unknown>;
  const norm = normalizeBeritaInput(d, undefined);
  return {
    id: snap.id,
    ...norm,
    createdAt: String(d.createdAt ?? new Date().toISOString()),
    updatedAt: String(d.updatedAt ?? new Date().toISOString()),
  };
}

/** `published == true` + `orderBy dateISO` butuh composite index (firestore.indexes.json). */
function needsIndexError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /FAILED_PRECONDITION|requires an index/i.test(msg);
}

export async function listBerita(opts?: { includeDraft?: boolean }): Promise<BeritaDoc[]> {
  if (!adminConfigured()) return [];
  const publishedOnly = !opts?.includeDraft;
  const db = getAdminDb();
  try {
    let q: Query = db
      .collection(BERITA_COLLECTION)
      .orderBy("dateISO", "desc");
    if (publishedOnly) q = q.where("published", "==", true);
    const snap = await q.limit(100).get();
    return snap.docs.map(snapToDoc);
  } catch (err) {
    if (!needsIndexError(err)) {
      console.error("[berita] listBerita gagal:", err);
      return [];
    }
    // Composite index belum dibuat di project ini: ambil tanpa orderBy lalu
    // urutkan di memori. Deploy firestore.indexes.json supaya jalur ini tidak terpakai.
    try {
      let q: Query = db.collection(BERITA_COLLECTION);
      if (publishedOnly) q = q.where("published", "==", true);
      const snap = await q.limit(500).get();
      return snap
        .docs.map(snapToDoc)
        .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
        .slice(0, 100);
    } catch (err2) {
      console.error("[berita] listBerita gagal:", err2);
      return [];
    }
  }
}

export async function getBeritaBySlug(slug: string): Promise<BeritaDoc | null> {
  if (!adminConfigured()) return null;
  try {
    const db = getAdminDb();
    const snap = await db
      .collection(BERITA_COLLECTION)
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return snapToDoc(snap.docs[0]!);
  } catch (err) {
    console.error("[berita] getBeritaBySlug gagal:", err);
    return null;
  }
}

export async function getBeritaById(id: string): Promise<BeritaDoc | null> {
  if (!adminConfigured()) return null;
  const doc = await getAdminDb().collection(BERITA_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return snapToDoc(doc);
}

export async function getBeritaLainDb(slug: string, count = 3): Promise<BeritaDoc[]> {
  if (!adminConfigured()) return [];
  try {
    // Ambil count+1 lalu buang slug aktif di memori — jauh lebih murah
    // daripada listBerita() (limit 100/500) untuk 3 kartu "Berita Lainnya".
    const snap = await getAdminDb()
      .collection(BERITA_COLLECTION)
      .where("published", "==", true)
      .orderBy("dateISO", "desc")
      .limit(count + 1)
      .get();
    return snap.docs
      .map(snapToDoc)
      .filter((b) => b.slug !== slug)
      .slice(0, count);
  } catch {
    // Composite index belum Ready: fallback via listBerita (sudah ada fallback memori).
    const all = await listBerita();
    return all.filter((b) => b.slug !== slug).slice(0, count);
  }
}

export async function slugTaken(slug: string, exceptId?: string): Promise<boolean> {
  if (!adminConfigured()) return false;
  const snap = await getAdminDb()
    .collection(BERITA_COLLECTION)
    .where("slug", "==", slug)
    .limit(2)
    .get();
  if (snap.empty) return false;
  if (!exceptId) return true;
  return snap.docs.some((d) => d.id !== exceptId);
}

export async function createBerita(input: Record<string, unknown>): Promise<BeritaDoc> {
  const check = validateBerita(input);
  if (!check.ok) throw Object.assign(new Error(check.errors.join(" ")), { status: 400 });
  const norm = normalizeBeritaInput(input);
  if (!isValidImageUrl(norm.image)) {
    throw Object.assign(new Error("URL gambar tidak diizinkan. Gunakan hasil upload atau path lokal."), { status: 400 });
  }
  if (await slugTaken(norm.slug)) {
    norm.slug = `${norm.slug}-${Date.now().toString(36)}`;
  }
  const now = new Date().toISOString();
  const ref = await getAdminDb().collection(BERITA_COLLECTION).add({
    ...norm,
    createdAt: now,
    updatedAt: now,
  });
  return { id: ref.id, ...norm, createdAt: now, updatedAt: now };
}

export async function updateBerita(id: string, input: Record<string, unknown>): Promise<BeritaDoc> {
  const prev = await getBeritaById(id);
  if (!prev) throw Object.assign(new Error("Berita tidak ditemukan."), { status: 404 });
  const merged: Record<string, unknown> = { ...prev, ...input };
  if (input.title && !input.slug) merged.slug = slugify(String(input.title));
  const check = validateBerita(merged);
  if (!check.ok) throw Object.assign(new Error(check.errors.join(" ")), { status: 400 });
  const norm = normalizeBeritaInput(merged, prev);
  if (!isValidImageUrl(norm.image)) {
    throw Object.assign(new Error("URL gambar tidak diizinkan. Gunakan hasil upload atau path lokal."), { status: 400 });
  }
  if (norm.slug !== prev.slug && (await slugTaken(norm.slug, id))) {
    norm.slug = `${norm.slug}-${Date.now().toString(36)}`;
  }
  const now = new Date().toISOString();
  await getAdminDb().collection(BERITA_COLLECTION).doc(id).set(
    { ...norm, createdAt: prev.createdAt, updatedAt: now },
    { merge: true }
  );
  return { id, ...norm, createdAt: prev.createdAt, updatedAt: now };
}

export async function deleteBerita(id: string): Promise<BeritaDoc | null> {
  const prev = await getBeritaById(id);
  if (!prev) return null;
  await getAdminDb().collection(BERITA_COLLECTION).doc(id).delete();
  return prev;
}
