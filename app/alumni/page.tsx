import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { Alumni } from "@/components/Alumni";

export const metadata: Metadata = {
  title: "Alumni — SMAN 1 Lumajang",
  description: "Jejak lulusan SMAN 1 Lumajang sejak 1960.",
};

export default function AlumniPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <main>
        <Alumni />
      </main>
      <Footer />
    </>
  );
}
