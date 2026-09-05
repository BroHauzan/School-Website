import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { KomiteSekolah } from "@/components/sections/KomiteSekolah";

export const metadata: Metadata = {
  title: "Komite Sekolah — SMAN 1 Lumajang",
  description: "Komite Sekolah SMAN 1 Lumajang — kemitraan orang tua dan masyarakat.",
};

export default function KomiteSekolahPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <main>
        <KomiteSekolah />
      </main>
      <Footer />
    </>
  );
}
