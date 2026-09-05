import { Hero } from "@/components/Hero";
import { Berita } from "@/components/Berita";
import { SectionDivider } from "@/components/SectionDivider";
import { Academic } from "@/components/Academic";
import { Gallery } from "@/components/Gallery";
import { Testimonials } from "@/components/Testimonials";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
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
