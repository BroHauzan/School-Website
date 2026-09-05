import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { PPDB } from "@/components/PPDB";

export const metadata: Metadata = {
  title: "PPDB — SMAN 1 Lumajang",
  description: "Jalur masuk PPDB SMAN 1 Lumajang.",
};

export default function PPDBPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <main>
        <PPDB />
      </main>
      <Footer />
    </>
  );
}
