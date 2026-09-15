import type { Metadata } from "next";
import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";

export const metadata: Metadata = {
  title: "Visi & Misi — SMAN 1 Lumajang",
  description: "Visi dan misi SMAN 1 Lumajang dalam membentuk generasi unggul.",
};

export default function VisiMisiPage() {
  return <HalamanSistemPage systemKey="visi-misi" />;
}
