import type { Metadata } from "next";
import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";

export const metadata: Metadata = {
  title: "Fasilitas — SMAN 1 Lumajang",
  description: "21 fasilitas pendukung belajar SMAN 1 Lumajang — lab, perpustakaan, olahraga, dan layanan siswa.",
};

export default function FasilitasPage() {
  return <HalamanSistemPage systemKey="fasilitas" />;
}
