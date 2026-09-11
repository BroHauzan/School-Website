import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { PageHero } from "@/components/ui/PageHero";
import { Footer } from "@/components/ui/Footer";
import { Facilities } from "@/components/sections/Facilities";

export const metadata: Metadata = {
  title: "Fasilitas — SMAN 1 Lumajang",
  description: "21 fasilitas pendukung belajar SMAN 1 Lumajang — lab, perpustakaan, olahraga, dan layanan siswa.",
};

export default function FasilitasPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <PageHero
        breadcrumbs={[
          { href: "/", label: "Beranda" },
          { href: "/fasilitas", label: "Fasilitas" },
        ]}
        title={
          <>
            Fasilitas <i className="text-cream/70">SMAN 1 Lumajang</i>
          </>
        }
        description="Dari laboratorium hingga lapangan olahraga — tur singkat 21 fasilitas kampus SMAN 1 Lumajang."
      />
      <main id="konten-utama">
        <Facilities />
      </main>
      <Footer />
    </>
  );
}
