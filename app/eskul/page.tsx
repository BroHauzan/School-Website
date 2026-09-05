import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { Extracurricular } from "@/components/sections/Extracurricular";

export const metadata: Metadata = {
  title: "Ekstrakurikuler — SMAN 1 Lumajang",
  description: "Daftar ekstrakurikuler SMAN 1 Lumajang.",
};

export default function EskulPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <main id="konten-utama">
        <Extracurricular />
      </main>
      <Footer />
    </>
  );
}
