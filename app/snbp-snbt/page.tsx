import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "SNBP & SNBT — SMAN 1 Lumajang",
  description: "Data penerimaan siswa melalui SNBP dan SNBT.",
};

export default function SNBPSNBTPage() {
  return (
    <>
      <SiteHeader solidOnTop />
      <main id="konten-utama" className="min-h-screen bg-cream text-navy">
      <section className="relative mx-auto max-w-4xl px-6 pb-24 pt-32">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
          SNBP & SNBT
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-navy/75">
          Data siswa SMAN 1 Lumajang yang diterima di perguruan tinggi negeri
          melalui jalur SNBP (Seleksi Nasional Berdasarkan Prestasi) dan SNBT
          (Seleksi Nasional Berdasarkan Tes).
        </p>
        <div className="mt-12 space-y-6">
          <div className="rounded-lg border border-navy/10 p-6">
            <h2 className="text-xl font-semibold">SNBP 2026</h2>
            <p className="mt-2 text-sm text-navy/60">
              Jalur undangan berdasarkan prestasi akademik
            </p>
            <p className="mt-4 text-2xl font-bold">47 Siswa</p>
            <p className="text-sm text-navy/60">Diterima di PTN favorit</p>
          </div>
          <div className="rounded-lg border border-navy/10 p-6">
            <h2 className="text-xl font-semibold">SNBT 2026</h2>
            <p className="mt-2 text-sm text-navy/60">
              Jalur tes berbasis komputer
            </p>
            <p className="mt-4 text-2xl font-bold">Data tersedia</p>
            <p className="text-sm text-navy/60">Setelah pengumuman resmi</p>
          </div>
        </div>
        <div className="mt-8 rounded-lg border border-navy/10 bg-navy-light/5 p-8">
          <p className="text-sm text-navy/60">
            Detail perguruan tinggi dan program studi akan diperbarui setelah
            pengumuman resmi. Hubungi bagian kesiswaan untuk konsultasi.
          </p>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}
