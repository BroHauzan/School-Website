import type { Metadata } from "next";
import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";

export const metadata: Metadata = {
  title: "Komite Sekolah — SMAN 1 Lumajang",
  description: "Komite Sekolah SMAN 1 Lumajang — kemitraan orang tua dan masyarakat.",
};

export default function KomiteSekolahPage() {
  return <HalamanSistemPage systemKey="komite-sekolah" />;
}
