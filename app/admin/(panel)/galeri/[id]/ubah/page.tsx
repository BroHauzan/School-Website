import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GaleriForm, type GaleriFormValue } from "@/components/admin/GaleriForm";
import { getGaleriById } from "@/lib/galeri-server";

export const dynamic = "force-dynamic";

export default async function GaleriUbahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getGaleriById(id);
  if (!item) notFound();
  const initial: GaleriFormValue = {
    caption: item.caption, src: item.src, wide: item.wide,
    order: item.order, published: item.published ?? true,
  };
  return (
    <div>
      <Link href="/admin/galeri" className="text-sm font-medium uppercase tracking-[0.18em] text-navy-muted transition-colors hover:text-navy">← Semua foto</Link>
      <div className="mt-4">
        <SectionHeading eyebrow="Ubah foto" title={<>Sunting <i className="text-navy-muted">foto galeri</i></>} />
      </div>
      <Reveal delay={0.1}>
        <div className="mt-10"><GaleriForm mode="edit" id={id} initial={initial} /></div>
      </Reveal>
    </div>
  );
}
