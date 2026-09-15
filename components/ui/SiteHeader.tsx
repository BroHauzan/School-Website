import "server-only";
import { cache } from "react";
import { getNavSource } from "@/lib/halaman-server";
import { buildPublicNav } from "@/lib/nav-public";
import { DEFAULT_NAV_ITEMS } from "@/lib/page-registry";
import { SiteHeaderClient } from "./SiteHeaderClient";

/**
 * Server wrapper untuk SiteHeader publik.
 *
 * Mengambil dokumen `halaman` dan `nav_groups` dari Firestore via
 * `getNavSource()`, lalu menyusun item navigasi dengan `buildPublicNav()`.
 * Dibungkus `React.cache()` agar de-duplikasi di dalam satu siklus render RSC.
 *
 * Fallback: jika Firestore belum terkonfigurasi atau query gagal,
 * gunakan `DEFAULT_NAV_ITEMS` dari registry (identik dengan array hardcode lama).
 *
 * Signature tetap: `<SiteHeader solidOnTop={...} />` tanpa breaking change
 * untuk seluruh pemanggil di `app/**`.
 */
const loadNavItems = cache(async () => {
  try {
    const { halaman, groups } = await getNavSource();
    const items = buildPublicNav(halaman, groups);
    return items.length > 0 ? items : DEFAULT_NAV_ITEMS;
  } catch {
    return DEFAULT_NAV_ITEMS;
  }
});

export async function SiteHeader({
  solidOnTop = false,
}: {
  solidOnTop?: boolean;
}) {
  const items = await loadNavItems();
  return <SiteHeaderClient items={items} solidOnTop={solidOnTop} />;
}
