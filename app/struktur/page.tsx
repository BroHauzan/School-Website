import type { Metadata } from "next";
import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";

export const metadata: Metadata = {
  title: "Struktur — SMAN 1 Lumajang",
  description: "Jajaran pimpinan SMAN 1 Lumajang — kepala sekolah dan tim kerja.",
};

export default function StrukturPage() {
  return <HalamanSistemPage systemKey="struktur" />;
}
