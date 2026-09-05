import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { About } from "@/components/sections/About";
import { Sejarah } from "@/components/sections/Sejarah";

export const metadata: Metadata = {
  title: "Sejarah — SMAN 1 Lumajang",
  description:
    "Sejarah SMA Negeri 1 Lumajang sejak 1960 — empat periode dari perintis hingga restrukturisasi.",
};

export default function SejarahPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <PageHero
        breadcrumbs={[
          { href: "/", label: "Beranda" },
          { href: "/sejarah", label: "Sejarah" },
        ]}
        title={
          <>
            Jejak <i className="text-cream/70">Panjang</i>
          </>
        }
        description="Perjalanan SMAN 1 Lumajang dalam membentuk generasi unggul sejak awal berdiri."
      />
      <main id="konten-utama">
        <About />
        <Sejarah />
      </main>
      <Footer />
    </>
  );
}
