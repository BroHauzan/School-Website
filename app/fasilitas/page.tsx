import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { PageHero } from "@/components/ui/PageHero";
import { Footer } from "@/components/ui/Footer";
import { Facilities } from "@/components/sections/Facilities";

export const metadata: Metadata = {
  title: "Fasilitas — SMAN 1 Lumajang",
  description: "Fasilitas pendukung belajar SMAN 1 Lumajang.",
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
            Fasilitas <i className="text-cream/70">Kampus</i>
          </>
        }
        description="Lab, aula, dan ruang kreatif — tur singkat lima fasilitas yang paling sering dipakai siswa SMAN 1 Lumajang."
      />
      <main id="konten-utama">
        <Facilities />
      </main>
      <Footer />
    </>
  );
}
