import type { Metadata } from "next";
import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";

export const metadata: Metadata = {
  title: "Kalender Pendidikan — SMAN 1 Lumajang",
  description: "Kalender akademik dan kegiatan SMAN 1 Lumajang.",
};

export default function KalenderPendidikanPage() {
  return <HalamanSistemPage systemKey="kalender-pendidikan" />;
}
