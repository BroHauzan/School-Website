import "server-only";
import { type DocumentSnapshot, type Query } from "firebase-admin/firestore";
import { getAdminDb, adminConfigured } from "./firebase-admin";
import {
  normalizePrestasiInput,
  validatePrestasi,
  type PrestasiDoc,
} from "./prestasi-schema";

export const PRESTASI_COLLECTION = "prestasi";
export { type PrestasiDoc };

/**
 * Sumber data prestasi SATU-SATUNYA koleksi Firestore `prestasi`.
 * Pola menyalin galeri-server: fallback in-memory sort bila composite
 * index (published + year) belum ready di project.
 */

function snapToDoc(snap: DocumentSnapshot): PrestasiDoc {
  const d = snap.data() as Record<string, unknown>;
  const norm = normalizePrestasiInput(d, undefined);
  return {
    id: snap.id,
    ...norm,
    createdAt: String(d.createdAt ?? new Date().toISOString()),
    updatedAt: String(d.updatedAt ?? new Date().toISOString()),
  };
}

export async function listPrestasi(
  opts?: { includeDraft?: boolean },
): Promise<PrestasiDoc[]> {
  if (!adminConfigured()) return [];
  const publishedOnly = !opts?.includeDraft;
  const db = getAdminDb();
  try {
    let q: Query = db.collection(PRESTASI_COLLECTION).orderBy("year", "desc");
    if (publishedOnly) q = q.where("published", "==", true);
    const snap = await q.limit(200).get();
    return snap.docs.map(snapToDoc);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!/FAILED_PRECONDITION|requires an index/i.test(msg)) {
      console.error("[prestasi] listPrestasi gagal:", err);
      return [];
    }
    // Composite index belum ada: ambil tanpa orderBy lalu urutkan di memori.
    // Deploy firestore.indexes.json supaya jalur ini tidak terpakai.
    try {
      let q2: Query = db.collection(PRESTASI_COLLECTION);
      if (publishedOnly) q2 = q2.where("published", "==", true);
      const snap2 = await q2.limit(500).get();
      return snap2.docs
        .map(snapToDoc)
        .sort((a, b) => b.year.localeCompare(a.year))
        .slice(0, 200);
    } catch (err2) {
      console.error("[prestasi] listPrestasi gagal:", err2);
      return [];
    }
  }
}

export async function getPrestasiById(id: string): Promise<PrestasiDoc | null> {
  if (!adminConfigured()) return null;
  const doc = await getAdminDb().collection(PRESTASI_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return snapToDoc(doc);
}

export async function createPrestasi(
  input: Record<string, unknown>,
): Promise<PrestasiDoc> {
  const check = validatePrestasi(input);
  if (!check.ok)
    throw Object.assign(new Error(check.errors.join(" ")), { status: 400 });
  const norm = normalizePrestasiInput(input);
  const now = new Date().toISOString();
  const ref = await getAdminDb()
    .collection(PRESTASI_COLLECTION)
    .add({ ...norm, createdAt: now, updatedAt: now });
  return { id: ref.id, ...norm, createdAt: now, updatedAt: now };
}

export async function updatePrestasi(
  id: string,
  input: Record<string, unknown>,
): Promise<PrestasiDoc> {
  const prev = await getPrestasiById(id);
  if (!prev)
    throw Object.assign(new Error("Prestasi tidak ditemukan."), { status: 404 });
  const merged: Record<string, unknown> = { ...prev, ...input };
  const check = validatePrestasi(merged);
  if (!check.ok)
    throw Object.assign(new Error(check.errors.join(" ")), { status: 400 });
  const norm = normalizePrestasiInput(merged, prev);
  const now = new Date().toISOString();
  await getAdminDb()
    .collection(PRESTASI_COLLECTION)
    .doc(id)
    .set({ ...norm, createdAt: prev.createdAt, updatedAt: now }, { merge: true });
  return { id, ...norm, createdAt: prev.createdAt, updatedAt: now };
}

export async function deletePrestasi(id: string): Promise<PrestasiDoc | null> {
  const prev = await getPrestasiById(id);
  if (!prev) return null;
  await getAdminDb().collection(PRESTASI_COLLECTION).doc(id).delete();
  return prev;
}
