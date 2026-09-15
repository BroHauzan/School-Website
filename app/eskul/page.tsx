import type { Metadata } from "next";
import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";

export const metadata: Metadata = {
  title: "Ekstrakurikuler — SMAN 1 Lumajang",
  description: "Daftar ekstrakurikuler SMAN 1 Lumajang.",
};

export default function EskulPage() {
  return <HalamanSistemPage systemKey="eskul" />;
}
