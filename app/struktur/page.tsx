import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { Struktur } from "@/components/sections/Struktur";

export const metadata: Metadata = {
  title: "Struktur — SMAN 1 Lumajang",
  description: "Jajaran pimpinan SMAN 1 Lumajang — kepala sekolah dan tim kerja.",
};

export default function StrukturPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <PageHero
        breadcrumbs={[
          { href: "/", label: "Beranda" },
          { href: "/struktur", label: "Struktur Organisasi" },
        ]}
        title="Struktur Organisasi"
        description="Kepemimpinan dan organisasi sekolah yang jelas dan terstruktur."
      />
      <main id="konten-utama">
        <Struktur />
      </main>
      <Footer />
    </>
  );
}
