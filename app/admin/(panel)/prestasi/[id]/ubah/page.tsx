import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PrestasiForm, type PrestasiFormValue } from "@/components/admin/PrestasiForm";
import { getPrestasiById } from "@/lib/prestasi-server";

export const dynamic = "force-dynamic";

export default async function PrestasiUbahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getPrestasiById(id);
  if (!item) notFound();
  const initial: PrestasiFormValue = {
    year: item.year, scope: item.scope, title: item.title,
    dateISO: item.dateISO, peraih: item.peraih, published: item.published ?? true,
  };
  return (
    <div>
      <Link href="/admin/prestasi" className="text-sm font-medium uppercase tracking-[0.18em] text-navy-muted transition-colors hover:text-navy">← Semua prestasi</Link>
      <div className="mt-4">
        <SectionHeading eyebrow="Ubah prestasi" title={<>Sunting <i className="text-navy-muted">prestasi</i></>} />
      </div>
      <Reveal delay={0.1}>
        <div className="mt-10"><PrestasiForm mode="edit" id={id} initial={initial} /></div>
      </Reveal>
    </div>
  );
}
