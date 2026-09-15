import type { Metadata } from "next";
import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Berita — SMAN 1 Lumajang",
  description:
    "Kabar terkini SMAN 1 Lumajang: aktivitas, capaian, dan pengumuman terbaru dari lingkungan sekolah.",
  alternates: { canonical: "/berita" },
};

export default async function BeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string }>;
}) {
  const sp = await searchParams;
  return <HalamanSistemPage systemKey="berita" bulanParam={sp.bulan} />;
}
