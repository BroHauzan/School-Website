import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { Achievements } from "@/components/sections/Achievements";

export const metadata: Metadata = {
  title: "Prestasi — SMAN 1 Lumajang",
  description: "Catatan prestasi siswa SMAN 1 Lumajang.",
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
        description="Bukti kuat tanpa gembar-gembor — setiap prestasi tercatat dengan detail."
      />
      <main id="konten-utama">
        <Achievements />
      </main>
      <Footer />
    </>
  );
}
