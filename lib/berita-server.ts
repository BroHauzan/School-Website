import "server-only";
import {
  type DocumentSnapshot,
  type Query,
} from "firebase-admin/firestore";
import { getAdminDb, adminConfigured } from "./firebase-admin";
import { normalizeBeritaInput, validateBerita, slugify, type BeritaDoc } from "./berita-schema";
import { isValidImageUrl } from "./image-url";
import { clampStr, fallbackStr, isValidDateISO, validDateOrDash } from "./sanitize";

export const BERITA_COLLECTION = "berita";
export { type BeritaDoc };

/**
 * Sumber data berita SATU-SATUNYA koleksi Firestore `berita`.
 * Tidak ada artikel bawaan/dummy — array kosong berarti benar-benar belum ada berita.
 */

function snapToDoc(snap: DocumentSnapshot): BeritaDoc {
  const d = snap.data() as Record<string, unknown>;
  const norm = normalizeBeritaInput(d, undefined);
  if (!isValidImageUrl(norm.image)) norm.image = "/hero-school.webp";
  // Defensive: dokumen bisa masuk via console/migrasi tanpa validasi API.
  norm.title = clampStr(norm.title, 200);
  norm.excerpt = clampStr(norm.excerpt, 500);
  norm.tag = fallbackStr(clampStr(norm.tag, 40), "Umum");
  norm.body = (Array.isArray(norm.body) ? norm.body : [])
    .map((p) => clampStr(String(p), 5000))
    .slice(0, 200);
  if (!isValidDateISO(norm.dateISO)) {
    norm.dateISO = "1970-01-01";
    norm.dateLabel = "-";
  } else {
    norm.dateLabel = validDateOrDash(norm.dateISO, norm.dateLabel);
  }
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
    console.warn("[berita] composite index missing — using slow in-memory fallback. Deploy firestore.indexes.json.");
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
  try {
    const doc = await getAdminDb().collection(BERITA_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return snapToDoc(doc);
  } catch (err) {
    console.error("[berita] getBeritaById gagal:", err);
    return null;
  }
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

function randomSlugSuffix(): string {
  return (Math.random().toString(36).slice(2, 6) || "x1y2").toLowerCase();
}

export async function createBerita(input: Record<string, unknown>): Promise<BeritaDoc> {
  const check = validateBerita(input);
  if (!check.ok) throw Object.assign(new Error(check.errors.join(" ")), { status: 400 });
  const norm = normalizeBeritaInput(input);
  if (!isValidImageUrl(norm.image)) {
    throw Object.assign(new Error("URL gambar tidak diizinkan. Gunakan hasil upload atau path lokal."), { status: 400 });
  }
  const db = getAdminDb();
  const now = new Date().toISOString();
  const docRef = db.collection(BERITA_COLLECTION).doc();
  await db.runTransaction(async (tx) => {
    const q = db.collection(BERITA_COLLECTION).where("slug", "==", norm.slug).limit(1);
    const snap = await tx.get(q);
    if (!snap.empty) {
      norm.slug = `${norm.slug}-${randomSlugSuffix()}`;
      const retry = await tx.get(
        db.collection(BERITA_COLLECTION).where("slug", "==", norm.slug).limit(1)
      );
      if (!retry.empty) {
        throw Object.assign(new Error("Slug sudah dipakai, coba judul berbeda."), { status: 409 });
      }
    }
    tx.set(docRef, { ...norm, createdAt: now, updatedAt: now });
  });
  return { id: docRef.id, ...norm, createdAt: now, updatedAt: now };
}

export async function updateBerita(id: string, input: Record<string, unknown>): Promise<BeritaDoc> {
  const prev = await getBeritaById(id);
  if (!prev) throw Object.assign(new Error("Berita tidak ditemukan."), { status: 404 });
  const clientUpdatedAt = typeof input.updatedAt === "string" ? input.updatedAt : undefined;
  const merged: Record<string, unknown> = { ...prev, ...input };
  if (input.title && !input.slug) merged.slug = slugify(String(input.title));
  const check = validateBerita(merged);
  if (!check.ok) throw Object.assign(new Error(check.errors.join(" ")), { status: 400 });
  const norm = normalizeBeritaInput(merged, prev);
  if (!isValidImageUrl(norm.image)) {
    throw Object.assign(new Error("URL gambar tidak diizinkan. Gunakan hasil upload atau path lokal."), { status: 400 });
  }
  const db = getAdminDb();
  const now = new Date().toISOString();
  const docRef = db.collection(BERITA_COLLECTION).doc(id);
  const slugChanged = norm.slug !== prev.slug;
  await db.runTransaction(async (tx) => {
    const storedSnap = await tx.get(docRef);
    if (!storedSnap.exists) {
      throw Object.assign(new Error("Berita tidak ditemukan."), { status: 404 });
    }
    const stored = storedSnap.data() as Record<string, unknown>;
    if (clientUpdatedAt && String(stored.updatedAt ?? "") !== clientUpdatedAt) {
      throw Object.assign(new Error("Data sudah diubah pihak lain, muat ulang dulu."), { status: 409 });
    }
    if (slugChanged) {
      const q = db.collection(BERITA_COLLECTION).where("slug", "==", norm.slug).limit(2);
      const snap = await tx.get(q);
      const taken = !snap.empty && snap.docs.some((d) => d.id !== id);
      if (taken) {
        norm.slug = `${norm.slug}-${randomSlugSuffix()}`;
        const retry = await tx.get(
          db.collection(BERITA_COLLECTION).where("slug", "==", norm.slug).limit(1)
        );
        if (!retry.empty) {
          throw Object.assign(new Error("Slug sudah dipakai, coba judul berbeda."), { status: 409 });
        }
      }
    }
    tx.set(docRef, { ...norm, createdAt: prev.createdAt, updatedAt: now }, { merge: true });
  });
  return { id, ...norm, createdAt: prev.createdAt, updatedAt: now };
}

export async function deleteBerita(id: string): Promise<BeritaDoc | null> {
  const prev = await getBeritaById(id);
  if (!prev) return null;
  await getAdminDb().collection(BERITA_COLLECTION).doc(id).delete();
  return prev;
}
