import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GaleriTable } from "@/components/admin/GaleriTable";
import { listGaleri } from "@/lib/galeri-server";

export const dynamic = "force-dynamic";

export default async function AdminGaleriPage() {
  const items = await listGaleri({ includeDraft: true });
  const published = items.filter((g) => g.published).length;
  const drafts = items.length - published;

  return (
    <div>
      <Link href="/admin" className="text-sm font-medium uppercase tracking-[0.18em] text-navy-muted transition-colors hover:text-navy">← Dashboard berita</Link>
      <div className="mt-4">
        <SectionHeading
          eyebrow="Panel Admin"
          title={<>Kelola <i className="text-navy-muted">galeri</i></>}
          description={`${items.length} total · ${published} tayang · ${drafts} draft. Urutan kecil tampil duluan.`}
        />
      </div>
      <Reveal delay={0.15}>
        <div className="mt-8 flex justify-end">
          <Link href="/admin/galeri/baru" className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy-light">
            + Tambah foto
          </Link>
        </div>
      </Reveal>
      <div className="mt-5">
        <GaleriTable items={items} />
      </div>
    </div>
  );
}
