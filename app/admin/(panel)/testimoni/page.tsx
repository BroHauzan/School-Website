import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimoniTable } from "@/components/admin/TestimoniTable";
import { listTestimoni } from "@/lib/testimoni-server";

export const dynamic = "force-dynamic";

export default async function AdminTestimoniPage() {
  const items = await listTestimoni({ includeDraft: true });
  const published = items.filter((t) => t.published).length;
  const drafts = items.length - published;

  return (
    <div>
      <SectionHeading
        eyebrow="Panel Admin"
        title={<>Kelola <i className="text-navy-muted">testimoni</i></>}
        description={`${items.length} total · ${published} tayang · ${drafts} draft.`}
      />
      <Reveal delay={0.15}>
        <div className="mt-8 flex justify-end">
          <Link href="/admin/testimoni/baru" className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy-light">
            + Tambah testimoni
          </Link>
        </div>
      </Reveal>
      <div className="mt-5">
        <TestimoniTable items={items} />
      </div>
    </div>
  );
}
