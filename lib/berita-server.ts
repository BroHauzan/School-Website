import "server-only";
import { FieldValue, type DocumentSnapshot, type Query } from "firebase-admin/firestore";
import { getAdminDb, adminConfigured } from "./firebase-admin";
import { BERITA } from "./berita";
import { normalizeBeritaInput, validateBerita, slugify, type BeritaDoc } from "./berita-schema";

export const BERITA_COLLECTION = "berita";
export { type BeritaDoc };

type SeedItem = (typeof BERITA)[number];

function seedToDoc(s: SeedItem, i: number): BeritaDoc {
  return {
    id: `seed-${s.slug}`,
    slug: s.slug,
    title: s.title,
    excerpt: s.excerpt,
    tag: s.tag,
    image: s.image,
    body: s.body,
    featured: s.featured ?? i === 0,
    published: true,
    dateISO: `2025-01-${String(26 - Math.min(i, 25)).padStart(2, "0")}`,
    dateLabel: s.date,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function seedBerita(): BeritaDoc[] {
  return BERITA.map(seedToDoc);
}

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

export async function listBerita(opts?: { includeDraft?: boolean }): Promise<BeritaDoc[]> {
  if (!adminConfigured()) return seedBerita();
  try {
    const db = getAdminDb();
    let q: Query = db
      .collection(BERITA_COLLECTION)
      .orderBy("dateISO", "desc");
    if (!opts?.includeDraft) q = q.where("published", "==", true);
    const snap = await q.limit(100).get();
    if (snap.empty) return seedBerita();
    return snap.docs.map(snapToDoc);
  } catch {
    return seedBerita();
  }
}

export async function getBeritaBySlug(slug: string): Promise<BeritaDoc | null> {
  if (!adminConfigured()) {
    return seedBerita().find((b) => b.slug === slug) ?? null;
  }
  try {
    const db = getAdminDb();
    const snap = await db
      .collection(BERITA_COLLECTION)
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snap.empty) return seedBerita().find((b) => b.slug === slug) ?? null;
    return snapToDoc(snap.docs[0]!);
  } catch {
    return seedBerita().find((b) => b.slug === slug) ?? null;
  }
}

export async function getBeritaById(id: string): Promise<BeritaDoc | null> {
  if (id.startsWith("seed-")) {
    return seedBerita().find((b) => b.id === id) ?? null;
  }
  if (!adminConfigured()) return null;
  const doc = await getAdminDb().collection(BERITA_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return snapToDoc(doc);
}

export async function getBeritaLainDb(slug: string, count = 3): Promise<BeritaDoc[]> {
  const all = await listBerita();
  return all.filter((b) => b.slug !== slug).slice(0, count);
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
  if (id.startsWith("seed-")) {
    throw Object.assign(new Error("Berita bawaan tidak bisa diubah. Buat berita baru dulu."), { status: 400 });
  }
  const prev = await getBeritaById(id);
  if (!prev) throw Object.assign(new Error("Berita tidak ditemukan."), { status: 404 });
  const merged: Record<string, unknown> = { ...prev, ...input };
  if (input.title && !input.slug) merged.slug = slugify(String(input.title));
  const check = validateBerita(merged);
  if (!check.ok) throw Object.assign(new Error(check.errors.join(" ")), { status: 400 });
  const norm = normalizeBeritaInput(merged, prev);
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
  if (id.startsWith("seed-")) {
    throw Object.assign(new Error("Berita bawaan tidak bisa dihapus."), { status: 400 });
  }
  await getAdminDb().collection(BERITA_COLLECTION).doc(id).delete();
  return prev;
}

export async function touchBerita(): Promise<void> {
  if (!adminConfigured()) return;
  await getAdminDb().collection(BERITA_COLLECTION).limit(1).get().catch(() => null);
}

export { FieldValue };
