import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BeritaForm } from "@/components/admin/BeritaForm";
import { todayISO } from "@/lib/berita-schema";

export const dynamic = "force-dynamic";

export default function BeritaBaruPage() {
  return (
    <div>
      <Link href="/admin" className="text-sm font-medium uppercase tracking-[0.18em] text-navy-muted transition-colors hover:text-navy">← Semua berita</Link>
      <div className="mt-4">
        <SectionHeading eyebrow="Berita baru" title={<>Tulis <i className="text-navy-muted">berita</i></>} />
      </div>
      <Reveal delay={0.1}>
        <div className="mt-10"><BeritaForm mode="create" initial={{ title: "", excerpt: "", tag: "Kesiswaan", image: "/hero-school.webp", dateISO: todayISO(), bodyText: "", featured: false, published: true }} /></div>
      </Reveal>
    </div>
  );
}
