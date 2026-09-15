import type { ReactElement } from "react";
import { Hero } from "@/components/sections/Hero";
import { Berita } from "@/components/sections/Berita";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Academic } from "@/components/sections/Academic";
import { Gallery } from "@/components/sections/Gallery";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";
import { About } from "@/components/sections/About";
import { Sejarah } from "@/components/sections/Sejarah";
import { VisiMisi } from "@/components/sections/VisiMisi";
import { Struktur } from "@/components/sections/Struktur";
import { Alumni } from "@/components/sections/Alumni";
import { KomiteSekolah } from "@/components/sections/KomiteSekolah";
import { KalenderPendidikan } from "@/components/sections/KalenderPendidikan";
import { BK } from "@/components/sections/BK";
import { Extracurricular } from "@/components/sections/Extracurricular";
import { Facilities } from "@/components/sections/Facilities";
import { PPDB } from "@/components/sections/PPDB";
import { Achievements } from "@/components/sections/Achievements";

// Konten inline halaman bawaan yang dipindahkan apa adanya dari app/**.
import { BeritaPageBody } from "./BeritaPageBody";
import { JurnalAbsensiBody } from "./JurnalAbsensiBody";
import { DataLulusanBody } from "./DataLulusanBody";
import { SnbpSnbtBody } from "./SnbpSnbtBody";

/**
 * Peta `systemKey` → komposisi section yang sudah ada.
 * Kunci berasal dari `SYSTEM_PAGES` (Agent 1, lib/page-registry.ts).
 *
 * Menjaga desain halaman bawaan tetap identik: setiap entri memakai komposisi
 * yang persis sama dengan JSX inline sebelumnya.
 */
const COMPOSISI: Record<string, () => ReactElement> = {
  beranda: () => (
    <>
      <Hero />
      <Berita />
      <SectionDivider className="my-2" />
      <Academic />
      <Gallery />
      <Testimonials />
      <Contact />
    </>
  ),
  sejarah: () => (
    <>
      <About />
      <Sejarah />
    </>
  ),
  "visi-misi": () => <VisiMisi />,
  struktur: () => <Struktur />,
  alumni: () => <Alumni />,
  "komite-sekolah": () => <KomiteSekolah />,
  "kalender-pendidikan": () => <KalenderPendidikan />,
  "jurnal-absensi": () => <JurnalAbsensiBody />,
  "data-lulusan": () => <DataLulusanBody />,
  "snbp-snbt": () => <SnbpSnbtBody />,
  bk: () => <BK />,
  eskul: () => <Extracurricular />,
  fasilitas: () => <Facilities />,
  ppdb: () => <PPDB />,
  prestasi: () => <Achievements />,
};

/**
 * Isi halaman bawaan untuk sebuah `systemKey`.
 * Kunci tak dikenal → tidak merender apa pun (halaman tetap 200 dengan
 * header/hero/footer, konten bawaan kosong).
 *
 * `bulanParam` hanya dipakai oleh `berita` untuk mempertahankan filter bulan
 * pada `?bulan=YYYY-MM` (JSX aslinya dipindahkan apa adanya).
 */
export function SystemPageBody({
  systemKey,
  bulanParam,
}: {
  systemKey: string;
  bulanParam?: string;
}) {
  if (systemKey === "berita") return <BeritaPageBody bulanParam={bulanParam} />;
  const render = COMPOSISI[systemKey];
  return render ? render() : null;
}

