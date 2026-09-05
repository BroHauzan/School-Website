import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";
import { Alumni } from "@/components/sections/Alumni";

export const metadata: Metadata = {
  title: "Alumni — SMAN 1 Lumajang",
  description: "Jejak lulusan SMAN 1 Lumajang sejak 1960.",
};

export default function AlumniPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <main id="konten-utama">
        <Alumni />
      </main>
      <Footer />
    </>
  );
}
