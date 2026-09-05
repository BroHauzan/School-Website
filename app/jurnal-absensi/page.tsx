import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Jurnal & Absensi — SMAN 1 Lumajang",
  description: "Sistem jurnal pembelajaran dan absensi siswa SMAN 1 Lumajang.",
};

export default function JurnalAbsensiPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <main id="konten-utama" className="min-h-screen bg-cream text-navy">
      <section className="relative mx-auto max-w-4xl px-6 pb-24 pt-32">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
          Jurnal & Absensi
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-navy/75">
          Sistem pencatatan jurnal pembelajaran dan absensi siswa untuk
          memantau kehadiran dan aktivitas belajar mengajar.
        </p>
        <div className="mt-12 rounded-lg border border-navy/10 bg-navy-light/5 p-8">
          <p className="text-sm text-navy/60">
            Fitur ini sedang dalam pengembangan. Untuk informasi lebih lanjut,
            hubungi bagian tata usaha sekolah.
          </p>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}
