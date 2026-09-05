import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { KalenderPendidikan } from "@/components/KalenderPendidikan";

export const metadata: Metadata = {
  title: "Kalender Pendidikan — SMAN 1 Lumajang",
  description: "Kalender akademik dan kegiatan SMAN 1 Lumajang.",
};

export default function KalenderPendidikanPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <PageHero
        breadcrumbs={[
          { href: "/", label: "Beranda" },
          { href: "/kalender-pendidikan", label: "Kalender Pendidikan" },
        ]}
        title="Kalender Pendidikan"
        description="Jadwal kegiatan akademik dan non-akademik sepanjang tahun ajaran."
      />
      <main>
        <KalenderPendidikan />
      </main>
      <Footer />
    </>
  );
}
