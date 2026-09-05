import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { Struktur } from "@/components/Struktur";

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
      <main>
        <Struktur />
      </main>
      <Footer />
    </>
  );
}
