import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Data Lulusan — SMAN 1 Lumajang",
  description: "Data dan statistik lulusan SMAN 1 Lumajang.",
};

export default function DataLulusanPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <main className="min-h-screen bg-cream text-navy">
      <section className="relative mx-auto max-w-4xl px-6 pb-24 pt-32">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
          Data Lulusan
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-navy/75">
          Statistik dan informasi tentang lulusan SMAN 1 Lumajang yang telah
          melanjutkan ke perguruan tinggi dan dunia kerja.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-navy/10 p-8">
            <h2 className="text-3xl font-bold">100%</h2>
            <p className="mt-2 text-sm text-navy/60">Tingkat Kelulusan</p>
          </div>
          <div className="rounded-lg border border-navy/10 p-8">
            <h2 className="text-3xl font-bold">85%</h2>
            <p className="mt-2 text-sm text-navy/60">Melanjutkan ke PTN/PTS</p>
          </div>
        </div>
        <div className="mt-8 rounded-lg border border-navy/10 bg-navy-light/5 p-8">
          <p className="text-sm text-navy/60">
            Data lengkap per tahun ajaran sedang dalam proses kompilasi.
            Hubungi bagian kesiswaan untuk informasi detail.
          </p>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}
