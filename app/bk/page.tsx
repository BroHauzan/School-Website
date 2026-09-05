import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { BK } from "@/components/BK";

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
