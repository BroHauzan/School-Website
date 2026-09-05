import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { KomiteSekolah } from "@/components/KomiteSekolah";

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
