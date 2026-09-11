import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimoniForm } from "@/components/admin/TestimoniForm";
import { getTestimoniById } from "@/lib/testimoni-server";

export const dynamic = "force-dynamic";

export default async function TestimoniUbahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getTestimoniById(id);
  if (!item) notFound();
  return (
    <div>
      <Link href="/admin/testimoni" className="text-sm font-medium uppercase tracking-[0.18em] text-navy-muted transition-colors hover:text-navy">← Semua testimoni</Link>
      <div className="mt-4">
        <SectionHeading eyebrow="Ubah testimoni" title={<>Sunting <i className="text-navy-muted">testimoni</i></>} />
      </div>
      <Reveal delay={0.1}>
        <div className="mt-10">
          <TestimoniForm mode="edit" id={id} initial={{
            quote: item.quote, name: item.name, role: item.role,
            order: item.order, published: item.published ?? true,
          }} />
        </div>
      </Reveal>
    </div>
  );
}
