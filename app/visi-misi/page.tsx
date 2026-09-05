import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { VisiMisi } from "@/components/VisiMisi";

export const metadata: Metadata = {
  title: "Visi & Misi — SMAN 1 Lumajang",
  description: "Visi dan misi SMAN 1 Lumajang dalam membentuk generasi unggul.",
};

export default function VisiMisiPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <PageHero
        breadcrumbs={[
          { href: "/", label: "Beranda" },
          { href: "/visi-misi", label: "Visi & Misi" },
        ]}
        title={
          <>
            Visi & <i className="text-cream/70">Misi</i>
          </>
        }
        description="Landasan pendidikan yang membentuk karakter unggul dan berwawasan global."
      />
      <main>
        <VisiMisi />
      </main>
      <Footer />
    </>
  );
}
