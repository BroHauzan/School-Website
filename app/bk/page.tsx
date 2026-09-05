import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { BK } from "@/components/sections/BK";

export const metadata: Metadata = {
  title: "BK — SMAN 1 Lumajang",
  description: "Layanan Bimbingan Konseling SMAN 1 Lumajang.",
};

export default function BKPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <main>
        <BK />
      </main>
      <Footer />
    </>
  );
}
