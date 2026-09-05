import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BeritaForm, type BeritaFormValue } from "@/components/admin/BeritaForm";
import { getBeritaById } from "@/lib/berita-server";

export const dynamic = "force-dynamic";

export default async function BeritaUbahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getBeritaById(id);
  if (!item) notFound();
  const initial: BeritaFormValue = {
    title: item.title, excerpt: item.excerpt, tag: item.tag, image: item.image,
    dateISO: item.dateISO, bodyText: item.body.join("\n\n"),
    featured: item.featured ?? false, published: item.published ?? true,
  };
  return (
    <div>
      <Link href="/admin" className="text-sm font-medium uppercase tracking-[0.18em] text-navy-muted transition-colors hover:text-navy">← Semua berita</Link>
      <div className="mt-4">
        <SectionHeading eyebrow="Ubah berita" title={<>Sunting <i className="text-navy-muted">berita</i></>} />
      </div>
      <Reveal delay={0.1}>
        <div className="mt-10"><BeritaForm mode="edit" id={id} initial={initial} /></div>
      </Reveal>
    </div>
  );
}
