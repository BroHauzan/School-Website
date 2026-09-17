import type { Metadata } from "next";
import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Prestasi — SMAN 1 Lumajang",
  description: "Daftar prestasi siswa SMAN 1 Lumajang — dikelola dan diverifikasi pihak sekolah.",
  alternates: { canonical: "/prestasi" },
};

export default function PrestasiPage() {
  return <HalamanSistemPage systemKey="prestasi" />;
}
