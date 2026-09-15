import type { Metadata } from "next";
import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";

export const metadata: Metadata = {
  title: "Sejarah — SMAN 1 Lumajang",
  description:
    "Sejarah SMA Negeri 1 Lumajang sejak 1960 — empat periode dari perintis hingga restrukturisasi.",
};

export default function SejarahPage() {
  return <HalamanSistemPage systemKey="sejarah" />;
}
