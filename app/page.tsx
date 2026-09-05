import { Hero } from "@/components/sections/Hero";
import { Berita } from "@/components/sections/Berita";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { Academic } from "@/components/sections/Academic";
import { Gallery } from "@/components/sections/Gallery";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/ui/Footer";
import { SiteHeader } from "@/components/ui/SiteHeader";

export const revalidate = 300;

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="konten-utama">
        <Hero />
        <Berita />
        <SectionDivider className="my-2" />
        <Academic />
        <Gallery />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
