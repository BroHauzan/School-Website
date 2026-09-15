import type { Metadata } from "next";
import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";

export const metadata: Metadata = {
  title: "BK — SMAN 1 Lumajang",
  description: "Layanan Bimbingan Konseling SMAN 1 Lumajang.",
};

export default function BKPage() {
  return <HalamanSistemPage systemKey="bk" />;
}
