import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { Extracurricular } from "@/components/Extracurricular";

export const metadata: Metadata = {
  title: "Ekstrakurikuler — SMAN 1 Lumajang",
  description: "Daftar ekstrakurikuler SMAN 1 Lumajang.",
};

export default function EskulPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <main>
        <Extracurricular />
      </main>
      <Footer />
    </>
  );
}
