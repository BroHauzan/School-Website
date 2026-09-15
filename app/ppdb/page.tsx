import type { Metadata } from "next";
import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";

export const metadata: Metadata = {
  title: "PPDB — SMAN 1 Lumajang",
  description: "Jalur masuk PPDB SMAN 1 Lumajang.",
};

export default function PPDBPage() {
  return <HalamanSistemPage systemKey="ppdb" />;
}
