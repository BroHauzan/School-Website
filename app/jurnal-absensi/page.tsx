import type { Metadata } from "next";
import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";

export const metadata: Metadata = {
  title: "Jurnal & Absensi — SMAN 1 Lumajang",
  description: "Sistem jurnal pembelajaran dan absensi siswa SMAN 1 Lumajang.",
};

export default function JurnalAbsensiPage() {
  return <HalamanSistemPage systemKey="jurnal-absensi" />;
}
