import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/school";
import { listBerita } from "@/lib/berita-server";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");
  const staticPaths = [
    "",
    "/berita",
    "/prestasi",
    "/fasilitas",
    "/ppdb",
    "/eskul",
    "/bk",
    "/kalender-pendidikan",
    "/jurnal-absensi",
    "/data-lulusan",
    "/snbp-snbt",
    "/sejarah",
    "/visi-misi",
    "/struktur",
    "/alumni",
    "/komite-sekolah",
  ];
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p || "/"}`,
    lastModified: new Date(),
    changeFrequency: p === "" || p === "/berita" ? "daily" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));

  const berita = await listBerita();
  const beritaEntries: MetadataRoute.Sitemap = berita.map((b) => ({
    url: `${base}/berita/${b.slug}`,
    lastModified: new Date(b.updatedAt || b.dateISO),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...beritaEntries];
}