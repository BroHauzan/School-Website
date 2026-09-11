import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PrestasiTable } from "@/components/admin/PrestasiTable";
import { listPrestasi } from "@/lib/prestasi-server";

export const dynamic = "force-dynamic";

export default async function AdminPrestasiPage() {
  const items = await listPrestasi({ includeDraft: true });
  const published = items.filter((p) => p.published).length;
  const drafts = items.length - published;

  return (
    <div>
      <SectionHeading
        eyebrow="Panel Admin"
        title={<>Kelola <i className="text-navy-muted">prestasi</i></>}
        description={`${items.length} total · ${published} tayang · ${drafts} draft.`}
      />
      <Reveal delay={0.15}>
        <div className="mt-8 flex justify-end">
          <Link href="/admin/prestasi/baru" className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy-light">
            + Tambah prestasi
          </Link>
        </div>
      </Reveal>
      <div className="mt-5">
        <PrestasiTable items={items} />
      </div>
    </div>
  );
}
