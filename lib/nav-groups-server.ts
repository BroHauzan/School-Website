import "server-only";
import { getAdminDb, adminConfigured } from "./firebase-admin";
import {
  NAV_GROUPS_COLLECTION,
  NAV_GROUPS_DOC_ID,
  slugifyHalaman,
  type NavGroupsDoc,
  type NavGroupsItem,
} from "./halaman-schema";
import { clampStr } from "./sanitize";

export { NAV_GROUPS_COLLECTION, NAV_GROUPS_DOC_ID, type NavGroupsDoc, type NavGroupsItem };

/** Nilai awal sebelum admin pernah mengatur menu: kosong (navbar pakai NAV bawaan). */
export const EMPTY_NAV_GROUPS: NavGroupsDoc = { items: [], updatedAt: "" };

const MAX_GROUPS = 30;

/**
 * Normalisasi daftar grup dari sumber tak terpercaya (body API / dokumen
 * Firestore yang diedit manual): buang label kosong, rapikan `groupKey`,
 * buang duplikat.
 */
function normalizeItems(raw: unknown): NavGroupsItem[] {
  if (!Array.isArray(raw)) return [];
  const taken = new Set<string>();
  const items: NavGroupsItem[] = [];

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const it = entry as Record<string, unknown>;
    const label = clampStr(String(it.label ?? "").trim(), 60).trim();
    if (!label) continue;
    const groupKey = slugifyHalaman(String(it.groupKey ?? "").trim() || label) || "menu";
    if (taken.has(groupKey)) continue;
    taken.add(groupKey);
    const urutanRaw = Number(it.urutan);
    items.push({
      groupKey,
      label,
      urutan: Number.isFinite(urutanRaw) && urutanRaw >= 0 ? Math.min(Math.trunc(urutanRaw), 9999) : items.length,
    });
    if (items.length >= MAX_GROUPS) break;
  }

  return items.sort((a, b) => a.urutan - b.urutan || a.label.localeCompare(b.label));
}

/** Daftar kelompok menu (menu induk) navbar publik. */
export async function getNavGroups(): Promise<NavGroupsDoc> {
  if (!adminConfigured()) return EMPTY_NAV_GROUPS;
  try {
    const snap = await getAdminDb().collection(NAV_GROUPS_COLLECTION).doc(NAV_GROUPS_DOC_ID).get();
    if (!snap.exists) return EMPTY_NAV_GROUPS;
    const d = snap.data() as Record<string, unknown>;
    return { items: normalizeItems(d.items), updatedAt: String(d.updatedAt ?? "") };
  } catch (err) {
    console.error("[nav-groups] getNavGroups gagal:", err);
    return EMPTY_NAV_GROUPS;
  }
}

export async function saveNavGroups(items: NavGroupsItem[]): Promise<NavGroupsDoc> {
  if (!adminConfigured()) {
    throw Object.assign(new Error("Firebase Admin belum dikonfigurasi."), { status: 500 });
  }
  const doc: NavGroupsDoc = { items: normalizeItems(items), updatedAt: new Date().toISOString() };
  await getAdminDb()
    .collection(NAV_GROUPS_COLLECTION)
    .doc(NAV_GROUPS_DOC_ID)
    .set(doc, { merge: true });
  return doc;
}
