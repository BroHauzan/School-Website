import type {
  HalamanDoc,
  NavGroupsDoc,
  NavItemPublic,
} from "./halaman-schema";
import { DEFAULT_NAV_GROUPS_ITEMS } from "./page-registry";

/** Href publik: slug "" (beranda) → "/", selainnya "/<slug>". */
function hrefOf(halaman: HalamanDoc): string {
  const slug = (halaman.slug ?? "").trim().replace(/^\/+/, "");
  return slug ? `/${slug}` : "/";
}

/** Label navbar: navLabel → judul → href. */
function labelOf(halaman: HalamanDoc): string {
  const nav = (halaman.navLabel ?? "").trim();
  return nav || (halaman.judul ?? "").trim() || hrefOf(halaman);
}

function urutanOf(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : Number.MAX_SAFE_INTEGER;
}

function byUrutan(a: HalamanDoc, b: HalamanDoc): number {
  const diff = urutanOf(a.urutan) - urutanOf(b.urutan);
  return diff !== 0 ? diff : labelOf(a).localeCompare(labelOf(b), "id");
}

/**
 * Bangun struktur navigasi publik dari dokumen Firestore.
 *
 * Aturan (lihat PLAN §7-AGENT 4):
 * - buang halaman `published:false` dan `showInNav:false`;
 * - halaman dengan `groupKey === null` (atau grup tak dikenal) jadi entri top-level;
 * - grup diurutkan mengikuti `groups.items[].urutan`; isi grup & entri independen
 *   mengikuti `halaman.urutan`;
 * - `collapsible` menentukan grup dirender sebagai dropdown (`children`);
 *   grup non-collapsible dirender sebagai tautan top-level per halaman.
 *
 * Fungsi ini PURE — tanpa `server-only`, tanpa API browser.
 */
export function buildPublicNav(
  halaman: HalamanDoc[],
  groups: NavGroupsDoc,
): NavItemPublic[] {
  const visible = (Array.isArray(halaman) ? halaman : []).filter(
    (h) => h && h.published !== false && h.showInNav !== false,
  );

  // Halaman independen (groupKey null/undefined) → top-level.
  const independen = visible
    .filter((h) => h.groupKey === null || h.groupKey === undefined)
    .sort(byUrutan)
    .map((h) => ({ href: hrefOf(h), label: labelOf(h) }));

  const items: NavItemPublic[] = [];

  // Grup dari nav_groups, diurutkan menurut groups.items[].urutan.
  const rawGroupItems = Array.isArray(groups?.items) && groups.items.length > 0
    ? groups.items
    : DEFAULT_NAV_GROUPS_ITEMS;

  const groupItems = rawGroupItems
    .slice()
    .sort((a, b) => urutanOf(a.urutan) - urutanOf(b.urutan));

  const grouped = new Map<string, HalamanDoc[]>();
  for (const h of visible) {
    if (h.groupKey === null || h.groupKey === undefined) continue;
    const arr = grouped.get(h.groupKey);
    if (arr) arr.push(h);
    else grouped.set(h.groupKey, [h]);
  }

  const consumed = new Set<string>();

  for (const g of groupItems) {
    if (!g || consumed.has(g.groupKey)) continue;
    consumed.add(g.groupKey);
    const members = (grouped.get(g.groupKey) ?? []).slice().sort(byUrutan);
    if (members.length === 0) continue;

    if (members[0].collapsible !== false) {
      // Dropdown: label grup + children halaman.
      items.push({
        label: (g.label && String(g.label).trim()) || g.groupKey,
        children: members.map((h) => ({ href: hrefOf(h), label: labelOf(h) })),
      });
    } else {
      // Grup non-collapsible → tautan top-level per halaman.
      for (const h of members) items.push({ href: hrefOf(h), label: labelOf(h) });
    }
  }

  // Grup yatim (halaman bergrup tanpa entri di nav_groups) → render dropdown jika collapsible.
  for (const [key, members] of grouped) {
    if (consumed.has(key)) continue;
    const sortedMembers = members.slice().sort(byUrutan);
    if (sortedMembers.length === 0) continue;
    if (sortedMembers[0].collapsible !== false) {
      const prettyLabel = key.charAt(0).toUpperCase() + key.slice(1);
      items.push({
        label: prettyLabel,
        children: sortedMembers.map((h) => ({ href: hrefOf(h), label: labelOf(h) })),
      });
    } else {
      for (const h of sortedMembers) items.push({ href: hrefOf(h), label: labelOf(h) });
    }
  }

  // Entri independen mengikuti di belakang grup — order final hanya bergantung
  // pada urutan sibling, sesuai kontrak.
  return [...items, ...independen];
}
