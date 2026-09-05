import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { About } from "@/components/About";
import { Sejarah } from "@/components/Sejarah";

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
      <main>
        <About />
        <Sejarah />
      </main>
      <Footer />
    </>
  );
}
