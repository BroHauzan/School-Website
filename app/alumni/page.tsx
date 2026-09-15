import type { Metadata } from "next";
import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";

export const metadata: Metadata = {
  title: "Alumni — SMAN 1 Lumajang",
  description: "Jejak lulusan SMAN 1 Lumajang sejak 1960.",
};

export default function AlumniPage() {
  return <HalamanSistemPage systemKey="alumni" />;
}
