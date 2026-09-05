import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BeritaTable } from "@/components/admin/BeritaTable";
import { listBerita } from "@/lib/berita-server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const items = await listBerita({ includeDraft: true });
  const published = items.filter((b) => b.published).length;
  const drafts = items.length - published;

  return (
    <div>
      <SectionHeading
        eyebrow="Panel Admin"
        title={<>Kelola <i className="text-navy-muted">berita</i></>}
        description={`${items.length} total · ${published} tayang · ${drafts} draft.`}
      />
      <Reveal delay={0.1}>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            { n: String(items.length), l: "Total berita" },
            { n: String(published), l: "Tayang" },
            { n: String(drafts), l: "Draft" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-navy/10 bg-paper p-6 transition-all hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-[0_12px_32px_-16px_rgba(9,18,43,0.2)]">
              <p className="font-display text-4xl text-ink">{s.n}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.15}>
        <div className="mt-8 flex justify-end">
          <Link href="/admin/berita/baru" className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy-light">
            + Tulis berita
          </Link>
        </div>
      </Reveal>
      <div className="mt-5">
        <BeritaTable items={items} />
      </div>
    </div>
  );
}
