import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { Achievements } from "@/components/sections/Achievements";

export const metadata: Metadata = {
  title: "Prestasi — SMAN 1 Lumajang",
  description: "Daftar prestasi siswa SMAN 1 Lumajang — dikelola dan diverifikasi pihak sekolah.",
};

export default function PrestasiPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <PageHero
        breadcrumbs={[
          { href: "/", label: "Beranda" },
          { href: "/prestasi", label: "Prestasi" },
        ]}
        title={
          <>
            Pencapaian <i className="text-cream/70">Nyata</i>
          </>
        }
        description="Kumpulan prestasi siswa SMAN 1 Lumajang — dari tingkat kabupaten hingga nasional, dikelola dan diverifikasi pihak sekolah."
      />
      <main id="konten-utama">
        <Achievements />
      </main>
      <Footer />
    </>
  );
}
