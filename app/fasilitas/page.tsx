import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { Facilities } from "@/components/Facilities";

export const metadata: Metadata = {
  title: "Fasilitas — SMAN 1 Lumajang",
  description: "Fasilitas pendukung belajar SMAN 1 Lumajang.",
};

export default function FasilitasPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <main>
        <Facilities />
      </main>
      <Footer />
    </>
  );
}
