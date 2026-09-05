import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GaleriForm } from "@/components/admin/GaleriForm";

export const dynamic = "force-dynamic";

export default function GaleriBaruPage() {
  return (
    <div>
      <Link href="/admin/galeri" className="text-sm font-medium uppercase tracking-[0.18em] text-navy-muted transition-colors hover:text-navy">← Semua foto</Link>
      <div className="mt-4">
        <SectionHeading eyebrow="Foto baru" title={<>Tambah <i className="text-navy-muted">foto galeri</i></>} />
      </div>
      <Reveal delay={0.1}>
        <div className="mt-10"><GaleriForm mode="create" initial={{ caption: "", src: "", wide: false, order: 0, published: true }} /></div>
      </Reveal>
    </div>
  );
}
