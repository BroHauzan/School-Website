import "server-only";
import { type DocumentSnapshot, type Query } from "firebase-admin/firestore";
import { getAdminDb, adminConfigured } from "./firebase-admin";
import { normalizeGaleriInput, validateGaleri, type GaleriDoc } from "./galeri-schema";
import { isValidImageUrl } from "./image-url";

export const GALERI_COLLECTION = "galeri";
export { type GaleriDoc };

function snapToDoc(snap: DocumentSnapshot): GaleriDoc {
  const d = snap.data() as Record<string, unknown>;
  const norm = normalizeGaleriInput(d, undefined);
  return {
    id: snap.id,
    ...norm,
    createdAt: String(d.createdAt ?? new Date().toISOString()),
    updatedAt: String(d.updatedAt ?? new Date().toISOString()),
  };
}

export async function listGaleri(opts?: { includeDraft?: boolean }): Promise<GaleriDoc[]> {
  if (!adminConfigured()) return [];
  const publishedOnly = !opts?.includeDraft;
  const db = getAdminDb();
  try {
    let q: Query = db.collection(GALERI_COLLECTION).orderBy("order", "asc");
    if (publishedOnly) q = q.where("published", "==", true);
    const snap = await q.limit(100).get();
    return snap.docs.map(snapToDoc);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Composite index (published + order) belum ada: fallback tanpa orderBy, sort di memori.
    if (!/FAILED_PRECONDITION|requires an index/i.test(msg)) {
      console.error("[galeri] listGaleri gagal:", err);
      return [];
    }
    try {
      let q2: Query = db.collection(GALERI_COLLECTION);
      if (publishedOnly) q2 = q2.where("published", "==", true);
      const snap2 = await q2.limit(500).get();
      return snap2.docs
        .map(snapToDoc)
        .sort((a, b) => a.order - b.order)
        .slice(0, 100);
    } catch (err2) {
      console.error("[galeri] listGaleri gagal:", err2);
      return [];
    }
  }
}

export async function getGaleriById(id: string): Promise<GaleriDoc | null> {
  if (!adminConfigured()) return null;
  const doc = await getAdminDb().collection(GALERI_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return snapToDoc(doc);
}

export async function createGaleri(input: Record<string, unknown>): Promise<GaleriDoc> {
  const check = validateGaleri(input);
  if (!check.ok) throw Object.assign(new Error(check.errors.join(" ")), { status: 400 });
  const norm = normalizeGaleriInput(input);
  if (!isValidImageUrl(norm.src)) {
    throw Object.assign(new Error("URL gambar tidak diizinkan. Gunakan hasil upload atau path lokal."), { status: 400 });
  }
  const now = new Date().toISOString();
  const ref = await getAdminDb().collection(GALERI_COLLECTION).add({
    ...norm,
    createdAt: now,
    updatedAt: now,
  });
  return { id: ref.id, ...norm, createdAt: now, updatedAt: now };
}

export async function updateGaleri(id: string, input: Record<string, unknown>): Promise<GaleriDoc> {
  const prev = await getGaleriById(id);
  if (!prev) throw Object.assign(new Error("Foto galeri tidak ditemukan."), { status: 404 });
  const merged: Record<string, unknown> = { ...prev, ...input };
  const check = validateGaleri(merged);
  if (!check.ok) throw Object.assign(new Error(check.errors.join(" ")), { status: 400 });
  const norm = normalizeGaleriInput(merged, prev);
  if (!isValidImageUrl(norm.src)) {
    throw Object.assign(new Error("URL gambar tidak diizinkan. Gunakan hasil upload atau path lokal."), { status: 400 });
  }
  const now = new Date().toISOString();
  await getAdminDb().collection(GALERI_COLLECTION).doc(id).set(
    { ...norm, createdAt: prev.createdAt, updatedAt: now },
    { merge: true },
  );
  return { id, ...norm, createdAt: prev.createdAt, updatedAt: now };
}

export async function deleteGaleri(id: string): Promise<GaleriDoc | null> {
  const prev = await getGaleriById(id);
  if (!prev) return null;
  await getAdminDb().collection(GALERI_COLLECTION).doc(id).delete();
  return prev;
}
