import { HalamanSistemPage } from "@/components/public/HalamanSistemPage";

export const revalidate = 300;

export default function Home() {
  return <HalamanSistemPage systemKey="beranda" />;
}
