import type { Metadata } from "next";
import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";

export const metadata: Metadata = {
  title: "SNBP & SNBT — SMAN 1 Lumajang",
  description: "Data penerimaan siswa melalui SNBP dan SNBT.",
};

export default function SNBPSNBTPage() {
  return <HalamanSistemPage systemKey="snbp-snbt" />;
}
