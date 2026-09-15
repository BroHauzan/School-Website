import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HalamanTable } from "@/components/admin/HalamanTable";
import { listHalaman } from "@/lib/halaman-server";
import { getNavGroups } from "@/lib/nav-groups-server";

export const dynamic = "force-dynamic";

export default async function AdminHalamanPage() {
  const [items, groupsDoc] = await Promise.all([
    listHalaman({ includeDraft: true }),
    getNavGroups(),
  ]);
  const published = items.filter((h) => h.published).length;
  const drafts = items.length - published;

  return (
    <div>
      <Link
        href="/admin"
        className="text-sm font-medium uppercase tracking-[0.18em] text-navy-muted transition-colors hover:text-navy"
      >
        ← Dashboard berita
      </Link>
      <div className="mt-4">
        <SectionHeading
          eyebrow="Panel Admin"
          title={
            <>
              Kelola <i className="text-navy-muted">halaman</i>
            </>
          }
          description={`${items.length} total · ${published} tayang · ${drafts} draft. Halaman bawaan bisa diubah isinya, alamatnya tidak berubah.`}
        />
      </div>

      <Reveal delay={0.1}>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            { n: String(items.length), l: "Total halaman" },
            { n: String(published), l: "Tayang" },
            { n: String(drafts), l: "Draft" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-lg border border-navy/10 bg-paper p-6 transition-all hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-[0_12px_32px_-16px_rgba(9,18,43,0.2)]"
            >
              <p className="font-display text-4xl text-ink">{s.n}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <Link
            href="/admin/menu"
            className="rounded-full border border-navy/20 px-6 py-2.5 text-sm text-navy transition-colors hover:border-navy/50"
          >
            Atur menu
          </Link>
          <Link
            href="/admin/halaman/baru"
            className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy-light"
          >
            + Halaman baru
          </Link>
        </div>
      </Reveal>

      <div className="mt-5">
        <HalamanTable items={items} groups={groupsDoc.items} />
      </div>
    </div>
  );
}
