import "server-only";
import { type DocumentSnapshot, type Query } from "firebase-admin/firestore";
import { getAdminDb, adminConfigured } from "./firebase-admin";
import {
  normalizeTestimoniInput,
  validateTestimoni,
  type TestimoniDoc,
} from "./testimoni-schema";

export const TESTIMONI_COLLECTION = "testimoni";
export { type TestimoniDoc };

/**
 * CRUD koleksi Firestore `testimoni`. Pola menyalin prestasi-server:
 * fallback in-memory sort bila composite index (published + order)
 * belum ready di project.
 */

function snapToDoc(snap: DocumentSnapshot): TestimoniDoc {
  const d = snap.data() as Record<string, unknown>;
  const norm = normalizeTestimoniInput(d, undefined);
  return {
    id: snap.id,
    ...norm,
    createdAt: String(d.createdAt ?? new Date().toISOString()),
    updatedAt: String(d.updatedAt ?? new Date().toISOString()),
  };
}

export async function listTestimoni(
  opts?: { includeDraft?: boolean },
): Promise<TestimoniDoc[]> {
  if (!adminConfigured()) return [];
  const publishedOnly = !opts?.includeDraft;
  const db = getAdminDb();
  try {
    let q: Query = db.collection(TESTIMONI_COLLECTION).orderBy("order", "asc");
    if (publishedOnly) q = q.where("published", "==", true);
    const snap = await q.limit(100).get();
    return snap.docs.map(snapToDoc);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!/FAILED_PRECONDITION|requires an index/i.test(msg)) {
      console.error("[testimoni] listTestimoni gagal:", err);
      return [];
    }
    // Composite index belum ada: ambil tanpa orderBy lalu urutkan di memori.
    try {
      let q2: Query = db.collection(TESTIMONI_COLLECTION);
      if (publishedOnly) q2 = q2.where("published", "==", true);
      const snap2 = await q2.limit(200).get();
      return snap2.docs
        .map(snapToDoc)
        .sort((a, b) => a.order - b.order)
        .slice(0, 100);
    } catch (err2) {
      console.error("[testimoni] listTestimoni gagal:", err2);
      return [];
    }
  }
}

export async function getTestimoniById(id: string): Promise<TestimoniDoc | null> {
  if (!adminConfigured()) return null;
  const doc = await getAdminDb().collection(TESTIMONI_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return snapToDoc(doc);
}

export async function createTestimoni(
  input: Record<string, unknown>,
): Promise<TestimoniDoc> {
  const check = validateTestimoni(input);
  if (!check.ok)
    throw Object.assign(new Error(check.errors.join(" ")), { status: 400 });
  const norm = normalizeTestimoniInput(input);
  const now = new Date().toISOString();
  const ref = await getAdminDb()
    .collection(TESTIMONI_COLLECTION)
    .add({ ...norm, createdAt: now, updatedAt: now });
  return { id: ref.id, ...norm, createdAt: now, updatedAt: now };
}

export async function updateTestimoni(
  id: string,
  input: Record<string, unknown>,
): Promise<TestimoniDoc> {
  const prev = await getTestimoniById(id);
  if (!prev)
    throw Object.assign(new Error("Testimoni tidak ditemukan."), { status: 404 });
  const merged: Record<string, unknown> = { ...prev, ...input };
  const check = validateTestimoni(merged);
  if (!check.ok)
    throw Object.assign(new Error(check.errors.join(" ")), { status: 400 });
  const norm = normalizeTestimoniInput(merged, prev);
  const now = new Date().toISOString();
  await getAdminDb()
    .collection(TESTIMONI_COLLECTION)
    .doc(id)
    .set({ ...norm, createdAt: prev.createdAt, updatedAt: now }, { merge: true });
  return { id, ...norm, createdAt: prev.createdAt, updatedAt: now };
}

export async function deleteTestimoni(id: string): Promise<TestimoniDoc | null> {
  const prev = await getTestimoniById(id);
  if (!prev) return null;
  await getAdminDb().collection(TESTIMONI_COLLECTION).doc(id).delete();
  return prev;
}
