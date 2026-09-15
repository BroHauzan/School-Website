import type { ReactElement, ReactNode } from "react";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { PageHero } from "@/components/ui/PageHero";
import { Footer } from "@/components/ui/Footer";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { systemPageByKey } from "@/lib/page-registry";
import { getHalamanByPath } from "@/lib/halaman-server";
import { SystemPageBody } from "./SystemPageBody";
import { getBeritaList, monthLabel, normalizeBulan } from "./berita-data";

type HeroSpec = { crumb: string; title: ReactElement | string; description: string };

/**
 * Hero bawaan untuk halaman yang saat ini memang merender `PageHero`.
 * Nilai di sini menyalin markup hero lama persis (termasuk aksen italic),
 * sehingga tampilan tidak berubah saat dokumen Firestore belum ada.
 */
const HERO_BY_KEY: Record<string, HeroSpec> = {
  "visi-misi": {
    crumb: "Visi & Misi",
    title: (
      <>
        Visi &amp; <i className="text-cream/70">Misi</i>
      </>
    ),
    description:
      "Landasan pendidikan yang membentuk karakter unggul dan berwawasan global.",
  },
  sejarah: {
    crumb: "Sejarah",
    title: (
      <>
        Jejak <i className="text-cream/70">Panjang</i>
      </>
    ),
    description:
      "Perjalanan SMAN 1 Lumajang dalam membentuk generasi unggul sejak awal berdiri.",
  },
  struktur: {
    crumb: "Struktur Organisasi",
    title: "Struktur Organisasi",
    description: "Kepemimpinan dan organisasi sekolah yang jelas dan terstruktur.",
  },
  "kalender-pendidikan": {
    crumb: "Kalender Pendidikan",
    title: "Kalender Pendidikan",
    description: "Jadwal kegiatan akademik dan non-akademik sepanjang tahun ajaran.",
  },
  fasilitas: {
    crumb: "Fasilitas",
    title: (
      <>
        Fasilitas <i className="text-cream/70">SMAN 1 Lumajang</i>
      </>
    ),
    description:
      "Dari laboratorium hingga lapangan olahraga — tur singkat 21 fasilitas kampus SMAN 1 Lumajang.",
  },
  prestasi: {
    crumb: "Prestasi",
    title: (
      <>
        Pencapaian <i className="text-cream/70">Nyata</i>
      </>
    ),
    description:
      "Kumpulan prestasi siswa SMAN 1 Lumajang — dari tingkat kabupaten hingga internasional, dikelola dan diverifikasi pihak sekolah.",
  },
  berita: {
    crumb: "Berita",
    title: (
      <>
        Kabar <i className="text-cream/70">Terkini</i>
      </>
    ),
    description:
      "Aktivitas, capaian, dan pengumuman terbaru dari lingkungan SMA Negeri 1 Lumajang — klik untuk membaca selengkapnya.",
  },
};

/** `className` pada `<main>` — disalin dari tiap halaman lama. */
const MAIN_CLASS: Record<string, string> = {
  "jurnal-absensi": "min-h-screen bg-cream text-navy",
  "data-lulusan": "min-h-screen bg-cream text-navy",
  "snbp-snbt": "min-h-screen bg-cream text-navy",
  berita: "bg-cream",
};

/**
 * Halaman bawaan ("sistem").
 *
 * Konten tetap komponen section yang sudah ada (`SystemPageBody`); Firestore
 * hanya memasok override judul/deskripsi hero, status tayang, dan blok
 * tambahan di bawah konten bawaan. Struktur visual (header → hero →
 * `main#konten-utama` → footer) identik dengan halaman yang digantikannya.
 */
export async function HalamanSistemPage({
  systemKey,
  bulanParam,
}: {
  systemKey: string;
  bulanParam?: string;
}) {
  const def = systemPageByKey(systemKey);
  if (!def) notFound();

  const doc = await getHalamanByPath(def.path);
  // Unpublish berlaku juga untuk halaman bawaan.
  if (doc && doc.published === false) notFound();

  const isBerita = systemKey === "berita";
  const spec = HERO_BY_KEY[systemKey];

  let judul: ReactNode = spec?.title ?? def.label;
  let deskripsi = spec?.description ?? def.description;

  if (isBerita && !doc) {
    // Judul/deskripsi hero async halaman berita lama: tergantung ada tidaknya
    // berita untuk bulan yang difilter.
    const all = await getBeritaList();
    const bulan = normalizeBulan(bulanParam);
    const docs = bulan ? all.filter((b) => b.dateISO.startsWith(bulan)) : all;
    const [sorotan] = docs;
    if (!sorotan) {
      const filteredEmpty = Boolean(bulan) && all.length > 0;
      judul = "Kabar Terkini";
      deskripsi = filteredEmpty
        ? `Tidak ada berita pada ${bulan ? monthLabel(bulan) : ""}.`
        : "Belum ada berita yang tersedia saat ini.";
    }
  }
  if (doc?.heroTitle) judul = doc.heroTitle;
  if (doc?.heroDescription) deskripsi = doc.heroDescription;

  return (
    <>
      <SiteHeader solidOnTop={def.solidHeader} />
      {spec ? (
        <PageHero
          breadcrumbs={[
            { href: "/", label: "Beranda" },
            { href: def.path, label: spec.crumb },
          ]}
          title={judul}
          description={deskripsi}
        />
      ) : null}
      <main id="konten-utama" className={MAIN_CLASS[systemKey]}>
        <SystemPageBody systemKey={systemKey} bulanParam={bulanParam} />
        {doc && doc.blok.length > 0 ? (
          <section className="mx-auto max-w-6xl px-6 py-16">
            <BlockRenderer blok={doc.blok} />
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
