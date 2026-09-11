import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimoniForm } from "@/components/admin/TestimoniForm";

export const dynamic = "force-dynamic";

export default function TestimoniBaruPage() {
  return (
    <div>
      <Link href="/admin/testimoni" className="text-sm font-medium uppercase tracking-[0.18em] text-navy-muted transition-colors hover:text-navy">← Semua testimoni</Link>
      <div className="mt-4">
        <SectionHeading eyebrow="Testimoni baru" title={<>Tambah <i className="text-navy-muted">testimoni</i></>} />
      </div>
      <Reveal delay={0.1}>
        <div className="mt-10">
          <TestimoniForm
            mode="create"
            initial={{ quote: "", name: "", role: "", order: 0, published: true }}
          />
        </div>
      </Reveal>
    </div>
  );
}
