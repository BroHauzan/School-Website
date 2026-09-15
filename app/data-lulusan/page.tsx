import type { Metadata } from "next";
import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";

export const metadata: Metadata = {
  title: "Data Lulusan — SMAN 1 Lumajang",
  description: "Data dan statistik lulusan SMAN 1 Lumajang.",
};

export default function DataLulusanPage() {
  return <HalamanSistemPage systemKey="data-lulusan" />;
}
